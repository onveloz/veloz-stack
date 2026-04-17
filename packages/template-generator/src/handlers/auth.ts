import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils.js";
import type { VirtualFs } from "../vfs.js";

export function processAuth(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.auth !== "better-auth") return;
  processTemplatesFromPrefix(vfs, "auth/better-auth/", "", config);
}
