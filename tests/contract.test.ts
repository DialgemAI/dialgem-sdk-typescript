/**
 * Drift guard against the API's OpenAPI snapshot
 * (openapi/openapi.json). Unit tests with a fake fetch can only
 * prove the SDK sends what the SDK expects; these prove the backend still has
 * those routes. A renamed route fails SDK CI instead of shipping a 404ing method.
 */
import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { describe, expect, it } from "vitest"

import { BASE_URL, client, mockFetch } from "./helpers.js"
import { SDK_CALLS } from "./sdk-calls.js"

interface OpenAPIDoc {
  paths: Record<string, Record<string, unknown>>
  components: { schemas: Record<string, unknown> }
}

const snapshotPath = fileURLToPath(new URL("../openapi/openapi.json", import.meta.url))
const doc = JSON.parse(readFileSync(snapshotPath, "utf8")) as OpenAPIDoc

/** Find the OpenAPI path template (`/v1/agents/{agent_id}`) that matches a concrete path. */
function matchTemplate(concretePath: string): string | undefined {
  return Object.keys(doc.paths).find((template) => {
    const pattern = new RegExp(`^${template.replace(/\{[^}]+\}/g, "[^/]+")}$`)
    return pattern.test(concretePath)
  })
}

describe("OpenAPI contract", () => {
  it.each(SDK_CALLS)("$name: $method route exists", async (call) => {
    const { fetch, calls } = mockFetch((req) =>
      req.url.includes("/v1/calls?") ? { body: { calls: [], total: 0, page: 1, page_size: 10 } } : { body: {} },
    )
    await call.invoke(client(fetch))
    const concrete = new URL(calls[0]!.url).pathname
    expect(new URL(calls[0]!.url).origin).toBe(BASE_URL)

    const template = matchTemplate(concrete)
    expect(template, `no route in the OpenAPI snapshot matches ${concrete}`).toBeDefined()
    // Literal routes win over templated ones on the server (`/functions/reorder` vs
    // `/functions/{function_id}`), so prefer an exact literal match when present.
    const exact = doc.paths[concrete] ? concrete : template!
    expect(Object.keys(doc.paths[exact]!), `${call.method} ${exact}`).toContain(call.method.toLowerCase())
  })

  it.each([
    "AgentCreate",
    "AgentUpdate",
    "FunctionCreate",
    "FunctionUpdate",
    "FunctionReorder",
    "DocumentCreate",
    "MCPServerCreate",
    "MCPServerUpdate",
    "PhoneNumberCreate",
    "PhoneNumberUpdate",
    "PhoneNumberAssign",
    "OutboundCallRequest",
    "RegisterCallRequest",
    "FlowConfig",
    "PromptState",
    "PostCallAnalysisVariable",
    "KVPair",
    "AgentWeightIn",
    "PromptTemplateSummary",
    "PromptTemplateDetail",
  ])("schema %s still exists", (name) => {
    expect(doc.components.schemas).toHaveProperty(name)
  })
})
