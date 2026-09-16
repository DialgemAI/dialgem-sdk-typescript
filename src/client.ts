import { DialgemError } from "./core/errors.js"
import { HttpClient, assertMaxRetries, assertTimeout, type Fetch } from "./core/http.js"
import { Agents } from "./resources/agents.js"
import { Calls } from "./resources/calls.js"
import { FlowTemplates, PromptTemplates, Voices } from "./resources/catalog.js"
import { PhoneNumbers } from "./resources/phone-numbers.js"
import { Webhooks, webhooks } from "./webhooks.js"

export const DEFAULT_BASE_URL = "https://api.dialgem.com"
const DEFAULT_TIMEOUT_MS = 60_000
const DEFAULT_MAX_RETRIES = 2

// Optional fields accept an explicit `undefined` so `new Dialgem({ apiKey: process.env.X })`
// compiles under `exactOptionalPropertyTypes`; undefined means "use the default".
export interface ClientOptions {
  /** Organization API key (`zk_…`). Defaults to `process.env.DIALGEM_API_KEY`. */
  apiKey?: string | undefined
  /** Defaults to `process.env.DIALGEM_BASE_URL`, then `https://api.dialgem.com`. */
  baseURL?: string | undefined
  /** Per-attempt timeout in milliseconds (> 0). Default 60000. */
  timeout?: number | undefined
  /** Retries for GET/PATCH/DELETE on 408/429/5xx and connection errors. Default 2. POST is not retried. */
  maxRetries?: number | undefined
  /** Custom fetch implementation (a proxy agent, instrumentation, tests). Defaults to the global `fetch`. */
  fetch?: Fetch | undefined
  /** Headers sent with every request. */
  defaultHeaders?: Record<string, string> | undefined
  /**
   * The API key grants full access to your organization, so constructing the
   * client in a browser throws by default. Only set this for a trusted internal tool.
   */
  dangerouslyAllowBrowser?: boolean | undefined
}

/**
 * Dialgem API client, for use from your backend.
 *
 * ```ts
 * import { Dialgem } from "@dialgem/sdk"
 *
 * const dialgem = new Dialgem() // reads DIALGEM_API_KEY
 * const agent = await dialgem.agents.create({ name: "Front desk", system_prompt: "…" })
 * ```
 */
export class Dialgem {
  static readonly DEFAULT_BASE_URL = DEFAULT_BASE_URL
  /** Webhook verification without a client instance: `Dialgem.webhooks.constructEvent(...)`. */
  static readonly webhooks: Webhooks = webhooks

  readonly agents: Agents
  readonly calls: Calls
  readonly phoneNumbers: PhoneNumbers
  readonly voices: Voices
  readonly flowTemplates: FlowTemplates
  readonly promptTemplates: PromptTemplates
  readonly webhooks: Webhooks = webhooks

  readonly baseURL: string

  constructor(options: ClientOptions = {}) {
    if (isBrowser() && !options.dangerouslyAllowBrowser) {
      throw new DialgemError(
        "The Dialgem SDK is for server-side use: running it in a browser exposes your API key to every visitor. " +
          "Call Dialgem from your backend instead, or pass `dangerouslyAllowBrowser: true` if you understand the risk.",
      )
    }

    const apiKey = options.apiKey ?? readEnv("DIALGEM_API_KEY")
    if (!apiKey) {
      throw new DialgemError(
        "Missing API key. Pass `apiKey` to `new Dialgem({ apiKey })` or set the DIALGEM_API_KEY environment variable.",
      )
    }

    const timeout = options.timeout ?? DEFAULT_TIMEOUT_MS
    const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES
    assertTimeout(timeout)
    assertMaxRetries(maxRetries)

    const fetchImpl = options.fetch ?? defaultFetch()
    this.baseURL = (options.baseURL ?? readEnv("DIALGEM_BASE_URL") ?? DEFAULT_BASE_URL).replace(/\/+$/, "")

    const http = new HttpClient({
      apiKey,
      baseURL: this.baseURL,
      timeout,
      maxRetries,
      fetch: fetchImpl,
      defaultHeaders: options.defaultHeaders ?? {},
    })

    this.agents = new Agents(http)
    this.calls = new Calls(http)
    this.phoneNumbers = new PhoneNumbers(http)
    this.voices = new Voices(http)
    this.flowTemplates = new FlowTemplates(http)
    this.promptTemplates = new PromptTemplates(http)
  }
}

function readEnv(name: string): string | undefined {
  const proc = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  const value = proc?.env?.[name]?.trim()
  return value ? value : undefined
}

function isBrowser(): boolean {
  const g = globalThis as { window?: unknown; document?: unknown }
  return typeof g.window !== "undefined" && typeof g.document !== "undefined"
}

function defaultFetch(): Fetch {
  const f = (globalThis as { fetch?: unknown }).fetch
  if (typeof f !== "function") {
    throw new DialgemError("No global `fetch` found. Use Node 20 or newer, or pass `fetch` in the client options.")
  }
  // Bound per call rather than stored: some runtimes throw "Illegal invocation"
  // when fetch is called detached from globalThis.
  return (url, init) => (f as Fetch).call(globalThis, url, init)
}
