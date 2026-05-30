import type { ProjectConfig } from "@veloz-stack/types";
import { runGeneratePipeline } from "./generate-pipeline";
import { writeVelozStackConfigToVfs } from "./veloz-stack-config";
import { VirtualFs } from "./vfs";

export { VirtualFs } from "./vfs";

/** Options for {@link generate} (CLI version stamp for `veloz-stack.jsonc`). */
export interface GenerateOptions {
  /** CLI version stamped into `veloz-stack.jsonc` (omitted in browser preview). */
  cliVersion?: string;
}

/**
 * Runs {@link runGeneratePipeline}: base → platform → data/deploy → extras
 * → post-process. Each handler owns its file tree; post-process merges shared
 * JSON at the end.
 *
 * Browser-safe: no `node:fs` imports so the web picker can preview the VFS.
 * Disk writes live in `./scaffold`.
 */
export function generate(
  config: ProjectConfig,
  options?: GenerateOptions,
): VirtualFs {
  const vfs = new VirtualFs();
  runGeneratePipeline(vfs, config);
  if (options?.cliVersion) {
    writeVelozStackConfigToVfs(vfs, config, options.cliVersion);
  }
  return vfs;
}
