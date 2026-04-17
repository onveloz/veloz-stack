import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

export function processApi(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.api === "none" || config.backend === "none") return;
  if (config.api !== "orpc") return; // Wave 2b: oRPC only
  processTemplatesFromPrefix(vfs, "api/orpc/", "", config);
}
