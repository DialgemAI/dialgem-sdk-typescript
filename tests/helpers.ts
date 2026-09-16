import { Dialgem, type ClientOptions, type Fetch, type FetchResponse } from "@dialgem/sdk"

export interface RecordedRequest {
  url: string
  method: string
  headers: Record<string, string>
  body: unknown
  signal: AbortSignal
  redirect: string
}

export interface MockReply {
  status?: number
  statusText?: string
  body?: unknown
  /** Sent verbatim instead of JSON-encoding `body`. */
  rawBody?: string
  headers?: Record<string, string>
}

export type Responder = (req: RecordedRequest, callNumber: number) => MockReply | Promise<MockReply>

export function mockFetch(responder: Responder = () => ({ status: 200, body: {} })) {
  const calls: RecordedRequest[] = []
  const fetch: Fetch = async (url, init) => {
    const req: RecordedRequest = {
      url,
      method: init.method,
      headers: init.headers,
      body: init.body === undefined ? undefined : JSON.parse(init.body),
      signal: init.signal,
      redirect: init.redirect,
    }
    calls.push(req)
    return toResponse(await responder(req, calls.length))
  }
  return { fetch, calls }
}

export function toResponse(reply: MockReply): FetchResponse {
  const status = reply.status ?? 200
  const text = reply.rawBody ?? (reply.body === undefined ? "" : JSON.stringify(reply.body))
  return {
    status,
    statusText: reply.statusText ?? "",
    headers: new Headers(reply.headers ?? {}),
    text: async () => text,
  }
}

export const BASE_URL = "https://api.test.dialgem"

export function client(fetch: Fetch, options: ClientOptions = {}): Dialgem {
  return new Dialgem({ apiKey: "zk_test", baseURL: BASE_URL, fetch, ...options })
}

/** An error envelope in the exact shape the Dialgem API returns. */
export function errorBody(err_code: string, err_msg: string, extra: Record<string, unknown> = {}) {
  return { err_code, err_msg, request_id: "req_123", ...extra }
}
