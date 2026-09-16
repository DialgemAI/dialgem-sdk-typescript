/**
 * Every failure the SDK raises is a `DialgemError`.
 *
 * HTTP failures are `APIError` subclasses chosen by status, so a caller can
 * `catch (e) { if (e instanceof NotFoundError) ... }`. Within a status, branch on
 * `errCode`: the API documents `err_code` as the one field clients
 * branch on, e.g. `flow_invalid`,
 * `flow_not_runnable`, `NOT_A_MEMBER`.
 */

/**
 * One entry of `issues[]` (in an error body, or an agent's `flow_validation`): a
 * field error or a flow graph rule.
 */
export interface ErrorIssue {
  /** Stable machine-readable identifier of the rule. */
  code?: string
  severity?: "error" | "warning"
  message?: string
  node_id?: string | null
  edge_id?: string | null
  /** Path into the request body, for field errors. */
  loc?: (string | number)[] | null
  meta?: Record<string, unknown>
  [key: string]: unknown
}

/** The API's error envelope. */
export interface ErrorBody {
  err_code: string
  err_msg: string
  request_id: string
  issues?: ErrorIssue[]
  [key: string]: unknown
}

/** Minimal read-only view of response headers, independent of the fetch implementation. */
export interface HeadersLike {
  get(name: string): string | null
}

export class DialgemError extends Error {
  override name = "DialgemError"
}

export class APIError extends DialgemError {
  override name = "APIError"
  /** HTTP status code. */
  readonly status: number
  /** The service's `err_code`, e.g. `flow_invalid` or `HTTP_404`. Undefined if the body was not the envelope. */
  readonly errCode: string | undefined
  /** The service's `request_id`. Quote it when contacting support. */
  readonly requestId: string | undefined
  /** Field/graph diagnostics, present on validation failures. */
  readonly issues: readonly ErrorIssue[]
  /** Parsed JSON body, or the raw text if the body was not JSON. */
  readonly body: unknown
  readonly headers: HeadersLike

  constructor(status: number, body: unknown, message: string, headers: HeadersLike) {
    super(message)
    this.status = status
    this.body = body
    this.headers = headers
    const envelope = isErrorBody(body) ? body : undefined
    this.errCode = envelope?.err_code
    this.requestId = envelope?.request_id ?? headers.get("x-request-id") ?? undefined
    this.issues = envelope?.issues ?? []
  }

  /** Build the subclass matching `status`. */
  static from(status: number, body: unknown, statusText: string, headers: HeadersLike): APIError {
    const envelope = isErrorBody(body) ? body : undefined
    const detail = envelope?.err_msg || (typeof body === "string" && body.trim() ? body.trim().slice(0, 500) : "")
    const message = detail ? `${status} ${detail}` : `${status} ${statusText || "status code (no body)"}`
    const Ctor = errorClassFor(status)
    return new Ctor(status, body, message, headers)
  }
}

export class BadRequestError extends APIError {
  override name = "BadRequestError"
}
export class AuthenticationError extends APIError {
  override name = "AuthenticationError"
}
export class PermissionDeniedError extends APIError {
  override name = "PermissionDeniedError"
}
export class NotFoundError extends APIError {
  override name = "NotFoundError"
}
export class ConflictError extends APIError {
  override name = "ConflictError"
}
export class UnprocessableEntityError extends APIError {
  override name = "UnprocessableEntityError"
}
export class RateLimitError extends APIError {
  override name = "RateLimitError"
}
export class InternalServerError extends APIError {
  override name = "InternalServerError"
}

/** The request never produced an HTTP response (DNS, TLS, reset, aborted by the caller). */
export class APIConnectionError extends DialgemError {
  override name = "APIConnectionError"
  constructor(message = "Connection error.", options?: { cause?: unknown }) {
    super(message, options)
  }
}

/** The caller's `signal` aborted the request. Never retried. */
export class APIUserAbortError extends DialgemError {
  override name = "APIUserAbortError"
  constructor(message = "Request was aborted.") {
    super(message)
  }
}

/** The request exceeded the configured `timeout`. */
export class APIConnectionTimeoutError extends APIConnectionError {
  override name = "APIConnectionTimeoutError"
  constructor(message = "Request timed out.") {
    super(message)
  }
}

/** A webhook's signature did not match its body. */
export class WebhookVerificationError extends DialgemError {
  override name = "WebhookVerificationError"
}

function errorClassFor(status: number): typeof APIError {
  switch (status) {
    case 400:
      return BadRequestError
    case 401:
      return AuthenticationError
    case 403:
      return PermissionDeniedError
    case 404:
      return NotFoundError
    case 409:
      return ConflictError
    case 422:
      return UnprocessableEntityError
    case 429:
      return RateLimitError
    default:
      return status >= 500 ? InternalServerError : APIError
  }
}

function isErrorBody(body: unknown): body is ErrorBody {
  return typeof body === "object" && body !== null && typeof (body as { err_code?: unknown }).err_code === "string"
}
