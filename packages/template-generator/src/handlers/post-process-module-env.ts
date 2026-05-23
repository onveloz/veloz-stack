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

  const existing = vfs.read(".env.example");
  const prefix =
    existing && existing.trimEnd().length > 0 ? `${existing.trimEnd()}\n` : "";
  vfs.write(".env.example", `${prefix}${additions.join("\n")}\n`);
}
