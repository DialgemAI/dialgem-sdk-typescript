/**
 * A call, as returned by `GET /v1/calls`, `GET /v1/calls/{id}` and every call webhook.
 * The shape is the same everywhere.
 */
export interface Call {
  id: string
  /** Empty string when the call has no agent. */
  agent_id: string
  /**
   * The published agent version this call ran. 0 is the live draft, which is
   * what a call runs unless a number or the request that created it pinned a
   * version.
   */
  agent_version: number
  agent_name: string
  /** Dialgem's lifecycle state. */
  status: CallStatus
  /** The same state in session vocabulary: active→ongoing, completed→ended, failed→error, queued→registered. */
  call_status: CallSessionStatus
  call_type: "phone_call" | "web_call" | (string & {})
  direction: "inbound" | "outbound" | (string & {})

  /** Your own data, attached when the call was created or later with `calls.update`. */
  metadata: Record<string, unknown>
  /** The dynamic variables the call was started with. */
  dynamic_variables: Record<string, string>

  /** ISO 8601, no timezone suffix (UTC). Empty string if unknown. */
  started_at: string
  /** ISO 8601, no timezone suffix (UTC). `null` while the call is ongoing. */
  ended_at: string | null
  /** Epoch milliseconds. */
  start_timestamp: number | null
  /** Epoch milliseconds. `null` while the call is ongoing. */
  end_timestamp: number | null
  duration_s: number
  duration_ms: number | null

  phone_number: string
  from_number: string
  to_number: string
  /** Carrier call id (Twilio CallSid). Empty string if none. */
  call_sid: string
  origination_state: string | null

  /**
   * One entry per turn. Empty when the agent opts out of transcript storage, and
   * once the agent's `data_retention_days` purge has run. PII-redacted when
   * redaction is on.
   */
  transcript: TranscriptTurn[]
  /** The same transcript as one string, `Agent: …` / `User: …` per line. */
  transcript_text: string
  /** Presigned URL that expires; download it promptly rather than storing the link. */
  recording_url: string | null
  events: Record<string, unknown>[]

  disconnection_reason: DisconnectionReason | null
  /** Whether the call reached voicemail or an answering machine. */
  in_voicemail: boolean
  amd_result: Record<string, unknown> | null
  /** Post-call analysis. `null` until the call has ended and been analyzed, and after a retention purge. */
  analysis: CallAnalysis | null
  /** Set once the call is finalized. */
  call_cost: CallCost | null
  /** Mean time from the caller's final transcript to the agent's first audio byte. */
  end_to_end_latency_ms: number | null
  /** Per-stage latency percentiles, recorded when the call ends. `null` if no turn completed. */
  latency: CallLatency | null
}

export type DisconnectionReason =
  | "user_hangup"
  | "agent_hangup"
  | "call_transfer"
  | "voicemail_reached"
  | "inactivity"
  | "max_duration_reached"
  | "manual_stopped"
  | "dial_no_answer"
  | "flow_dead_end"
  | "flow_loop_guard"
  | "error"
  | (string & {})

/** Every amount is an integer in units of **$0.0001**: `combined_cost: 1700` is $0.17. */
export interface CallCost {
  combined_cost: number
  total_duration_seconds: number
  total_duration_unit_price: number
  product_costs: { product: string; unit_price: number; cost: number }[]
}

export type CallStatus = "active" | "queued" | "completed" | "failed" | (string & {})
export type CallSessionStatus = "ongoing" | "registered" | "ended" | "error" | (string & {})

export interface TranscriptTurn {
  role: "user" | "agent"
  text: string
  /** ISO 8601. */
  timestamp: string
}

export interface CallAnalysis {
  /** A one-to-three sentence summary of the call. */
  call_summary: string | null
  user_sentiment: "Positive" | "Neutral" | "Negative" | (string & {}) | null
  call_successful: boolean | null
  in_voicemail: boolean
  /** Values for the agent's `post_call_analysis_data` fields, keyed by name. */
  variables: Record<string, unknown>
  model: string
  extracted_at: string
  /** Set when extraction failed; `variables` may then be partial or empty. */
  error: string | null
}

/** Milliseconds. Each stage has at least one sample, or is omitted. */
export interface LatencyStats {
  p50: number
  p90: number
  p95: number
  p99: number
  min: number
  max: number
  num: number
}

export interface CallLatency {
  /** Caller's final transcript to the agent's first audio byte. */
  e2e?: LatencyStats
  /** Time to the model's first sentence. */
  llm?: LatencyStats
  /** Time to the first synthesized audio. */
  tts?: LatencyStats
  /** How long end-of-speech detection waited. */
  endpointing?: LatencyStats
}

export interface CallListParams {
  agent_id?: string | string[] | undefined
  status?: CallStatus | CallStatus[] | undefined
  direction?: "inbound" | "outbound" | undefined
  call_type?: "phone_call" | "web_call" | undefined
  disconnection_reason?: DisconnectionReason | DisconnectionReason[] | undefined
  from_number?: string | undefined
  to_number?: string | undefined
  user_sentiment?: "Positive" | "Neutral" | "Negative" | undefined
  call_successful?: boolean | undefined
  /** Started at or after this time, epoch ms. */
  start_after?: number | undefined
  /** Started before this time, epoch ms. */
  start_before?: number | undefined
  /**
   * Match calls whose metadata has these values, e.g. `{ crm_id: "42" }`.
   * Values are compared as strings.
   */
  metadata?: Record<string, string | number | boolean> | undefined
  /** Case-insensitive match on the agent's name. */
  search?: string | undefined
  /** Default `desc` (newest first). */
  sort_order?: "asc" | "desc" | undefined
  /** Calls per page, 1–100. Default 10. */
  limit?: number | undefined
}

export interface CallUpdateParams {
  /** Replaces the call's metadata. A JSON object of at most 16 KB. */
  metadata: Record<string, unknown>
}

export interface CallDeleteResponse {
  deleted: true
  id: string
}

export interface CallStopResponse {
  id: string
  /** The call is tearing down; it becomes `completed` with `disconnection_reason: "manual_stopped"` shortly. */
  stopping: true
}

/** Result of `calls.createPhoneCall`. The call is dialing; its outcome arrives via webhooks or `calls.retrieve`. */
export interface PhoneCallCreateResponse {
  call_id: string
  call_sid: string
  origination_state: "queued" | (string & {})
}

/** Result of `calls.register`: return TwiML `<Connect><Stream url="{stream_url}"/></Connect>` to Twilio. */
export interface CallRegisterResponse {
  call_id: string
  /** Signed `wss://` Twilio Media Streams URL. Hand it to Twilio before `expires_in` elapses. */
  stream_url: string
  /** Seconds until `stream_url`'s signature expires. */
  expires_in: number
}
