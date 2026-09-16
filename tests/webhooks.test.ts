import { Dialgem, DialgemError, WebhookVerificationError, webhooks, type WebhookEvent } from "@dialgem/sdk"
import { describe, expect, it } from "vitest"

import fixture from "./fixtures/webhook-vectors.json" with { type: "json" }

const { secret, vectors } = fixture
const ended = vectors[0]!
const analyzed = vectors[1]!

describe("webhooks.verify", () => {
  it.each(vectors.map((v) => [JSON.parse(v.body).event as string, v]))(
    "accepts a %s body signed by the Dialgem service",
    async (_event, v) => {
      expect(await webhooks.verify(v.body, v.sig, secret)).toBe(true)
    },
  )

  it("accepts the body as Buffer, Uint8Array and ArrayBuffer", async () => {
    const bytes = new TextEncoder().encode(ended.body)
    expect(await webhooks.verify(Buffer.from(ended.body, "utf8"), ended.sig, secret)).toBe(true)
    expect(await webhooks.verify(bytes, ended.sig, secret)).toBe(true)
    expect(await webhooks.verify(bytes.buffer.slice(0), ended.sig, secret)).toBe(true)
  })

  it("accepts a Buffer that is a slice of a larger pooled ArrayBuffer", async () => {
    // Small Buffers share Node's pool, so the view starts partway into a bigger
    // ArrayBuffer. Hashing `slice.buffer` instead of the view would sign garbage.
    const pool = Buffer.from(`xxxx${ended.body}yyyy`, "utf8")
    const slice = pool.subarray(4, pool.length - 4)
    expect(slice.byteOffset).toBeGreaterThan(0)
    expect(slice.buffer.byteLength).toBeGreaterThan(slice.byteLength)
    expect(await webhooks.verify(slice, ended.sig, secret)).toBe(true)
  })

  it("accepts an uppercase signature and a header array", async () => {
    expect(await webhooks.verify(ended.body, ended.sig.toUpperCase(), secret)).toBe(true)
    expect(await webhooks.verify(ended.body, [ended.sig], secret)).toBe(true)
  })

  it("rejects a tampered body", async () => {
    expect(await webhooks.verify(ended.body.replace("42.5", "4200"), ended.sig, secret)).toBe(false)
  })

  it("rejects a re-serialized body even though the JSON is equal", async () => {
    // Python's json.dumps uses ", " and ": "; JSON.stringify does not. This is the
    // express.json() mistake the README warns about.
    const reserialized = JSON.stringify(JSON.parse(ended.body))
    expect(reserialized).not.toBe(ended.body)
    expect(await webhooks.verify(reserialized, ended.sig, secret)).toBe(false)
  })

  it("rejects the non-ASCII body once \\u escapes are decoded", async () => {
    // Python sends "Zoë" (ensure_ascii). A proxy or logger that "normalizes"
    // the escape to the literal character changes the bytes, and the signature.
    expect(analyzed.body).toContain("Zo\\u00eb")
    const decoded = analyzed.body.replace("Zo\\u00eb", "Zoë")
    expect(await webhooks.verify(decoded, analyzed.sig, secret)).toBe(false)
  })

  it("rejects the wrong secret", async () => {
    expect(await webhooks.verify(ended.body, ended.sig, "whsec_other")).toBe(false)
  })

  it.each([undefined, null, "", "abc", "z".repeat(64), `${"0".repeat(63)}`, []])(
    "returns false for a missing or malformed signature: %j",
    async (sig) => {
      expect(await webhooks.verify(ended.body, sig as string | undefined, secret)).toBe(false)
    },
  )

  it("throws on an empty secret — a config error, not a bad request", async () => {
    await expect(webhooks.verify(ended.body, ended.sig, "")).rejects.toBeInstanceOf(DialgemError)
  })
})

describe("webhooks.constructEvent", () => {
  it("returns the typed event", async () => {
    const event: WebhookEvent = await Dialgem.webhooks.constructEvent(ended.body, ended.sig, secret)
    expect(event.event).toBe("call_ended")
    if (event.event === "call_ended") {
      expect(event.duration_s).toBe(42.5)
      expect(event.status).toBe("completed")
    }
  })

  it("decodes non-ASCII from bytes", async () => {
    const event = await webhooks.constructEvent(Buffer.from(analyzed.body), analyzed.sig, secret)
    expect(event.event === "call_analyzed" && event.analysis.variables["name"]).toBe("Zoë")
  })

  it("throws WebhookVerificationError on a bad signature", async () => {
    await expect(webhooks.constructEvent(ended.body, "0".repeat(64), secret)).rejects.toBeInstanceOf(
      WebhookVerificationError,
    )
  })

  it("throws a helpful WebhookVerificationError when the header is missing", async () => {
    await expect(webhooks.constructEvent(ended.body, undefined, secret)).rejects.toThrow(/Missing x-dialgem-signature/)
  })
})
