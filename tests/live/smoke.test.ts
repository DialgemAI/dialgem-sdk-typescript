/**
 * Live smoke test against the Dialgem API. This is the check a fake fetch
 * cannot make: that the header, paths and response shapes the SDK assumes are
 * what the running service actually does.
 *
 *   DIALGEM_API_KEY=zk_… pnpm test:live
 *
 * **Runs against production** (https://api.dialgem.com — the SDK has no other
 * target). Use an org API key (`zk_…`) for a test organization, never a
 * customer's: this creates and deletes one agent in that org. Excluded from
 * `pnpm test`, and skipped when the key is unset.
 */
import { AuthenticationError, Dialgem, NotFoundError, type Agent } from "@dialgem/sdk"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

const apiKey = process.env["DIALGEM_API_KEY"]

describe.skipIf(!apiKey)("live: Dialgem API", () => {
  // Built in beforeAll, not here: a skipped describe's body still runs during
  // collection, and the constructor throws without a key.
  let dialgem: Dialgem
  let agent: Agent | undefined

  beforeAll(() => {
    dialgem = new Dialgem({ apiKey: apiKey! })
  })

  afterAll(async () => {
    if (agent) await dialgem.agents.delete(agent.id).catch(() => undefined)
  })

  it("creates, reads, updates, lists and deletes an agent", async () => {
    agent = await dialgem.agents.create({
      name: `sdk-live-${Date.now()}`,
      system_prompt: "You are a test agent.",
      webhook_url: "https://example.invalid/hook",
      webhook_signing_secret: "whsec_live_test",
    })
    expect(agent.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(agent.agent_id).toBe(agent.id)
    expect(agent.webhook_signing_secret).toBe("whsec_live_test")
    expect(agent.webhook_events).toEqual(["call_ended"])

    const fetched = await dialgem.agents.retrieve(agent.id)
    expect(fetched.name).toBe(agent.name)

    const updated = await dialgem.agents.update(agent.id, { temperature: 0.2 })
    expect(updated.temperature).toBe(0.2)
    expect(updated.name).toBe(agent.name)

    const listed = (await dialgem.agents.list()).find((a) => a.id === agent!.id)
    expect(listed).toBeDefined()
    expect(listed!.webhook_signing_secret).toBeNull()
    expect(listed!.has_webhook_signing_secret).toBe(true)

    const fns = await dialgem.agents.functions.list(agent.id)
    expect(Array.isArray(fns)).toBe(true)

    await expect(dialgem.agents.delete(agent.id)).resolves.toEqual({ deleted: true, id: agent.id })
    agent = undefined
  })

  it("maps a missing agent to NotFoundError with a request id", async () => {
    const err = await dialgem.agents.retrieve("00000000-0000-0000-0000-000000000000").catch((e: unknown) => e)
    expect(err).toBeInstanceOf(NotFoundError)
    expect((err as NotFoundError).requestId).toBeTruthy()
  })

  it("lists phone numbers, voices and templates", async () => {
    expect(Array.isArray(await dialgem.phoneNumbers.list())).toBe(true)
    expect(Array.isArray(await dialgem.voices.list())).toBe(true)
    expect(Array.isArray(await dialgem.flowTemplates.list())).toBe(true)
    expect(Array.isArray(await dialgem.promptTemplates.list())).toBe(true)
  })

  it("paginates calls with a cursor, without repeats", async () => {
    const page = await dialgem.calls.list({ limit: 2 })
    expect(page.data.length).toBeLessThanOrEqual(2)
    expect(typeof page.has_more).toBe("boolean")
    const ids = new Set<string>()
    for await (const call of dialgem.calls.list({ limit: 50 })) {
      expect(ids.has(call.id)).toBe(false)
      ids.add(call.id)
      expect(typeof call.start_timestamp === "number" || call.start_timestamp === null).toBe(true)
      if (ids.size >= 120) break
    }
  })

  it("rejects a bad key with AuthenticationError", async () => {
    const bad = new Dialgem({ apiKey: "zk_not_a_real_key_000000000000000000000000000" })
    const err = await bad.agents.list().catch((e: unknown) => e)
    expect(err).toBeInstanceOf(AuthenticationError)
    expect((err as AuthenticationError).requestId).toBeTruthy()
  })
})
