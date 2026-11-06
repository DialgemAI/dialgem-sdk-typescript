import type { Query, RequestOptions } from "../core/http.js"
import { PagePromise, type PageData } from "../core/pagination.js"
import type { LLM, LLMCreateParams, LLMDeleteResponse, LLMListParams, LLMUpdateParams } from "../types/llm.js"
import { APIResource, path } from "./resource.js"

interface LLMListEnvelope {
  llms: LLM[]
  has_more: boolean
  pagination_key: string | null
}

/**
 * A prompt and model you set up once and attach to agents.
 *
 *   const llm = await dialgem.llms.create({ name: "Booking", system_prompt, llm_model: "gpt-4o-mini" })
 *   await dialgem.agents.create({ name: "Front desk", llm_id: llm.id })
 *
 * It holds `system_prompt`, `first_message`, `llm_provider`, `llm_model`, `temperature`, `max_tokens`, the
 * fallback pair and `default_dynamic_variables`. **Attaching copies it**: `agents.create` / `agents.update` with
 * `llm_id` writes those values into the agent, and editing or deleting the saved LLM afterwards changes no
 * agent, no published version and no call. Sending `llm_id` together with any of those fields is refused.
 */
export class LLMs extends APIResource {
  /** Save LLM settings. Anything left out takes the default a new agent gets. Not retried by default. */
  create(body: LLMCreateParams, options?: RequestOptions): Promise<LLM> {
    return this._client.post("/v1/llms", body, options)
  }

  /** Saved LLMs, newest first. Await for one page, or iterate for every one. */
  list(params: LLMListParams = {}, options?: RequestOptions): PagePromise<LLM> {
    const fetchPage = async (paginationKey: string | null): Promise<PageData<LLM>> => {
      const res = await this._client.get<LLMListEnvelope>(
        "/v1/llms",
        { ...(params as Query), pagination_key: paginationKey ?? undefined },
        options,
      )
      return { data: res.llms, has_more: res.has_more, pagination_key: res.pagination_key }
    }
    return new PagePromise(fetchPage)
  }

  retrieve(llmId: string, options?: RequestOptions): Promise<LLM> {
    return this._client.get(path`/v1/llms/${llmId}`, undefined, options)
  }

  /** Change the fields you send. Agents it was attached to are not changed. */
  update(llmId: string, body: LLMUpdateParams, options?: RequestOptions): Promise<LLM> {
    return this._client.patch(path`/v1/llms/${llmId}`, body, options)
  }

  /** Delete saved LLM settings. Agents they were attached to keep their copy. */
  delete(llmId: string, options?: RequestOptions): Promise<LLMDeleteResponse> {
    return this._client.delete(path`/v1/llms/${llmId}`, options)
  }
}
