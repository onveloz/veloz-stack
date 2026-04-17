import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils.js";
import type { VirtualFs } from "../vfs.js";

/**
 * Addons are tooling modifications: turborepo task graph, biome
 * formatter, husky git hooks. They write config files here; the
 * post-processor rewrites root scripts to reflect the chosen tooling.
 */
export function processAddons(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.addons.includes("turborepo")) {
    processTemplatesFromPrefix(vfs, "addons/turborepo/", "", config);
  }
  if (config.addons.includes("biome")) {
    processTemplatesFromPrefix(vfs, "addons/biome/", "", config);
  }
}
