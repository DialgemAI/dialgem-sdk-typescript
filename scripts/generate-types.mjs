#!/usr/bin/env node
/**
 * Regenerate `src/generated/openapi.d.ts` from `openapi/openapi.json`.
 *
 * Refresh the snapshot first with `pnpm sync:openapi`. CI runs this script and
 * fails on a diff, so a snapshot change that was never regenerated cannot ship.
 *
 * Only request-body schemas are consumed from this file (see src/types/params.ts).
 * Response shapes are hand-written in src/types/, because the API's routes return
 * objects the OpenAPI document does not describe in detail.
 *
 * Usage:  pnpm gen:types
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import openapiTS, { astToString } from "openapi-typescript"

const HERE = dirname(fileURLToPath(import.meta.url))
const SDK = resolve(HERE, "..")
const SNAPSHOT = join(SDK, "openapi", "openapi.json")
const OUT = join(SDK, "src", "generated", "openapi.d.ts")

const doc = JSON.parse(readFileSync(SNAPSHOT, "utf8"))
const ast = await openapiTS(doc, {
  alphabetize: true,
  // openapi-typescript's default marks every field that has a server default as
  // REQUIRED — right for a response, wrong for a request body. Left on, AgentCreate
  // would demand all ~40 defaulted settings from a caller who only wants a name.
  defaultNonNullable: false,
})

const banner =
  "/**\n" +
  " * GENERATED FILE — DO NOT EDIT.\n" +
  " *\n" +
  " * Source: openapi/openapi.json. Refresh with `pnpm sync:openapi`, then `pnpm gen:types`.\n" +
  " *\n" +
  " * Import the friendly aliases from src/types/params.ts rather than reaching in here.\n" +
  " */\n\n"

mkdirSync(dirname(OUT), { recursive: true })
// LF regardless of platform, so a Windows regeneration does not produce a diff CI rejects.
writeFileSync(OUT, (banner + astToString(ast)).replace(/\r\n/g, "\n"), "utf8")
console.log(`✓ ${OUT}`)
