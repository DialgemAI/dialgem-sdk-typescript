import {
  APIConnectionError,
  APIError,
  AuthenticationError,
  BadRequestError,
  ConflictError,
  DialgemError,
  InternalServerError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  UnprocessableEntityError,
} from "@dialgem/sdk"
import { describe, expect, it } from "vitest"

import { client, errorBody, mockFetch } from "./helpers.js"

const noRetry = { maxRetries: 0 }

describe("error mapping", () => {
  it.each([
    [400, BadRequestError],
    [401, AuthenticationError],
    [403, PermissionDeniedError],
    [404, NotFoundError],
    [409, ConflictError],
    [422, UnprocessableEntityError],
    [429, RateLimitError],
    [500, InternalServerError],
    [503, InternalServerError],
    [418, APIError],
  ])("%i → %s", async (status, Ctor) => {
    const { fetch } = mockFetch(() => ({ status, body: errorBody(`HTTP_${status}`, "nope") }))
    const err = await client(fetch, noRetry).agents.list().catch((e: unknown) => e)
    expect(err).toBeInstanceOf(Ctor)
    expect(err).toBeInstanceOf(APIError)
    expect(err).toBeInstanceOf(DialgemError)
    expect(err).toMatchObject({ status, errCode: `HTTP_${status}`, requestId: "req_123", message: `${status} nope` })
  })

  it("carries issues[] from a 422 flow validation failure", async () => {
    const issues = [{ loc: ["body", "flow_config", "nodes", 0], message: "missing edge", severity: "error", node_id: "n1" }]
    const { fetch } = mockFetch(() => ({ status: 422, body: errorBody("flow_invalid", "Flow config is invalid: 1 error.", { issues }) }))
    const err = (await client(fetch).agents.create({ name: "x" }).catch((e: unknown) => e)) as UnprocessableEntityError
    expect(err.errCode).toBe("flow_invalid")
    expect(err.issues).toEqual(issues)
  })

  it("keeps extra envelope keys on body", async () => {
    // envelope_from_detail spreads a router's extra detail keys onto the body.
    const { fetch } = mockFetch(() => ({
      status: 502,
      statusText: "Bad Gateway",
      body: errorBody("HTTP_502", "", { carrier: "invalid destination" }),
    }))
    const err = (await client(fetch).calls.createPhoneCall({ from_: "+1", to: "+2" }).catch((e: unknown) => e)) as APIError
    expect(err.body).toMatchObject({ carrier: "invalid destination" })
    // Empty err_msg falls back to the status line rather than an empty message.
    expect(err.message).toBe("502 Bad Gateway")
  })

  it("handles a non-JSON error body (a proxy's HTML 502)", async () => {
    const { fetch } = mockFetch(() => ({ status: 502, statusText: "Bad Gateway", rawBody: "<html>upstream down</html>" }))
    const err = (await client(fetch, noRetry).agents.list().catch((e: unknown) => e)) as APIError
    expect(err).toBeInstanceOf(InternalServerError)
    expect(err.errCode).toBeUndefined()
    expect(err.body).toBe("<html>upstream down</html>")
    expect(err.message).toBe("502 <html>upstream down</html>")
  })

  it("falls back to the x-request-id header when the body has none", async () => {
    const { fetch } = mockFetch(() => ({ status: 500, rawBody: "", statusText: "Internal Server Error", headers: { "x-request-id": "hdr_9" } }))
    const err = (await client(fetch, noRetry).agents.list().catch((e: unknown) => e)) as APIError
    expect(err.requestId).toBe("hdr_9")
    expect(err.message).toBe("500 Internal Server Error")
  })

  it("wraps a transport failure as APIConnectionError with the cause", async () => {
    const cause = new TypeError("fetch failed", { cause: new Error("ECONNREFUSED") })
    const { fetch } = mockFetch(() => {
      throw cause
    })
    const err = (await client(fetch, noRetry).agents.list().catch((e: unknown) => e)) as APIConnectionError
    expect(err).toBeInstanceOf(APIConnectionError)
    expect(err.message).toContain("ECONNREFUSED")
    expect(err.cause).toBe(cause)
  })

  it.each([301, 302, 307, 308])("surfaces a %i redirect as an APIError instead of following it", async (status) => {
    // Following would re-send X-API-Key to the Location, and a 301'd POST becomes a GET.
    const { fetch, calls } = mockFetch(() => ({ status, headers: { location: "https://elsewhere.example/v1/agents" } }))
    const err = (await client(fetch).agents.create({ name: "x" }).catch((e: unknown) => e)) as APIError
    expect(err).toBeInstanceOf(APIError)
    expect(err.status).toBe(status)
    expect(calls).toHaveLength(1)
  })

  it("rejects a 2xx that is not JSON", async () => {
    const { fetch } = mockFetch(() => ({ status: 200, rawBody: "OK" }))
    await expect(client(fetch).agents.list()).rejects.toThrow(/Expected a JSON response/)
  })
})
