import { DialgemError } from "../core/errors.js"
import type { HttpClient } from "../core/http.js"

export abstract class APIResource {
  protected readonly _client: HttpClient

  constructor(client: HttpClient) {
    this._client = client
  }
}

/**
 * Builds a path with each interpolated id URI-encoded.
 *
 * Rejects an empty id rather than sending it: `/v1/agents/${""}` is
 * `/v1/agents/`, which a `retrieve("")` would turn into a silent *list*
 * call, and a `delete("")` into a confusing 405.
 */
export function path(strings: TemplateStringsArray, ...ids: string[]): string {
  let out = strings[0] ?? ""
  ids.forEach((id, i) => {
    if (typeof id !== "string" || id.trim() === "") {
      throw new DialgemError(`Expected a non-empty id in ${strings.join("{id}")}, got ${JSON.stringify(id)}.`)
    }
    out += encodeURIComponent(id) + (strings[i + 1] ?? "")
  })
  return out
}
