/**
 * Prepaid credit: what your organization has left, and what moved it.
 *
 * Amounts are integers in units of **$0.0001**, as everywhere else
 * (`balance: 425_000` is $42.50).
 */
export interface BillingSummary {
  org_id: string
  /**
   * Whether credit is actually enforced for this organization. When false,
   * nothing is charged and no call is refused — a self-hosted stack, or an
   * organization the operator exempted.
   */
  enabled: boolean
  currency: "usd"
  balance: number
  /** What new calls are charged per minute. */
  rate_per_minute: number
  /** Whether a card is saved (from an earlier top-up) for auto-recharge to charge. */
  has_payment_method: boolean
  /** Whether the server can take card payments at all. */
  purchases_available: boolean
  /** Smallest and largest single top-up. */
  min_topup: number
  max_topup: number
  auto_recharge: {
    enabled: boolean
    /** Recharge once the balance falls below this. */
    threshold: number | null
    /** How much each recharge adds. */
    amount: number | null
    /** Most auto-recharge may add per calendar month (units of $0.0001); null = no cap. */
    monthly_limit: number | null
    /** Why auto-recharge was last switched off (a decline, typically). */
    last_error: string | null
    /** A recharge is in flight. */
    pending: boolean
  }
}

export type CreditTransactionKind =
  | "purchase"
  | "auto_recharge"
  | "call"
  | "grant"
  | "adjustment"
  | "refund"
  | (string & {})

/** One movement of the balance. Credits are positive, debits negative. */
export interface CreditTransaction {
  id: string
  amount: number
  balance_after: number
  kind: CreditTransactionKind
  description: string
  /** The call this debit paid for, when `kind` is `"call"`. */
  call_id: string | null
  /** ISO 8601, no timezone suffix (UTC). */
  created_at: string
}

export interface CreditTransactionListParams {
  /** 1-based. Default 1. */
  page?: number | undefined
  /** 1–100. Default 25. */
  page_size?: number | undefined
}

export interface CreditTransactionList {
  transactions: CreditTransaction[]
  page: number
  page_size: number
  /** Every movement on the ledger, across all pages. */
  total: number
  has_more: boolean
}
