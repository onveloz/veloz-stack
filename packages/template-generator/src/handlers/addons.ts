import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

function emitAddon(
  vfs: VirtualFs,
  config: ProjectConfig,
  sourcePrefix: string,
): void {
  processTemplatesFromPrefix({
    vfs,
    sourcePrefix,
    destPrefix: "",
    config,
  });
}

function emitLefthookAddons(vfs: VirtualFs, config: ProjectConfig): void {
  emitAddon(vfs, config, "addons/lefthook/");
  if (config.lefthookAdvanced) {
    emitAddon(vfs, config, "addons/lefthook-advanced/");
    emitAddon(vfs, config, "addons/lefthook-advanced-ci/");
    return;
  }
  if (config.lefthookCi) {
    emitAddon(vfs, config, "addons/lefthook-ci/");
  }
}

/**
 * Addons are tooling modifications: turborepo task graph, biome
 * formatter, husky / lefthook git hooks, tauri desktop shell. They write config
 * files here; the post-processor rewrites root scripts when needed.
 */
export function processAddons(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.addons.includes("turborepo")) {
    emitAddon(vfs, config, "addons/turborepo/");
  }
  if (config.addons.includes("biome")) {
    emitAddon(vfs, config, "addons/biome/");
  }
  if (config.addons.includes("husky")) {
    emitAddon(vfs, config, "addons/husky/");
  }
  if (config.addons.includes("oxlint")) {
    emitAddon(vfs, config, "addons/oxlint/");
  }
  if (config.addons.includes("lefthook")) {
    emitLefthookAddons(vfs, config);
  }
  // Tauri moved out of addons — it's now a top-level `desktop` target.
  // See handlers/desktop.ts.
}
