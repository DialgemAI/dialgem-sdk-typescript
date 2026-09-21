# Changelog

## 0.1.0-beta.1 (unreleased)

### Breaking changes
- **Webhook signatures are timestamped.** `x-dialgem-signature` is now `v=<timestamp_ms>,d=<hex>`, where the HMAC covers the raw body plus the timestamp. `verify` and `constructEvent` also reject signatures more than 5 minutes old; set `toleranceMs` or `now` to change that. Signatures from 0.1.0-beta.0 no longer verify.
- **Webhook payloads carry the full call record.** Every event is `{ event, call_id, agent_id, call }`. The flat fields (`status`, `duration_s`, `analysis`) now live under `call`.
- **`calls.list` pages are cursor-based.** A page is `{ data, has_more, pagination_key }`. `page`, `page_size` and `total` are gone; use `limit`.

### Added
- `calls.update` (replace metadata), `calls.delete` and `calls.stop`.
- `metadata` on `createPhoneCall` and `register`.
- New call record fields: `metadata`, `dynamic_variables`, `start_timestamp`, `end_timestamp`, `ended_at`, `duration_ms`, `transcript_text`, `in_voicemail` and `latency` (per-stage p50/p90/p95/p99). Post-call analysis gains `call_summary` and `in_voicemail`.
- `calls.list` filters: `agent_id`, `status` (one or several), `direction`, `call_type`, `disconnection_reason`, `from_number`, `to_number`, `user_sentiment`, `call_successful`, `start_after`, `start_before`, `metadata`, `sort_order`.
- `webhooks.constructFunctionCall` verifies and parses signed requests to your custom functions (`{ name, call, args }`).
- `AgentFunction.args_at_root`.
- **Agent versions.** `agents.versions.publish` freezes an agent — its configuration, functions and MCP servers — as an immutable numbered snapshot; `list` and `retrieve` read them back. Pin one with `inbound_agent_version` / `outbound_agent_version` on a phone number, or `agent_version` on `createPhoneCall` and `register`. The version a call ran is reported as `agent_version` on the call record and in every webhook. The agent itself is the draft, version 0, and stays what every unpinned call runs.

## 0.1.0-beta.0 (unreleased)

The first release.

- `Dialgem` client authenticated with an organization API key (`X-API-Key`).
- Resources:
  - `agents`, with its `functions`, `knowledge` and `mcpServers` sub-resources
  - `calls`: `list`, `retrieve`, `createPhoneCall`, `register`
  - `phoneNumbers`, `voices`, `flowTemplates`, `promptTemplates`
- Webhooks: `Dialgem.webhooks.verify` and `constructEvent` check HMAC-SHA256 signatures and return typed events.
- Typed errors carrying `errCode`, `requestId` and `issues`.
- Retries with backoff on GET, PATCH and DELETE, honoring `Retry-After`. POST is never retried by default.
- `calls.list()` pagination: `await` it for one page, or iterate with `for await` across all pages.
- Request-body types generated from the agent service's OpenAPI schema.
