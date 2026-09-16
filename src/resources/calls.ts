import type { RequestOptions } from "../core/http.js"
import { PagePromise, type PageData } from "../core/pagination.js"
import type {
  Call,
  CallListParams,
  CallRegisterResponse,
  PhoneCallCreateResponse,
} from "../types/call.js"
import type { CallCreatePhoneCallParams, CallRegisterParams } from "../types/params.js"
import { APIResource, path } from "./resource.js"

interface CallListEnvelope {
  calls: Call[]
  total: number
  page: number
  page_size: number
}

export class Calls extends APIResource {
  /**
   * Calls, newest first. Await for one page, or iterate for every call:
   *
   *   const page = await dialgem.calls.list({ page_size: 50 })
   *   for await (const call of dialgem.calls.list({ status: "completed" })) {
   *     if (call.started_at < cutoff) break // newest first: everything after is older
   *   }
   */
  list(params: CallListParams = {}, options?: RequestOptions): PagePromise<Call> {
    const fetchPage = async (page: number): Promise<PageData<Call>> => {
      const res = await this._client.get<CallListEnvelope>("/v1/calls", { ...params, page }, options)
      return { data: res.calls, total: res.total, page: res.page, page_size: res.page_size }
    }
    return new PagePromise(fetchPage, params.page ?? 1)
  }

  /** One call, including its transcript, analysis and recording URL. */
  retrieve(callId: string, options?: RequestOptions): Promise<Call> {
    return this._client.get(path`/v1/calls/${callId}`, undefined, options)
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
