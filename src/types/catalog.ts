import type { components } from "../generated/openapi.js"
import type { FlowConfig } from "./params.js"

/** A TTS voice, as returned by `/v1/voices`. */
export interface Voice {
  /** Dialgem id. */
  id: string
  provider: string
  /** The id to put in an agent's `voice_id`. */
  provider_voice_id: string
  name: string
  gender: string | null
  accent: string | null
  age: string | null
  voice_type: string | null
  language: string[]
  preview_url: string | null
  raw_metadata: Record<string, unknown> | null
  /** True for a voice your organization cloned; false for the shared catalog. */
  is_custom: boolean
  /** Who uploaded the audio, for a cloned voice. */
  created_by: string | null
  created_at: string | null
  updated_at: string | null
}

/** One audio sample for cloning. `Blob` and `File` both satisfy this. */
export type VoiceCloneFile = Blob | { name?: string; type?: string }

export interface VoiceCloneParams {
  /** Display name for the new voice. */
  name: string
  /**
   * The audio to clone from.
   *
   * ElevenLabs takes up to 25 files; **Cartesia takes exactly one** and refuses
   * more rather than silently picking one, since that would make the same
   * upload produce a noticeably different voice on the two providers.
   */
  files: Blob[]
  /**
   * You are asserting that you hold the rights to this audio and have the
   * speaker's consent to clone their voice. Required, and recorded against
   * your API identity — a cloned voice is built from a real person's speech.
   */
  consent_confirmed: true
  /** Which provider clones it. Defaults to `elevenlabs`. */
  engine?: "elevenlabs" | "cartesia" | undefined
  description?: string | undefined
  /** Cartesia clones per language; ElevenLabs ignores this. Defaults to `en`. */
  language?: string | undefined
  /**
   * Filenames sent with each blob, in order. The provider infers the audio
   * container from the extension, so a `Blob` with no name needs one here.
   * Defaults to `clip-1.wav`, `clip-2.wav`, …
   */
  filenames?: string[] | undefined
}

export interface VoiceDeleteResponse {
  deleted: boolean
  voice_id: string
}

export interface VoiceListParams {
  provider?: string | undefined
  gender?: string | undefined
  accent?: string | undefined
  /** Language code the voice supports, e.g. `en`. */
  language?: string | undefined
  /** Case-insensitive substring match on the name. */
  search?: string | undefined
}

export interface TemplateListParams {
  category?: string | undefined
}

export type PromptTemplateSummary = components["schemas"]["PromptTemplateSummary"]
/** Seed an agent from it: `agents.create({ name, system_prompt, first_message, default_dynamic_variables })`. */
export type PromptTemplate = components["schemas"]["PromptTemplateDetail"]

/** A built-in flow template, as listed by `/v1/flow-templates`. */
export interface FlowTemplateSummary {
  id: string
  name: string
  description: string
  setup_note: string
  category: string
  tags: string[]
  use_case: string
  icon: string
  source: string
  node_count: number
  node_types: string[]
  unsupported_node_types: string[]
  path_counts: Record<string, number>
  runnable: boolean
}

/** Seed a flow agent from it: `agents.create({ name, agent_type: "flow", flow_config })`. */
export interface FlowTemplate extends FlowTemplateSummary {
  unsupported_nodes: { node_id: string; name: string | null; type: string; support: string }[]
  not_runnable_reasons: { reason: string; node_ids: string[]; message: string }[]
  flow_config: FlowConfig
}
