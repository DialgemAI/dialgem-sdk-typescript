/**
 * What your organization's calls cost over a period.
 *
 * Every amount is an integer in units of **$0.0001**, the same convention as
 * `Call.call_cost`: `cost: 1700` is $0.17. Days are UTC calendar days.
 */
export interface UsageBucket {
  calls: number
  /**
   * Calls with billed time (more than 0 s). The rest of `calls` went
   * unanswered or failed (those are costed at $0), are still in progress, or
   * were never finalized.
   */
  billed_calls: number
  billed_seconds: number
  cost: number
}

export interface UsageDay extends UsageBucket {
  /** `YYYY-MM-DD`, UTC. */
  date: string
}

export interface UsageByAgent extends UsageBucket {
  /** `null` for calls that ran with no agent. */
  agent_id: string | null
  agent_name: string
  agent_deleted: boolean
}

export interface UsageReport {
  /** Inclusive UTC days, `YYYY-MM-DD`. */
  period: { date_from: string; date_to: string }
  currency: "usd"
  /** What new calls are charged per minute. Past calls keep the rate they were charged at. */
  rate_per_minute: number
  totals: UsageBucket & { average_billed_seconds: number }
  /** Calls in progress right now, regardless of the period. */
  active_calls: number
  /** One entry per day of the period, zero-filled. */
  daily: UsageDay[]
  /** Most expensive first. */
  by_agent: UsageByAgent[]
  by_direction: (UsageBucket & { direction: string })[]
  by_call_type: (UsageBucket & { call_type: string })[]
}

export interface UsageRetrieveParams {
  /** First day, `YYYY-MM-DD` (UTC). Default: the 1st of `date_to`'s month. */
  date_from?: string | undefined
  /** Last day, `YYYY-MM-DD` (UTC), inclusive. Default: today. */
  date_to?: string | undefined
}
