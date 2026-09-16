/**
 * Next.js App Router route handler: app/api/webhooks/dialgem/route.ts
 *
 * `request.text()` returns the body unparsed, which is what the signature covers.
 */
import { Dialgem, WEBHOOK_SIGNATURE_HEADER, WebhookVerificationError } from "@dialgem/sdk"

export async function POST(request: Request): Promise<Response> {
  const body = await request.text()
  try {
    const event = await Dialgem.webhooks.constructEvent(
      body,
      request.headers.get(WEBHOOK_SIGNATURE_HEADER),
      process.env["DIALGEM_WEBHOOK_SECRET"]!,
    )
    if (event.event === "call_analyzed") {
      // e.g. await db.calls.update(event.call_id, { outcome: event.analysis.variables })
    }
    return new Response(null, { status: 204 })
  } catch (err) {
    if (err instanceof WebhookVerificationError) return new Response(err.message, { status: 400 })
    throw err
  }
}
