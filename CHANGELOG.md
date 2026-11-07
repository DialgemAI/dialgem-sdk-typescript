# Changelog

## 0.1.0-beta.3

### Added
- `phoneNumbers.search({ country?, type?, area_code?, contains?, limit? })` lists numbers that can be bought, with the monthly price, and `phoneNumbers.buy({ phone_number, type?, nickname? })` buys one. **Buying spends the organization's credit**: the first month is debited when you buy and the rental renews monthly until the number is released; nothing is charged if the purchase fails. Both need the deployment to have number purchasing switched on (`search` throws `NotFoundError`, `number_purchase_disabled`, otherwise). Types: `PhoneNumberSearchParams`, `PhoneNumberBuyParams`, `AvailablePhoneNumbers`, `PurchasedPhoneNumber`.
- A number looked up with `phoneNumbers.retrieve` now carries `own_twilio` (whether it is on a Twilio account you connected yourself). Connecting your own Twilio account and importing its numbers is a dashboard feature; it is not in the SDK, because it handles your Twilio credentials.

## 0.1.0-beta.2

### Not in this SDK, on purpose
Campaigns, webhook endpoint management, usage, billing, analytics, and contact erasure / do-not-call are dashboard-only. See the surface policy in the Python SDK's `docs/api-surface.md`.

### Breaking changes
- **The API address is fixed at `https://api.dialgem.com`.** The `baseURL` option and the `DIALGEM_BASE_URL` environment variable are gone. Passing `baseURL` now throws rather than being ignored, so a leftover staging or local URL cannot quietly send your key to production. `DEFAULT_BASE_URL` is renamed `BASE_URL`.
- **Webhook signatures are timestamped.** `x-dialgem-signature` is now `v=<timestamp_ms>,d=<hex>`, where the HMAC covers the raw body plus the timestamp. `verify` and `constructEvent` also reject signatures more than 5 minutes old; set `toleranceMs` or `now` to change that. Signatures from 0.1.0-beta.0 no longer verify.
- **Webhook payloads carry the full call record.** Every event is `{ event, call_id, agent_id, call }`. The flat fields (`status`, `duration_s`, `analysis`) now live under `call`.
- **`calls.list` pages are cursor-based.** A page is `{ data, has_more, pagination_key }`. `page`, `page_size` and `total` are gone; use `limit`.

### Added
- `sessions.say(sessionId, { text, interrupt? })` and `sessions.release(sessionId)`: make the agent speak a line on a live call, and hand a taken-over call back. Off unless the deployment enables live control (`live_control_disabled`). Listening in and taking over run over a WebSocket this SDK does not wrap. `sessions.update` now reaches a call on any service instance.

