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

export interface AgentSessionList {
  sessions: AgentSession[]
  /** How many are live. This is what "how busy am I right now?" asks for. */
  count: number
}
