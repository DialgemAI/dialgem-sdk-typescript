/**
 * Browser calls. Request bodies come from the generated OpenAPI types (see `params.ts`); the response
 * shapes are written from the API's own serializers.
 */
import type { components } from "../generated/openapi.js"
import type { RequestBody } from "./params.js"

type Schemas = components["schemas"]

export type WebCallCreateParams = RequestBody<Schemas["WebCallRequest"]>
export type WebCallSettingsUpdateParams = RequestBody<Schemas["WebCallSettings"]>

/** What `webCalls.create` returns. Hand `access_token` to the page; keep your API key on the server. */
export interface WebCall {
  /** The call's id. The call record exists from now, with status `queued` until the browser connects. */
  call_id: string
  agent_id: string
  /** The published version this call will run (0 is the live draft). */
  agent_version: number
  /**
   * A one-use credential for exactly this call and agent. It cannot be used for anything else, and it works
   * from the origins you have allowed, once.
   */
  access_token: string
  /** ISO 8601, UTC. 60 seconds after creation: long enough to reach the page, not to be stockpiled. */
  expires_at: string
  expires_in: number
}

export interface WebCallSettings {
  /** The websites (origins, like `https://app.example.com`) browser calls may start from. Empty means none. */
  allowed_origins: string[]
  /** True when the list contains `*`: any website may start a call with a token it was given. */
  any_origin: boolean
  limits: {
    /** Browser calls that can be live at once, per organization. */
    max_concurrent_calls: number
    /** Calls that can be created per minute, per organization. */
    tokens_per_minute: number
    token_ttl_s: number
  }
}
