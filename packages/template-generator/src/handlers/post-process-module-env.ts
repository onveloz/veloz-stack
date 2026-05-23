import type { ProjectConfig } from "@veloz-stack/types";
import { collectModuleEnvVarLines } from "../module-registry";
import type { VirtualFs } from "../vfs";

/** @internal Scaffold pipeline step. */
export function appendModuleEnvVarsFromRegistry(
  vfs: VirtualFs,
  config: ProjectConfig,
): void {
  const additions = collectModuleEnvVarLines(config.modules);
  if (additions.length === 0) {
    return;
  }

  const existing = vfs.read(".env.example") ?? "";
  vfs.write(".env.example", `${existing.trimEnd()}\n${additions.join("\n")}\n`);
}
