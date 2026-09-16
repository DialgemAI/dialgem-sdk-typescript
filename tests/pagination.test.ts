import type { Call } from "@dialgem/sdk"
import { describe, expect, it } from "vitest"

import { client, mockFetch, type RecordedRequest } from "./helpers.js"

/** A fake `GET /v1/calls` over `total` calls, honouring page/page_size like the API does. */
function callsServer(total: number) {
  return (req: RecordedRequest) => {
    const url = new URL(req.url)
    const page = Number(url.searchParams.get("page") ?? 1)
    const pageSize = Number(url.searchParams.get("page_size") ?? 10)
    const start = (page - 1) * pageSize
    const calls = Array.from({ length: Math.max(0, Math.min(pageSize, total - start)) }, (_, i) => ({
      id: `call_${start + i}`,
    }))
    return { body: { calls, total, page, page_size: pageSize } }
  }
}

describe("calls.list pagination", () => {
  it("awaits to a single page with metadata", async () => {
    const { fetch, calls } = mockFetch(callsServer(25))
    const page = await client(fetch).calls.list({ page_size: 10, status: "completed" })

    expect(page.data.map((c) => c.id)).toEqual(Array.from({ length: 10 }, (_, i) => `call_${i}`))
    expect(page).toMatchObject({ total: 25, page: 1, page_size: 10 })
    expect(page.hasNextPage()).toBe(true)
    expect(calls).toHaveLength(1)
    expect(new URL(calls[0]!.url).searchParams.get("status")).toBe("completed")
  })

  it("iterates every item across pages and stops at total", async () => {
    const { fetch, calls } = mockFetch(callsServer(25))
    const seen: Call[] = []
    for await (const call of client(fetch).calls.list({ page_size: 10 })) seen.push(call)

    expect(seen.map((c) => c.id)).toEqual(Array.from({ length: 25 }, (_, i) => `call_${i}`))
    expect(calls.map((r) => new URL(r.url).searchParams.get("page"))).toEqual(["1", "2", "3"])
  })

  it("does not request a page past an exact multiple", async () => {
    const { fetch, calls } = mockFetch(callsServer(20))
    let n = 0
    for await (const _ of client(fetch).calls.list({ page_size: 10 })) n++
    expect(n).toBe(20)
    expect(calls).toHaveLength(2)
  })

  it("starts from the requested page", async () => {
    const { fetch } = mockFetch(callsServer(25))
    const ids: string[] = []
    for await (const call of client(fetch).calls.list({ page: 3, page_size: 10 })) ids.push(call.id)
    expect(ids).toEqual(["call_20", "call_21", "call_22", "call_23", "call_24"])
  })

  it("stops on an empty page even if total says otherwise (rows deleted mid-iteration)", async () => {
    const { fetch, calls } = mockFetch((req) => {
      const page = Number(new URL(req.url).searchParams.get("page"))
      return { body: { calls: page === 1 ? [{ id: "a" }] : [], total: 50, page, page_size: 1 } }
    })
    const ids: string[] = []
    for await (const call of client(fetch).calls.list({ page_size: 1 })) ids.push(call.id)
    expect(ids).toEqual(["a"])
    expect(calls).toHaveLength(2)
  })

  it("is lazy, and awaiting then iterating reuses page one", async () => {
    const { fetch, calls } = mockFetch(callsServer(15))
    const list = client(fetch).calls.list({ page_size: 10 })
    expect(calls).toHaveLength(0)

    await list
    let n = 0
    for await (const _ of list) n++
    expect(n).toBe(15)
    expect(calls).toHaveLength(2)
  })

  it("getNextPage walks forward and refuses past the end", async () => {
    const { fetch } = mockFetch(callsServer(15))
    const first = await client(fetch).calls.list({ page_size: 10 })
    const second = await first.getNextPage()
    expect(second.data).toHaveLength(5)
    expect(second.hasNextPage()).toBe(false)
    await expect(second.getNextPage()).rejects.toThrow(/No next page/)
  })
})
