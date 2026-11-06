import { describe, expect, it } from "vitest"

import { client, mockFetch } from "./helpers.js"

const llm = (id: string) => ({ id, llm_id: id, name: "n", system_prompt: "", llm_model: "gpt-4o-mini" })

describe("llms.list", () => {
  it("walks every page by pagination_key", async () => {
    const { fetch, calls } = mockFetch((req) => {
      const key = new URL(req.url).searchParams.get("pagination_key")
      return !key
        ? { body: { llms: [llm("a"), llm("b")], has_more: true, pagination_key: "k1" } }
        : { body: { llms: [llm("c")], has_more: false, pagination_key: null } }
    })
    const ids: string[] = []
    for await (const l of client(fetch).llms.list({ limit: 2 })) ids.push(l.id)
    expect(ids).toEqual(["a", "b", "c"])
    expect(new URL(calls[1]!.url).searchParams.get("pagination_key")).toBe("k1")
  })
})

describe("agents with a saved LLM", () => {
  it("accepts llm_id on create and update", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: { agent_id: "ag" } }))
    const c = client(fetch)
    await c.agents.create({ name: "a", llm_id: "l1" })
    await c.agents.update("ag", { llm_id: "l2" })
    expect(calls[0]!.body).toEqual({ name: "a", llm_id: "l1" })
    expect(calls[1]!.body).toEqual({ llm_id: "l2" })
  })
})
