/**
 * Receive Dialgem webhooks in Express and update your CRM.
 *
 * The signature covers the raw bytes, so this route uses `express.raw()`.
 * `express.json()` would re-serialize the body and every signature would fail.
 */
import { Dialgem, WEBHOOK_SIGNATURE_HEADER, WebhookVerificationError } from "@dialgem/sdk"
import express from "express"

const secret = process.env["DIALGEM_WEBHOOK_SECRET"]!
const app = express()

app.post("/webhooks/dialgem", express.raw({ type: "application/json" }), async (req, res) => {
  let event
  try {
    event = await Dialgem.webhooks.constructEvent(req.body as Buffer, req.header(WEBHOOK_SIGNATURE_HEADER), secret)
  } catch (err) {
    if (err instanceof WebhookVerificationError) return res.status(400).send(err.message)
    throw err
  }

  // A failed delivery is retried once, so handle each (event, call_id) idempotently.
  switch (event.event) {
    case "call_started":
      console.log(`call ${event.call_id} started`)
      break
    case "call_analyzed":
      console.log(`call ${event.call_id}: sentiment ${event.analysis.user_sentiment}`, event.analysis.variables)
      break
    case "call_ended":
      console.log(`call ${event.call_id} ${event.status} after ${event.duration_s}s`)
      break
  }

  // Answer fast (Dialgem waits up to 10s); do slow work in a queue.
  res.sendStatus(204)
})

app.listen(3000)
