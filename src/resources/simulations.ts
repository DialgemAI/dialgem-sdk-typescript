import type { RequestOptions } from "../core/http.js"
import type {
  SimulationCase,
  SimulationCaseInput,
  SimulationRun,
  SimulationRunCreateParams,
  SimulationRunDetail,
  SimulationRunList,
  SimulationSuite,
  SimulationSuiteCreateParams,
  SimulationSuiteDetail,
  SimulationSuiteList,
  SimulationSuiteUpdateParams,
} from "../types/simulation.js"
import { APIResource, path } from "./resource.js"

/**
 * Test your agent before a change reaches a caller. A **suite** holds **cases**; in each, a simulated caller
 * talks to the agent in text and your **checks** decide whether it passed.
 *
 * A simulation is not a call: nothing is dialled, recorded or billed, and the agent's tools are never really
 * called. Simulations spend model usage, so they are switched on per platform; until then every method answers
 * 403 `simulations_disabled`.
 *
 *   const suite = await dialgem.simulations.createSuite({ agent_id, name: "Refunds" })
 *   await dialgem.simulations.createCase(suite.id, {
 *     name: "Asks for a refund",
 *     caller: { mode: "script", turns: ["I want my money back."] },
 *     checks: [{ type: "not_contains", text: "full refund" }],
 *   })
 *   const run = await dialgem.simulations.run(suite.id)
 *   // poll retrieveRun(run.id) until status is "completed"
 */
export class Simulations extends APIResource {
  /** Make a suite for one of your agents. */
  createSuite(body: SimulationSuiteCreateParams, options?: RequestOptions): Promise<SimulationSuite> {
    return this._client.post("/v1/simulations/suites", body, options)
  }

  /** Your suites, newest first, each with its latest run. Pass `agent_id` for one agent's. */
  listSuites(params: { agent_id?: string } = {}, options?: RequestOptions): Promise<SimulationSuiteList> {
    return this._client.get("/v1/simulations/suites", params, options)
  }

  /** One suite with its cases. */
  retrieveSuite(suiteId: string, options?: RequestOptions): Promise<SimulationSuiteDetail> {
    return this._client.get(path`/v1/simulations/suites/${suiteId}`, undefined, options)
  }

  /**
   * Rename a suite or set its publish gate: `off`, `warn` (publishing a version succeeds and lists the suites the draft
   * has not passed) or `block` (publishing is refused with 409 `simulation_required` until it has).
   */
  updateSuite(suiteId: string, body: SimulationSuiteUpdateParams, options?: RequestOptions): Promise<SimulationSuite> {
    return this._client.patch(path`/v1/simulations/suites/${suiteId}`, body, options)
  }

  /** Delete a suite and its cases. Past runs are deleted with it. */
  deleteSuite(suiteId: string, options?: RequestOptions): Promise<void> {
    return this._client.delete(path`/v1/simulations/suites/${suiteId}`, options)
  }

  /** Add a case (up to 50 per suite). 422 `invalid_case` says what to fix. */
  createCase(suiteId: string, body: SimulationCaseInput, options?: RequestOptions): Promise<SimulationCase> {
    return this._client.post(path`/v1/simulations/suites/${suiteId}/cases`, body, options)
  }

  /** Change a case. Fields you leave out keep their value. */
  updateCase(caseId: string, body: Partial<SimulationCaseInput>, options?: RequestOptions): Promise<SimulationCase> {
    return this._client.patch(path`/v1/simulations/cases/${caseId}`, body, options)
  }

  deleteCase(caseId: string, options?: RequestOptions): Promise<void> {
    return this._client.delete(path`/v1/simulations/cases/${caseId}`, options)
  }

  /**
   * Run every case of a suite against the draft, a published version or `"latest_published"`. Answers at once
   * (`202`); the run happens in the background, so poll `retrieveRun` until `status` is `completed`.
   *
   * 409 `suite_empty`, 422 `agent_type_not_supported` (multi-prompt agents), 429 `too_many_runs` or
   * `daily_run_limit`.
   */
  run(suiteId: string, body: SimulationRunCreateParams = {}, options?: RequestOptions): Promise<SimulationRun> {
    return this._client.post(path`/v1/simulations/suites/${suiteId}/runs`, body, options)
  }

  /** Runs, newest first. Pass `suite_id` for one suite's. */
  listRuns(params: { suite_id?: string; limit?: number } = {}, options?: RequestOptions): Promise<SimulationRunList> {
    return this._client.get("/v1/simulations/runs", params, options)
  }

  /** A run with every case's transcript, tool calls and check results. */
  retrieveRun(runId: string, options?: RequestOptions): Promise<SimulationRunDetail> {
    return this._client.get(path`/v1/simulations/runs/${runId}`, undefined, options)
  }

  /** Stop a run that has not finished. Cases already under way finish; the rest are skipped. */
  cancelRun(runId: string, options?: RequestOptions): Promise<SimulationRun> {
    return this._client.post(path`/v1/simulations/runs/${runId}/cancel`, undefined, options)
  }
}
