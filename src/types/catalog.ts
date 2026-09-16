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
  created_at: string | null
  updated_at: string | null
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
