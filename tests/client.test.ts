import { DEFAULT_BASE_URL, Dialgem, DialgemError, VERSION, webhooks } from "@dialgem/sdk"
import { afterEach, describe, expect, it, vi } from "vitest"

import { client, mockFetch } from "./helpers.js"

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("Dialgem client", () => {
  it("authenticates with X-API-Key, never Authorization", async () => {
    // The API only tries a Bearer value as a session JWT; an org key
    // sent that way is a 401.
    const { fetch, calls } = mockFetch(() => ({ body: [] }))
    await client(fetch, { apiKey: "zk_live_abc" }).agents.list()
    expect(calls[0]!.headers["X-API-Key"]).toBe("zk_live_abc")
    expect(calls[0]!.headers).not.toHaveProperty("Authorization")
  })

  it("sends a versioned User-Agent and JSON content type only with a body", async () => {
    const { fetch, calls } = mockFetch()
    const c = client(fetch)
    await c.agents.list()
    await c.agents.create({ name: "A" })
    expect(calls[0]!.headers["User-Agent"]).toMatch(new RegExp(`^dialgem-sdk-node/${VERSION.replace(/\./g, "\\.")} node/v`))
    expect(calls[0]!.headers).not.toHaveProperty("Content-Type")
    expect(calls[1]!.headers["Content-Type"]).toBe("application/json")
  })

  it("merges default and per-request headers, per-request winning", async () => {
    const { fetch, calls } = mockFetch()
    const c = client(fetch, { defaultHeaders: { "X-Tenant": "a", "X-Trace": "1" } })
    await c.agents.list({ headers: { "X-Trace": "2" } })
    expect(calls[0]!.headers["X-Tenant"]).toBe("a")
    expect(calls[0]!.headers["X-Trace"]).toBe("2")
  })

  it("lets a caller override a built-in header in any case, without duplicating it", async () => {
    // A plain spread kept both `X-API-Key` and `x-api-key`; fetch joins them into
    // "zk_a, zk_b", which the service rejects.
    const { fetch, calls } = mockFetch()
    await client(fetch, { apiKey: "zk_a", defaultHeaders: { "x-api-key": "zk_b" } }).agents.list({
      headers: { "user-agent": "my-app/1.0" },
    })
    const names = Object.keys(calls[0]!.headers).map((h) => h.toLowerCase())
    expect(names.filter((h) => h === "x-api-key")).toHaveLength(1)
    expect(names.filter((h) => h === "user-agent")).toHaveLength(1)
    expect(calls[0]!.headers["x-api-key"]).toBe("zk_b")
    expect(calls[0]!.headers["user-agent"]).toBe("my-app/1.0")
  })

  it("never follows redirects", async () => {
    const { fetch, calls } = mockFetch()
    await client(fetch).agents.list()
    expect(calls[0]!.redirect).toBe("manual")
  })

  it("reads DIALGEM_API_KEY and DIALGEM_BASE_URL from the environment", async () => {
    vi.stubEnv("DIALGEM_API_KEY", "zk_env")
    vi.stubEnv("DIALGEM_BASE_URL", "http://localhost:8002/")
    const { fetch, calls } = mockFetch(() => ({ body: [] }))
    const c = new Dialgem({ fetch })
    await c.agents.list()
    expect(calls[0]!.url).toBe("http://localhost:8002/v1/agents")
    expect(calls[0]!.headers["X-API-Key"]).toBe("zk_env")
  })

  it("defaults to the production API", () => {
    vi.stubEnv("DIALGEM_BASE_URL", "")
    const c = new Dialgem({ apiKey: "zk", fetch: mockFetch().fetch })
    expect(c.baseURL).toBe(DEFAULT_BASE_URL)
    expect(DEFAULT_BASE_URL).toBe("https://api.dialgem.com")
  })

  it("throws a clear error without an API key", () => {
    vi.stubEnv("DIALGEM_API_KEY", "")
    expect(() => new Dialgem({ fetch: mockFetch().fetch })).toThrow(/Missing API key/)
  })

  it.each([
    ["timeout", -1],
    ["timeout", 0],
    ["timeout", 1.5],
    ["maxRetries", -1],
    ["maxRetries", Number.NaN],
  ])("rejects invalid %s %s", (name, value) => {
    expect(() => client(mockFetch().fetch, { [name]: value })).toThrow(DialgemError)
  })

  it("rejects an invalid per-request timeout before sending", async () => {
    // timeout: 0 used to abort every attempt instantly and surface as a timeout.
    const { fetch, calls } = mockFetch()
    await expect(client(fetch).agents.list({ timeout: 0 })).rejects.toThrow(/positive integer/)
    expect(calls).toHaveLength(0)
  })

  it("accepts maxRetries: 0 and explicit undefined options", () => {
    expect(() => client(mockFetch().fetch, { maxRetries: 0, timeout: undefined, baseURL: undefined })).not.toThrow()
  })

  it("refuses to run in a browser unless explicitly allowed", () => {
    vi.stubGlobal("window", {})
    vi.stubGlobal("document", {})
    expect(() => client(mockFetch().fetch)).toThrow(/server-side use/)
    expect(() => client(mockFetch().fetch, { dangerouslyAllowBrowser: true })).not.toThrow()
  })

  it("exposes webhooks statically and on the instance", () => {
    expect(Dialgem.webhooks).toBe(webhooks)
    expect(client(mockFetch().fetch).webhooks).toBe(webhooks)
  })
})
