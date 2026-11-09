<div align="center">

# Dialgem for TypeScript

**The official TypeScript SDK for the [Dialgem](https://dialgem.com) voice AI API.**

Build voice agents, put them on phone numbers, place calls, steer them live, and read transcripts, all from your backend.

[![npm](https://img.shields.io/npm/v/@dialgem/sdk?color=CB3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/@dialgem/sdk)
[![Node](https://img.shields.io/node/v/@dialgem/sdk?logo=node.js&logoColor=white)](https://www.npmjs.com/package/@dialgem/sdk)
[![CI](https://img.shields.io/github/actions/workflow/status/DialgemAI/dialgem-sdk-typescript/ci.yml?branch=main&label=CI&logo=github)](https://github.com/DialgemAI/dialgem-sdk-typescript/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-typed-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Stars](https://img.shields.io/github/stars/DialgemAI/dialgem-sdk-typescript?style=flat&logo=github)](https://github.com/DialgemAI/dialgem-sdk-typescript/stargazers)

[Website](https://dialgem.com) · [Issues](https://github.com/DialgemAI/dialgem-sdk-typescript/issues) · [Changelog](CHANGELOG.md) · [Python SDK](https://github.com/DialgemAI/dialgem-sdk-python)

</div>

---

```ts
import { Dialgem } from "@dialgem/sdk"

const dialgem = new Dialgem() // reads DIALGEM_API_KEY

const agent = await dialgem.agents.create({ name: "Front desk", system_prompt: "You answer for Acme Dental." })
const { call_id } = await dialgem.calls.createPhoneCall({ from_: "+14155550100", to: "+14155550123", agent_id: agent.id })
```

## Why this SDK

- **Typed end to end.** Request bodies are typed from the API's own schema, including the full conversation-flow node union, and webhook events are a discriminated union you can `switch` on.
- **Zero runtime dependencies.** ESM and CommonJS builds, so it works from any Node project.
- **Runs anywhere with `fetch`.** Node.js 20+, Bun, Deno and serverless runtimes that provide `fetch` and Web Crypto.
- **Safe by default.** `POST` is never retried (a retry could ring someone twice), other requests retry with backoff and `Retry-After`, and redirects are never followed so your key can't be sent elsewhere.
- **Everything a backend needs.** Agents (with tools, knowledge, MCP servers and versions), phone numbers, calls and chats, saved flows and LLMs, voices, contacts, live call control, and webhook signature verification.
- **Server-side only.** Your API key grants full access to your organization. To talk to an agent from a web page, use [`@dialgem/client`](https://github.com/DialgemAI/dialgem-client-sdk).

## Contents

[Install](#install) · [Quickstart](#quickstart) · [Recipes](#recipes) · [Live call control](#live-call-control) · [Errors](#errors) · [Retries](#retries) · [Coverage](#coverage) · [Development](#development) · [License](#license)

## Install

```sh
npm install @dialgem/sdk
# or
pnpm add @dialgem/sdk
# or
yarn add @dialgem/sdk
```

## Quickstart

Create an organization API key (`zk_…`) in the Dialgem dashboard and keep it in your server's environment.

```ts
import { Dialgem } from "@dialgem/sdk"

const dialgem = new Dialgem() // reads DIALGEM_API_KEY

const agent = await dialgem.agents.create({
  name: "Front desk",
  system_prompt: "You are the front desk for {{business_name}}.",
  first_message: "Thanks for calling, how can I help?",
  default_dynamic_variables: { business_name: "Acme Dental" },
})
```

| Option | Default | |
|---|---|---|
| `apiKey` | `process.env.DIALGEM_API_KEY` | Organization API key. |
| `timeout` | `60000` | Milliseconds per attempt. |
| `maxRetries` | `2` | See [Retries](#retries). |
| `fetch` | global `fetch` | Custom implementation (proxy agent, instrumentation). |
| `defaultHeaders` | `{}` | Sent with every request. |

Every method also takes an optional last argument, `{ timeout, maxRetries, signal, headers }`, which overrides these options for that one request.

Field names are the API's own snake_case, sent exactly as written.

## Recipes

Complete, typechecked versions of each recipe ship with the package, in `node_modules/@dialgem/sdk/examples/`.

### 1. Provision an agent on a phone number

```ts
const agent = await dialgem.agents.create({ name: "Front desk", system_prompt: "…" })
const number = await dialgem.phoneNumbers.create({ phone_number: "+14155550100" })

await dialgem.phoneNumbers.update(number.id, {
  inbound_agent_id: agent.id,
  set_inbound_agent: true, // inbound_agent_id is ignored without this
})
```

Agents also have tools, knowledge and MCP servers:

```ts
await dialgem.agents.functions.create(agent.id, {
  name: "lookup_order",
  url: "https://example.com/api/orders/lookup",
  parameters: { type: "object", properties: { order_id: { type: "string" } } },
})
await dialgem.agents.knowledge.create(agent.id, { filename: "faq.txt", content: faqText })
```

To start from a built-in template, fetch it and pass its fields to `agents.create`:

```ts
const tpl = await dialgem.promptTemplates.retrieve("dental_front_desk")
await dialgem.agents.create({
  name: tpl.name,
  system_prompt: tpl.system_prompt,
  first_message: tpl.first_message,
  default_dynamic_variables: { ...tpl.default_dynamic_variables, business_name: "Acme Dental" },
})
```

### 2. Place an outbound call

```ts
const { call_id } = await dialgem.calls.createPhoneCall({
  from_: "+14155550100", // a number on your organization (`from_` is the wire name)
  to: "+14155550199",
  agent_id: agent.id,
  dialgem_llm_dynamic_variables: { customer_name: "Sam" },
  metadata: { crm_id: "42" }, // your own data; returned on the call and in every webhook
})
```

Manage it afterwards:

```ts
await dialgem.calls.update(call_id, { metadata: { crm_id: "42", campaign: "renewals" } })
await dialgem.calls.stop(call_id) // end it now; disconnection_reason becomes "manual_stopped"
await dialgem.calls.delete(call_id) // a finished call: record, transcript and recording
```

### 3. Bring your own Twilio number

Point your Twilio number's Voice webhook at your backend. Register the call there, then return TwiML that connects Twilio's media stream to Dialgem:

```ts
app.post("/twilio/voice", express.urlencoded({ extended: false }), async (req, res) => {
  const { stream_url } = await dialgem.calls.register({
    agent_id: AGENT_ID,
    call_sid: req.body.CallSid,
    from_number: req.body.From,
    to_number: req.body.To,
  })
  // stream_url contains `&`: escape it for XML.
  res.type("text/xml").send(`<Response><Connect><Stream url="${escapeXml(stream_url)}"/></Connect></Response>`)
})
```

Your Twilio credentials are never shared with Dialgem. `stream_url` is signed and expires after `expires_in` seconds.

### 4. Verify webhooks

Set `webhook_url`, `webhook_events` and `webhook_signing_secret` on the agent (and, optionally, `webhook_timeout_ms`, 1000–30000, default 10000, to bound how long each delivery attempt waits for your server). Dialgem then POSTs the events you subscribe to: `call_started`, `call_ended`, `call_analyzed`, `transcript_updated`, `transfer_started`, `transfer_bridged`, `transfer_cancelled` and `transfer_ended`. Each body is `{ event, call_id, agent_id, call }`, where `call` is the full call record; `transcript_updated` also carries `role`, `turn_index` and the `transcript` so far, and the transfer events carry `transfer: { target?, mode?, reason? }`. Each request is signed:

```
x-dialgem-signature: v=<timestamp_ms>,d=<hex>      hex = HMAC-SHA256(secret, raw_body + timestamp_ms)
```

`constructEvent` and `verify` check the HMAC and reject signatures more than 5 minutes old, so a captured request cannot be replayed. `call_ended` arrives as soon as the call ends; `call_analyzed` follows once the summary, sentiment and your extracted variables are ready. `transcript_updated` is sent per turn and may be retried out of order, so keep the highest `turn_index`. For a cold transfer, `transfer_bridged` is sent when the transferred leg finishes, followed by `transfer_ended`.

> **Verify the raw body.** The signature covers the exact bytes Dialgem sent. A body that was parsed and re-serialized, for example by `express.json()`, will never verify, even when the JSON is identical.

**Express**

```ts
import { Dialgem, WebhookVerificationError } from "@dialgem/sdk"

app.post("/webhooks/dialgem", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = await Dialgem.webhooks.constructEvent(req.body, req.header("x-dialgem-signature"), SECRET)
    if (event.event === "call_analyzed") await crm.update(event.call.metadata.crm_id, event.call.analysis?.variables)
    res.sendStatus(204)
  } catch (err) {
    if (err instanceof WebhookVerificationError) return res.status(400).send(err.message)
    throw err
  }
})
```

**Next.js route handler**

```ts
export async function POST(request: Request) {
  const event = await Dialgem.webhooks.constructEvent(
    await request.text(),
    request.headers.get("x-dialgem-signature"),
    process.env.DIALGEM_WEBHOOK_SECRET!,
  )
  // …
  return new Response(null, { status: 204 })
}
```

**Fastify**: register a buffer parser for `application/json` on the webhook route. See `examples/webhook-fastify.ts`.

`event` is a discriminated union, so `switch (event.event)` narrows the payload type. A failed delivery is retried up to three times; every attempt carries the same `x-dialgem-delivery` header, so drop an id you have already processed. Respond within 10 seconds and queue any slow work. `webhooks.verify(body, signature, secret)` returns a boolean if you prefer to handle rejection yourself.

**Verifying your custom functions.** When the agent calls one of your functions, the request is signed the same way, and its body is `{ name, call, args }`:

```ts
app.post("/functions/lookup-order", express.raw({ type: "application/json" }), async (req, res) => {
  const { args, call } = await Dialgem.webhooks.constructFunctionCall<{ order_id: string }>(
    req.body, req.header("x-dialgem-signature"), SECRET,
  )
  res.json(await orders.find(args.order_id, call.metadata.crm_id))
})
```

A function created with `args_at_root: true` receives the arguments object alone instead.

### 5. Export calls and transcripts

`calls.list()` returns one page when you `await` it. Iterate over it with `for await` to walk every page:

```ts
const since = Date.parse("2026-09-01T00:00:00Z")
for await (const call of dialgem.calls.list({ start_after: since, status: "completed", limit: 50 })) {
  console.log(call.id, call.duration_ms, call.analysis?.call_summary, call.transcript_text)
}

const page = await dialgem.calls.list({ agent_id: agent.id, metadata: { crm_id: "42" }, limit: 50 })
page.data // Call[]
if (page.hasNextPage()) await page.getNextPage()
```

Filters: `agent_id`, `status`, `direction`, `call_type`, `disconnection_reason`, `from_number`, `to_number`, `user_sentiment`, `call_successful`, `start_after` / `start_before` (epoch ms), `metadata`, `search` and `sort_order`. Pages are cursor-based, so walking them is stable while new calls arrive.

### 6. Ship a change without touching live calls

The agent you edit is the **draft**. Publishing freezes it — configuration, functions and MCP servers — as a numbered version that never changes afterwards:

```ts
const v1 = await dialgem.agents.versions.publish(agent.id, { title: "Refund flow" })
v1.version // 1

// Point production at the frozen copy, then keep editing the draft freely.
await dialgem.phoneNumbers.assign(number.id, { agent_id: agent.id, agent_version: v1.version })
await dialgem.agents.update(agent.id, { system_prompt: "…work in progress…" })

await dialgem.agents.versions.list(agent.id) // one page, newest first
await dialgem.agents.versions.retrieve(agent.id, 1) // with its snapshot

// Nothing prunes versions, so the list is paged. `listPage` keeps `has_more`.
const { versions, has_more } = await dialgem.agents.versions.listPage(agent.id, { limit: 20 })
```

A number can also follow the newest publish instead of naming a version, so shipping moves it with nothing to update:

```ts
await dialgem.phoneNumbers.assign(number.id, {
  agent_id: agent.id,
  agent_version: "latest_published",
})
```

A version is also pinnable per call — `createPhoneCall({ …, agent_id, agent_version: 1 })` and `register({ …, agent_version: 1 })` — and the version a call ran comes back on the call record as `agent_version`, so a recording, its transcript and its analysis all name the configuration that produced them. Version `0` everywhere means the draft, which is what an unpinned call runs.

### 7. Give an agent a cloned voice

```ts
import { readFile } from "node:fs/promises"

const voice = await dialgem.voices.clone({
  name: "Ada",
  files: [new Blob([await readFile("./sample.mp3")], { type: "audio/mpeg" })],
  // You are asserting that you hold the rights to this audio and have the
  // speaker's consent. It is recorded against your API identity.
  consent_confirmed: true,
})

await dialgem.agents.update(agent.id, { voice_id: voice.provider_voice_id })
```

The new voice is private to your organization — it never appears in another
one's catalog, and `voices.list()` puts yours first. ElevenLabs (the default)
takes up to 25 files; **Cartesia takes exactly one** and refuses more rather
than quietly picking one.

`voices.delete(voice.id)` removes it at the provider and here. It refuses with a
409 while an agent still uses it, rather than leaving that agent without a voice.


## Live call control

Steer a call while it is happening. `sessionId` is the session's id from `sessions.list()` or the call's own `call_id`, and the call can be on any service instance.

```ts
// Change this call's prompt or variables from the agent's next turn (not saved, only this call).
await dialgem.sessions.update(call_id, { dynamic_variables: { plan: "pro" } })

// Make the agent say a line in its own voice; interrupt: true cuts in now.
await dialgem.sessions.say(call_id, { text: "One moment while I check that." })

// Give a taken-over call back to the agent.
await dialgem.sessions.release(call_id)
```

`say` and `release` are **off unless your deployment enables live control** (`PermissionDeniedError` with `errCode` `live_control_disabled`), and are for owners, admins and API keys only. Listening in and taking a call over run over a WebSocket (`/v1/agent/sessions/{id}/live`), which this SDK does not wrap.

## Errors

Every error extends `DialgemError`. When the API returns an HTTP error, the SDK throws an `APIError` subclass chosen by status code:

| Status | Class |
|---|---|
| 400 | `BadRequestError` |
| 401 | `AuthenticationError` |
| 403 | `PermissionDeniedError` |
| 404 | `NotFoundError` |
| 409 | `ConflictError` |
| 422 | `UnprocessableEntityError` |
| 429 | `RateLimitError` |
| ≥500 | `InternalServerError` |
| no response | `APIConnectionError` / `APIConnectionTimeoutError` |
| your `signal` aborted | `APIUserAbortError` |

```ts
try {
  await dialgem.agents.update(id, { flow_config })
} catch (err) {
  if (err instanceof UnprocessableEntityError && err.errCode === "flow_invalid") {
    for (const issue of err.issues) console.log(issue.node_id, issue.message)
  } else if (err instanceof APIError) {
    console.error(err.status, err.errCode, err.message, err.requestId)
  }
}
```

Use `errCode` (for example `flow_invalid` or `flow_not_runnable`) to tell errors with the same status apart. Include `requestId` when you contact support.

## Retries

The SDK retries GET, PATCH and DELETE requests up to `maxRetries` times on 408, 429, 5xx and connection failures. It backs off exponentially with jitter and honors `Retry-After`.

**POST requests are not retried by default.** Most POSTs create something: after an ambiguous failure, a retried `createPhoneCall` would dial the same person twice. To retry a specific POST anyway, opt in on that request: `dialgem.agents.create(body, { maxRetries: 2 })`.

The SDK never follows redirects. The API does not issue them, and following one would send your API key to wherever the redirect points. A 3xx response throws an `APIError`.

## Coverage

| Resource | Methods |
|---|---|
| `agents` | `create`, `retrieve`, `list`, `update`, `delete` |
| `agents.functions` | `list`, `create`, `update`, `delete`, `reorder` |
| `agents.knowledge` | `list`, `create`, `delete` |
| `agents.mcpServers` | `list`, `create`, `update`, `delete`, `test` |
| `agents.versions` | `publish`, `list`, `listPage`, `retrieve` |
| `calls` | `list`, `retrieve`, `update`, `delete`, `stop`, `rerunAnalysis`, `createPhoneCall`, `register` |
| `phoneNumbers` | `create`, `list`, `retrieve`, `update`, `assign`, `delete` |
| `voices` | `list`, `clone`, `delete` |
| `flowTemplates`, `promptTemplates` | `list`, `retrieve` |
| `llms` | `create`, `list`, `retrieve`, `update`, `delete` |
| `flows` | `create`, `list`, `retrieve`, `update`, `delete` |
| `chats` | `create`, `list`, `retrieve`, `update`, `delete`, `sendMessage`, `end`, `rerunAnalysis` |
| `sessions` | `list`, `update`, `say`, `release` |
| `apiKey` | `retrieve` |
| `contacts` | `retrieveByPhone` (and the rest: see the reference) |
| `webhooks` | `verify`, `constructEvent`, `constructFunctionCall` |

In-browser web calls are not part of this package: see [`@dialgem/client`](https://github.com/DialgemAI/dialgem-client-sdk).

## Development

Requires Node 22.13+ and pnpm 11.

```sh
pnpm install
pnpm typecheck && pnpm test          # unit tests with a fake fetch, plus the OpenAPI contract test
pnpm build && pnpm smoke && pnpm lint:package

# After an API change: refresh the filtered OpenAPI snapshot, then regenerate request types.
pnpm sync:openapi --from https://api.dialgem.com/openapi.json
pnpm gen:types

# Against a running API, with an organization key:
DIALGEM_API_KEY=zk_… pnpm test:live   # runs against api.dialgem.com — use a test org's key
```

The API address is fixed at `https://api.dialgem.com` and `baseURL` is refused,
so a key can never start hitting production by accident. To exercise the SDK
against a local or staging stack, pass a `fetch` that rewrites the origin — it
is explicit, it stays in your test setup, and it cannot be switched on by an
environment variable someone forgot to unset:

```ts
const local = new Dialgem({
  apiKey: "zk_local",
  fetch: (url, init) => fetch(String(url).replace("https://api.dialgem.com", "http://localhost:8002"), init),
})
```

Request-body types are generated from `openapi/openapi.json`. Response types in `src/types/` are written by hand, so a change to a response shape needs a matching edit there.

To release, bump `version` in `package.json` and `src/version.ts`, add a CHANGELOG entry, merge to `main`, and push a matching tag (`git tag v0.1.0 && git push origin v0.1.0`). A version with a hyphen (`0.2.0-beta.1`) publishes to the `next` dist-tag.

## License

Apache-2.0. Copyright 2026 Achroweb Solutions. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

---

<div align="center">

If this SDK saves you time, a ⭐ on [GitHub](https://github.com/DialgemAI/dialgem-sdk-typescript) helps other developers find it.

</div>
