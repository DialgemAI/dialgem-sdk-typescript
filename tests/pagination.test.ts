import type { Call } from "@dialgem/sdk"
import { describe, expect, it } from "vitest"

import { client, mockFetch, type RecordedRequest } from "./helpers.js"

/**
 * A fake `GET /v1/calls` in cursor mode over `total` calls. The cursor names the
 * index of the last call returned, standing in for the API's opaque keyset key.
 */
function callsServer(total: number) {
  return (req: RecordedRequest) => {
    const url = new URL(req.url)
    const limit = Number(url.searchParams.get("limit"))
    const key = url.searchParams.get("pagination_key")
    const start = key === null ? 0 : Number(key.replace("after-", "")) + 1
    const calls = Array.from({ length: Math.max(0, Math.min(limit, total - start)) }, (_, i) => ({
      id: `call_${start + i}`,
    }))
    const has_more = start + calls.length < total
    return {
      body: { calls, has_more, pagination_key: has_more ? `after-${start + calls.length - 1}` : null },
    }
  }
}

describe("calls.list pagination", () => {
  it("awaits to a single page", async () => {
    const { fetch, calls } = mockFetch(callsServer(25))
    const page = await client(fetch).calls.list({ limit: 10, status: "completed" })

    expect(page.data.map((c) => c.id)).toEqual(Array.from({ length: 10 }, (_, i) => `call_${i}`))
    expect(page.has_more).toBe(true)
    expect(page.hasNextPage()).toBe(true)
    expect(calls).toHaveLength(1)
    const params = new URL(calls[0]!.url).searchParams
    expect(params.get("status")).toBe("completed")
    expect(params.get("limit")).toBe("10")
    expect(params.has("pagination_key")).toBe(false)
  })

  it("always asks for cursor mode, defaulting the limit", async () => {
    const { fetch, calls } = mockFetch(callsServer(3))
    await client(fetch).calls.list()
    expect(new URL(calls[0]!.url).searchParams.get("limit")).toBe("10")
  })

  it("iterates every item across pages, passing the cursor back", async () => {
    const { fetch, calls } = mockFetch(callsServer(25))
    const seen: Call[] = []
    for await (const call of client(fetch).calls.list({ limit: 10 })) seen.push(call)

    expect(seen.map((c) => c.id)).toEqual(Array.from({ length: 25 }, (_, i) => `call_${i}`))
    expect(calls.map((r) => new URL(r.url).searchParams.get("pagination_key"))).toEqual([null, "after-9", "after-19"])
  })

  it("stops when the server says there is no more, even on a full page", async () => {
    const { fetch, calls } = mockFetch(callsServer(20))
    let n = 0
    for await (const _ of client(fetch).calls.list({ limit: 10 })) n++
    expect(n).toBe(20)
    expect(calls).toHaveLength(2)
  })

  it("stops when has_more is true but no key came back", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: { calls: [{ id: "a" }], has_more: true, pagination_key: null } }))
    const ids: string[] = []
    for await (const call of client(fetch).calls.list()) ids.push(call.id)
    expect(ids).toEqual(["a"])
    expect(calls).toHaveLength(1)
  })

  it("is lazy, and awaiting then iterating reuses page one", async () => {
    const { fetch, calls } = mockFetch(callsServer(15))
    const list = client(fetch).calls.list({ limit: 10 })
    expect(calls).toHaveLength(0)

    await list
    let n = 0
    for await (const _ of list) n++
    expect(n).toBe(15)
    expect(calls).toHaveLength(2)
  })

  it("getNextPage walks forward and refuses past the end", async () => {
    const { fetch } = mockFetch(callsServer(15))
    const first = await client(fetch).calls.list({ limit: 10 })
    const second = await first.getNextPage()
    expect(second.data).toHaveLength(5)
    expect(second.hasNextPage()).toBe(false)
    await expect(second.getNextPage()).rejects.toThrow(/No next page/)
  })
})

describe("calls.list filters", () => {
  it("sends arrays as repeated parameters and metadata as metadata.<key>", async () => {
    const { fetch, calls } = mockFetch(callsServer(0))
    await client(fetch).calls.list({
      agent_id: ["a1", "a2"],
      status: ["completed", "failed"],
      disconnection_reason: "user_hangup",
      call_successful: false,
      start_after: 1767225600000,
      metadata: { crm_id: 42, tier: "gold" },
      sort_order: "asc",
    })
    const params = new URL(calls[0]!.url).searchParams
    expect(params.getAll("agent_id")).toEqual(["a1", "a2"])
    expect(params.getAll("status")).toEqual(["completed", "failed"])
    expect(params.get("disconnection_reason")).toBe("user_hangup")
    expect(params.get("call_successful")).toBe("false")
    expect(params.get("start_after")).toBe("1767225600000")
    expect(params.get("metadata.crm_id")).toBe("42")
    expect(params.get("metadata.tier")).toBe("gold")
    expect(params.get("sort_order")).toBe("asc")
    expect(params.has("metadata")).toBe(false)
  })
})
