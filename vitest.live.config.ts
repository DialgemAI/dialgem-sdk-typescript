import { fileURLToPath } from "node:url"

import { defineConfig } from "vitest/config"

// Runs against a real agent service. Skipped (not failed) when
// DIALGEM_API_KEY is unset — see tests/live/smoke.test.ts. It runs against production.
export default defineConfig({
  resolve: {
    alias: { "@dialgem/sdk": fileURLToPath(new URL("./src/index.ts", import.meta.url)) },
  },
  test: {
    include: ["tests/live/**/*.test.ts"],
    testTimeout: 30_000,
    // Tests share one org and create/delete real rows; keep them ordered.
    fileParallelism: false,
  },
})
