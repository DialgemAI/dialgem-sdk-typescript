/**
 * Request-body types, aliased from the generated OpenAPI types so they track the
 * API's own schema exactly. Field names are the API's own
 * (snake_case); the SDK sends bodies as-is.
 */
import type { components } from "../generated/openapi.js"

type Schemas = components["schemas"]

/**
 * Adds `| undefined` to the optional top-level fields of a request body, so
 * callers compiling with `exactOptionalPropertyTypes` can write
 * `{ agent_id: maybeId }`. An undefined field is dropped by `JSON.stringify`, which
 * is exactly "not sent". Required fields are left as they are.
 */
export type RequestBody<T> = { [K in keyof T]: {} extends Pick<T, K> ? T[K] | undefined : T[K] }

export type AgentCreateParams = RequestBody<Schemas["AgentCreate"]>
export type AgentUpdateParams = RequestBody<Schemas["AgentUpdate"]>
export type FunctionCreateParams = RequestBody<Schemas["FunctionCreate"]>
export type FunctionUpdateParams = RequestBody<Schemas["FunctionUpdate"]>
export type FunctionReorderParams = RequestBody<Schemas["FunctionReorder"]>
export type KnowledgeDocumentCreateParams = RequestBody<Schemas["DocumentCreate"]>
export type MCPServerCreateParams = RequestBody<Schemas["MCPServerCreate"]>
export type MCPServerUpdateParams = RequestBody<Schemas["MCPServerUpdate"]>
export type PhoneNumberCreateParams = RequestBody<Schemas["PhoneNumberCreate"]>
export type PhoneNumberUpdateParams = RequestBody<Schemas["PhoneNumberUpdate"]>
export type PhoneNumberAssignParams = RequestBody<Schemas["PhoneNumberAssign"]>

/**
 * `from_`, with the trailing underscore, is the wire name (`from` is a Python
 * keyword on the server). It must be a number registered on your organization.
 */
export type CallCreatePhoneCallParams = RequestBody<Schemas["OutboundCallRequest"]>
export type CallRegisterParams = RequestBody<Schemas["RegisterCallRequest"]>

/** A conversation-flow definition (`agent_type: "flow"`). */
export type FlowConfig = Schemas["FlowConfig"]
/** One state of a `multi_prompt` agent. */
export type PromptState = Schemas["PromptState"]
/** A field extracted from the transcript after the call ends. */
export type PostCallAnalysisVariable = Schemas["PostCallAnalysisVariable"]
export type KeyValuePair = Schemas["KVPair"]
export type AgentWeight = Schemas["AgentWeightIn"]

export type AgentType = NonNullable<Schemas["AgentCreate"]["agent_type"]>
export type WebhookEventType = NonNullable<Schemas["AgentCreate"]["webhook_events"]>[number]
export type FunctionKind = NonNullable<Schemas["FunctionCreate"]["kind"]>
