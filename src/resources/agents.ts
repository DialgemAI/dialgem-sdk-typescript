import type { HttpClient, RequestOptions } from "../core/http.js"
import type { Agent, AgentDeleteResponse } from "../types/agent.js"
import type { AgentFunction, KnowledgeDocument, MCPServer, MCPServerTestResult } from "../types/agent-resources.js"
import type {
  AgentVersion,
  AgentVersionListParams,
  AgentVersionListResponse,
  AgentVersionPublishParams,
  AgentVersionSummary,
} from "../types/agent-version.js"
import type {
  AgentCreateParams,
  AgentUpdateParams,
  FunctionCreateParams,
  FunctionReorderParams,
  FunctionUpdateParams,
  KnowledgeDocumentCreateParams,
  MCPServerCreateParams,
  MCPServerUpdateParams,
} from "../types/params.js"
import { DialgemError } from "../core/errors.js"
import { APIResource, path } from "./resource.js"

export class Agents extends APIResource {
  /** Tools (HTTP functions and built-ins like `end_call`) the agent can call. */
  readonly functions: AgentFunctions
  /** Text documents the agent retrieves from during the call. */
  readonly knowledge: AgentKnowledge
  /** Remote MCP servers whose tools are exposed to the agent. */
  readonly mcpServers: AgentMCPServers
  /** Frozen snapshots of the agent that a number or a call can pin. */
  readonly versions: AgentVersions

  constructor(client: HttpClient) {
    super(client)
    this.functions = new AgentFunctions(client)
    this.knowledge = new AgentKnowledge(client)
    this.mcpServers = new AgentMCPServers(client)
    this.versions = new AgentVersions(client)
  }

  /** Create an agent. Only `name` is required; everything else has a server default. */
  create(body: AgentCreateParams, options?: RequestOptions): Promise<Agent> {
    return this._client.post("/v1/agents", body, options)
  }

  retrieve(agentId: string, options?: RequestOptions): Promise<Agent> {
    return this._client.get(path`/v1/agents/${agentId}`, undefined, options)
  }

  /** Every agent in the organization. `webhook_signing_secret` is `null` in this list. */
  list(options?: RequestOptions): Promise<Agent[]> {
    return this._client.get("/v1/agents", undefined, options)
  }

  /** Partial update: only the fields you send change. */
  update(agentId: string, body: AgentUpdateParams, options?: RequestOptions): Promise<Agent> {
    return this._client.patch(path`/v1/agents/${agentId}`, body, options)
  }

  delete(agentId: string, options?: RequestOptions): Promise<AgentDeleteResponse> {
    return this._client.delete(path`/v1/agents/${agentId}`, options)
  }
}

/**
 * Published versions of an agent.
 *
 * The agent itself is the draft, version 0, and every call runs it unless a
 * number or a request pins a published version. Publishing takes a copy;
 * editing the agent afterwards changes only the draft.
 */
export class AgentVersions extends APIResource {
  /** Freeze the agent as it is now. Returns the new version, snapshot included. */
  publish(
    agentId: string,
    body: AgentVersionPublishParams = {},
    options?: RequestOptions,
  ): Promise<AgentVersion> {
    return this._client.post(path`/v1/agents/${agentId}/versions`, body, options)
  }

/**
   * One page of published versions, newest first, without their snapshots.
   *
   * Returns the array. When you need to page — an agent published on every
   * deploy accumulates versions, and nothing prunes them — read `has_more` from
   * {@link listPage} instead and pass the last `version` as `before_version`.
   */
  async list(
    agentId: string,
    params?: AgentVersionListParams,
    options?: RequestOptions,
  ): Promise<AgentVersionSummary[]> {
    return (await this.listPage(agentId, params, options)).versions
  }

  /** {@link list} with the `has_more` flag, for paging. */
  listPage(
    agentId: string,
    params?: AgentVersionListParams,
    options?: RequestOptions,
  ): Promise<AgentVersionListResponse> {
    return this._client.get(
      path`/v1/agents/${agentId}/versions`,
      // Spread into a plain query record: an `interface` has no index
      // signature, so it does not structurally satisfy `Query`.
      { ...params },
      options,
    )
  }

