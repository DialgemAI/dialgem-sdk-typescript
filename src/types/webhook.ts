import type { Call } from "./call.js"
import type { WebhookEventType } from "./params.js"

/**
 * Payloads Dialgem POSTs to an agent's `webhook_url`, for the events subscribed in
 * `webhook_events`. Each carries the full call record; see the "Verify webhooks"
 * section of the README.
 *
 * A failed delivery is retried up to three times, and every attempt carries the
 * same `x-dialgem-delivery` id. Use it (or `event` + `call_id`) to drop duplicates.
 */
export type WebhookEvent = CallStartedEvent | CallEndedEvent | CallAnalyzedEvent

interface CallEventBase {
  call_id: string
  agent_id: string
  /** The full call record at the moment the event was sent. */
  call: Call
}

export interface CallStartedEvent extends CallEventBase {
  event: "call_started"
}

/** Sent as soon as the call ends; post-call analysis follows in `call_analyzed`. */
export interface CallEndedEvent extends CallEventBase {
  event: "call_ended"
}

/** Sent after `call_ended`, once analysis has run, and only for calls that produced a transcript. */
export interface CallAnalyzedEvent extends CallEventBase {
  event: "call_analyzed"
}

/**
 * The body Dialgem POSTs to a custom function's URL when the agent calls it,
 * unless the function has `args_at_root`, in which case the body is `args` alone.
 */
export interface FunctionCallRequest<Args = Record<string, unknown>> {
  /** The function's name. */
  name: string
  call: FunctionCallContext
  /** The arguments the agent supplied, per the function's `parameters` schema. */
  args: Args
}

export interface FunctionCallContext {
  call_id: string
  agent_id: string | null
  call_type: "phone_call" | "web_call"
  direction: "inbound" | "outbound" | null
  from_number: string | null
  to_number: string | null
  dynamic_variables: Record<string, string>
  metadata: Record<string, unknown>
}

// Compile-time guard: the union above must cover exactly the events an agent can
// subscribe to (generated from the API). A new event type fails `tsc` here.
type Assert<T extends true> = T
type SameUnion<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
export type _WebhookEventsExhaustive = Assert<SameUnion<WebhookEventType, WebhookEvent["event"]>>
