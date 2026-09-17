import { DialgemError, WebhookVerificationError } from "./core/errors.js"
import type { FunctionCallRequest, WebhookEvent } from "./types/webhook.js"

/** Header carrying the request signature: `v=<timestamp_ms>,d=<hex>`. */
export const WEBHOOK_SIGNATURE_HEADER = "x-dialgem-signature"
/** Header naming the event; the same value as the body's `event`. */
export const WEBHOOK_EVENT_HEADER = "x-dialgem-event"
/** Header with an id that stays the same across retries of one delivery. */
export const WEBHOOK_DELIVERY_HEADER = "x-dialgem-delivery"

/** Signatures older or newer than this are rejected, so a captured request cannot be replayed. */
export const DEFAULT_SIGNATURE_TOLERANCE_MS = 5 * 60 * 1000

/** The raw request body, byte-for-byte as received. Node `Buffer` is a `Uint8Array`. */
export type WebhookPayload = string | Uint8Array | ArrayBuffer

/** A header value as Node's `IncomingHttpHeaders`, `Headers.get()` or a framework hands it over. */
export type SignatureHeader = string | string[] | null | undefined

export interface VerifyOptions {
  /** Maximum age (and clock skew) of a signature, in ms. Default 5 minutes. */
  toleranceMs?: number | undefined
  /** The current time in epoch ms. For tests; defaults to `Date.now()`. */
  now?: number | undefined
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const SIGNATURE_RE = /^v=(\d{10,16}),d=([0-9a-f]{64})$/

/**
 * Verifies and parses what Dialgem sends to your servers: event webhooks, and
 * requests to your custom functions. Both use one signature scheme:
 *
 *   x-dialgem-signature: v=<timestamp_ms>,d=<hex>
 *   hex = HMAC-SHA256(secret, raw_body + timestamp_ms)
 *
 * The secret is the agent's `webhook_signing_secret`.
 *
 * **Pass the raw body.** The signature covers the exact bytes Dialgem sent. A body
 * that was parsed and re-serialized (`express.json()`, `JSON.stringify(req.body)`)
 * will not match, even when the JSON is equal. Use `express.raw({ type: "application/json" })`,
 * Fastify's raw body, or `await request.text()` in a route handler.
 */
export class Webhooks {
  /**
   * Returns whether `signature` is a current, valid signature of `payload` under
   * `secret`. Constant-time. Returns `false` for a missing, malformed, tampered or
   * stale signature; throws only if `secret` is empty, which is a configuration
   * error rather than a bad request.
   */
  async verify(
    payload: WebhookPayload,
    signature: SignatureHeader,
    secret: string,
    options: VerifyOptions = {},
  ): Promise<boolean> {
    if (!secret) {
      throw new DialgemError(
        "Webhook secret is empty. Set the agent's `webhook_signing_secret` and pass the same value here.",
      )
    }
    const match = SIGNATURE_RE.exec(firstHeader(signature)?.trim().toLowerCase() ?? "")
    if (!match) return false
    const [, timestamp, received] = match as unknown as [string, string, string]
    const now = options.now ?? Date.now()
    if (Math.abs(now - Number(timestamp)) > (options.toleranceMs ?? DEFAULT_SIGNATURE_TOLERANCE_MS)) {
      return false
    }
    const body = toBytes(payload)
    const message = new Uint8Array(body.length + timestamp.length)
    message.set(body, 0)
    message.set(encoder.encode(timestamp), body.length)
    const expected = await hmacSha256Hex(secret, message)
    return timingSafeEqual(expected, received)
  }

  /**
   * Verifies a webhook's signature, then parses its body.
   *
   * @throws WebhookVerificationError if the signature is missing, invalid or stale.
   */
  async constructEvent(
    payload: WebhookPayload,
    signature: SignatureHeader,
    secret: string,
    options: VerifyOptions = {},
  ): Promise<WebhookEvent> {
    const parsed = await this.#verifiedJson(payload, signature, secret, options)
    if (typeof parsed !== "object" || parsed === null || typeof (parsed as { event?: unknown }).event !== "string") {
      throw new WebhookVerificationError("Webhook body has no `event` field.")
    }
    return parsed as WebhookEvent
  }

  /**
   * Verifies a request Dialgem made to one of your custom functions, then parses
   * its body. For functions with `args_at_root`, the body is the arguments object
   * alone; use `verify` and parse it yourself.
   *
   * @throws WebhookVerificationError if the signature is missing, invalid or stale.
   */
  async constructFunctionCall<Args = Record<string, unknown>>(
    payload: WebhookPayload,
    signature: SignatureHeader,
    secret: string,
    options: VerifyOptions = {},
  ): Promise<FunctionCallRequest<Args>> {
    const parsed = await this.#verifiedJson(payload, signature, secret, options)
    const body = parsed as Partial<FunctionCallRequest<Args>> | null
    if (!body || typeof body.name !== "string" || typeof body.call !== "object" || body.call === null) {
      throw new WebhookVerificationError(
        "Function request body has no `name` and `call`. Does this function have args_at_root set?",
      )
    }
    return body as FunctionCallRequest<Args>
  }

  async #verifiedJson(
    payload: WebhookPayload,
    signature: SignatureHeader,
    secret: string,
    options: VerifyOptions,
  ): Promise<unknown> {
    if (!firstHeader(signature)) {
      throw new WebhookVerificationError(
        `Missing ${WEBHOOK_SIGNATURE_HEADER} header. Is a webhook_signing_secret set on the agent?`,
      )
    }
    if (!(await this.verify(payload, signature, secret, options))) {
      throw new WebhookVerificationError(
        "Signature is invalid or older than the allowed tolerance. Check the secret, the server clock, and that the body was not re-serialized before verification.",
      )
    }
    const text = typeof payload === "string" ? payload : decoder.decode(toBytes(payload))
    try {
      return JSON.parse(text)
    } catch {
      throw new WebhookVerificationError("Body is signed but is not valid JSON.")
    }
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
