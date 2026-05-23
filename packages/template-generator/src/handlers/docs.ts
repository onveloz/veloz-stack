import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Emits Architecture Decision Records for stack choices made at scaffold time.
 * Conditional prefixes mirror auth/db handlers — only relevant ADRs land in the tree.
 */
export function processAdrs(vfs: VirtualFs, config: ProjectConfig): void {
  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: "docs/adr/core/",
    destPrefix: "docs/adr/",
    config,
  });

  if (config.auth === "better-auth") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "docs/adr/auth/better-auth/",
      destPrefix: "docs/adr/",
      config,
    });
  }
  if (config.api === "orpc") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "docs/adr/api/orpc/",
      destPrefix: "docs/adr/",
      config,
    });
  }
  if (config.db !== "none" && config.orm !== "none") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "docs/adr/db/",
      destPrefix: "docs/adr/",
      config,
    });
  }
}
