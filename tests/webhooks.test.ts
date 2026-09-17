import {
  DEFAULT_SIGNATURE_TOLERANCE_MS,
  Dialgem,
  DialgemError,
  WebhookVerificationError,
  webhooks,
  type WebhookEvent,
} from "@dialgem/sdk"
import { describe, expect, it } from "vitest"

import fixture from "./fixtures/webhook-vectors.json" with { type: "json" }

const { secret, vectors } = fixture
const ended = vectors.find((v) => v.body.includes('"event":"call_ended"'))!
const analyzed = vectors.find((v) => v.body.includes('"event":"call_analyzed"'))!
const fnCall = vectors.find((v) => v.kind === "function")!
const at = (v: { timestamp: number }, offset = 0) => ({ now: v.timestamp + offset })

describe("webhooks.verify", () => {
  it.each(vectors.map((v) => [v.kind, v] as const))("accepts a %s body signed by the Dialgem service", async (_kind, v) => {
    expect(await webhooks.verify(v.body, v.signature, secret, at(v))).toBe(true)
  })

  it("accepts the body as Buffer, Uint8Array and ArrayBuffer", async () => {
    const bytes = new TextEncoder().encode(ended.body)
    expect(await webhooks.verify(Buffer.from(ended.body, "utf8"), ended.signature, secret, at(ended))).toBe(true)
    expect(await webhooks.verify(bytes, ended.signature, secret, at(ended))).toBe(true)
    expect(await webhooks.verify(bytes.buffer.slice(0), ended.signature, secret, at(ended))).toBe(true)
  })

  it("accepts a Buffer that is a slice of a larger pooled ArrayBuffer", async () => {
    const pool = Buffer.from(`xxxx${ended.body}yyyy`, "utf8")
    const slice = pool.subarray(4, pool.length - 4)
    expect(slice.byteOffset).toBeGreaterThan(0)
    expect(await webhooks.verify(slice, ended.signature, secret, at(ended))).toBe(true)
  })

  it("accepts a header array", async () => {
    expect(await webhooks.verify(ended.body, [ended.signature], secret, at(ended))).toBe(true)
  })

  it("rejects a tampered body", async () => {
    expect(await webhooks.verify(ended.body.replace("42500", "4250"), ended.signature, secret, at(ended))).toBe(false)
  })

  it("rejects a re-serialized body even though the JSON is equal", async () => {
    const reserialized = JSON.stringify(JSON.parse(ended.body), null, 1)
    expect(reserialized).not.toBe(ended.body)
    expect(await webhooks.verify(reserialized, ended.signature, secret, at(ended))).toBe(false)
  })

  it("rejects non-ASCII text escaped on the way through a proxy", async () => {
    expect(ended.body).toContain("Zoë")
    const escaped = ended.body.replace(/Zoë/g, "Zo\\u00eb")
    expect(await webhooks.verify(escaped, ended.signature, secret, at(ended))).toBe(false)
  })

  it("rejects the wrong secret", async () => {
    expect(await webhooks.verify(ended.body, ended.signature, "whsec_other", at(ended))).toBe(false)
  })

  it("binds the timestamp: a signature moved to another timestamp fails", async () => {
    const moved = ended.signature.replace(`v=${ended.timestamp}`, `v=${ended.timestamp + 1}`)
    expect(await webhooks.verify(ended.body, moved, secret, at(ended))).toBe(false)
  })

  it("rejects a replayed (stale) or future-dated signature", async () => {
    const tolerance = DEFAULT_SIGNATURE_TOLERANCE_MS
    expect(await webhooks.verify(ended.body, ended.signature, secret, at(ended, tolerance))).toBe(true)
    expect(await webhooks.verify(ended.body, ended.signature, secret, at(ended, tolerance + 1))).toBe(false)
    expect(await webhooks.verify(ended.body, ended.signature, secret, at(ended, -tolerance - 1))).toBe(false)
  })

  it("honours a custom tolerance", async () => {
    const opts = { now: ended.timestamp + 10_000, toleranceMs: 5_000 }
    expect(await webhooks.verify(ended.body, ended.signature, secret, opts)).toBe(false)
  })

  it.each([undefined, null, "", "abc", "v=1,d=zz", `d=${"0".repeat(64)}`, []])(
    "returns false for a missing or malformed signature: %j",
    async (sig) => {
      expect(await webhooks.verify(ended.body, sig as string | undefined, secret, at(ended))).toBe(false)
    },
  )

  it("throws on an empty secret — a config error, not a bad request", async () => {
    await expect(webhooks.verify(ended.body, ended.signature, "", at(ended))).rejects.toBeInstanceOf(DialgemError)
  })

  it("uses the real clock by default, so an old vector is stale", async () => {
    expect(await webhooks.verify(ended.body, ended.signature, secret)).toBe(false)
  })
})

describe("webhooks.constructEvent", () => {
  it("returns the typed event with the full call record", async () => {
    const event: WebhookEvent = await Dialgem.webhooks.constructEvent(ended.body, ended.signature, secret, at(ended))
    expect(event.event).toBe("call_ended")
    expect(event.call.duration_ms).toBe(42500)
    expect(event.call.metadata).toEqual({ crm_id: "42" })
    expect(event.call_id).toBe(event.call.id)
  })

  it("decodes non-ASCII from bytes and exposes the summary", async () => {
    const event = await webhooks.constructEvent(Buffer.from(analyzed.body), analyzed.signature, secret, at(analyzed))
    expect(event.event).toBe("call_analyzed")
    expect(event.call.analysis?.call_summary).toBe("Greeted Zoë.")
    expect(event.call.dynamic_variables["name"]).toBe("Zoë")
  })

  it("throws WebhookVerificationError on a bad signature", async () => {
    await expect(
      webhooks.constructEvent(ended.body, `v=${ended.timestamp},d=${"0".repeat(64)}`, secret, at(ended)),
    ).rejects.toBeInstanceOf(WebhookVerificationError)
  })

  it("throws a helpful WebhookVerificationError when the header is missing", async () => {
    await expect(webhooks.constructEvent(ended.body, undefined, secret)).rejects.toThrow(/Missing x-dialgem-signature/)
  })

  it("refuses a signed function request body, which has no event", async () => {
    await expect(webhooks.constructEvent(fnCall.body, fnCall.signature, secret, at(fnCall))).rejects.toThrow(/no `event`/)
  })
})

describe("webhooks.constructFunctionCall", () => {
  it("returns the function name, call context and typed args", async () => {
    const req = await webhooks.constructFunctionCall<{ order_id: string }>(
      fnCall.body,
      fnCall.signature,
      secret,
      at(fnCall),
    )
    expect(req.name).toBe("lookup_order")
    expect(req.args.order_id).toBe("A1")
    expect(req.call.metadata).toEqual({ crm_id: "42" })
    expect(req.call.dynamic_variables).toEqual({ name: "Zoë" })
  })

  it("rejects an event body", async () => {
    await expect(webhooks.constructFunctionCall(ended.body, ended.signature, secret, at(ended))).rejects.toThrow(
      /args_at_root/,
    )
  })
})
