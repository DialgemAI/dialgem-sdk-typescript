import type { Dialgem } from "@dialgem/sdk"

/**
 * One entry per public resource method: how to invoke it, and the HTTP request it
 * must produce. Shared by resources.test.ts (URL/body/method) and
 * contract.test.ts (the route exists in the API's OpenAPI snapshot),
 * so a method added here is automatically checked against the backend.
 */
export interface SdkCall {
  name: string
  invoke: (c: Dialgem) => PromiseLike<unknown>
  method: "GET" | "POST" | "PATCH" | "DELETE"
  path: string
  body?: unknown
}

export const SDK_CALLS: SdkCall[] = [
  { name: "agents.create", invoke: (c) => c.agents.create({ name: "A" }), method: "POST", path: "/v1/agents", body: { name: "A" } },
  { name: "agents.retrieve", invoke: (c) => c.agents.retrieve("ag_1"), method: "GET", path: "/v1/agents/ag_1" },
  { name: "agents.list", invoke: (c) => c.agents.list(), method: "GET", path: "/v1/agents" },
  { name: "agents.update", invoke: (c) => c.agents.update("ag_1", { name: "B" }), method: "PATCH", path: "/v1/agents/ag_1", body: { name: "B" } },
  { name: "agents.delete", invoke: (c) => c.agents.delete("ag_1"), method: "DELETE", path: "/v1/agents/ag_1" },

  { name: "agents.functions.list", invoke: (c) => c.agents.functions.list("ag_1"), method: "GET", path: "/v1/agents/ag_1/functions" },
  { name: "agents.functions.create", invoke: (c) => c.agents.functions.create("ag_1", { name: "lookup" }), method: "POST", path: "/v1/agents/ag_1/functions", body: { name: "lookup" } },
  { name: "agents.functions.update", invoke: (c) => c.agents.functions.update("ag_1", "fn_1", { url: "https://x" }), method: "PATCH", path: "/v1/agents/ag_1/functions/fn_1", body: { url: "https://x" } },
  { name: "agents.functions.delete", invoke: (c) => c.agents.functions.delete("ag_1", "fn_1"), method: "DELETE", path: "/v1/agents/ag_1/functions/fn_1" },
  { name: "agents.functions.reorder", invoke: (c) => c.agents.functions.reorder("ag_1", { order: ["fn_2", "fn_1"] }), method: "POST", path: "/v1/agents/ag_1/functions/reorder", body: { order: ["fn_2", "fn_1"] } },

  { name: "agents.knowledge.list", invoke: (c) => c.agents.knowledge.list("ag_1"), method: "GET", path: "/v1/agents/ag_1/knowledge" },
  { name: "agents.knowledge.create", invoke: (c) => c.agents.knowledge.create("ag_1", { filename: "faq.txt", content: "hi" }), method: "POST", path: "/v1/agents/ag_1/knowledge", body: { filename: "faq.txt", content: "hi" } },
  { name: "agents.knowledge.delete", invoke: (c) => c.agents.knowledge.delete("ag_1", "src_1"), method: "DELETE", path: "/v1/agents/ag_1/knowledge/src_1" },

  { name: "agents.mcpServers.list", invoke: (c) => c.agents.mcpServers.list("ag_1"), method: "GET", path: "/v1/agents/ag_1/mcp-servers" },
  { name: "agents.mcpServers.create", invoke: (c) => c.agents.mcpServers.create("ag_1", { name: "crm", url: "https://mcp" }), method: "POST", path: "/v1/agents/ag_1/mcp-servers", body: { name: "crm", url: "https://mcp" } },
  { name: "agents.mcpServers.update", invoke: (c) => c.agents.mcpServers.update("ag_1", "srv_1", { enabled: false }), method: "PATCH", path: "/v1/agents/ag_1/mcp-servers/srv_1", body: { enabled: false } },
  { name: "agents.mcpServers.delete", invoke: (c) => c.agents.mcpServers.delete("ag_1", "srv_1"), method: "DELETE", path: "/v1/agents/ag_1/mcp-servers/srv_1" },
  { name: "agents.mcpServers.test", invoke: (c) => c.agents.mcpServers.test("ag_1", "srv_1"), method: "POST", path: "/v1/agents/ag_1/mcp-servers/srv_1/test" },

  { name: "calls.list", invoke: (c) => c.calls.list(), method: "GET", path: "/v1/calls?page=1" },
  { name: "calls.retrieve", invoke: (c) => c.calls.retrieve("call_1"), method: "GET", path: "/v1/calls/call_1" },
  {
    name: "calls.createPhoneCall",
    invoke: (c) => c.calls.createPhoneCall({ from_: "+14155550100", to: "+14155550199", agent_id: "ag_1" }),
    method: "POST",
    path: "/v1/calls/outbound",
    body: { from_: "+14155550100", to: "+14155550199", agent_id: "ag_1" },
  },
  { name: "calls.register", invoke: (c) => c.calls.register({ agent_id: "ag_1", call_sid: "CA1" }), method: "POST", path: "/v1/calls/register", body: { agent_id: "ag_1", call_sid: "CA1" } },

  { name: "phoneNumbers.create", invoke: (c) => c.phoneNumbers.create({ phone_number: "+14155550100" }), method: "POST", path: "/v1/phone-numbers", body: { phone_number: "+14155550100" } },
  { name: "phoneNumbers.list", invoke: (c) => c.phoneNumbers.list(), method: "GET", path: "/v1/phone-numbers" },
  { name: "phoneNumbers.update", invoke: (c) => c.phoneNumbers.update("pn_1", { nickname: "Main" }), method: "PATCH", path: "/v1/phone-numbers/pn_1", body: { nickname: "Main" } },
  { name: "phoneNumbers.assign", invoke: (c) => c.phoneNumbers.assign("pn_1", { agent_id: "ag_1" }), method: "PATCH", path: "/v1/phone-numbers/pn_1/assign", body: { agent_id: "ag_1" } },
  { name: "phoneNumbers.delete", invoke: (c) => c.phoneNumbers.delete("pn_1"), method: "DELETE", path: "/v1/phone-numbers/pn_1" },

  { name: "voices.list", invoke: (c) => c.voices.list({ language: "en" }), method: "GET", path: "/v1/voices?language=en" },
  { name: "flowTemplates.list", invoke: (c) => c.flowTemplates.list(), method: "GET", path: "/v1/flow-templates" },
  { name: "flowTemplates.retrieve", invoke: (c) => c.flowTemplates.retrieve("tpl_1"), method: "GET", path: "/v1/flow-templates/tpl_1" },
  { name: "promptTemplates.list", invoke: (c) => c.promptTemplates.list({ category: "sales" }), method: "GET", path: "/v1/prompt-templates?category=sales" },
  { name: "promptTemplates.retrieve", invoke: (c) => c.promptTemplates.retrieve("tpl_1"), method: "GET", path: "/v1/prompt-templates/tpl_1" },
]

/** Every public resource method name found on a client, by walking its resources. */
export function publicMethodNames(c: Dialgem): string[] {
  const names: string[] = []
  const walk = (obj: object, prefix: string) => {
    for (const key of Object.getOwnPropertyNames(Object.getPrototypeOf(obj))) {
      if (key === "constructor" || key.startsWith("_")) continue
      const value = (obj as Record<string, unknown>)[key]
      if (typeof value === "function") names.push(`${prefix}.${key}`)
    }
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith("_") || typeof value !== "object" || value === null) continue
      walk(value, `${prefix}.${key}`)
    }
  }
  for (const resource of ["agents", "calls", "phoneNumbers", "voices", "flowTemplates", "promptTemplates"] as const) {
    walk(c[resource], resource)
  }
  return names.sort()
}
