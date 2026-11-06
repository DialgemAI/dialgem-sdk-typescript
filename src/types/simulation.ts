/**
 * Agent simulations: saved conversations that a simulated caller has with your agent, in text,
 * checked afterwards. Nothing is dialled, recorded or billed, and the agent's tools are never really called.
 *
 * The API accepts free-form objects for the caller, tool answers and checks, so they are typed here.
 */

/** What publishing a version of the agent does when the draft has not passed the suite. */
export type SimulationPublishGate = "off" | "warn" | "block"

export type SimulationCaller =
  | {
      mode: "script"
      /** What the caller says, one line per turn (up to 20). */
      turns: string[]
    }
  | {
      mode: "persona"
      /** Who the caller is. A model plays them. */
      persona: string
      /** What they want from the call. */
      goal?: string | undefined
      /** Longest the conversation runs, in exchanges (1 to 12, default 6). */
      max_turns?: number | undefined
    }

interface CheckBase {
  /** Names the check in the results. */
  label?: string | undefined
}

export type SimulationCheck =
  | (CheckBase & { type: "contains" | "not_contains"; text: string; who?: "agent" | "caller" | "any" | undefined })
  | (CheckBase & { type: "tool_called"; name: string; args?: Record<string, unknown> | undefined })
  | (CheckBase & { type: "tool_not_called"; name: string })
  | (CheckBase & { type: "variable_equals"; name: string; value: string })
  | (CheckBase & { type: "node_reached"; node_id: string })
  | (CheckBase & { type: "ended"; value?: boolean | undefined })
  | (CheckBase & { type: "rubric"; criteria: string })

export interface SimulationCaseInput {
  name: string
  caller: SimulationCaller
  /** Fills `{{placeholders}}` in the agent's prompt and first message. */
  dynamic_variables?: Record<string, string | number> | undefined
  /** What each tool answers. A tool without an entry answers `{"status": "ok"}`. */
  tool_mocks?: Record<string, unknown> | undefined
  /** At least one. The case passes when all of them hold. */
  checks: SimulationCheck[]
}

export interface SimulationSuiteCreateParams {
  agent_id: string
  name: string
  description?: string | null | undefined
  publish_gate?: SimulationPublishGate | undefined
}

export interface SimulationSuiteUpdateParams {
  name?: string | undefined
  description?: string | null | undefined
  publish_gate?: SimulationPublishGate | undefined
}

export interface SimulationRunCreateParams {
  /** `0` is the draft you are editing (the default), or a published version, or `"latest_published"`. */
  agent_version?: number | "latest_published" | undefined
  /** Run every case again even if an identical one already ran against this exact agent. */
  fresh?: boolean | undefined
  /** Spend at most this many model turns. When used up the remaining cases are skipped. */
  max_model_turns?: number | undefined
}

export interface SimulationCase extends Required<Pick<SimulationCaseInput, "name" | "caller" | "checks">> {
  id: string
  suite_id: string
  position: number
  dynamic_variables: Record<string, string>
  tool_mocks: Record<string, unknown>
  created_at: string | null
  updated_at: string | null
}

export type SimulationRunStatus = "queued" | "running" | "completed" | "cancelled" | "failed"

export interface SimulationRun {
  id: string
  suite_id: string
  agent_id: string
  /** The version that was tested; `0` is the draft. */
  agent_version: number
  status: SimulationRunStatus
  trigger: string
  fresh: boolean
  total: number
  passed: number
  failed: number
  /** The model or the case broke; this says nothing about your agent. */
  errored: number
  /** Cancelled, or the run ran out of model turns. */
  skipped: number
  model_turn_budget: number
  model_turns_used: number
  budget_exhausted: boolean
  created_at: string | null
  started_at: string | null
  finished_at: string | null
}

export type SimulationResultStatus = "pending" | "passed" | "failed" | "errored" | "skipped"

export interface SimulationCheckResult {
  /** Position in the case's `checks`. */
  index: number
  type: SimulationCheck["type"]
  label?: string | undefined
  passed: boolean
  detail: string
}

export interface SimulationResult {
  id: string
  case_id: string | null
  case_name: string
  position: number
  status: SimulationResultStatus
  /** Why it failed, errored or was skipped. */
  reason: string | null
  /** Taken from an earlier identical run rather than run again. */
  cached: boolean
  transcript: { role: "caller" | "agent"; text: string; node_id?: string | undefined }[]
  tool_calls: { name: string; input: Record<string, unknown>; result: string }[]
  /** A flow agent's variables at the end. */
  variables: Record<string, unknown>
  checks: SimulationCheckResult[]
  model_turns: number
  duration_ms: number
  finished_at: string | null
}

export interface SimulationRunDetail extends SimulationRun {
  results: SimulationResult[]
}

export interface SimulationSuite {
  id: string
  agent_id: string
  name: string
  description: string | null
  publish_gate: SimulationPublishGate
  case_count: number
  latest_run: SimulationRun | null
  created_at: string | null
  updated_at: string | null
}

export interface SimulationSuiteDetail extends SimulationSuite {
  cases: SimulationCase[]
}

export interface SimulationSuiteList {
  /** Whether simulations are switched on for the platform. */
  enabled: boolean
  suites: SimulationSuite[]
}

export interface SimulationRunList {
  runs: SimulationRun[]
}
