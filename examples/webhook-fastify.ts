/**
 * Receive Dialgem webhooks in Fastify. JSON bodies are parsed as a Buffer so the
 * signature can be checked against the exact bytes.
 */
import { Dialgem, WEBHOOK_SIGNATURE_HEADER, WebhookVerificationError } from "@dialgem/sdk"
import Fastify from "fastify"

const secret = process.env["DIALGEM_WEBHOOK_SECRET"]!
const app = Fastify()

// Scope the raw parser to this plugin so the rest of your app keeps parsed JSON.
await app.register(async (hooks) => {
  hooks.addContentTypeParser("application/json", { parseAs: "buffer" }, (_req, body, done) => done(null, body))

  hooks.post("/webhooks/dialgem", async (req, reply) => {
    try {
      const event = await Dialgem.webhooks.constructEvent(
        req.body as Buffer,
        req.headers[WEBHOOK_SIGNATURE_HEADER],
        secret,
      )
      req.log.info({ event: event.event, call_id: event.call_id }, "dialgem webhook")
      return reply.code(204).send()
    } catch (err) {
      if (err instanceof WebhookVerificationError) return reply.code(400).send(err.message)
      throw err
    }
  })
})

await app.listen({ port: 3000 })
