export { Dialgem, DEFAULT_BASE_URL, type ClientOptions } from "./client.js"
export { VERSION } from "./version.js"

export {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIError,
  APIUserAbortError,
  AuthenticationError,
  BadRequestError,
  ConflictError,
  DialgemError,
  InternalServerError,
  NotFoundError,
  PermissionDeniedError,
  RateLimitError,
  UnprocessableEntityError,
  WebhookVerificationError,
  type ErrorBody,
  type ErrorIssue,
  type HeadersLike,
} from "./core/errors.js"
export type { Fetch, FetchInit, FetchResponse, RequestOptions } from "./core/http.js"
export { Page, PagePromise, type PageData } from "./core/pagination.js"

export {
  Webhooks,
  webhooks,
  WEBHOOK_EVENT_HEADER,
  WEBHOOK_SIGNATURE_HEADER,
  type SignatureHeader,
  type WebhookPayload,
} from "./webhooks.js"

export type { Agents, AgentFunctions, AgentKnowledge, AgentMCPServers } from "./resources/agents.js"
export type { Calls } from "./resources/calls.js"
export type { PhoneNumbers } from "./resources/phone-numbers.js"
export type { FlowTemplates, PromptTemplates, Voices } from "./resources/catalog.js"

export type * from "./types/params.js"
export type * from "./types/agent.js"
export type * from "./types/agent-resources.js"
export type * from "./types/call.js"
export type * from "./types/phone-number.js"
export type * from "./types/catalog.js"
export type { CallAnalyzedEvent, CallEndedEvent, CallStartedEvent, WebhookEvent } from "./types/webhook.js"
