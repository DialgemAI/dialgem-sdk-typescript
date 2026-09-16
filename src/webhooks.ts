import { DialgemError, WebhookVerificationError } from "./core/errors.js"
import type { WebhookEvent } from "./types/webhook.js"

/** Header carrying the hex HMAC-SHA256 of the raw request body. */
export const WEBHOOK_SIGNATURE_HEADER = "x-dialgem-signature"
/** Header naming the event; the same value as the body's `event`. */
export const WEBHOOK_EVENT_HEADER = "x-dialgem-event"

/** The raw request body, byte-for-byte as received. Node `Buffer` is a `Uint8Array`. */
export type WebhookPayload = string | Uint8Array | ArrayBuffer

/** A header value as Node's `IncomingHttpHeaders`, `Headers.get()` or a framework hands it over. */
export type SignatureHeader = string | string[] | null | undefined

const encoder = new TextEncoder()
const decoder = new TextDecoder()

/**
 * Verifies and parses Dialgem webhooks.
 *
 * **Pass the raw body.** The signature covers the exact bytes Dialgem sent. A body
 * that was parsed and re-serialized (`express.json()`, `JSON.stringify(req.body)`)
 * will not match, even when the JSON is equal. Use `express.raw({ type: "application/json" })`,
 * Fastify's raw body, or `await request.text()` in a route handler.
 */
export class Webhooks {
  /**
   * Returns whether `signature` is the HMAC-SHA256 of `payload` under `secret`.
   * Constant-time. Returns `false` for a missing or malformed signature; throws only
   * if `secret` is empty, which is a configuration error rather than a bad request.
   */
  async verify(payload: WebhookPayload, signature: SignatureHeader, secret: string): Promise<boolean> {
    if (!secret) {
      throw new DialgemError(
        "Webhook secret is empty. Set the agent's `webhook_signing_secret` and pass the same value here.",
      )
    }
    const received = firstHeader(signature)?.trim().toLowerCase()
    if (!received || !/^[0-9a-f]{64}$/.test(received)) return false
    const expected = await hmacSha256Hex(secret, toBytes(payload))
    return timingSafeEqual(expected, received)
  }

  /**
   * Verifies the signature, then parses the body.
   *
   * @throws WebhookVerificationError if the signature is missing or does not match.
   */
  async constructEvent(payload: WebhookPayload, signature: SignatureHeader, secret: string): Promise<WebhookEvent> {
    if (!firstHeader(signature)) {
      throw new WebhookVerificationError(
        `Missing ${WEBHOOK_SIGNATURE_HEADER} header. Is a webhook_signing_secret set on the agent?`,
      )
    }
    if (!(await this.verify(payload, signature, secret))) {
      throw new WebhookVerificationError(
        "Webhook signature does not match the body. Check the secret, and that the body was not re-serialized before verification.",
      )
    }
    const text = typeof payload === "string" ? payload : decoder.decode(toBytes(payload))
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      throw new WebhookVerificationError("Webhook body is signed but is not valid JSON.")
    }
    if (typeof parsed !== "object" || parsed === null || typeof (parsed as { event?: unknown }).event !== "string") {
      throw new WebhookVerificationError("Webhook body has no `event` field.")
    }
    return parsed as WebhookEvent
  }
}

export const webhooks = new Webhooks()

function firstHeader(value: SignatureHeader): string | undefined {
  const v = Array.isArray(value) ? value[0] : value
  return v ?? undefined
}

function toBytes(payload: WebhookPayload): Uint8Array {
  if (typeof payload === "string") return encoder.encode(payload)
  if (payload instanceof Uint8Array) return payload
  return new Uint8Array(payload)
}

async function hmacSha256Hex(secret: string, data: Uint8Array): Promise<string> {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    throw new DialgemError("Web Crypto (globalThis.crypto.subtle) is unavailable. Node 20 or newer is required.")
  }
  const key = await subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"])
  // Copy into a fresh ArrayBuffer-backed view: a Node Buffer can be a slice of a
  // larger pooled ArrayBuffer, and some Web Crypto implementations reject SharedArrayBuffer views.
  const signature = await subtle.sign("HMAC", key, new Uint8Array(data))
  return Array.from(new Uint8Array(signature), (b) => b.toString(16).padStart(2, "0")).join("")
}

/** Compares two equal-format hex strings without an early exit. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}
