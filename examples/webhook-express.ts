/**
 * Receive Dialgem webhooks in Express and update your CRM.
 *
 * The signature covers the raw bytes, so this route uses `express.raw()`.
 * `express.json()` would re-serialize the body and every signature would fail.
 */
import { Dialgem, WEBHOOK_DELIVERY_HEADER, WEBHOOK_SIGNATURE_HEADER, WebhookVerificationError } from "@dialgem/sdk"
import express from "express"

const secret = process.env["DIALGEM_WEBHOOK_SECRET"]!
const app = express()
const seenDeliveries = new Set<string>() // use your database in production

app.post("/webhooks/dialgem", express.raw({ type: "application/json" }), async (req, res) => {
  let event
  try {
    event = await Dialgem.webhooks.constructEvent(req.body as Buffer, req.header(WEBHOOK_SIGNATURE_HEADER), secret)
  } catch (err) {
    if (err instanceof WebhookVerificationError) return res.status(400).send(err.message)
    throw err
  }

  // A failed delivery is retried; every attempt carries the same delivery id.
  const deliveryId = req.header(WEBHOOK_DELIVERY_HEADER)
  if (deliveryId && seenDeliveries.has(deliveryId)) return res.sendStatus(204)
  if (deliveryId) seenDeliveries.add(deliveryId)

  const { call } = event
  switch (event.event) {
    case "call_started":
      console.log(`call ${call.id} started for customer ${String(call.metadata["crm_id"])}`)
      break
    case "call_ended":
      console.log(`call ${call.id} ended (${call.disconnection_reason}) after ${call.duration_ms} ms`)
      break
    case "call_analyzed":
      console.log(`call ${call.id}: ${call.analysis?.call_summary}`, call.analysis?.variables)
      break
  }

  // Answer fast (Dialgem waits up to 10s); do slow work in a queue.
  res.sendStatus(204)
})

app.listen(3000)
