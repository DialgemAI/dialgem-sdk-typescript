import { DialgemError } from "@dialgem/sdk"
import { describe, expect, it } from "vitest"

import { client, mockFetch } from "./helpers.js"

const contact = (id: string, phone = "+14155552671") => ({
  id,
  phone,
  first_name: null,
  last_name: null,
  email: null,
  timezone: null,
  attributes: {},
  source: "api",
  do_not_call: false,
  created_at: "2026-10-28T09:00:00",
  updated_at: "2026-10-28T09:00:00",
})

describe("contacts.list", () => {
  it("walks every page by cursor and keeps the filters on each request", async () => {
    const { fetch, calls } = mockFetch((req) => {
      const cursor = new URL(req.url).searchParams.get("cursor")
      return !cursor
        ? { body: { contacts: [contact("a"), contact("b")], total: 3, next_cursor: "cur_1" } }
        : { body: { contacts: [contact("c")], total: 3, next_cursor: null } }
    })
    const ids: string[] = []
    for await (const c of client(fetch).contacts.list({ q: "ada", list_id: "cl_1" })) ids.push(c.id)

    expect(ids).toEqual(["a", "b", "c"])
    expect(calls).toHaveLength(2)
    for (const call of calls) {
      const q = new URL(call.url).searchParams
      expect(q.get("q")).toBe("ada")
      expect(q.get("list_id")).toBe("cl_1")
    }
    expect(new URL(calls[0]!.url).searchParams.has("cursor")).toBe(false)
    expect(new URL(calls[1]!.url).searchParams.get("cursor")).toBe("cur_1")
  })

  it("exposes one page with has_more and the cursor, and omits filters that were not given", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: { contacts: [contact("a")], total: 9, next_cursor: "cur_9" } }))
    const page = await client(fetch).contacts.list({ q: undefined })
    expect(page.data.map((c) => c.id)).toEqual(["a"])
    expect(page.has_more).toBe(true)
    expect(page.pagination_key).toBe("cur_9")
    expect(new URL(calls[0]!.url).search).toBe("")
  })
})

describe("contacts", () => {
  it("encodes ids into the path and refuses an empty one", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: {} }))
    const c = client(fetch)
    await c.contacts.retrieve("a/b ?")
    expect(new URL(calls[0]!.url).pathname).toBe("/v1/contacts/a%2Fb%20%3F")
    expect(() => c.contacts.delete("")).toThrow(DialgemError)
    expect(() => c.contactLists.removeContact("cl_1", " ")).toThrow(DialgemError)
    expect(calls).toHaveLength(1)
  })

  it("passes the calls limit as a query parameter", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: { total: 0, calls: [] } }))
    await client(fetch).contacts.calls("ct_1", { limit: 5 })
    expect(new URL(calls[0]!.url).searchParams.get("limit")).toBe("5")
  })

  it("is not retried on POST: creating a contact must not repeat", async () => {
    const { fetch, calls } = mockFetch(() => ({ status: 503, body: { err_code: "HTTP_503", err_msg: "down", request_id: "r" } }))
    await expect(client(fetch, { maxRetries: 2 }).contacts.create({ phone: "+14155552671" })).rejects.toThrow()
    expect(calls).toHaveLength(1)
  })
})

describe("contacts.imports", () => {
  it("runs the preview then commit flow against the right routes", async () => {
    const imp = (status: string, dry_run: boolean) => ({ id: "im_1", status, dry_run })
    const { fetch, calls } = mockFetch((req) => {
      if (req.url.endsWith("/commit")) return { status: 202, body: imp("queued", false) }
      if (req.method === "POST") return { status: 202, body: imp("queued", true) }
      return { body: imp("previewed", true) }
    })
    const c = client(fetch)
    const started = await c.contacts.imports.create({ csv: "phone\n+14155552671", dry_run: true, default_country: "US" })
    expect(started.status).toBe("queued")
    expect((await c.contacts.imports.retrieve("im_1")).status).toBe("previewed")
    await c.contacts.imports.commit("im_1")

    expect(calls.map((r) => `${r.method} ${new URL(r.url).pathname}`)).toEqual([
      "POST /v1/contacts/imports",
      "GET /v1/contacts/imports/im_1",
      "POST /v1/contacts/imports/im_1/commit",
    ])
    expect(calls[0]!.body).toEqual({ csv: "phone\n+14155552671", dry_run: true, default_country: "US" })
  })

  it("errors() takes a limit; cancel() is a DELETE", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: {} }))
    const c = client(fetch)
    await c.contacts.imports.errors("im_1", { limit: 50 })
    await c.contacts.imports.cancel("im_1")
    expect(new URL(calls[0]!.url).searchParams.get("limit")).toBe("50")
    expect(calls[1]!.method).toBe("DELETE")
  })
})

describe("contactLists", () => {
  it("addContacts posts the ids as contact_ids", async () => {
    const { fetch, calls } = mockFetch(() => ({ body: { id: "cl_1", added: 2, member_count: 2 } }))
    const res = await client(fetch).contactLists.addContacts("cl_1", ["a", "b"])
    expect(res.added).toBe(2)
    expect(calls[0]!.body).toEqual({ contact_ids: ["a", "b"] })
  })
})
