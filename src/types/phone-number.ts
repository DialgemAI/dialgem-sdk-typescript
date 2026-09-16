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
  inbound_agent_version: number
  outbound_agent_id: string | null
  outbound_agent_version: number
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
  agent_version: number
  weight: number
}

export interface SipOutboundTrunkConfig {
  termination_uri?: string | null
  transport?: string | null
  auth_username?: string | null
  [key: string]: unknown
}
