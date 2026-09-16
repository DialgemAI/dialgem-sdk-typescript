/**
 * A call, as returned by `GET /v1/calls` and `GET /v1/calls/{id}`.
 * The shape is the same for both endpoints.
 */
export interface Call {
  id: string
  /** Empty string when the call has no agent. */
  agent_id: string
  agent_name: string
  /** Dialgem's lifecycle state. */
  status: CallStatus
  /** The same state in session vocabulary: active→ongoing, completed→ended, failed→error, queued→registered. */
  call_status: CallSessionStatus
  duration_s: number
  /**
   * Empty when the agent opts out of transcript storage, and once the agent's
   * `data_retention_days` purge has run. PII-redacted when redaction is on.
   */
  transcript: TranscriptTurn[]
  /** ISO 8601, no timezone suffix (UTC). Empty string if unknown. */
  started_at: string
  phone_number: string
  direction: "inbound" | "outbound" | (string & {})
  call_type: "phone_call" | "web_call" | (string & {})
  /** Carrier call id (Twilio CallSid). Empty string if none. */
  call_sid: string
  from_number: string
  to_number: string
  origination_state: string | null
  /** Presigned URL that expires; download it promptly rather than storing the link. */
  recording_url: string | null
  amd_result: Record<string, unknown> | null
  events: Record<string, unknown>[]
  /** Post-call extraction. `null` until the call has ended and been analyzed, and after a retention purge. */
  analysis: CallAnalysis | null
  disconnection_reason: string | null
  /** Set once the call is finalized. */
  call_cost: CallCost | null
  /** Mean time from the caller's final transcript to the agent's first audio byte. */
  end_to_end_latency_ms: number | null
}

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
  /** Values for the agent's `post_call_analysis_data` fields, keyed by name. */
  variables: Record<string, unknown>
  model: string
  extracted_at: string
  user_sentiment: "Positive" | "Neutral" | "Negative" | (string & {}) | null
  call_successful: boolean | null
  /** Set when extraction failed; `variables` may then be partial or empty. */
  error: string | null
}

export interface CallListParams {
  /** Case-insensitive match on the agent's name. */
  search?: string | undefined
  status?: CallStatus | "all" | undefined
  // `date_from` / `date_to` exist on the endpoint but are deliberately not exposed
  // yet: the service compares them to a timestamp column as raw strings and fails
  // server-side. Add them back once the service is fixed and a live test covers them.
  /** 1-based. Default 1. */
  page?: number | undefined
  /** 1–100. Default 10. */
  page_size?: number | undefined
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
