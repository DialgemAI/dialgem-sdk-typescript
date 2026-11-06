/**
 * Chats. Request bodies come from the generated OpenAPI types; the response shapes are written from the
 * API's own serializer (`chat_to_dict`).
 */
import type { components } from "../generated/openapi.js"
import type { RequestBody } from "./params.js"

type Schemas = components["schemas"]

export type ChatCreateParams = RequestBody<Schemas["ChatCreate"]>
export type ChatUpdateParams = RequestBody<Schemas["ChatUpdate"]>

export interface ChatListParams {
  agent_id?: string | undefined
  status?: "ongoing" | "ended" | undefined
  /** 1 to 100. Default 50. */
  limit?: number | undefined
}

/** One entry in a chat. Tool use is shown between the user's message and the agent's reply. */
export interface ChatMessage {
  message_id: string
  role: "user" | "agent" | "tool_call_invocation" | "tool_call_result" | (string & {})
  /** The text. Empty on a `tool_call_invocation`; the tool's answer on a `tool_call_result`. */
  content: string
  /** Epoch milliseconds. */
  created_timestamp: number
  /** On the two tool roles: ties an invocation to its result. */
  tool_call_id?: string
  /** On `tool_call_invocation`. */
  name?: string
  arguments?: Record<string, unknown>
}

export interface Chat {
  id: string
  /** Same as `id`. */
  chat_id: string
  chat_type: "api_chat" | (string & {})
  chat_status: "ongoing" | "ended" | (string & {})
  agent_id: string
  /** The version the chat answers with; 0 is the live draft. */
  agent_version: number
  metadata: Record<string, unknown>
  dynamic_variables: Record<string, string>
  /** Epoch milliseconds. */
  start_timestamp: number | null
  end_timestamp: number | null
  /** `user_ended`, `agent_ended`, ... `null` while ongoing. */
  end_reason: string | null
  /** User and agent messages, not counting tool entries. */
  message_count: number
  /** `User: ...` / `Agent: ...` lines. */
  transcript: string
  /** Same shape as a call's `analysis`; `null` until it has run (a moment after the chat ends). */
  analysis: Record<string, unknown> | null
  /**
   * What the chat has cost so far, in $0.0001 units (50 = $0.005), and how many agent messages it holds
   * (the greeting is one, and is not billed). `null` for a team-member session, as for a call's cost.
   * Estimates until the price list is published.
   */
  chat_cost: { combined_cost: number; reply_count: number } | null
  /** Left out of `list` entries; fetch one chat for them. */
  messages?: ChatMessage[]
}

/** What `chats.sendMessage` returns: only the new entries, in order. */
export interface ChatReply {
  chat_id: string
  chat_status: "ongoing" | "ended" | (string & {})
  messages: ChatMessage[]
}

export interface ChatDeleteResponse {
  deleted: true
  id: string
}
