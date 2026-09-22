import type { Query, RequestOptions } from "../core/http.js"
import type {
  BillingSummary,
  CreditTransactionList,
  CreditTransactionListParams,
} from "../types/billing.js"
import type { AgentSessionList } from "../types/session.js"
import type { UsageReport, UsageRetrieveParams } from "../types/usage.js"
import { APIResource } from "./resource.js"

export class Usage extends APIResource {
  /**
   * What your calls cost over a period: totals, a day-by-day series, and
   * breakdowns by agent, direction and call type.
   *
   * Defaults to the current calendar month so far. Days are UTC, and a call
   * counts toward the day it started. Amounts are in $0.0001 units.
   *
   * ```ts
   * const usage = await dialgem.usage.retrieve({ date_from: "2026-09-01", date_to: "2026-09-30" })
   * console.log(usage.totals.cost / 10_000) // dollars
   * ```
   */
  retrieve(params: UsageRetrieveParams = {}, options?: RequestOptions): Promise<UsageReport> {
    return this._client.get("/v1/usage", params as Query, options)
  }
}

/**
 * Prepaid credit, read-only.
 *
 * Buying credit, changing auto-recharge and opening the payment portal are
 * deliberately absent: they require an admin or owner **session**, and an API
 * key is a `member`, so the API refuses them. A person does those in the
 * dashboard; your backend watches the balance and reacts to it.
 */
export class Billing extends APIResource {
  /**
   * The organization's credit balance and auto-recharge settings.
   *
   * ```ts
   * const billing = await dialgem.billing.retrieve()
   * if (billing.enabled && billing.balance <= 0) {
   *   // New calls are being refused with a 402 right now.
   * }
   * ```
   */
  retrieve(options?: RequestOptions): Promise<BillingSummary> {
    return this._client.get("/v1/billing", undefined, options)
  }

  /** Credit movements, newest first: purchases, auto-recharges, per-call debits, grants, refunds. */
  transactions(
    params: CreditTransactionListParams = {},
    options?: RequestOptions,
  ): Promise<CreditTransactionList> {
    return this._client.get("/v1/billing/transactions", params as Query, options)
  }
}

export class Sessions extends APIResource {
  /**
   * The calls your organization has in progress right now, with a `count`.
   *
   * Live state read from the service's own registry — use it for a
   * concurrency check before placing a call. For finished calls use
   * `calls.list`; a call whose teardown never arrived is not counted here.
   */
  list(options?: RequestOptions): Promise<AgentSessionList> {
    return this._client.get("/v1/agent/sessions", undefined, options)
  }
}
