/**
 * Saved flows. Request bodies come from the generated OpenAPI types; the response shape is written from the
 * API's own serializer (`flow_to_dict`).
 */
import type { ErrorIssue } from "../core/errors.js"
import type { components } from "../generated/openapi.js"
import type { FlowConfig, RequestBody } from "./params.js"

type Schemas = components["schemas"]

export type FlowCreateParams = RequestBody<Schemas["FlowCreate"]>
export type FlowUpdateParams = RequestBody<Schemas["FlowUpdate"]>

export interface FlowListParams {
  /** 1 to 100. Default 50. */
  limit?: number | undefined
}

export interface Flow {
  id: string
  /** Same as `id`. */
  flow_id: string
  name: string
  language: string
  /** Bumped by the server when the flow's content changes. */
  version: number | null
  node_count: number
  /** Epoch milliseconds. */
  created_timestamp: number | null
  last_modification_timestamp: number | null
  /** Left out of `list` entries; `retrieve` a flow for it. */
  flow_config?: FlowConfig
  /** Present on `create` / `update` when the flow saved with warnings. */
  flow_validation?: { issues: ErrorIssue[] }
}

export interface FlowDeleteResponse {
  deleted: true
  id: string
}
