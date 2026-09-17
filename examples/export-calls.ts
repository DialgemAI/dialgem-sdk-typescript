/**
 * Export the last 24 hours of calls with transcripts and analysis for reporting.
 *
 *   DIALGEM_API_KEY=zk_… npx tsx examples/export-calls.ts > calls.jsonl
 */
import { Dialgem } from "@dialgem/sdk"

const dialgem = new Dialgem()

const since = Date.now() - 86_400_000

// Pages are cursor-based: iterating is stable while new calls keep arriving.
for await (const call of dialgem.calls.list({ start_after: since, status: "completed", limit: 50 })) {
  const row = {
    id: call.id,
    agent: call.agent_name,
    direction: call.direction,
    from: call.from_number,
    to: call.to_number,
    started_at: call.start_timestamp,
    duration_ms: call.duration_ms,
    ended_because: call.disconnection_reason,
    voicemail: call.in_voicemail,
    cost_usd: call.call_cost ? call.call_cost.combined_cost / 10_000 : null,
    summary: call.analysis?.call_summary ?? null,
    successful: call.analysis?.call_successful ?? null,
    sentiment: call.analysis?.user_sentiment ?? null,
    variables: call.analysis?.variables ?? {},
    latency_p50_ms: call.latency?.e2e?.p50 ?? null,
    metadata: call.metadata,
    transcript: call.transcript_text,
  }
  process.stdout.write(`${JSON.stringify(row)}\n`)
}
