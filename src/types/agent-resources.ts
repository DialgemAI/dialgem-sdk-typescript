import type { FunctionKind, KeyValuePair } from "./params.js"

/** A tool the agent can call, as returned by `/v1/agents/{id}/functions`. */
export interface AgentFunction {
  id: string
  agent_id: string
  name: string
  description: string
  /** JSON Schema for the arguments the LLM supplies. */
  parameters: Record<string, unknown>
  url: string
  method: string
  timeout_ms: number
  headers: KeyValuePair[]
  query_params: KeyValuePair[]
  speak_during_execution: string | null
  speak_after_execution: boolean
  sort_order: number
  kind: FunctionKind
  /** Kind-specific settings (e.g. Cal.com credentials for the `*_cal` kinds). */
  config: Record<string, unknown>
  /** Maps dynamic-variable names to JSON paths in the function's response. */
  response_variables: Record<string, string>
  created_at: string | null
}

/** A text document in the agent's knowledge base, summarised across its chunks. */
export interface KnowledgeDocument {
  source_id: string
  filename: string
  chunk_count: number
  /**
   * From `list()`: false if **any** chunk failed to embed (those chunks are not
   * retrievable). From `create()`: true if **at least one** chunk embedded, so a
   * partial failure still reads true there; re-check with `list()`.
   */
  embedded: boolean
  /** Present on `list()`; absent from the `create()` response. */
  created_at?: string | null
}

/** A remote MCP tool server attached to an agent. The `auth_token` is write-only. */
export interface MCPServer {
  id: string
  agent_id: string
  name: string
  url: string
  has_auth_token: boolean
  enabled: boolean
  timeout_ms: number
  headers: KeyValuePair[]
  query_params: KeyValuePair[]
  last_status: MCPServerTestResult | null
  created_at: string | null
}

export interface MCPServerTestResult {
  ok: boolean
  /** Tool names the server advertised. */
  tools: string[]
  error: string | null
  /** ISO 8601. */
  at: string
}
