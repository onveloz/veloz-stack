import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "node20",
  outExtensions: () => ({ js: ".mjs" }),
  clean: true,
  minify: false,
  dts: false,
  shims: true,
  // Bundle the workspace types package so the published CLI is standalone.
  noExternal: ["@veloz-stack/types", "@veloz-stack/template-generator"],
});
