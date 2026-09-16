#!/usr/bin/env node
/**
 * Runtime smoke test of the BUILT package (dist/), with no test framework, so it
 * runs on every Node in `engines` — including ones the dev toolchain (vitest)
 * does not. Exercises both the ESM and CJS entry points: a request through a
 * fake fetch, an error mapping, and a webhook signature from the Python vectors.
 *
 * Usage:  pnpm build && pnpm smoke
 */
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const esm = await import("../dist/index.js")
const cjs = require("../dist/index.cjs")
const vectors = JSON.parse(readFileSync(new URL("../tests/fixtures/webhook-vectors.json", import.meta.url), "utf8"))

for (const [label, sdk] of [
  ["esm", esm],
  ["cjs", cjs],
]) {
  const seen = []
  const fetch = async (url, init) => {
    seen.push({ url, init })
    const notFound = url.endsWith("/missing")
    return {
      status: notFound ? 404 : 200,
      statusText: notFound ? "Not Found" : "OK",
      headers: new Headers(),
      text: async () =>
        JSON.stringify(notFound ? { err_code: "HTTP_404", err_msg: "Agent not found", request_id: "r1" } : [{ id: "a1" }]),
    }
  }

  const client = new sdk.Dialgem({ apiKey: "zk_smoke", baseURL: "http://smoke.test", fetch })
  assert.deepEqual(await client.agents.list(), [{ id: "a1" }], `${label}: list`)
  assert.equal(seen[0].init.headers["X-API-Key"], "zk_smoke", `${label}: auth header`)

  await assert.rejects(client.agents.retrieve("missing"), (err) => {
    assert.ok(err instanceof sdk.NotFoundError, `${label}: NotFoundError`)
    assert.equal(err.requestId, "r1")
    return true
  })

  for (const v of vectors.vectors) {
    assert.equal(await sdk.webhooks.verify(v.body, v.sig, vectors.secret), true, `${label}: webhook verify`)
  }
  assert.equal(sdk.VERSION, JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version)
  console.log(`✓ ${label} on node ${process.version}`)
}