- `sessions.update(sessionId, { system_prompt?, dynamic_variables? })`: change a live call's prompt and/or variables from the agent's next turn. `sessionId` is the session's id or the call's `call_id`. Only that call changes and it is not saved.
- **Saved LLMs.** `llms` (`create`, `list`, `retrieve`, `update`, `delete`): a prompt and model set up once, attached with `llm_id` on `agents.create` / `agents.update`. Attaching copies the values; later edits or deletion do not change the agent, and `llm_id` cannot be sent with the fields it carries.
- `agents.mcpServers.listTools(agentId, serverId)`: the server's tools with descriptions and argument schemas, from a live connection; stores nothing.
- **Saved flows.** `flows` (`create`, `list`, `retrieve`, `update`, `delete`): build and check a conversation flow once, then attach it with `flow_id` on `agents.create` / `agents.update`. Attaching copies the flow; later edits or deletion do not change the agent.
- **Chats.** `chats` (`create`, `list`, `retrieve`, `update`, `delete`, `sendMessage`, `end`, `rerunAnalysis`): text conversations with a prompt agent, with the agent's own prompt, model and functions.
- Chats are billed per agent reply (a spent balance is a 402 `insufficient_credit`); `Chat.chat_cost` shows the spend (`null` for a team-member session). Webhook events `chat_started`, `chat_ended` and `chat_analyzed` are in the `WebhookEvent` union (`ChatStartedEvent`, `ChatEndedEvent`, `ChatAnalyzedEvent`); they carry `chat_id` and `chat`, not `call_id`, so narrow on `event` before reading `call`.
- `calls.rerunAnalysis(callId)`, `contacts.retrieveByPhone(phone, { default_country })` and `apiKey.retrieve()` (who this key is; works for any scope).
- **Agent simulations.** `simulations.createSuite`, `createCase`, `run` and `retrieveRun` (with the rest of `listSuites`, `retrieveSuite`, `updateSuite`, `deleteSuite`, `updateCase`, `deleteCase`, `listRuns`, `cancelRun`): save conversations a simulated caller has with your agent, run them in text against the draft or a published version, and check what it said and did. A suite's `publish_gate` can warn or block publishing a version until the draft has passed. Nothing is dialled or billed and the agent's tools are never really called.
- **Inbound routing webhook.** `phoneNumbers.update(id, { inbound_webhook_url })` sets (or, with `null`, removes) a URL Dialgem asks, before an inbound call is answered, which agent should take it, with variables or metadata, or to reject it. `phoneNumbers.testInboundWebhook(id)` sends one signed test request; `phoneNumbers.rotateInboundWebhookSecret(id)` replaces the signing secret. `PhoneNumber` gains `inbound_webhook_url` and `inbound_webhook_secret_hint`, and `inbound_webhook_secret` in the one response that creates or rotates it.
- `calls.update` (replace metadata), `calls.delete` and `calls.stop`.
- `metadata` on `createPhoneCall` and `register`.
- New call record fields: `metadata`, `dynamic_variables`, `start_timestamp`, `end_timestamp`, `ended_at`, `duration_ms`, `transcript_text`, `in_voicemail` and `latency` (per-stage p50/p90/p95/p99). Post-call analysis gains `call_summary` and `in_voicemail`.
- `calls.list` filters: `agent_id`, `status` (one or several), `direction`, `call_type`, `disconnection_reason`, `from_number`, `to_number`, `user_sentiment`, `call_successful`, `start_after`, `start_before`, `metadata`, `sort_order`.
- `webhooks.constructFunctionCall` verifies and parses signed requests to your custom functions (`{ name, call, args }`).
- `AgentFunction.args_at_root`.
- **Voice cloning.** `voices.clone({ name, files, consent_confirmed: true })` uploads audio and returns a voice private to your organization; `voices.delete(voiceId)` removes it at the provider and here. `Voice` gains `is_custom` and `created_by`. The upload is never retried, whatever `maxRetries` says.
- `phoneNumbers.retrieve(phoneNumber)` looks a number up by its E.164 value.
- **`agent_version: "latest_published"`** on a phone number and on `createPhoneCall` / `register`: a pointer that follows the newest publish rather than naming a version. A call still reports the concrete version it ran.
- **Contacts.** `contacts` (`create`, `list`, `retrieve`, `update`, `delete`, `calls`), `contactLists` (`list`, `create`, `retrieve`, `update`, `delete`, `addContacts`, `removeContact`) and CSV import under `contacts.imports` (`inspect`, `create`, `list`, `retrieve`, `errors`, `commit`, `cancel`). A contact is keyed on its phone number, stored in E.164 however it is written (pass `default_country` for numbers without a `+`). `do_not_call` on a contact is read from your do-not-call list, not stored on it. Imports run in the background: start one with `dry_run: true`, poll `retrieve` until it is `previewed`, then `commit`. `contacts.list` pages by cursor like `calls.list`. CSV downloads (the export, and the rejected-rows report) are available over the REST API only.
- **Browser calls.** `webCalls.create({ agent_id, metadata, dialgem_llm_dynamic_variables })` creates a call for one visitor and returns a one-use `access_token` (60 seconds) for `@dialgem/client`, so a web page can talk to an agent without your API key ever reaching the browser. Allow the pages that may start calls with `webCalls.updateSettings({ allowed_origins })` (`retrieveSettings` reads them back); `create` answers 409 `web_origins_not_configured` until at least one is set.
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
