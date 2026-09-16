import { VERSION } from "@dialgem/sdk"
import { expect, it } from "vitest"

import pkg from "../package.json" with { type: "json" }

it("VERSION matches package.json (it is sent in the User-Agent)", () => {
  expect(VERSION).toBe(pkg.version)
})
