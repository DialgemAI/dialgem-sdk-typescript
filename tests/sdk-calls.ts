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
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  path: string
  body?: unknown
  /** Set for a multipart upload, whose body is not a comparable JSON value. */
  skipBody?: boolean
  /** A second case for a method already listed: exercised, but not counted as another method. */
  extra?: boolean
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
  { name: "agents.mcpServers.listTools", invoke: (c) => c.agents.mcpServers.listTools("ag_1", "srv_1"), method: "GET", path: "/v1/agents/ag_1/mcp-servers/srv_1/tools" },
  { name: "agents.mcpServers.test", invoke: (c) => c.agents.mcpServers.test("ag_1", "srv_1"), method: "POST", path: "/v1/agents/ag_1/mcp-servers/srv_1/test" },

  { name: "agents.versions.publish", invoke: (c) => c.agents.versions.publish("ag_1", { title: "v1" }), method: "POST", path: "/v1/agents/ag_1/versions", body: { title: "v1" } },
  { name: "agents.versions.list", invoke: (c) => c.agents.versions.list("ag_1"), method: "GET", path: "/v1/agents/ag_1/versions" },
  { name: "agents.versions.listPage", invoke: (c) => c.agents.versions.listPage("ag_1", { limit: 2, before_version: 5 }), method: "GET", path: "/v1/agents/ag_1/versions?limit=2&before_version=5" },
  { name: "agents.versions.retrieve", invoke: (c) => c.agents.versions.retrieve("ag_1", 2), method: "GET", path: "/v1/agents/ag_1/versions/2" },

  { name: "calls.list", invoke: (c) => c.calls.list(), method: "GET", path: "/v1/calls?limit=10" },
  { name: "calls.retrieve", invoke: (c) => c.calls.retrieve("call_1"), method: "GET", path: "/v1/calls/call_1" },
  { name: "calls.update", invoke: (c) => c.calls.update("call_1", { metadata: { crm_id: "42" } }), method: "PATCH", path: "/v1/calls/call_1", body: { metadata: { crm_id: "42" } } },
  { name: "calls.delete", invoke: (c) => c.calls.delete("call_1"), method: "DELETE", path: "/v1/calls/call_1" },
  { name: "calls.rerunAnalysis", invoke: (c) => c.calls.rerunAnalysis("call_1"), method: "POST", path: "/v1/calls/call_1/rerun-analysis" },
  { name: "apiKey.retrieve", invoke: (c) => c.apiKey.retrieve(), method: "GET", path: "/v1/api-key-info" },
  { name: "llms.create", invoke: (c) => c.llms.create({ name: "L", llm_model: "gpt-4o-mini" }), method: "POST", path: "/v1/llms", body: { name: "L", llm_model: "gpt-4o-mini" } },
  { name: "llms.list", invoke: (c) => c.llms.list(), method: "GET", path: "/v1/llms" },
  { name: "llms.retrieve", invoke: (c) => c.llms.retrieve("l_1"), method: "GET", path: "/v1/llms/l_1" },
  { name: "llms.update", invoke: (c) => c.llms.update("l_1", { temperature: 0.3 }), method: "PATCH", path: "/v1/llms/l_1", body: { temperature: 0.3 } },
  { name: "llms.delete", invoke: (c) => c.llms.delete("l_1"), method: "DELETE", path: "/v1/llms/l_1" },
  { name: "flows.create", invoke: (c) => c.flows.create({ name: "F", flow_config: { start_node_id: "a", nodes: [] } as never }), method: "POST", path: "/v1/flows", body: { name: "F", flow_config: { start_node_id: "a", nodes: [] } } },
  { name: "flows.list", invoke: (c) => c.flows.list(), method: "GET", path: "/v1/flows" },
  { name: "flows.retrieve", invoke: (c) => c.flows.retrieve("fl_1"), method: "GET", path: "/v1/flows/fl_1" },
  { name: "flows.update", invoke: (c) => c.flows.update("fl_1", { name: "G" }), method: "PATCH", path: "/v1/flows/fl_1", body: { name: "G" } },
  { name: "flows.delete", invoke: (c) => c.flows.delete("fl_1"), method: "DELETE", path: "/v1/flows/fl_1" },
  { name: "chats.create", invoke: (c) => c.chats.create({ agent_id: "ag_1", metadata: { k: 1 } }), method: "POST", path: "/v1/chats", body: { agent_id: "ag_1", metadata: { k: 1 } } },
  { name: "chats.list", invoke: (c) => c.chats.list(), method: "GET", path: "/v1/chats" },
  { name: "chats.retrieve", invoke: (c) => c.chats.retrieve("ch_1"), method: "GET", path: "/v1/chats/ch_1" },
  { name: "chats.update", invoke: (c) => c.chats.update("ch_1", { metadata: { a: 1 } }), method: "PATCH", path: "/v1/chats/ch_1", body: { metadata: { a: 1 } } },
  { name: "chats.delete", invoke: (c) => c.chats.delete("ch_1"), method: "DELETE", path: "/v1/chats/ch_1" },
  { name: "chats.sendMessage", invoke: (c) => c.chats.sendMessage("ch_1", "hello"), method: "POST", path: "/v1/chats/ch_1/messages", body: { content: "hello" } },
  { name: "chats.end", invoke: (c) => c.chats.end("ch_1"), method: "POST", path: "/v1/chats/ch_1/end" },
  { name: "chats.rerunAnalysis", invoke: (c) => c.chats.rerunAnalysis("ch_1"), method: "POST", path: "/v1/chats/ch_1/rerun-analysis" },
  { name: "calls.stop", invoke: (c) => c.calls.stop("call_1"), method: "POST", path: "/v1/calls/call_1/stop" },
  {
    name: "calls.createPhoneCall",
    invoke: (c) => c.calls.createPhoneCall({ from_: "+14155550100", to: "+14155550199", agent_id: "ag_1" }),
    method: "POST",
    path: "/v1/calls/outbound",
    body: { from_: "+14155550100", to: "+14155550199", agent_id: "ag_1" },
  },
  { name: "sessions.update", invoke: (c) => c.sessions.update("s_1", { dynamic_variables: { a: "b" } }), method: "PATCH", path: "/v1/agent/sessions/s_1", body: { dynamic_variables: { a: "b" } } },
  { name: "sessions.say", invoke: (c) => c.sessions.say("s_1", { text: "Hold on.", interrupt: true }), method: "POST", path: "/v1/agent/sessions/s_1/say", body: { text: "Hold on.", interrupt: true } },
  { name: "sessions.release", invoke: (c) => c.sessions.release("s_1"), method: "POST", path: "/v1/agent/sessions/s_1/release" },
  { name: "sessions.list", invoke: (c) => c.sessions.list(), method: "GET", path: "/v1/agent/sessions" },

  { name: "calls.register", invoke: (c) => c.calls.register({ agent_id: "ag_1", call_sid: "CA1" }), method: "POST", path: "/v1/calls/register", body: { agent_id: "ag_1", call_sid: "CA1" } },

  { name: "phoneNumbers.create", invoke: (c) => c.phoneNumbers.create({ phone_number: "+14155550100" }), method: "POST", path: "/v1/phone-numbers", body: { phone_number: "+14155550100" } },
  { name: "phoneNumbers.list", invoke: (c) => c.phoneNumbers.list(), method: "GET", path: "/v1/phone-numbers" },
  { name: "phoneNumbers.retrieve", invoke: (c) => c.phoneNumbers.retrieve("+14155550100"), method: "GET", path: "/v1/phone-numbers/by-number/%2B14155550100" },
  { name: "phoneNumbers.update", invoke: (c) => c.phoneNumbers.update("pn_1", { nickname: "Main" }), method: "PATCH", path: "/v1/phone-numbers/pn_1", body: { nickname: "Main" } },
  { name: "phoneNumbers.assign", invoke: (c) => c.phoneNumbers.assign("pn_1", { agent_id: "ag_1" }), method: "PATCH", path: "/v1/phone-numbers/pn_1/assign", body: { agent_id: "ag_1" } },
  { name: "phoneNumbers.testInboundWebhook", invoke: (c) => c.phoneNumbers.testInboundWebhook("pn_1"), method: "POST", path: "/v1/phone-numbers/pn_1/inbound-webhook/test" },
  { name: "phoneNumbers.rotateInboundWebhookSecret", invoke: (c) => c.phoneNumbers.rotateInboundWebhookSecret("pn_1"), method: "POST", path: "/v1/phone-numbers/pn_1/inbound-webhook/rotate-secret" },
  { name: "simulations.createSuite", invoke: (c) => c.simulations.createSuite({ agent_id: "ag_1", name: "S" }), method: "POST", path: "/v1/simulations/suites", body: { agent_id: "ag_1", name: "S" } },
  { name: "simulations.listSuites", invoke: (c) => c.simulations.listSuites(), method: "GET", path: "/v1/simulations/suites" },
  { name: "simulations.listSuites", extra: true, invoke: (c) => c.simulations.listSuites({ agent_id: "ag_1" }), method: "GET", path: "/v1/simulations/suites?agent_id=ag_1" },
  { name: "simulations.retrieveSuite", invoke: (c) => c.simulations.retrieveSuite("su_1"), method: "GET", path: "/v1/simulations/suites/su_1" },
  { name: "simulations.updateSuite", invoke: (c) => c.simulations.updateSuite("su_1", { publish_gate: "block" }), method: "PATCH", path: "/v1/simulations/suites/su_1", body: { publish_gate: "block" } },
  { name: "simulations.deleteSuite", invoke: (c) => c.simulations.deleteSuite("su_1"), method: "DELETE", path: "/v1/simulations/suites/su_1" },
  { name: "simulations.createCase", invoke: (c) => c.simulations.createCase("su_1", { name: "c", caller: { mode: "script", turns: ["hi"] }, checks: [{ type: "contains", text: "hello" }] }), method: "POST", path: "/v1/simulations/suites/su_1/cases", body: { name: "c", caller: { mode: "script", turns: ["hi"] }, checks: [{ type: "contains", text: "hello" }] } },
  { name: "simulations.updateCase", invoke: (c) => c.simulations.updateCase("ca_1", { name: "renamed" }), method: "PATCH", path: "/v1/simulations/cases/ca_1", body: { name: "renamed" } },
  { name: "simulations.deleteCase", invoke: (c) => c.simulations.deleteCase("ca_1"), method: "DELETE", path: "/v1/simulations/cases/ca_1" },
  { name: "simulations.run", invoke: (c) => c.simulations.run("su_1"), method: "POST", path: "/v1/simulations/suites/su_1/runs", body: {} },
  { name: "simulations.run", extra: true, invoke: (c) => c.simulations.run("su_1", { agent_version: "latest_published", fresh: true, max_model_turns: 50 }), method: "POST", path: "/v1/simulations/suites/su_1/runs", body: { agent_version: "latest_published", fresh: true, max_model_turns: 50 } },
  { name: "simulations.listRuns", invoke: (c) => c.simulations.listRuns({ suite_id: "su_1" }), method: "GET", path: "/v1/simulations/runs?suite_id=su_1" },
  { name: "simulations.retrieveRun", invoke: (c) => c.simulations.retrieveRun("ru_1"), method: "GET", path: "/v1/simulations/runs/ru_1" },
  { name: "simulations.cancelRun", invoke: (c) => c.simulations.cancelRun("ru_1"), method: "POST", path: "/v1/simulations/runs/ru_1/cancel" },
  { name: "phoneNumbers.delete", invoke: (c) => c.phoneNumbers.delete("pn_1"), method: "DELETE", path: "/v1/phone-numbers/pn_1" },

  { name: "voices.list", invoke: (c) => c.voices.list({ language: "en" }), method: "GET", path: "/v1/voices?language=en" },
  {
    name: "voices.clone",
    invoke: (c) =>
      c.voices.clone({
        name: "Ada",
        files: [new Blob([new Uint8Array([1, 2, 3])], { type: "audio/mpeg" })],
        consent_confirmed: true,
      }),
    method: "POST",
    path: "/v1/voices/clone",
    // A FormData body: asserted part by part in resources.test.ts instead.
    skipBody: true,
  },
  { name: "extractionModels.list", invoke: (c) => c.extractionModels.list(), method: "GET", path: "/v1/models/extraction" },
  { name: "voices.delete", invoke: (c) => c.voices.delete("v_1"), method: "DELETE", path: "/v1/voices/v_1" },
  { name: "flowTemplates.list", invoke: (c) => c.flowTemplates.list(), method: "GET", path: "/v1/flow-templates" },
  { name: "flowTemplates.retrieve", invoke: (c) => c.flowTemplates.retrieve("tpl_1"), method: "GET", path: "/v1/flow-templates/tpl_1" },
  { name: "promptTemplates.list", invoke: (c) => c.promptTemplates.list({ category: "sales" }), method: "GET", path: "/v1/prompt-templates?category=sales" },
  { name: "promptTemplates.retrieve", invoke: (c) => c.promptTemplates.retrieve("tpl_1"), method: "GET", path: "/v1/prompt-templates/tpl_1" },
  { name: "contacts.create", invoke: (c) => c.contacts.create({ phone: "+14155552671" }), method: "POST", path: "/v1/contacts", body: { phone: "+14155552671" } },
  { name: "contacts.list", invoke: (c) => c.contacts.list(), method: "GET", path: "/v1/contacts" },
  { name: "contacts.retrieveByPhone", invoke: (c) => c.contacts.retrieveByPhone("+14155552671"), method: "GET", path: "/v1/contacts/by-phone/%2B14155552671" },
  { name: "contacts.retrieveByPhone", extra: true, invoke: (c) => c.contacts.retrieveByPhone("(212) 220-0001", { default_country: "US" }), method: "GET", path: "/v1/contacts/by-phone/(212)%20220-0001?default_country=US" },
  { name: "contacts.retrieve", invoke: (c) => c.contacts.retrieve("ct_1"), method: "GET", path: "/v1/contacts/ct_1" },
  { name: "contacts.update", invoke: (c) => c.contacts.update("ct_1", { first_name: "Ada" }), method: "PATCH", path: "/v1/contacts/ct_1", body: { first_name: "Ada" } },
  { name: "contacts.delete", invoke: (c) => c.contacts.delete("ct_1"), method: "DELETE", path: "/v1/contacts/ct_1" },
  { name: "contacts.calls", invoke: (c) => c.contacts.calls("ct_1"), method: "GET", path: "/v1/contacts/ct_1/calls" },
  { name: "contacts.imports.inspect", invoke: (c) => c.contacts.imports.inspect("phone\n+1"), method: "POST", path: "/v1/contacts/imports/inspect", body: { csv: "phone\n+1" } },
  { name: "contacts.imports.create", invoke: (c) => c.contacts.imports.create({ csv: "phone\n+1" }), method: "POST", path: "/v1/contacts/imports", body: { csv: "phone\n+1" } },
  { name: "contacts.imports.list", invoke: (c) => c.contacts.imports.list(), method: "GET", path: "/v1/contacts/imports" },
  { name: "contacts.imports.retrieve", invoke: (c) => c.contacts.imports.retrieve("im_1"), method: "GET", path: "/v1/contacts/imports/im_1" },
  { name: "contacts.imports.errors", invoke: (c) => c.contacts.imports.errors("im_1"), method: "GET", path: "/v1/contacts/imports/im_1/errors" },
  { name: "contacts.imports.commit", invoke: (c) => c.contacts.imports.commit("im_1"), method: "POST", path: "/v1/contacts/imports/im_1/commit" },
  { name: "contacts.imports.cancel", invoke: (c) => c.contacts.imports.cancel("im_1"), method: "DELETE", path: "/v1/contacts/imports/im_1" },
  { name: "contactLists.list", invoke: (c) => c.contactLists.list(), method: "GET", path: "/v1/contact-lists" },
  { name: "contactLists.create", invoke: (c) => c.contactLists.create({ name: "VIP" }), method: "POST", path: "/v1/contact-lists", body: { name: "VIP" } },
  { name: "contactLists.retrieve", invoke: (c) => c.contactLists.retrieve("cl_1"), method: "GET", path: "/v1/contact-lists/cl_1" },
  { name: "contactLists.update", invoke: (c) => c.contactLists.update("cl_1", { name: "Hot" }), method: "PATCH", path: "/v1/contact-lists/cl_1", body: { name: "Hot" } },
  { name: "contactLists.delete", invoke: (c) => c.contactLists.delete("cl_1"), method: "DELETE", path: "/v1/contact-lists/cl_1" },
  { name: "contactLists.addContacts", invoke: (c) => c.contactLists.addContacts("cl_1", ["ct_1"]), method: "POST", path: "/v1/contact-lists/cl_1/members", body: { contact_ids: ["ct_1"] } },
  { name: "contactLists.removeContact", invoke: (c) => c.contactLists.removeContact("cl_1", "ct_1"), method: "DELETE", path: "/v1/contact-lists/cl_1/members/ct_1" },
  { name: "webCalls.create", invoke: (c) => c.webCalls.create({ agent_id: "ag_1" }), method: "POST", path: "/v1/calls/web", body: { agent_id: "ag_1" } },
  { name: "webCalls.retrieveSettings", invoke: (c) => c.webCalls.retrieveSettings(), method: "GET", path: "/v1/web-calls/settings" },
  { name: "webCalls.updateSettings", invoke: (c) => c.webCalls.updateSettings({ allowed_origins: ["https://a.io"] }), method: "PUT", path: "/v1/web-calls/settings", body: { allowed_origins: ["https://a.io"] } },
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
  for (const resource of [
    "agents",
    "calls",
    "phoneNumbers",
    "voices",
    "extractionModels",
    "flowTemplates",
    "promptTemplates",
    "sessions",
    "apiKey",
    "chats",
    "flows",
    "llms",
    "contacts",
    "contactLists",
    "simulations",
    "webCalls",
  ] as const) {
    walk(c[resource], resource)
  }
  return names.sort()
}
