/**
 * Provision an agent and put it on a phone number, e.g. from your admin tooling
 * when a customer signs up.
 *
 *   DIALGEM_API_KEY=zk_… npx tsx examples/provision-agent.ts +14155550100
 */
import { ConflictError, Dialgem } from "@dialgem/sdk"

const dialgem = new Dialgem()

async function main(phoneNumber: string) {
  const agent = await dialgem.agents.create({
    name: "Front desk",
    system_prompt:
      "You are the front desk for {{business_name}}. Answer questions about opening hours and book appointments.",
    first_message: "Thanks for calling {{business_name}}, how can I help?",
    default_dynamic_variables: { business_name: "Acme Dental" },
    webhook_url: "https://example.com/webhooks/dialgem",
    webhook_events: ["call_ended", "call_analyzed"],
    // Store this in your secrets manager; verify deliveries with it (see webhook-express.ts).
    webhook_signing_secret: process.env["DIALGEM_WEBHOOK_SECRET"] ?? null,
    post_call_analysis_data: [
      { name: "appointment_booked", type: "boolean", description: "Whether an appointment was booked." },
    ],
  })

  // A tool the agent can call mid-conversation.
  await dialgem.agents.functions.create(agent.id, {
    name: "lookup_patient",
    description: "Find a patient record by phone number.",
    url: "https://example.com/api/patients/lookup",
    method: "POST",
    parameters: {
      type: "object",
      properties: { phone: { type: "string" } },
      required: ["phone"],
    },
  })

  let number
  try {
    number = await dialgem.phoneNumbers.create({ phone_number: phoneNumber, nickname: "Main line" })
  } catch (err) {
    if (!(err instanceof ConflictError)) throw err
    // Already registered on this org: find it instead.
    number = (await dialgem.phoneNumbers.list()).find((n) => n.phone_number === phoneNumber)
    if (!number) throw err
  }

  // `inbound_agent_id` only takes effect together with `set_inbound_agent: true`.
  await dialgem.phoneNumbers.update(number.id, {
    inbound_agent_id: agent.id,
    set_inbound_agent: true,
    outbound_agent_id: agent.id,
    set_outbound_agent: true,
  })

  console.log(`Agent ${agent.id} now answers ${number.phone_number_pretty}`)
}

await main(process.argv[2] ?? "+14155550100")
