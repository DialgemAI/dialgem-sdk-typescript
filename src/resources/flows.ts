import type { Query, RequestOptions } from "../core/http.js"
import { PagePromise, type PageData } from "../core/pagination.js"
import type { Flow, FlowCreateParams, FlowDeleteResponse, FlowListParams, FlowUpdateParams } from "../types/flow.js"
import { APIResource, path } from "./resource.js"

interface FlowListEnvelope {
  flows: Flow[]
  has_more: boolean
  pagination_key: string | null
}

/**
 * Conversation flows you save once and attach to agents.
 *
 *   const flow = await dialgem.flows.create({ name: "Intake", flow_config })
 *   await dialgem.agents.create({ name: "Front desk", agent_type: "flow", flow_id: flow.id })
 *
 * A flow is checked the way an agent's `flow_config` is, so a saved flow is one that would have saved on an
 * agent. **Attaching copies it**: `agents.create` / `agents.update` with `flow_id` takes a snapshot, and editing
 * or deleting the flow afterwards changes no agent, no published version and no call.
 */
export class Flows extends APIResource {
  /** Validate and save a flow. `UnprocessableEntityError` (`errCode` `flow_invalid`) lists every problem. Not retried by default. */
  create(body: FlowCreateParams, options?: RequestOptions): Promise<Flow> {
    return this._client.post("/v1/flows", body, options)
  }

  /** Flows, newest first. Await for one page, or iterate for every flow. Entries leave out `flow_config`. */
  list(params: FlowListParams = {}, options?: RequestOptions): PagePromise<Flow> {
    const fetchPage = async (paginationKey: string | null): Promise<PageData<Flow>> => {
      const res = await this._client.get<FlowListEnvelope>(
        "/v1/flows",
        { ...(params as Query), pagination_key: paginationKey ?? undefined },
        options,
      )
      return { data: res.flows, has_more: res.has_more, pagination_key: res.pagination_key }
    }
    return new PagePromise(fetchPage)
  }

  /** One flow with its `flow_config`. */
  retrieve(flowId: string, options?: RequestOptions): Promise<Flow> {
    return this._client.get(path`/v1/flows/${flowId}`, undefined, options)
  }

  /** Rename a flow and/or replace its `flow_config` (checked again). Agents it was attached to are not changed. */
  update(flowId: string, body: FlowUpdateParams, options?: RequestOptions): Promise<Flow> {
    return this._client.patch(path`/v1/flows/${flowId}`, body, options)
  }

  /** Delete a saved flow. Agents it was attached to keep their copy. */
  delete(flowId: string, options?: RequestOptions): Promise<FlowDeleteResponse> {
    return this._client.delete(path`/v1/flows/${flowId}`, options)
  }
}
