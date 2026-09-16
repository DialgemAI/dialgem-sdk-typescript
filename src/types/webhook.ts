import type { CallAnalysis, CallStatus } from "./call.js"
import type { WebhookEventType } from "./params.js"

/**
 * Payloads Dialgem POSTs to an agent's `webhook_url`, subscribed per agent via
 * `webhook_events`. Flat objects with an `event` discriminator; see
 * the "Verify webhooks" section of the README.
 *
 * Delivery is at-least-once in practice: a failed POST is retried once after a
 * second, so a slow 2xx can arrive twice. Make handlers idempotent on
 * `(event, call_id)`.
 */
export type WebhookEvent = CallStartedEvent | CallEndedEvent | CallAnalyzedEvent

export interface CallStartedEvent {
  event: "call_started"
  call_id: string
  agent_id: string
}

export interface CallEndedEvent {
  event: "call_ended"
  call_id: string
  agent_id: string
  status: CallStatus
  duration_s: number | null
}

/** Sent before `call_ended`, and only for calls that produced a transcript. */
export interface CallAnalyzedEvent {
  event: "call_analyzed"
  call_id: string
  agent_id: string
  analysis: CallAnalysis
}

// Compile-time guard: the union above must cover exactly the events an agent can
// subscribe to (generated from the API). A new event type fails `tsc` here.
type Assert<T extends true> = T
type SameUnion<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
export type _WebhookEventsExhaustive = Assert<SameUnion<WebhookEventType, WebhookEvent["event"]>>
