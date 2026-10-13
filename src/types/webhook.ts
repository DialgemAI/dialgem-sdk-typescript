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
export type WebhookEvent =
  | CallStartedEvent
  | CallEndedEvent
  | CallAnalyzedEvent
  | TranscriptUpdatedEvent
  | TransferStartedEvent
  | TransferBridgedEvent
  | TransferCancelledEvent
  | TransferEndedEvent

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

/** A transcript turn as carried by `transcript_updated`. */
export interface WebhookTranscriptTurn {
  role: "user" | "agent"
  text: string
  timestamp: string
  start_ms?: number
}

/**
 * Sent each time a caller or agent turn is added to the live transcript.
 *
 * `transcript` is the whole transcript so far, so a receiver that misses or
 * reorders a delivery still ends up correct. `turn_index` increases by one per
 * event within a call; keep the highest.
 */
export interface TranscriptUpdatedEvent extends CallEventBase {
  event: "transcript_updated"
  /** Who spoke the turn that triggered this event. */
  role: "user" | "agent"
  turn_index: number
  transcript: WebhookTranscriptTurn[]
}

/** What a transfer event says about the transfer. Fields are present only when known. */
export interface WebhookTransferInfo {
  /** The number the call is being transferred to. */
  target?: string
  mode?: "cold" | "warm" | string
  /** Why a transfer was cancelled: a carrier dial status (`busy`, `no-answer`, ...) or a failure reason. */
  reason?: string
}

/** The agent asked for the call to be transferred. */
export interface TransferStartedEvent extends CallEventBase {
  event: "transfer_started"
  transfer: WebhookTransferInfo
}

/**
 * The transferee answered and was connected to the caller. For a cold transfer
 * this is delivered when the transferred leg finishes, immediately followed by
 * `transfer_ended`.
 */
export interface TransferBridgedEvent extends CallEventBase {
  event: "transfer_bridged"
  transfer: WebhookTransferInfo
}

/** The transfer did not connect: busy, no answer, failed, or could not be placed. */
export interface TransferCancelledEvent extends CallEventBase {
  event: "transfer_cancelled"
  transfer: WebhookTransferInfo
}

/** A connected transfer finished. */
export interface TransferEndedEvent extends CallEventBase {
  event: "transfer_ended"
  transfer: WebhookTransferInfo
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
