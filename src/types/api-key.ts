/** What an API key was granted. The secret is never returned. */
export interface ApiKeyDetails {
  id: string
  name: string
  /** The start of the key, to recognise it by. */
  prefix: string
  /** True when the key has no scopes and can do everything. */
  full_access: boolean
  /** For example `["calls:write", "agents:read"]`; `null` for a full-access key. */
  scopes: string[] | null
  /** IP addresses or CIDR ranges the key may be used from; `null` for anywhere. */
  allowed_ips: string[] | null
  expires_at: string | null
  expired: boolean
  last_used_at: string | null
  created_at: string | null
  revoked_at: string | null
}

export interface ApiKeyInfo {
  auth: "api_key" | "session" | "service" | (string & {})
  /** Your organization's slug. */
  organization: string
  role: string
  /** The key being used; `null` when the request was not made with an organization API key. */
  key: ApiKeyDetails | null
}
