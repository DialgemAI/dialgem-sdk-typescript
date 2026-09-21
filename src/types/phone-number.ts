/**
 * Which published agent version a number answers on.
 *
 * A number is the frozen version with that number; `0` is the live draft, which
 * is what a number does when nothing is pinned. `"latest_published"` is a
 * pointer rather than a choice — it follows the newest publish, so shipping a
 * new version moves every number set to it without touching them.
 *
 * A *call* never reports this type: `Call.agent_version` is always the concrete
 * number that ran, resolved when the call was placed.
 */
export type AgentVersionRef = number | "latest_published"

/**
 * A phone number, as returned by `/v1/phone-numbers`.
 * The shape is the same across all phone-number endpoints.
 */
export interface PhoneNumber {
  /** Dialgem id. Use this (not the E.164 number) for update/assign/delete. */
  id: string
  status: string
  provider: string
  /** E.164, e.g. `+14155550123`. */
  phone_number: string
  phone_number_pretty: string
  phone_number_type: string
  nickname: string
  inbound_agent_id: string | null
  inbound_agent_version: AgentVersionRef
  outbound_agent_id: string | null
  outbound_agent_version: AgentVersionRef
  /** Weighted inbound routing. `inbound_agent_id` is its primary entry. */
  inbound_agents: PhoneNumberAgentWeight[]
  outbound_agents: PhoneNumberAgentWeight[]
  custom_sms_enabled: boolean
  flow_sms_sender_enabled: boolean
  /** Epoch milliseconds (0 if unknown). */
  creation_timestamp: number
  /** Epoch milliseconds (0 if unknown). */
  last_modification_timestamp: number
  sip_outbound_trunk_config: SipOutboundTrunkConfig | null
}

export interface PhoneNumberAgentWeight {
  agent_id: string
  agent_version: AgentVersionRef
  weight: number
}

export interface SipOutboundTrunkConfig {
  termination_uri?: string | null
  transport?: string | null
  auth_username?: string | null
  [key: string]: unknown
}
