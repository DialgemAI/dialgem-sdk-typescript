import { describe, expect, it } from "vitest"

import { client, mockFetch } from "./helpers.js"

const flow = (id: string) => ({ id, flow_id: id, name: "n", language: "en", version: 1, node_count: 2 })

describe("flows.list", () => {
  it("walks every page by pagination_key", async () => {
    const { fetch, calls } = mockFetch((req) => {
      const key = new URL(req.url).searchParams.get("pagination_key")
      return !key
        ? { body: { flows: [flow("a"), flow("b")], has_more: true, pagination_key: "k1" } }
        : { body: { flows: [flow("c")], has_more: false, pagination_key: null } }
    })
    const ids: string[] = []
    for await (const f of client(fetch).flows.list({ limit: 2 })) ids.push(f.id)
    expect(ids).toEqual(["a", "b", "c"])
    expect(new URL(calls[1]!.url).searchParams.get("pagination_key")).toBe("k1")
    expect(new URL(calls[0]!.url).searchParams.get("limit")).toBe("2")
  })
})

describe("agents with a saved flow", () => {
  it("accepts flow_id on create and update", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: { agent_id: "ag" } }))
    const c = client(fetch)
    await c.agents.create({ name: "a", agent_type: "flow", flow_id: "fl_1" })
    await c.agents.update("ag", { flow_id: "fl_2" })
    expect(calls[0]!.body).toEqual({ name: "a", agent_type: "flow", flow_id: "fl_1" })
    expect(calls[1]!.body).toEqual({ flow_id: "fl_2" })
  })
})
