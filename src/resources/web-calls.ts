import type { RequestOptions } from "../core/http.js"
import type { WebCall, WebCallCreateParams, WebCallSettings, WebCallSettingsUpdateParams } from "../types/web-call.js"
import { APIResource } from "./resource.js"

/**
 * Let a visitor talk to one of your agents from a web page, with `@dialgem/client`.
 *
 * Your **backend** calls `create` with your API key and gives the returned `access_token` to the page; the
 * page connects with that token alone. The key never reaches the browser. Before the first call, allow the
 * page's origin with `updateSettings`.
 */
export class WebCalls extends APIResource {
  /**
   * Create a call for one visitor and get its access token.
   *
   *   const { access_token } = await dialgem.webCalls.create({ agent_id, metadata: { visitor: "v_123" } })
   *
   * `metadata` and `dialgem_llm_dynamic_variables` are fixed here, by you, and cannot be changed by the page.
   * 409 `web_origins_not_configured` until an origin is allowed; 402 if the organization cannot pay for calls;
   * 429 when more than `limits.tokens_per_minute` calls are created in a minute.
   */
  create(body: WebCallCreateParams, options?: RequestOptions): Promise<WebCall> {
    return this._client.post("/v1/calls/web", body, options)
  }

  /** The origins browser calls may start from, and the limits that apply. */
  retrieveSettings(options?: RequestOptions): Promise<WebCallSettings> {
    return this._client.get("/v1/web-calls/settings", undefined, options)
  }

  /**
   * Replace the allowed origins. Each is `scheme://host[:port]`; `https://*.example.com` allows any subdomain
   * (not the bare domain) and `*` allows any website. Tokens already issued keep the list they were issued with.
   */
  updateSettings(body: WebCallSettingsUpdateParams, options?: RequestOptions): Promise<WebCallSettings> {
    return this._client.put("/v1/web-calls/settings", body, options)
  }
}
