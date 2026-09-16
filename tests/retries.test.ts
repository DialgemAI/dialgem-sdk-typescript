import { APIConnectionTimeoutError, APIUserAbortError, InternalServerError, RateLimitError } from "@dialgem/sdk"
import { afterEach, describe, expect, it, vi } from "vitest"

import { client, errorBody, mockFetch } from "./helpers.js"

// `Retry-After: 0` makes retries immediate, so these run without fake timers.
const unavailable = { status: 503, body: errorBody("HTTP_503", "down"), headers: { "retry-after": "0" } }

afterEach(() => {
  vi.useRealTimers()
})

describe("retries", () => {
  it("retries a GET on 503 and returns the eventual success", async () => {
    const { fetch, calls } = mockFetch((_req, n) => (n < 3 ? unavailable : { body: [{ id: "a" }] }))
    await expect(client(fetch).agents.list()).resolves.toEqual([{ id: "a" }])
    expect(calls).toHaveLength(3)
  })

  it("gives up after maxRetries and throws the last error", async () => {
    const { fetch, calls } = mockFetch(() => unavailable)
    await expect(client(fetch, { maxRetries: 2 }).agents.list()).rejects.toBeInstanceOf(InternalServerError)
    expect(calls).toHaveLength(3)
  })

  it.each([
    ["PATCH", (c: ReturnType<typeof client>) => c.agents.update("a", { name: "n" })],
    ["DELETE", (c: ReturnType<typeof client>) => c.agents.delete("a")],
  ])("retries %s", async (_method, invoke) => {
    const { fetch, calls } = mockFetch((_req, n) => (n === 1 ? unavailable : { body: {} }))
    await invoke(client(fetch))
    expect(calls).toHaveLength(2)
  })

  it("never retries a POST by default — an outbound call must not be dialed twice", async () => {
    const { fetch, calls } = mockFetch(() => ({ ...unavailable, status: 502 }))
    await expect(
      client(fetch, { maxRetries: 5 }).calls.createPhoneCall({ from_: "+14155550100", to: "+14155550199" }),
    ).rejects.toBeInstanceOf(InternalServerError)
    expect(calls).toHaveLength(1)
  })

  it("never retries a POST on a connection error by default", async () => {
    const { fetch, calls } = mockFetch(() => {
      throw new TypeError("fetch failed")
    })
    await expect(client(fetch, { maxRetries: 5 }).agents.create({ name: "x" })).rejects.toThrow(/Connection error/)
    expect(calls).toHaveLength(1)
  })

  it("retries a POST when the caller opts in per request", async () => {
    const { fetch, calls } = mockFetch((_req, n) => (n === 1 ? unavailable : { body: { id: "a" } }))
    await client(fetch).agents.create({ name: "x" }, { maxRetries: 1 })
    expect(calls).toHaveLength(2)
  })

  it.each([400, 401, 403, 404, 409, 422])("does not retry %i", async (status) => {
    const { fetch, calls } = mockFetch(() => ({ status, body: errorBody("x", "y"), headers: { "retry-after": "0" } }))
    await expect(client(fetch).agents.list()).rejects.toThrow()
    expect(calls).toHaveLength(1)
  })

  it("retries 429 and 408", async () => {
    const { fetch, calls } = mockFetch((_req, n) =>
      n === 1 ? { status: 429, headers: { "retry-after": "0" } } : n === 2 ? { status: 408, headers: { "retry-after": "0" } } : { body: [] },
    )
    await client(fetch).agents.list()
    expect(calls).toHaveLength(3)
  })

  it("maxRetries: 0 disables retries", async () => {
    const { fetch, calls } = mockFetch(() => ({ status: 429, headers: { "retry-after": "0" } }))
    await expect(client(fetch, { maxRetries: 0 }).agents.list()).rejects.toBeInstanceOf(RateLimitError)
    expect(calls).toHaveLength(1)
  })

  it("waits for Retry-After before retrying", async () => {
    vi.useFakeTimers()
    const { fetch, calls } = mockFetch((_req, n) => (n === 1 ? { status: 429, headers: { "retry-after": "3" } } : { body: [] }))
    const pending = client(fetch).agents.list()

    await vi.advanceTimersByTimeAsync(2_900)
    expect(calls).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(200)
    await pending
    expect(calls).toHaveLength(2)
  })

  it("caps an absurd Retry-After at 60s", async () => {
    vi.useFakeTimers()
    const { fetch, calls } = mockFetch((_req, n) => (n === 1 ? { status: 503, headers: { "retry-after": "86400" } } : { body: [] }))
    const pending = client(fetch).agents.list()
    await vi.advanceTimersByTimeAsync(60_001)
    await pending
    expect(calls).toHaveLength(2)
  })
})

describe("timeouts and aborts", () => {
  /** A server that never answers until the request is aborted. */
  const hang = mockFetchHanging

  it("times out an attempt and surfaces APIConnectionTimeoutError", async () => {
    const server = hang()
    await expect(client(server.fetch, { timeout: 20, maxRetries: 0 }).agents.list()).rejects.toBeInstanceOf(
      APIConnectionTimeoutError,
    )
    expect(server.calls).toBe(1)
  })

  it("retries a timed-out GET", async () => {
    vi.useFakeTimers()
    const server = hang()
    const pending = client(server.fetch, { timeout: 100, maxRetries: 1 }).agents.list().catch((e: unknown) => e)
    // attempt 1 times out at 100ms, backoff ≤ 500ms, attempt 2 times out 100ms later.
    await vi.advanceTimersByTimeAsync(100 + 500 + 100)
    expect(await pending).toBeInstanceOf(APIConnectionTimeoutError)
    expect(server.calls).toBe(2)
  })

  it("stops on the caller's abort signal and does not retry", async () => {
    const server = hang()
    const controller = new AbortController()
    const pending = client(server.fetch, { maxRetries: 3 }).agents.list({ signal: controller.signal })
    setTimeout(() => controller.abort(), 10)
    await expect(pending).rejects.toBeInstanceOf(APIUserAbortError)
    expect(server.calls).toBe(1)
  })

  it("reports a caller abort as APIUserAbortError even with retries off", async () => {
    // Not a connection failure: the caller chose to stop. A POST (never retried)
    // must report it the same way as a GET.
    const server = hang()
    const controller = new AbortController()
    const pending = client(server.fetch).agents.create({ name: "x" }, { signal: controller.signal })
    setTimeout(() => controller.abort(), 10)
    await expect(pending).rejects.toBeInstanceOf(APIUserAbortError)
  })

  it("aborts during a retry backoff", async () => {
    const controller = new AbortController()
    const { fetch, calls } = mockFetch(() => ({ status: 503, headers: { "retry-after": "30" } }))
    const pending = client(fetch).agents.list({ signal: controller.signal })
    setTimeout(() => controller.abort(), 10)
    await expect(pending).rejects.toBeInstanceOf(APIUserAbortError)
    expect(calls).toHaveLength(1)
  })
})

function mockFetchHanging() {
  const state = { calls: 0 }
  const fetch = (_url: string, init: { signal: AbortSignal }) =>
    new Promise<never>((_resolve, reject) => {
      state.calls++
      init.signal.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))
    })
  return {
    fetch,
    get calls() {
      return state.calls
    },
  }
}
