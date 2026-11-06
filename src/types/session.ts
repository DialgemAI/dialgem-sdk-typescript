/**
 * A call in progress right now, as the service holds it in memory.
 *
 * This is live state, not a record: a finished call is a `Call`, reachable
 * through `calls.retrieve`. The shape of a session is not a stable contract
 * beyond the fields below, so it is deliberately open.
 */
export interface AgentSession {
  session_id: string
  agent_id: string
  status: "active" | "ended" | (string & {})
  /** ISO 8601. */
  started_at?: string
  [key: string]: unknown
}

import type { components } from "../generated/openapi.js"
import type { RequestBody } from "./params.js"

export type AgentSessionUpdateParams = RequestBody<components["schemas"]["SessionUpdate"]>

export type AgentSessionSayParams = RequestBody<components["schemas"]["SessionSay"]>

/** What `sessions.say` returns: the line plays behind the call's audio, so this answers at once. */
export interface AgentSessionSayResult {
  status: "speaking"
}

/** What `sessions.release` returns. */
export interface AgentSessionReleaseResult {
  /** `not_taken_over` when nobody had the call. */
  status: "handed_back" | "not_taken_over"
  reason?: string
}

/** What `sessions.update` returns. */
export interface AgentSessionUpdateResult {
  session_id: string
  status: "active" | (string & {})
  /** Which of `system_prompt` and `dynamic_variables` were changed. */
  updated: Array<"system_prompt" | "dynamic_variables">
  applies_from: "next_turn"
}

export interface AgentSessionList {
  sessions: AgentSession[]
  /** How many are live. This is what "how busy am I right now?" asks for. */
  count: number
}