  /** One version with its full snapshot. Version 0 is the draft: use `agents.retrieve`. */
  retrieve(agentId: string, version: number, options?: RequestOptions): Promise<AgentVersion> {
    return this._client.get(
      path`/v1/agents/${agentId}/versions/${versionSegment(version)}`,
      undefined,
      options,
    )
  }
}

/**
 * A version number as a path segment.
 *
 * Rejected here rather than sent: a fractional or negative number would 404 or
 * 422 from the server with nothing pointing at the caller's own value, and
 * `undefined` reaching the template would request the whole collection.
 */
function versionSegment(version: number): string {
  if (!Number.isInteger(version) || version < 1) {
    throw new DialgemError(
      `Expected a published version number (a positive integer), got ${JSON.stringify(version)}. ` +
        "Version 0 is the draft — read it with agents.retrieve().",
    )
  }
  return String(version)
}

export class AgentFunctions extends APIResource {
  list(agentId: string, options?: RequestOptions): Promise<AgentFunction[]> {
    return this._client.get(path`/v1/agents/${agentId}/functions`, undefined, options)
  }

  create(agentId: string, body: FunctionCreateParams, options?: RequestOptions): Promise<AgentFunction> {
    return this._client.post(path`/v1/agents/${agentId}/functions`, body, options)
  }

  update(
    agentId: string,
    functionId: string,
    body: FunctionUpdateParams,
    options?: RequestOptions,
  ): Promise<AgentFunction> {
    return this._client.patch(path`/v1/agents/${agentId}/functions/${functionId}`, body, options)
  }

  delete(agentId: string, functionId: string, options?: RequestOptions): Promise<void> {
    return this._client.delete(path`/v1/agents/${agentId}/functions/${functionId}`, options)
  }

  /** Set the order functions are offered to the LLM. `order` is function ids, first to last. */
  reorder(agentId: string, body: FunctionReorderParams, options?: RequestOptions): Promise<void> {
    return this._client.post(path`/v1/agents/${agentId}/functions/reorder`, body, options)
  }
}

export class AgentKnowledge extends APIResource {
  list(agentId: string, options?: RequestOptions): Promise<KnowledgeDocument[]> {
    return this._client.get(path`/v1/agents/${agentId}/knowledge`, undefined, options)
  }

  /** Add a plain-text document (up to 500,000 characters). It is chunked and embedded server-side. */
  create(agentId: string, body: KnowledgeDocumentCreateParams, options?: RequestOptions): Promise<KnowledgeDocument> {
    return this._client.post(path`/v1/agents/${agentId}/knowledge`, body, options)
  }

  delete(agentId: string, sourceId: string, options?: RequestOptions): Promise<void> {
    return this._client.delete(path`/v1/agents/${agentId}/knowledge/${sourceId}`, options)
  }
}

export class AgentMCPServers extends APIResource {
  list(agentId: string, options?: RequestOptions): Promise<MCPServer[]> {
    return this._client.get(path`/v1/agents/${agentId}/mcp-servers`, undefined, options)
  }

  create(agentId: string, body: MCPServerCreateParams, options?: RequestOptions): Promise<MCPServer> {
    return this._client.post(path`/v1/agents/${agentId}/mcp-servers`, body, options)
  }

  update(agentId: string, serverId: string, body: MCPServerUpdateParams, options?: RequestOptions): Promise<MCPServer> {
    return this._client.patch(path`/v1/agents/${agentId}/mcp-servers/${serverId}`, body, options)
  }

  delete(agentId: string, serverId: string, options?: RequestOptions): Promise<void> {
    return this._client.delete(path`/v1/agents/${agentId}/mcp-servers/${serverId}`, options)
  }

  /** Connect to the server now, list its tools, and store the result as `last_status`. */
  test(agentId: string, serverId: string, options?: RequestOptions): Promise<MCPServerTestResult> {
    return this._client.post(path`/v1/agents/${agentId}/mcp-servers/${serverId}/test`, undefined, options)
  }
}
