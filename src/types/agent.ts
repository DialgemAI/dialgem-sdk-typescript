import type { ErrorIssue } from "../core/errors.js"
import type {
  AgentCreateParams,
  AgentType,
  FlowConfig,
  PostCallAnalysisVariable,
  PostCallBuiltinFields,
  PromptState,
  WebhookEventType,
} from "./params.js"

/**
 * An agent, as returned by `GET /v1/agents/{id}` and the create/update calls.
 * The shape is the same across all of those endpoints.
 */
export interface Agent {
  id: string
  /** Same value as `id`. */
  agent_id: string
  name: string
  agent_type: AgentType
  system_prompt: string
  llm_provider: string
  llm_model: string
  tts_engine: string
  voice_id: string
  first_message: string | null
  temperature: number
  max_tokens: number
  /** Set for `agent_type: "flow"`. */
  flow_config: FlowConfig | null
  /** Set for `agent_type: "multi_prompt"`. */
  states: PromptState[]
  starting_state: string | null
  /** Fallback values for `{{variables}}` not supplied by the call. */
  default_dynamic_variables: Record<string, string>

  responsiveness: number
  /**
   * Wait a little longer (up to 1.5 s) when the caller sounds unfinished: a
   * trailing "and", a comma, a half-read number. Off by default.
   */
  adaptive_response_wait: boolean
  interruption_sensitivity: number
  enable_backchannel: boolean
  backchannel_frequency: number
  reminder_trigger_ms: number
  reminder_message: string
  ambient_sound: NonNullable<AgentCreateParams["ambient_sound"]>
  ambient_sound_volume: number
  voice_speed: number
  voice_temperature: number

  stt_model: string
  language: string
  enable_transcription_formatting: boolean
  boosted_keywords: string[]
  /**
   * `noise-and-background-speech-cancellation` is a stronger setting of the same
   * stationary-noise filter, scaled by `denoising_strength`; it does not isolate
   * the caller from other voices.
   */
  denoising_mode: NonNullable<AgentCreateParams["denoising_mode"]>
  /** 0-1. Only read by `noise-and-background-speech-cancellation`. */
  denoising_strength: number
  /**
   * `fast` uses Deepgram; `accurate` uses AssemblyAI when the server has it
   * configured (English only) and falls back to Deepgram otherwise. Only
   * applies when `stt_model` is `deepgram`.
   */
  stt_mode: NonNullable<AgentCreateParams["stt_mode"]>
  /** `medical` uses Deepgram's medical model (English only), in either `stt_mode`. */
  vocab_specialization: NonNullable<AgentCreateParams["vocab_specialization"]>

  begin_message_delay_ms: number
  end_call_after_silence_ms: number
  max_call_duration_ms: number
  ring_duration_ms: number
  voicemail_detection_enabled: boolean
  voicemail_action: NonNullable<AgentCreateParams["voicemail_action"]>
  voicemail_message: string
  /** When set, the voicemail is written by the LLM from this instruction (outbound calls). */
  voicemail_prompt: string
  /** Hang up when an automated phone menu is detected (outbound calls). */
  ivr_hangup_enabled: boolean
  /** How the agent should handle a menu when `ivr_hangup_enabled` is off. */
  ivr_prompt: string
  /** Say `call_screen_message` once to a phone's call-screening assistant (outbound calls). */
  call_screen_handling_enabled: boolean
  call_screen_message: string
  /**
   * Offer the agent a do-not-call tool: a contact who asks to stop being called is
   * added to the organization's do-not-call list and the call ends.
   */
  dnc_detection_enabled: boolean

  post_call_analysis_data: PostCallAnalysisVariable[]
  post_call_analysis_model: string
  /**
   * Settings for the always-on analysis fields. A missing key means defaults;
   * `{ enabled: false }` stops that field being extracted (it is stored null).
   */
  post_call_builtin_fields: PostCallBuiltinFields

  fallback_llm_provider: string | null
  fallback_llm_model: string | null
  fallback_voice_id: string | null
  pii_redaction_enabled: boolean
  opt_out_call_recording: boolean
  opt_out_transcript_storage: boolean
  data_retention_days: number | null

  webhook_url: string | null
  webhook_events: WebhookEventType[]
  /**
   * Returned by `retrieve`, `create` and `update` only. **Always `null` in
   * `list()`**; use `has_webhook_signing_secret` there.
   */
  webhook_signing_secret: string | null
  has_webhook_signing_secret: boolean
  /** How long, in ms, a receiver gets to answer one delivery attempt. 1000–30000, default 10000. */
  webhook_timeout_ms: number

  /** ISO 8601, no timezone suffix (UTC). */
  created_at: string | null
  call_count: number

  /**
   * Present only on `create` / `update` responses of a flow agent that saved with
   * warnings. Check it: an issue with `meta.not_runnable === true` means the agent
   * saved but cannot take calls; attaching it to a number or dialing with it is
   * refused with `err_code` `flow_not_runnable`.
   */
  flow_validation?: { issues: ErrorIssue[] }
}

export interface AgentDeleteResponse {
  deleted: true
  id: string
}
