import {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
  DialgemError,
  type HeadersLike,
} from "./errors.js"
import { VERSION } from "../version.js"

/**
 * The slice of `fetch` the SDK uses. Declared structurally so any conforming
 * implementation (Node's global fetch, undici, node-fetch, a test double) fits,
 * without the SDK's public types depending on DOM lib typings.
 */
export type Fetch = (url: string, init: FetchInit) => Promise<FetchResponse>

export interface FetchInit {
  method: string
  headers: Record<string, string>
  body?: string
  signal: AbortSignal
  /**
   * Always `"manual"`. A followed redirect re-sends the API key to wherever the
   * `Location` points (fetch strips only `Authorization` cross-origin, not
   * `X-API-Key`), and turns a 301'd POST into a GET that "succeeds" with the
   * wrong body. The API never redirects, so a 3xx is surfaced as an `APIError`.
   */
  redirect: "manual"
}

export interface FetchResponse {
  readonly status: number
  readonly statusText: string
  readonly headers: HeadersLike
  text(): Promise<string>
}

/** Per-call overrides, accepted as the last argument of every resource method. */
// Every optional field also accepts an explicit `undefined`, so a caller compiling
// with `exactOptionalPropertyTypes` can pass `{ signal: maybeSignal }` directly.
export interface RequestOptions {
  /** Milliseconds (> 0) before the attempt is aborted. Applies per attempt, not across retries. */
  timeout?: number | undefined
  /**
   * Retries on 408/429/5xx and connection failures.
   *
   * GET, PATCH and DELETE use the client's `maxRetries` unless overridden here.
   * **POST is never retried unless you set this explicitly**: most POSTs create
   * things, and an outbound call retried after an ambiguous 502 dials the person twice.
   */
  maxRetries?: number | undefined
  /** Abort the request. Surfaces as `APIUserAbortError`. */
  signal?: AbortSignal | undefined
  /** Extra headers for this request only. */
  headers?: Record<string, string> | undefined
}

export type QueryValue = string | number | boolean | null | undefined
export type Query = Record<string, QueryValue>

export interface HttpClientOptions {
  apiKey: string
  baseURL: string
  timeout: number
  maxRetries: number
  fetch: Fetch
  defaultHeaders: Record<string, string>
}

type Method = "GET" | "POST" | "PATCH" | "DELETE"

const RETRYABLE_METHODS: ReadonlySet<Method> = new Set(["GET", "PATCH", "DELETE"])
const MAX_RETRY_DELAY_MS = 60_000

export class HttpClient {
  readonly baseURL: string
  readonly #apiKey: string
  readonly #timeout: number
  readonly #maxRetries: number
  readonly #fetch: Fetch
  readonly #defaultHeaders: Record<string, string>

  constructor(options: HttpClientOptions) {
    this.baseURL = options.baseURL.replace(/\/+$/, "")
    this.#apiKey = options.apiKey
    this.#timeout = options.timeout
    this.#maxRetries = options.maxRetries
    this.#fetch = options.fetch
    this.#defaultHeaders = options.defaultHeaders
  }

