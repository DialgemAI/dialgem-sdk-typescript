import { describe, expect, it } from "vitest"

import { client, mockFetch } from "./helpers.js"

describe("webCalls", () => {
  it("creates a call and hands back the token, sending only what the backend chose", async () => {
    const { fetch, calls } = mockFetch(() => ({ status: 201, body: { call_id: "c1", access_token: "tok", expires_in: 60 } }))
    const out = await client(fetch).webCalls.create({
      agent_id: "ag_1",
      agent_version: "latest_published",
      metadata: { visitor: "v_1" },
      dialgem_llm_dynamic_variables: { name: "Ada" },
    })
    expect(out.access_token).toBe("tok")
    expect(calls[0]!.method).toBe("POST")
    expect(calls[0]!.body).toEqual({
      agent_id: "ag_1",
      agent_version: "latest_published",
      metadata: { visitor: "v_1" },
      dialgem_llm_dynamic_variables: { name: "Ada" },
    })
  })

  it("surfaces the reasons creating a call can be refused", async () => {
    for (const [status, err_code] of [[409, "web_origins_not_configured"], [402, "insufficient_credit"], [429, "rate_limited"]] as const) {
      const { fetch } = mockFetch(() => ({ status, body: { err_code, err_msg: "x" } }))
      await expect(client(fetch).webCalls.create({ agent_id: "a" })).rejects.toMatchObject({ status })
    }
  })

  it("reads and replaces the allowed origins", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: { allowed_origins: ["https://a.io"], any_origin: false, limits: {} } }))
    const c = client(fetch)
    await c.webCalls.retrieveSettings()
    const out = await c.webCalls.updateSettings({ allowed_origins: ["https://a.io"] })
    expect(out.allowed_origins).toEqual(["https://a.io"])
    expect(calls.map((r) => [r.method, new URL(r.url).pathname, r.body])).toEqual([
      ["GET", "/v1/web-calls/settings", undefined],
      ["PUT", "/v1/web-calls/settings", { allowed_origins: ["https://a.io"] }],
    ])
  })
})
