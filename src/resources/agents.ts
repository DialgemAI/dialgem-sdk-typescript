import type { HttpClient, RequestOptions } from "../core/http.js"
import type { Agent, AgentDeleteResponse } from "../types/agent.js"
import type { AgentFunction, KnowledgeDocument, MCPServer, MCPServerTestResult } from "../types/agent-resources.js"
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
import { APIResource, path } from "./resource.js"

export class Agents extends APIResource {
  /** Tools (HTTP functions and built-ins like `end_call`) the agent can call. */
  readonly functions: AgentFunctions
  /** Text documents the agent retrieves from during the call. */
  readonly knowledge: AgentKnowledge
  /** Remote MCP servers whose tools are exposed to the agent. */
  readonly mcpServers: AgentMCPServers

  constructor(client: HttpClient) {
    super(client)
    this.functions = new AgentFunctions(client)
    this.knowledge = new AgentKnowledge(client)
    this.mcpServers = new AgentMCPServers(client)
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
