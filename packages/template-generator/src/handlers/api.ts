import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/** @internal Scaffold pipeline step. */
export function processApi(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.api === "none" || config.backend === "none") {
    return;
  }
  // Wave 2b: oRPC only
  if (config.api !== "orpc") {
    return;
  }
  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: "api/orpc/",
    destPrefix: "",
    config,
  });
}
