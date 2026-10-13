import { DialgemError } from "../core/errors.js"
import type { Query, RequestOptions } from "../core/http.js"
import type {
  ExtractionModelList,
  FlowTemplate,
  FlowTemplateSummary,
  PromptTemplate,
  PromptTemplateSummary,
  TemplateListParams,
  Voice,
  VoiceCloneParams,
  VoiceDeleteResponse,
  VoiceListParams,
} from "../types/catalog.js"
import { APIResource, path } from "./resource.js"

export class Voices extends APIResource {
  /**
   * Voices available to agents: the shared catalog plus the ones your
   * organization cloned, yours first. Put a voice's `provider_voice_id` in an
   * agent's `voice_id`.
   */
  list(params: VoiceListParams = {}, options?: RequestOptions): Promise<Voice[]> {
    return this._client.get("/v1/voices", params as Query, options)
  }

  /**
   * Clone a voice from audio you upload. The new voice is private to your
   * organization and never appears in another one's catalog.
   *
   * Consent is required: you are asserting that you hold the rights to the
   * audio and have the speaker's consent, and that assertion is recorded
   * against your API identity.
   *
   * The upload is never retried, whatever `maxRetries` says — a retried
   * multipart body can send truncated audio, and a clone built from half the
   * recording succeeds and sounds wrong.
   */
  clone(params: VoiceCloneParams, options?: RequestOptions): Promise<Voice> {
    const { name, files, consent_confirmed, engine, description, language, filenames } = params
    if (!consent_confirmed) {
      throw new DialgemError(
        "consent_confirmed must be true: you are asserting that you hold the rights " +
          "to this audio and have the speaker's consent to clone their voice.",
      )
    }
    if (!files?.length) {
      throw new DialgemError("At least one audio file is required to clone a voice.")
    }

    const form = new FormData()
    form.append("name", name)
    form.append("consent_confirmed", "true")
    if (engine) form.append("engine", engine)
    if (description) form.append("description", description)
    if (language) form.append("language", language)
    files.forEach((file, i) => {
      // The provider infers the container from the extension, so every part is
      // given a name — the caller's, the Blob's own, or a generated one.
      const fallback = (file as File).name || `clip-${i + 1}.wav`
      form.append("files", file, filenames?.[i] ?? fallback)
    })

    return this._client.postForm("/v1/voices/clone", form, options)
  }

  /**
   * Delete a voice your organization cloned, at the provider and here.
   *
   * Only your own cloned voices: the shared catalog is not deletable, and a
   * voice an agent still uses is refused with a 409 rather than leaving that
   * agent without one.
   */
  delete(voiceId: string, options?: RequestOptions): Promise<VoiceDeleteResponse> {
    return this._client.delete(path`/v1/voices/${voiceId}`, options)
  }
}

export class ExtractionModels extends APIResource {
  /** Models an agent may use for post-call analysis, with an estimated cost per session. */
  list(options?: RequestOptions): Promise<ExtractionModelList> {
    return this._client.get("/v1/models/extraction", undefined, options)
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
