/**
 * Browser-safe preview entry — no node:fs imports.
 * Import from `@veloz-stack/template-generator/preview` in client bundles.
 */
export { type GenerateOptions, generate, VirtualFs } from "./index";
