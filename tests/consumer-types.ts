/**
 * Not a test file vitest runs: `pnpm typecheck` compiles it with this package's
 * tsconfig, which has `exactOptionalPropertyTypes` on. It pins that ordinary
 * customer code — values that may be undefined — compiles against the public
 * types. A failure here is a type error, not a red test.
 */
import { Dialgem, type RequestOptions } from "@dialgem/sdk"

declare const maybe: string | undefined
declare const maybeSignal: AbortSignal | undefined

export async function customerCode(): Promise<void> {
  const dialgem = new Dialgem({ apiKey: process.env["DIALGEM_API_KEY"], baseURL: process.env["DIALGEM_BASE_URL"] })
  const options: RequestOptions = { signal: maybeSignal, timeout: undefined }

  await dialgem.calls.createPhoneCall({ from_: "+1", to: "+2", agent_id: maybe }, options)
  await dialgem.calls.register({ agent_id: "a", call_sid: maybe, from_number: maybe })
  await dialgem.agents.create({ name: "x", first_message: maybe, voice_id: maybe })
  await dialgem.agents.update("a", { name: maybe })
  await dialgem.calls.list({ status: maybe, page_size: undefined })
  await dialgem.voices.list({ search: maybe })

  // Required fields stay required.
  // @ts-expect-error — `name` cannot be undefined on create
  await dialgem.agents.create({ name: maybe })
  // @ts-expect-error — `to` is required
  await dialgem.calls.createPhoneCall({ from_: "+1" })
}
