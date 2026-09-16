#!/usr/bin/env node
/**
 * Refresh `openapi/openapi.json` from the Dialgem API's OpenAPI document.
 *
 *   pnpm sync:openapi                                  # http://localhost:8002/openapi.json
 *   pnpm sync:openapi --from https://api.dialgem.com/openapi.json
 *   pnpm sync:openapi --from ../path/to/openapi.json
 *   pnpm gen:types                                     # then regenerate src/generated
 *
 * The source document covers every route the service has, including internal and
 * dashboard-only ones. This repo is public and the SDK only wraps customer routes,
 * so the snapshot is filtered to:
 *   - the (method, path) pairs in PUBLIC_OPERATIONS below;
 *   - the component schemas those operations reach through `$ref`;
 *   - no `description` fields (they carry service-internal notes; titles and types stay).
 *
 * A route the service renamed or removed simply disappears from the output, and
 * tests/contract.test.ts then fails for the SDK method that calls it.
 */
import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, "..", "openapi", "openapi.json")

/** Customer-facing operations. Keep in step with tests/sdk-calls.ts. */
const PUBLIC_OPERATIONS = {
  "/v1/agents": ["get", "post"],
  "/v1/agents/{agent_id}": ["get", "patch", "delete"],
  "/v1/agents/{agent_id}/functions": ["get", "post"],
  "/v1/agents/{agent_id}/functions/reorder": ["post"],
  "/v1/agents/{agent_id}/functions/{function_id}": ["patch", "delete"],
  "/v1/agents/{agent_id}/knowledge": ["get", "post"],
  "/v1/agents/{agent_id}/knowledge/{source_id}": ["delete"],
  "/v1/agents/{agent_id}/mcp-servers": ["get", "post"],
  "/v1/agents/{agent_id}/mcp-servers/{server_id}": ["patch", "delete"],
  "/v1/agents/{agent_id}/mcp-servers/{server_id}/test": ["post"],
  "/v1/calls": ["get"],
  "/v1/calls/{call_id}": ["get"],
  "/v1/calls/outbound": ["post"],
  "/v1/calls/register": ["post"],
  "/v1/phone-numbers": ["get", "post"],
  "/v1/phone-numbers/{number_id}": ["patch", "delete"],
  "/v1/phone-numbers/{number_id}/assign": ["patch"],
  "/v1/voices": ["get"],
  "/v1/flow-templates": ["get"],
  "/v1/flow-templates/{template_id}": ["get"],
  "/v1/prompt-templates": ["get"],
  "/v1/prompt-templates/{template_id}": ["get"],
}

function arg(name) {
  const i = process.argv.indexOf(name)
  return i === -1 ? undefined : process.argv[i + 1]
}

async function load(from) {
  if (/^https?:\/\//.test(from)) {
    const res = await fetch(from, { signal: AbortSignal.timeout(15_000) })
    if (!res.ok) throw new Error(`${from}: ${res.status} ${res.statusText}`)
    return res.json()
  }
  return JSON.parse(readFileSync(resolve(from), "utf8"))
}

function stripDescriptions(node) {
  if (Array.isArray(node)) return node.map(stripDescriptions)
  if (node === null || typeof node !== "object") return node
  const out = {}
  for (const [key, value] of Object.entries(node)) {
    // Only the string annotation. A PROPERTY named `description` (FunctionCreate has
    // one) is an object schema under `properties` and must survive.
    if (key === "description" && typeof value === "string") continue
    out[key] = stripDescriptions(value)
  }
  return out
}

function collectRefs(node, into) {
  if (Array.isArray(node)) return node.forEach((n) => collectRefs(n, into))
  if (node === null || typeof node !== "object") return
  for (const [key, value] of Object.entries(node)) {
    if (key === "$ref" && typeof value === "string") into.add(value.replace("#/components/schemas/", ""))
    else collectRefs(value, into)
  }
}

const from = arg("--from") ?? "http://localhost:8002/openapi.json"
const doc = await load(from)

const paths = {}
const missing = []
for (const [path, methods] of Object.entries(PUBLIC_OPERATIONS)) {
  for (const method of methods) {
    const op = doc.paths?.[path]?.[method]
    if (!op) {
      missing.push(`${method.toUpperCase()} ${path}`)
      continue
    }
    paths[path] ??= {}
    paths[path][method] = op
  }
}

// Transitive closure over $ref, starting from the kept operations.
const schemas = doc.components?.schemas ?? {}
const keep = new Set()
const queue = new Set()
collectRefs(paths, queue)
while (queue.size) {
  const [name] = queue
  queue.delete(name)
  if (keep.has(name) || !schemas[name]) continue
  keep.add(name)
  collectRefs(schemas[name], queue)
}

const filtered = stripDescriptions({
  openapi: doc.openapi,
  info: { title: "Dialgem API", version: doc.info?.version ?? "0" },
  paths,
  components: { schemas: Object.fromEntries([...keep].sort().map((name) => [name, schemas[name]])) },
})

writeFileSync(OUT, `${JSON.stringify(filtered, null, 2)}\n`, "utf8")
console.log(`✓ ${OUT}: ${Object.keys(paths).length} paths, ${keep.size} schemas (from ${from})`)
if (missing.length) {
  console.warn(`! not in the source document (the SDK methods calling these will fail the contract test):\n  ${missing.join("\n  ")}`)
}
