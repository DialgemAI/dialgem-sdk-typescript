import type { RequestOptions } from "../core/http.js"
import type { ApiKeyInfo } from "../types/api-key.js"
import type {
  AgentSessionList,
  AgentSessionReleaseResult,
  AgentSessionSayParams,
  AgentSessionSayResult,
  AgentSessionUpdateParams,
  AgentSessionUpdateResult,
} from "../types/session.js"
import { APIResource, path } from "./resource.js"

export class ApiKey extends APIResource {
  /**
   * Who this key is: your organization and the key's name, prefix, scopes, allowed addresses
   * and expiry. It answers for any valid key whatever its scopes, so an integration can check
   * what it was given. Never returns the secret.
   *
   * ```ts
   * const { key } = await dialgem.apiKey.retrieve()
   * if (key && !key.full_access) console.log("scoped to", key.scopes)
   * ```
   */
  retrieve(options?: RequestOptions): Promise<ApiKeyInfo> {
    return this._client.get("/v1/api-key-info", undefined, options)
  }
}

export class Sessions extends APIResource {
  /**
   * The calls your organization has in progress right now, with a `count`.
   *
   * Live state read from the service's own registry — use it for a
   * concurrency check before placing a call. For finished calls use
   * `calls.list`; a call whose teardown never arrived is not counted here.
   */
  list(options?: RequestOptions): Promise<AgentSessionList> {
    return this._client.get("/v1/agent/sessions", undefined, options)
  }

  /**
   * Change a live call's prompt and/or variables. It applies from the agent's **next turn**.
   *
   * `sessionId` is a session's `session_id` from `list`, or the call's own `call_id`. Only this call changes:
   * the agent, its published versions and other calls are untouched, and the change is gone when the call ends.
   * A turn already being spoken finishes as it was. `dynamic_variables` are merged over the call's variables;
   * `system_prompt` replaces the prompt for the rest of the call.
   *
   * The call may be on any service instance. `NotFoundError` if it is not live (or is another organization's),
   * `ConflictError` with `errCode` `session_ended` once it is over, `UnprocessableEntityError` with `errCode`
   * `flow_agent_prompt` for a flow agent's prompt (its variables can still change). Not retried by default.
   *
   * ```ts
   * await dialgem.sessions.update(callId, { dynamic_variables: { plan: "pro" } })
   * ```
   */
  update(sessionId: string, body: AgentSessionUpdateParams, options?: RequestOptions): Promise<AgentSessionUpdateResult> {
    return this._client.patch(path`/v1/agent/sessions/${sessionId}`, body, options)
  }

  /**
   * Make the agent say `text` on a live call, in its own voice. Answers at once; the line plays behind what the
   * agent is saying, or now with `interrupt: true`. The agent's conversation records it as something it said.
   *
   * Off unless the deployment enables live control: `ForbiddenError` with `errCode` `live_control_disabled`.
   * `ConflictError` `human_has_call` while a human has taken the call. Owners, admins and API keys only.
   * Not retried by default.
   *
   * ```ts
   * await dialgem.sessions.say(callId, { text: "One moment while I check that." })
   * ```
   */
  say(sessionId: string, body: AgentSessionSayParams, options?: RequestOptions): Promise<AgentSessionSayResult> {
    return this._client.post(path`/v1/agent/sessions/${sessionId}/say`, body, options)
  }

  /**
   * Hand a taken-over call back to the agent, for when the socket that took it is gone. The agent is told a
   * human had the call and that it did not hear what was said. Same availability and limits as `say`.
   * Listening in and taking over run over a WebSocket (`/v1/agent/sessions/{id}/live`), which this SDK does not wrap.
   */
  release(sessionId: string, options?: RequestOptions): Promise<AgentSessionReleaseResult> {
    return this._client.post(path`/v1/agent/sessions/${sessionId}/release`, undefined, options)
  }
}
