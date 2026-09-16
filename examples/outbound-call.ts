/**
 * Place an outbound call from a business event, e.g. an appointment reminder job.
 */
import { APIError, Dialgem } from "@dialgem/sdk"

const dialgem = new Dialgem()

export async function remindAppointment(appointment: {
  id: string
  patientName: string
  patientPhone: string
  startsAt: Date
}): Promise<string | undefined> {
  try {
    const call = await dialgem.calls.createPhoneCall({
      from_: "+14155550100", // a number registered on your organization
      to: appointment.patientPhone,
      agent_id: process.env["REMINDER_AGENT_ID"] ?? null,
      // Fills {{patient_name}} and {{appointment_time}} in the agent's prompt.
      dialgem_llm_dynamic_variables: {
        patient_name: appointment.patientName,
        appointment_time: appointment.startsAt.toLocaleString("en-US"),
      },
    })
    // Keep call_id to match the call_ended / call_analyzed webhooks later.
    return call.call_id
  } catch (err) {
    // createPhoneCall is never retried automatically: a retry after an ambiguous
    // failure could ring the patient twice. Decide here, with your own dedupe.
    if (err instanceof APIError) {
      console.error(`Could not dial ${appointment.id}: ${err.errCode} ${err.message} (request ${err.requestId})`)
      return undefined
    }
    throw err
  }
}
