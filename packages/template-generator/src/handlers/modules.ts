import type { ProjectConfig } from "@veloz-stack/types";
import { moduleTemplatePrefixes } from "../module-registry";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Each module owns a `templates/modules/<id>/` folder. When the user picks
 * the module, everything in that folder gets merged into the VFS verbatim
 * (or compiled, if `.hbs`). Imperative extras (extra package.json fields,
 * env vars) live in post-process.ts via module-registry.
 */
export function processModules(vfs: VirtualFs, config: ProjectConfig): void {
  for (const prefix of moduleTemplatePrefixes(config.modules)) {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: prefix,
      destPrefix: "",
      config,
    });
  }
}
