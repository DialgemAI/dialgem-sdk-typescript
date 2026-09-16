/**
 * Export the last 24 hours of calls with transcripts and analysis for reporting.
 *
 *   DIALGEM_API_KEY=zk_… npx tsx examples/export-calls.ts > calls.jsonl
 */
import { Dialgem } from "@dialgem/sdk"

const dialgem = new Dialgem()

// `started_at` is ISO 8601 UTC without a suffix, so it compares correctly as a string.
const cutoff = new Date(Date.now() - 86_400_000).toISOString().slice(0, 19)
const seen = new Set<string>()

// Calls come newest first, so stop at the first one older than the cutoff.
for await (const call of dialgem.calls.list({ page_size: 50 })) {
  if (call.started_at && call.started_at < cutoff) break
  // Offset pages shift when a call starts mid-export; skip the repeat.
  if (seen.has(call.id)) continue
  seen.add(call.id)

  const row = {
    id: call.id,
    agent: call.agent_name,
    direction: call.direction,
    from: call.from_number,
    to: call.to_number,
    status: call.status,
    started_at: call.started_at,
    duration_s: call.duration_s,
    cost_usd: call.call_cost ? call.call_cost.combined_cost / 10_000 : null,
    successful: call.analysis?.call_successful ?? null,
    sentiment: call.analysis?.user_sentiment ?? null,
    variables: call.analysis?.variables ?? {},
    transcript: call.transcript.map((t) => `${t.role}: ${t.text}`).join("\n"),
  }
  process.stdout.write(`${JSON.stringify(row)}\n`)
}
