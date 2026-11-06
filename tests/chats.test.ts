import { describe, expect, it } from "vitest"

import { client, mockFetch } from "./helpers.js"

const chat = (id: string) => ({
  id,
  chat_id: id,
  chat_status: "ongoing",
  chat_cost: { combined_cost: 50, reply_count: 1 },
  messages: [],
})

describe("chats.list", () => {
  it("walks every page by pagination_key and keeps the filters", async () => {
    const { fetch, calls } = mockFetch((req) => {
      const key = new URL(req.url).searchParams.get("pagination_key")
      return !key
        ? { body: { chats: [chat("a"), chat("b")], has_more: true, pagination_key: "k1" } }
        : { body: { chats: [chat("c")], has_more: false, pagination_key: null } }
    })
    const ids: string[] = []
    for await (const c of client(fetch).chats.list({ status: "ended", agent_id: "ag_1" })) ids.push(c.id)
    expect(ids).toEqual(["a", "b", "c"])
    for (const call of calls) {
      const q = new URL(call.url).searchParams
      expect(q.get("status")).toBe("ended")
      expect(q.get("agent_id")).toBe("ag_1")
    }
    expect(new URL(calls[1]!.url).searchParams.get("pagination_key")).toBe("k1")
  })
})

describe("chats.sendMessage", () => {
  it("sends the text as `content`", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: { chat_id: "c", chat_status: "ongoing", messages: [] } }))
    await client(fetch).chats.sendMessage("ch_1", "hi there")
    expect(calls[0]!.body).toEqual({ content: "hi there" })
  })

  it("is not retried: a second attempt could put the message in the chat twice", async () => {
    const { fetch, calls } = mockFetch(() => ({ status: 503, body: { err_code: "HTTP_503", err_msg: "down", request_id: "r" } }))
    await expect(client(fetch, { maxRetries: 2 }).chats.sendMessage("ch_1", "hi")).rejects.toThrow()
    expect(calls).toHaveLength(1)
  })

  it("refuses an empty chat id instead of posting to /v1/chats//messages", () => {
    const { fetch } = mockFetch(() => ({ body: {} }))
    expect(() => client(fetch).chats.sendMessage("", "hi")).toThrow()
  })
})
