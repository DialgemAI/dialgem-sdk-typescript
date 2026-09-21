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
    if (!call.skipBody) expect(calls[0]!.body).toEqual(call.body)
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

  it("rejects a version that is not a published version number", async () => {
    // 0 is the draft and is read through `agents.retrieve`; a fraction or a
    // negative would reach the server as a 404 with nothing pointing back at
    // the caller's own value.
    const { fetch, calls } = mockFetch()
    for (const bad of [0, -1, 1.5, Number.NaN]) {
      expect(() => client(fetch).agents.versions.retrieve("ag_1", bad)).toThrow(DialgemError)
    }
    expect(calls).toHaveLength(0)
  })

  it("unwraps the versions envelope into an array", async () => {
    const { fetch } = mockFetch(() => ({ body: { versions: [{ version: 2 }, { version: 1 }], has_more: true } }))
    await expect(client(fetch).agents.versions.list("ag_1")).resolves.toEqual([
      { version: 2 },
      { version: 1 },
    ])
  })

  it("keeps has_more on listPage, which is the point of having both", async () => {
    const { fetch } = mockFetch(() => ({ body: { versions: [{ version: 2 }], has_more: true } }))
    await expect(client(fetch).agents.versions.listPage("ag_1", { limit: 1 })).resolves.toEqual({
      versions: [{ version: 2 }],
      has_more: true,
    })
  })

  it("publishes with no body at all", async () => {
    const { fetch, calls } = mockFetch()
    await client(fetch).agents.versions.publish("ag_1")
    expect(calls[0]!.body).toEqual({})
  })

  it("uploads clone audio as multipart, with a filename on every part", async () => {
    // The provider infers the audio container from the filename, so a part
    // without one is a clone that fails at the provider for a reason the
    // caller cannot see from here.
    const { fetch, calls } = mockFetch(() => ({ body: { id: "v_1" } }))
    await client(fetch).voices.clone({
      name: "Ada",
      files: [
        new Blob([new Uint8Array([1])], { type: "audio/mpeg" }),
        new Blob([new Uint8Array([2])], { type: "audio/wav" }),
      ],
      filenames: ["first.mp3"],
      consent_confirmed: true,
      engine: "cartesia",
      description: "support",
      language: "de",
    })

    const form = calls[0]!.body as FormData
    expect(form).toBeInstanceOf(FormData)
    expect(form.get("name")).toBe("Ada")
    expect(form.get("consent_confirmed")).toBe("true")
    expect(form.get("engine")).toBe("cartesia")
    expect(form.get("description")).toBe("support")
    expect(form.get("language")).toBe("de")
    const parts = form.getAll("files") as File[]
    expect(parts).toHaveLength(2)
    expect(parts[0]!.name).toBe("first.mp3")
    expect(parts[1]!.name).toBe("clip-2.wav")
  })

  it("does not set Content-Type on a multipart upload", async () => {
    // Only fetch knows the boundary it is about to generate; setting the
    // header ourselves produces a request no server can parse.
    const { fetch, calls } = mockFetch(() => ({ body: { id: "v_1" } }))
    await client(fetch).voices.clone({
      name: "Ada",
      files: [new Blob([new Uint8Array([1])])],
      consent_confirmed: true,
    })
    const names = Object.keys(calls[0]!.headers).map((h) => h.toLowerCase())
    expect(names).not.toContain("content-type")
    expect(names).toContain("x-api-key")
  })

  it("never retries a multipart upload, even when asked to", async () => {
    // A retried multipart body can send truncated audio, and a clone built
    // from half a recording succeeds and sounds wrong.
    const { fetch, calls } = mockFetch(() => ({ status: 503, body: { err_msg: "nope" } }))
    await expect(
      client(fetch).voices.clone(
        { name: "Ada", files: [new Blob([new Uint8Array([1])])], consent_confirmed: true },
        { maxRetries: 3 },
      ),
    ).rejects.toThrow()
    expect(calls).toHaveLength(1)
  })

  it("refuses to upload audio without the consent assertion", async () => {
    const { fetch, calls } = mockFetch()
    expect(() =>
      client(fetch).voices.clone({
        name: "Ada",
        files: [new Blob([new Uint8Array([1])])],
        consent_confirmed: false as unknown as true,
      }),
    ).toThrow(DialgemError)
    expect(calls).toHaveLength(0)
  })

  it("refuses a clone with no audio", async () => {
    const { fetch, calls } = mockFetch()
    expect(() =>
      client(fetch).voices.clone({ name: "Ada", files: [], consent_confirmed: true }),
    ).toThrow(DialgemError)
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
