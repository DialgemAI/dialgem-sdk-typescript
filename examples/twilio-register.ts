/**
 * Bring your own Twilio number: point the number's Voice webhook at this route.
 * Your backend registers the call with Dialgem and answers Twilio with TwiML that
 * streams the audio to Dialgem. No Twilio credentials are shared with Dialgem.
 */
import { Dialgem } from "@dialgem/sdk"
import express from "express"

const dialgem = new Dialgem()
const app = express()

app.post("/twilio/voice", express.urlencoded({ extended: false }), async (req, res) => {
  // In production, validate Twilio's X-Twilio-Signature first (twilio.validateRequest).
  const { CallSid, From, To } = req.body as Record<string, string | undefined>

  try {
    const { stream_url } = await dialgem.calls.register({
      agent_id: process.env["DIALGEM_AGENT_ID"]!,
      call_sid: CallSid ?? null,
      from_number: From ?? null,
      to_number: To ?? null,
      direction: "inbound",
      dialgem_llm_dynamic_variables: { caller_number: From ?? "" },
    })

    // stream_url carries a signed query string with `&`, which must be escaped in XML.
    res.type("text/xml").send(
      `<Response><Connect><Stream url="${escapeXml(stream_url)}"/></Connect></Response>`,
    )
  } catch (err) {
    console.error("Dialgem register failed", err)
    res.type("text/xml").send("<Response><Say>Sorry, we cannot take your call right now.</Say><Hangup/></Response>")
  }
})

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

app.listen(3000)
