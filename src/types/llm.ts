/**
 * Saved LLM settings. Request bodies come from the generated OpenAPI types; the response shape is written from
 * the API's own serializer (`llm_to_dict`).
 */
import type { components } from "../generated/openapi.js"
import type { RequestBody } from "./params.js"

type Schemas = components["schemas"]

export type LLMCreateParams = RequestBody<Schemas["LLMCreate"]>
export type LLMUpdateParams = RequestBody<Schemas["LLMUpdate"]>

export interface LLMListParams {
  /** 1 to 100. Default 50. */
  limit?: number | undefined
}

export interface LLM {
  id: string
  /** Same as `id`. */
  llm_id: string
  name: string
  /** Epoch milliseconds. */
  created_timestamp: number | null
  last_modification_timestamp: number | null
  system_prompt: string
  first_message: string | null
  llm_provider: "anthropic" | "openai" | (string & {})
  llm_model: string
  temperature: number
  max_tokens: number
  fallback_llm_provider: "anthropic" | "openai" | (string & {}) | null
  fallback_llm_model: string | null
  default_dynamic_variables: Record<string, string>
}

export interface LLMDeleteResponse {
  deleted: true
  id: string
}
