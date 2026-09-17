import type { Query, RequestOptions } from "../core/http.js"
import { PagePromise, type PageData } from "../core/pagination.js"
import type {
  Call,
  CallDeleteResponse,
  CallListParams,
  CallRegisterResponse,
  CallStopResponse,
  CallUpdateParams,
  PhoneCallCreateResponse,
} from "../types/call.js"
import type { CallCreatePhoneCallParams, CallRegisterParams } from "../types/params.js"
import { APIResource, path } from "./resource.js"

interface CallListEnvelope {
  calls: Call[]
  has_more: boolean
  pagination_key: string | null
}

export class Calls extends APIResource {
  /**
   * Calls, newest first by default. Await for one page, or iterate for every call:
   *
   *   const page = await dialgem.calls.list({ limit: 50 })
   *   for await (const call of dialgem.calls.list({ status: "completed", start_after: since })) { ... }
   */
  list(params: CallListParams = {}, options?: RequestOptions): PagePromise<Call> {
    const query = toQuery(params)
    const fetchPage = async (paginationKey: string | null): Promise<PageData<Call>> => {
      const res = await this._client.get<CallListEnvelope>(
        "/v1/calls",
        { ...query, pagination_key: paginationKey ?? undefined },
        options,
      )
      return { data: res.calls, has_more: res.has_more, pagination_key: res.pagination_key }
    }
    return new PagePromise(fetchPage)
  }

  /** One call, including its transcript, analysis, latency and recording URL. */
  retrieve(callId: string, options?: RequestOptions): Promise<Call> {
    return this._client.get(path`/v1/calls/${callId}`, undefined, options)
  }

  /** Replace the call's `metadata`. */
  update(callId: string, body: CallUpdateParams, options?: RequestOptions): Promise<Call> {
    return this._client.patch(path`/v1/calls/${callId}`, body, options)
  }

  /**
   * Permanently delete a finished call: its record, transcript, analysis and
   * recording. A call still in progress is refused with `ConflictError`; stop it first.
   */
  delete(callId: string, options?: RequestOptions): Promise<CallDeleteResponse> {
    return this._client.delete(path`/v1/calls/${callId}`, options)
  }

  /**
   * End an ongoing call now, as if the agent had hung up. The call becomes
   * `completed` with `disconnection_reason: "manual_stopped"` a moment later, and
   * the usual `call_ended` webhook follows.
   *
   * `ConflictError` with `errCode` `call_not_ongoing` if it already ended, or
   * `call_not_connected` if no agent is on the call yet (e.g. still ringing).
   * Not retried by default.
   */
  stop(callId: string, options?: RequestOptions): Promise<CallStopResponse> {
    return this._client.post(path`/v1/calls/${callId}/stop`, undefined, options)
  }

  /**
   * Dial `to` from one of your organization's numbers, with `agent_id` (or the
   * number's outbound agent) on the line.
   *
   * Not retried by default: a retry after an ambiguous failure can place a
   * second call. Follow progress through webhooks or `retrieve(call_id)`.
   */
  createPhoneCall(body: CallCreatePhoneCallParams, options?: RequestOptions): Promise<PhoneCallCreateResponse> {
    return this._client.post("/v1/calls/outbound", body, options)
  }

  /**
   * Bring-your-own-Twilio: call this from your Twilio voice webhook, then answer
   * Twilio with `<Response><Connect><Stream url="{stream_url}"/></Connect></Response>`.
   * No Twilio credentials are shared with Dialgem.
   */
  register(body: CallRegisterParams, options?: RequestOptions): Promise<CallRegisterResponse> {
    return this._client.post("/v1/calls/register", body, options)
  }
}

function toQuery(params: CallListParams): Query {
  const { metadata, ...rest } = params
  const query: Query = { ...rest }
  // `limit` selects cursor pagination server-side; without it the API answers in
  // its page-number mode, which this client does not read.
  query["limit"] = params.limit ?? 10
  for (const [key, value] of Object.entries(metadata ?? {})) {
    query[`metadata.${key}`] = String(value)
  }
  return query
}
