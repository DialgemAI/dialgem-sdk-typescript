import type { RequestOptions } from "../core/http.js"
import type { PhoneNumberAssignParams, PhoneNumberCreateParams, PhoneNumberUpdateParams } from "../types/params.js"
import type { PhoneNumber } from "../types/phone-number.js"
import { APIResource, path } from "./resource.js"

export class PhoneNumbers extends APIResource {
  /** Register a number you own (`phone_number` in E.164) with Dialgem. */
  create(body: PhoneNumberCreateParams, options?: RequestOptions): Promise<PhoneNumber> {
    return this._client.post("/v1/phone-numbers", body, options)
  }

  /** Every active (not released) number in the organization, newest first. */
  list(options?: RequestOptions): Promise<PhoneNumber[]> {
    return this._client.get("/v1/phone-numbers", undefined, options)
  }

  /**
   * One number by its E.164 value, e.g. `+14155550123`.
   *
   * Keyed on the number rather than on `id`, because the number is what you
   * have when you are asking whether it is registered at all. Throws
   * `NotFoundError` when it is not.
   */
  retrieve(phoneNumber: string, options?: RequestOptions): Promise<PhoneNumber> {
    return this._client.get(
      path`/v1/phone-numbers/by-number/${phoneNumber}`,
      undefined,
      options,
    )
  }

  /**
   * Partial update.
   *
   * `inbound_agent_id` is **ignored unless `set_inbound_agent: true`** is sent with
   * it, both to set an agent and to clear one (`null`). Same for the outbound pair.
   * `inbound_agents` / `outbound_agents` (weighted routing), when sent, take
   * precedence over the single-agent fields.
   */
  update(phoneNumberId: string, body: PhoneNumberUpdateParams, options?: RequestOptions): Promise<PhoneNumber> {
    return this._client.patch(path`/v1/phone-numbers/${phoneNumberId}`, body, options)
  }

  /** Set the number's **inbound** agent, or pass `agent_id: null` to clear it. For outbound, use `update`. */
  assign(phoneNumberId: string, body: PhoneNumberAssignParams, options?: RequestOptions): Promise<PhoneNumber> {
    return this._client.patch(path`/v1/phone-numbers/${phoneNumberId}/assign`, body, options)
  }

  /** Release the number from Dialgem. It stops routing calls and disappears from `list()`; your carrier account is untouched. */
  delete(phoneNumberId: string, options?: RequestOptions): Promise<void> {
    return this._client.delete(path`/v1/phone-numbers/${phoneNumberId}`, options)
  }
}
