import { DialgemError } from "@dialgem/sdk"
import { describe, expect, it } from "vitest"

import { BASE_URL, client, mockFetch } from "./helpers.js"
import { SDK_CALLS, publicMethodNames } from "./sdk-calls.js"

describe("resource methods", () => {
  it.each(SDK_CALLS)("$name → $method $path", async (call) => {
    const { fetch, calls } = mockFetch((req) =>
      req.url.includes("/v1/calls?") ? { body: { calls: [], total: 0, page: 1, page_size: 10 } } : { body: {} },
    )
    await call.invoke(client(fetch))

    expect(calls).toHaveLength(1)
    expect(calls[0]!.method).toBe(call.method)
    expect(calls[0]!.url).toBe(`${BASE_URL}${call.path}`)
    expect(calls[0]!.body).toEqual(call.body)
  })

  it("the table covers every public resource method", () => {
    const { fetch } = mockFetch()
    expect(publicMethodNames(client(fetch))).toEqual(SDK_CALLS.map((c) => c.name).sort())
  })

  it("URI-encodes ids", async () => {
    const { fetch, calls } = mockFetch()
    await client(fetch).agents.retrieve("a/b?c")
    expect(calls[0]!.url).toBe(`${BASE_URL}/v1/agents/a%2Fb%3Fc`)
  })

  it("rejects an empty id instead of calling the list route", async () => {
    const { fetch, calls } = mockFetch()
    expect(() => client(fetch).agents.retrieve("")).toThrow(DialgemError)
    expect(() => client(fetch).agents.functions.delete("ag_1", " ")).toThrow(DialgemError)
    expect(calls).toHaveLength(0)
  })

  it("resolves 204 responses to undefined", async () => {
    const { fetch } = mockFetch(() => ({ status: 204 }))
    await expect(client(fetch).phoneNumbers.delete("pn_1")).resolves.toBeUndefined()
  })

  it("omits undefined and null query params", async () => {
    // A JS caller (or a form mapping empty fields to null) must not send
    // `?gender=null`, which the service would treat as a literal filter value.
    const { fetch, calls } = mockFetch(() => ({ body: [] }))
    await client(fetch).voices.list({ provider: "cartesia", accent: undefined, gender: null as unknown as string })
    expect(calls[0]!.url).toBe(`${BASE_URL}/v1/voices?provider=cartesia`)
  })
})