  get<T>(path: string, query?: Query, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, { query, options })
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("POST", path, { body, options })
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>("PATCH", path, { body, options })
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, { options })
  }

  async request<T>(
    method: Method,
    path: string,
    { query, body, options = {} }: { query?: Query | undefined; body?: unknown; options?: RequestOptions | undefined },
  ): Promise<T> {
    const url = this.buildURL(path, query)
    const headers = this.buildHeaders(body !== undefined, options.headers)
    const payload = body === undefined ? undefined : JSON.stringify(body)
    const timeout = options.timeout ?? this.#timeout
    const maxRetries = options.maxRetries ?? (RETRYABLE_METHODS.has(method) ? this.#maxRetries : 0)
    assertTimeout(timeout)
    assertMaxRetries(maxRetries)

    for (let attempt = 0; ; attempt++) {
      const retriesLeft = maxRetries - attempt
      if (options.signal?.aborted) throw new APIUserAbortError()

      const outcome = await this.#attempt(url, method, headers, payload, timeout, options.signal)

      if (outcome.kind === "response") {
        const { status, statusText, headers: responseHeaders, text } = outcome
        if (status >= 200 && status < 300) return parseSuccess<T>(text, status)
        if (retriesLeft > 0 && isRetryableStatus(status)) {
          await sleep(retryAfterMs(responseHeaders) ?? backoffMs(attempt), options.signal)
          continue
        }
        throw APIError.from(status, parseErrorBody(text), statusText, responseHeaders)
      }

      if (options.signal?.aborted) throw new APIUserAbortError()
      if (retriesLeft > 0) {
        await sleep(backoffMs(attempt), options.signal)
        continue
      }
      throw outcome.error
    }
  }

  /** One HTTP attempt, with its own timeout. Never throws; timers and listeners are released before it returns. */
  async #attempt(
    url: string,
    method: Method,
    headers: Record<string, string>,
    payload: string | undefined,
    timeout: number,
    signal: AbortSignal | undefined,
  ): Promise<
    | { kind: "response"; status: number; statusText: string; headers: HeadersLike; text: string }
    | { kind: "failure"; error: APIConnectionError }
  > {
    const controller = new AbortController()
    let timedOut = false
    const timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, timeout)
    const onUserAbort = () => controller.abort()
    signal?.addEventListener("abort", onUserAbort, { once: true })

    try {
      const init: FetchInit = { method, headers, signal: controller.signal, redirect: "manual" }
      if (payload !== undefined) init.body = payload
      const response = await this.#fetch(url, init)
      // Read inside the timer: a server that sends headers then stalls the body
      // must still hit the timeout rather than hang the caller.
      const text = await response.text()
      return { kind: "response", status: response.status, statusText: response.statusText, headers: response.headers, text }
    } catch (err) {
      const error = timedOut
        ? new APIConnectionTimeoutError(`Request timed out after ${timeout}ms.`)
        : new APIConnectionError(`Connection error: ${describe(err)}`, { cause: err })
      return { kind: "failure", error }
    } finally {
      clearTimeout(timer)
      signal?.removeEventListener("abort", onUserAbort)
    }
  }

  buildURL(path: string, query?: Query): string {
    const url = `${this.baseURL}${path.startsWith("/") ? path : `/${path}`}`
    if (!query) return url
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue
      params.append(key, String(value))
    }
    const qs = params.toString()
    return qs ? `${url}?${qs}` : url
  }

  private buildHeaders(hasBody: boolean, extra?: Record<string, string>): Record<string, string> {
    // Merged case-insensitively, later layers winning. A plain object spread would
    // keep both `X-API-Key` and a caller's `x-api-key`, which fetch then joins
    // into one comma-separated value the service rejects.
    const merged = new Map<string, [name: string, value: string]>()
    const layer = (headers: Record<string, string> | undefined) => {
      for (const [name, value] of Object.entries(headers ?? {})) merged.set(name.toLowerCase(), [name, value])
    }
    layer({
      Accept: "application/json",
      // `X-API-Key`, not `Authorization: Bearer`: the API only tries a
      // Bearer value as a session JWT, so an org key sent that way is a 401.
      "X-API-Key": this.#apiKey,
      "User-Agent": userAgent(),
    })
    layer(this.#defaultHeaders)
    layer(extra)
    if (hasBody) layer({ "Content-Type": "application/json" })
    return Object.fromEntries(merged.values())
  }
}

export function assertTimeout(value: number): void {
  // 0 is rejected rather than read as "no timeout": setTimeout(…, 0) would abort
  // every attempt immediately, and an unbounded request is never what a backend wants.
  if (!Number.isInteger(value) || value <= 0) {
    throw new DialgemError(`\`timeout\` must be a positive integer of milliseconds, got ${String(value)}.`)
  }
}

export function assertMaxRetries(value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new DialgemError(`\`maxRetries\` must be a non-negative integer, got ${String(value)}.`)
  }
}

function parseSuccess<T>(text: string, status: number): T {
  if (status === 204 || text.trim() === "") return undefined as T
  try {
    return JSON.parse(text) as T
  } catch (err) {
    throw new DialgemError(`Expected a JSON response (status ${status}) but could not parse it: ${describe(err)}`)
  }
}

function parseErrorBody(text: string): unknown {
  if (!text) return undefined
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function isRetryableStatus(status: number): boolean {
  // Not 409: the API's 409s are real conflicts (a phone number already
  // registered), which a retry would only repeat.
  return status === 408 || status === 429 || status >= 500
}

/** Exponential backoff with jitter: ~0.5s, 1s, 2s, … capped at 8s. */
function backoffMs(attempt: number): number {
  const base = Math.min(500 * 2 ** attempt, 8_000)
  return base * (1 - Math.random() * 0.25)
}

/** Honour `retry-after-ms`, then `Retry-After` (seconds or an HTTP date). */
function retryAfterMs(headers: HeadersLike): number | undefined {
  const ms = Number(headers.get("retry-after-ms"))
  if (Number.isFinite(ms) && ms > 0) return Math.min(ms, MAX_RETRY_DELAY_MS)
  const raw = headers.get("retry-after")
  if (!raw) return undefined
  const seconds = Number(raw)
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS)
  const date = Date.parse(raw)
  if (Number.isFinite(date)) return Math.min(Math.max(date - Date.now(), 0), MAX_RETRY_DELAY_MS)
  return undefined
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new APIUserAbortError())
    const onAbort = () => {
      clearTimeout(timer)
      reject(new APIUserAbortError())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    signal?.addEventListener("abort", onAbort, { once: true })
  })
}

function userAgent(): string {
  const proc = (globalThis as { process?: { version?: string } }).process
  return proc?.version ? `dialgem-sdk-node/${VERSION} node/${proc.version}` : `dialgem-sdk-node/${VERSION}`
}

function describe(err: unknown): string {
  if (err instanceof Error) {
    const cause = (err as { cause?: unknown }).cause
    return cause instanceof Error ? `${err.message} (${cause.message})` : err.message
  }
  return String(err)
}
