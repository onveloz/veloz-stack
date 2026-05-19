import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Addons are tooling modifications: turborepo task graph, biome
 * formatter, husky / lefthook git hooks, tauri desktop shell. They write config
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
  if (config.addons.includes("oxlint")) {
    processTemplatesFromPrefix(vfs, "addons/oxlint/", "", config);
  }
  if (config.addons.includes("lefthook")) {
    processTemplatesFromPrefix(vfs, "addons/lefthook/", "", config);
    if (config.lefthookAdvanced) {
      processTemplatesFromPrefix(vfs, "addons/lefthook-advanced/", "", config);
      processTemplatesFromPrefix(vfs, "addons/lefthook-advanced-ci/", "", config);
    } else if (config.lefthookCi) {
      processTemplatesFromPrefix(vfs, "addons/lefthook-ci/", "", config);
    }
  }
  // Tauri moved out of addons — it's now a top-level `desktop` target.
  // See handlers/desktop.ts.
}
