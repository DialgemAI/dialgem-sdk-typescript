import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  // Node 20 is the floor in `engines`; nothing newer is emitted than it runs.
  target: "node20",
  // Customers bundle this into their own services; minified stack traces from a
  // vendor SDK are a support ticket, and the source is ~20 KB anyway.
  minify: false,
  splitting: false,
  treeshake: true,
})
