import type { ProjectConfig } from "@veloz-stack/types";
import { runBaseStackHandlers } from "./handlers/pipeline-base";
import { runDataHandlers } from "./handlers/pipeline-data";
import { runExtrasHandlers } from "./handlers/pipeline-extras";
import { runPlatformHandlers } from "./handlers/pipeline-platform";
import { postProcess } from "./handlers/post-process";
import type { VirtualFs } from "./vfs";

/** Run scaffold handlers in dependency order (base → axes → post-process). */
export function runGeneratePipeline(
  vfs: VirtualFs,
  config: ProjectConfig,
): void {
  runBaseStackHandlers(vfs, config);
  runPlatformHandlers(vfs, config);
  runDataHandlers(vfs, config);
  runExtrasHandlers(vfs, config);
  postProcess(vfs, config);
}
