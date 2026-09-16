import type { ErrorIssue } from "../core/errors.js"
import type {
  AgentCreateParams,
  AgentType,
  FlowConfig,
  PostCallAnalysisVariable,
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
  denoising_mode: NonNullable<AgentCreateParams["denoising_mode"]>

  begin_message_delay_ms: number
  end_call_after_silence_ms: number
  max_call_duration_ms: number
  ring_duration_ms: number
  voicemail_detection_enabled: boolean
  voicemail_action: NonNullable<AgentCreateParams["voicemail_action"]>
  voicemail_message: string

  post_call_analysis_data: PostCallAnalysisVariable[]
  post_call_analysis_model: string

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
