/**
 * Contacts, lists and CSV imports.
 *
 * Request bodies come from the generated OpenAPI types (see `params.ts`); the
 * response shapes are written here, from the API's own serializers.
 */
import type { components } from "../generated/openapi.js"
import type { RequestBody } from "./params.js"

type Schemas = components["schemas"]

export type ContactCreateParams = RequestBody<Schemas["ContactCreate"]>
export type ContactUpdateParams = RequestBody<Schemas["ContactUpdate"]>
export type ContactListCreateParams = RequestBody<Schemas["ContactListCreate"]>
export type ContactListUpdateParams = RequestBody<Schemas["ContactListUpdate"]>
export type ContactImportCreateParams = RequestBody<Schemas["ContactImportCreate"]>

export interface Contact {
  id: string
  /** E.164, for example `+14155552671`. The number is the contact's identity: one contact per number. */
  phone: string
  first_name: string | null
  last_name: string | null
  email: string | null
  /** IANA zone name, for example `America/Chicago`. */
  timezone: string | null
  /** Your own fields, as text. */
  attributes: Record<string, string>
  source: "api" | "dashboard" | "import" | (string & {})
  /**
   * Whether the number is on your organization's do-not-call list. Read from that list
   * each time, never stored on the contact.
   */
  do_not_call: boolean
  /** ISO 8601, no timezone suffix (UTC). */
  created_at: string | null
  updated_at: string | null
  /** Present on `create`, `retrieve` and `update`. */
  lists?: { id: string; name: string }[]
  /** Present on `retrieve`: calls to or from the number. */
  call_count?: number
  last_call_at?: string | null
}

export interface ContactListParams {
  /** Matches name, email and phone digits. */
  q?: string | undefined
  list_id?: string | undefined
  /** 1 to 200. Default 50. */
  limit?: number | undefined
}

export interface ContactDeleteResponse {
  id: string
  deleted: true
}

export interface ContactCallSummary {
  id: string
  agent_id: string | null
  direction: "inbound" | "outbound" | (string & {})
  status: string
  started_at: string | null
  ended_at: string | null
  duration_s: number | null
  disconnection_reason: string | null
  /** The call's analysis summary, when it has one. No transcript. */
  summary: string | null
}

export interface ContactCallList {
  total: number
  calls: ContactCallSummary[]
}

export interface ContactListRecord {
  id: string
  name: string
  description: string | null
  member_count: number
  created_at: string | null
  updated_at: string | null
}

export interface ContactListDeleteResponse {
  id: string
  deleted: true
}

export interface ContactListMembersAddResponse {
  id: string
  /** How many were not already in the list. */
  added: number
  member_count: number
}

export interface ContactListMemberRemoveResponse {
  id: string
  member_count: number
}

export type ContactImportStatus =
  | "queued"
  | "running"
  /** A dry run finished; apply it with `commit`. */
  | "previewed"
  | "completed"
  | "failed"
  | "cancelled"
  /** A preview nobody confirmed within a day. */
  | "expired"

export interface ContactImport {
  id: string
  status: ContactImportStatus
  dry_run: boolean
  filename: string | null
  total_rows: number
  /** For a preview, what would be created. */
  created: number
  updated: number
  /** Rows repeating an earlier number in the file, or existing contacts when `on_duplicate` is `skip`. */
  skipped: number
  /** Rows that could not be used. See `imports.errors`. */
  errors: number
  /** More rows were rejected than the report keeps (5,000). */
  errors_truncated: boolean
  failure: string | null
  mapping: Record<string, string> | null
  attribute_columns: string[] | null
  default_country: string | null
  on_duplicate: "update" | "skip" | null
  list_id: string | null
  created_at: string | null
  started_at: string | null
  finished_at: string | null
}

export interface ContactImportList {
  imports: ContactImport[]
}

export interface ContactCsvInspection {
  headers: string[]
  row_count: number
  /** The guessed field-to-column mapping: `phone`, `first_name`, `last_name`, `full_name`, `email`, `timezone`. */
  mapping: Record<string, string>
  /** Columns left over, offered as your own fields. */
  attribute_columns: string[]
  sample: Record<string, string | null>[]
}

export interface ContactImportErrorRow {
  /** The line of the file, counting the header as line 1. */
  row: number
  error: string
  values: Record<string, string>
}

export interface ContactImportErrors {
  errors: ContactImportErrorRow[]
  total: number
  truncated: boolean
}
