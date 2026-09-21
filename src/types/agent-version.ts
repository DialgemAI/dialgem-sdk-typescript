import type { AgentFunction, MCPServer } from "./agent-resources.js"
import type { Agent } from "./agent.js"

/**
 * A published agent version: a frozen copy of the agent's configuration, its
 * functions and its MCP servers.
 *
 * The editable agent is the **draft**, version `0`, and is what a call runs
 * unless something pins a version. Publishing never changes the draft, and a
 * published version never changes at all — editing a function's URL afterwards
 * does not move the copy inside a version that already shipped.
 *
 * Pin one on a phone number (`inbound_agent_version` / `outbound_agent_version`),
 * on an outbound call, or on a registered call. The version a call ran is
 * reported as `agent_version` on its call record and in every webhook.
 */
export interface AgentVersionSummary {
  id: string
  agent_id: string
  /** 1 for the first publish, then upwards. The draft is 0 and is not listed here. */
  version: number
  /** The agent's name at publish time. */
  name: string
  /** Your label for the release, if you gave one. */
  title: string | null
  description: string | null
  /** ISO 8601, no timezone suffix (UTC). */
  published_at: string | null
  /** Whoever published it, as the API identity that made the call. */
  published_by: string | null
  function_count: number
  mcp_server_count: number
}

/** A version with its snapshot, returned by `publish` and `retrieve`. */
export interface AgentVersion extends AgentVersionSummary {
  /**
   * The frozen configuration. Same fields as {@link Agent}, minus the ones that
   * belong to the agent rather than to a snapshot (`id`, `created_at`,
   * `call_count`). `webhook_signing_secret` is never included; read it from the
   * agent itself.
   */
  config: AgentVersionConfig
  functions: AgentFunction[]
  /** `auth_token` is stripped; `has_auth_token` says whether one is set. */
  mcp_servers: AgentVersionMCPServer[]
}

export type AgentVersionConfig = Partial<Omit<Agent, "id" | "agent_id" | "created_at" | "call_count">> & {
  has_webhook_signing_secret: boolean
} & Record<string, unknown>

export type AgentVersionMCPServer = Omit<MCPServer, "id"> & {
  id: string
  has_auth_token: boolean
}

export interface AgentVersionListResponse {
  /** Newest first. */
  versions: AgentVersionSummary[]
  /** Whether older versions remain below the last one returned. */
  has_more: boolean
}

export interface AgentVersionListParams {
  /** Versions per page, 1-100. Default 50. */
  limit?: number | undefined
  /**
   * Return versions below this one. Page by passing the `version` of the last
   * entry you received.
   */
  before_version?: number | undefined
}

export interface AgentVersionPublishParams {
  /** A label for the release, e.g. "adds the refund flow". */
  title?: string | undefined
  description?: string | undefined
}
