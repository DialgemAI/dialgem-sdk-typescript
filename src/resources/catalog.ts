import type { Query, RequestOptions } from "../core/http.js"
import type {
  FlowTemplate,
  FlowTemplateSummary,
  PromptTemplate,
  PromptTemplateSummary,
  TemplateListParams,
  Voice,
  VoiceListParams,
} from "../types/catalog.js"
import { APIResource, path } from "./resource.js"

export class Voices extends APIResource {
  /** Voices available to agents, by name. Put a voice's `provider_voice_id` in an agent's `voice_id`. */
  list(params: VoiceListParams = {}, options?: RequestOptions): Promise<Voice[]> {
    return this._client.get("/v1/voices", params as Query, options)
  }
}

export class FlowTemplates extends APIResource {
  /** Built-in conversation-flow templates (summaries, without `flow_config`). */
  list(params: TemplateListParams = {}, options?: RequestOptions): Promise<FlowTemplateSummary[]> {
    return this._client.get("/v1/flow-templates", params as Query, options)
  }

  retrieve(templateId: string, options?: RequestOptions): Promise<FlowTemplate> {
    return this._client.get(path`/v1/flow-templates/${templateId}`, undefined, options)
  }
}

export class PromptTemplates extends APIResource {
  /** Built-in prompt templates (summaries, without the prompt text). */
  list(params: TemplateListParams = {}, options?: RequestOptions): Promise<PromptTemplateSummary[]> {
    return this._client.get("/v1/prompt-templates", params as Query, options)
  }

  retrieve(templateId: string, options?: RequestOptions): Promise<PromptTemplate> {
    return this._client.get(path`/v1/prompt-templates/${templateId}`, undefined, options)
  }
}
