# @dialgem/sdk

The official TypeScript SDK for the [Dialgem](https://dialgem.com) voice AI API. Use it from your backend to create voice agents, put them on phone numbers, place and register calls, pull transcripts, and verify webhooks.

- Written in TypeScript. Request bodies are typed from the API's own schema, including the full conversation-flow node union.
- Zero runtime dependencies. Ships ESM and CommonJS builds.
- Node.js 20+. It also runs on Bun, Deno and serverless runtimes that provide `fetch` and Web Crypto.
- Server-side only. Your API key grants full access to your organization.

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
| `baseURL` | `process.env.DIALGEM_BASE_URL`, then `https://api.dialgem.com` | Point at a self-hosted or local stack. |
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
})
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

Set `webhook_url`, `webhook_events` and `webhook_signing_secret` on the agent. Dialgem then POSTs `call_started`, `call_ended` and `call_analyzed` events, each signed with HMAC-SHA256 in the `x-dialgem-signature` header.

> **Verify the raw body.** The signature covers the exact bytes Dialgem sent. A body that was parsed and re-serialized, for example by `express.json()`, will never verify, even when the JSON is identical.

**Express**

```ts
import { Dialgem, WebhookVerificationError } from "@dialgem/sdk"

app.post("/webhooks/dialgem", express.raw({ type: "application/json" }), async (req, res) => {
  try {
    const event = await Dialgem.webhooks.constructEvent(req.body, req.header("x-dialgem-signature"), SECRET)
    if (event.event === "call_analyzed") await crm.update(event.call_id, event.analysis.variables)
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

`event` is a discriminated union, so `switch (event.event)` narrows the payload type. A failed delivery is retried once, so make your handler idempotent on `(event, call_id)`. Respond within 10 seconds and queue any slow work. `webhooks.verify(body, signature, secret)` returns a boolean if you prefer to handle rejection yourself.

### 5. Export calls and transcripts

`calls.list()` returns one page when you `await` it. Iterate over it with `for await` to walk every page:

```ts
const cutoff = "2026-09-01T00:00:00"
for await (const call of dialgem.calls.list({ page_size: 50 })) {
  if (call.started_at < cutoff) break // newest first: the rest are older
  console.log(call.id, call.duration_s, call.analysis?.call_successful, call.transcript)
}

const page = await dialgem.calls.list({ page_size: 50 })
page.data // Call[]
page.total // number
if (page.hasNextPage()) await page.getNextPage()
```

Pages are offset-based and ordered newest first. A call that starts mid-export shifts later pages by one, so de-duplicate on `id` if exactness matters.

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
| `calls` | `list`, `retrieve`, `createPhoneCall`, `register` |
| `phoneNumbers` | `create`, `list`, `update`, `assign`, `delete` |
| `voices` | `list` |
| `flowTemplates`, `promptTemplates` | `list`, `retrieve` |
| `webhooks` | `verify`, `constructEvent` |

In-browser web calls are not part of this package.

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
DIALGEM_API_KEY=zk_… DIALGEM_BASE_URL=http://localhost:8002 pnpm test:live
```

Request-body types are generated from `openapi/openapi.json`. Response types in `src/types/` are written by hand, so a change to a response shape needs a matching edit there.

To release, bump `version` in `package.json` and `src/version.ts`, add a CHANGELOG entry, merge to `main`, and push a matching tag (`git tag v0.1.0 && git push origin v0.1.0`). A version with a hyphen (`0.2.0-beta.1`) publishes to the `next` dist-tag.

## License

Apache-2.0
