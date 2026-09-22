export { Dialgem, BASE_URL, type ClientOptions } from "./client.js"
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
  DEFAULT_SIGNATURE_TOLERANCE_MS,
  WEBHOOK_DELIVERY_HEADER,
  WEBHOOK_EVENT_HEADER,
  WEBHOOK_SIGNATURE_HEADER,
  type SignatureHeader,
  type VerifyOptions,
  type WebhookPayload,
} from "./webhooks.js"

export type { Agents, AgentFunctions, AgentKnowledge, AgentMCPServers, AgentVersions } from "./resources/agents.js"
export type { Calls } from "./resources/calls.js"
export type { PhoneNumbers } from "./resources/phone-numbers.js"
export type { FlowTemplates, PromptTemplates, Voices } from "./resources/catalog.js"
export type { Billing, Sessions, Usage } from "./resources/account.js"

export type * from "./types/params.js"
export type * from "./types/agent.js"
export type * from "./types/agent-resources.js"
export type * from "./types/agent-version.js"
export type * from "./types/call.js"
export type * from "./types/phone-number.js"
export type * from "./types/catalog.js"
export type * from "./types/usage.js"
export type * from "./types/billing.js"
export type * from "./types/session.js"
export type {
  CallAnalyzedEvent,
  CallEndedEvent,
  CallStartedEvent,
  FunctionCallContext,
  FunctionCallRequest,
  WebhookEvent,
} from "./types/webhook.js"
