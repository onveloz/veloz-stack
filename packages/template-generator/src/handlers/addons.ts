import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Addons are tooling modifications: turborepo task graph, biome
 * formatter, husky git hooks, tauri desktop shell. They write config
 * files here; the post-processor rewrites root scripts when needed.
 */
export function processAddons(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.addons.includes("turborepo")) {
    processTemplatesFromPrefix(vfs, "addons/turborepo/", "", config);
  }
  if (config.addons.includes("biome")) {
    processTemplatesFromPrefix(vfs, "addons/biome/", "", config);
  }
  if (config.addons.includes("husky")) {
    processTemplatesFromPrefix(vfs, "addons/husky/", "", config);
  }
  // Tauri moved out of addons — it's now a top-level `desktop` target.
  // See handlers/desktop.ts.
}
