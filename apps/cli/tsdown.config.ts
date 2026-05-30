import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  format: "esm",
  target: "node24",
  outExtensions: () => ({ js: ".mjs" }),
  clean: true,
  minify: false,
  dts: false,
  shims: true,
  // Bundle the workspace types package so the published CLI is standalone.
  // Regex so subpath exports like `@veloz-stack/template-generator/scaffold`
  // are inlined too (string match only catches the root specifier).
  noExternal: [/^@veloz-stack\//],
});
