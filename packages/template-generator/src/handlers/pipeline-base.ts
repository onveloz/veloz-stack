import type { ProjectConfig } from "@veloz-stack/types";
import { processBase } from "./base";
import { processFrontend } from "./frontend";
import { processUi } from "./ui";
import type { VirtualFs } from "../vfs";

export function runBaseStackHandlers(
  vfs: VirtualFs,
  config: ProjectConfig,
): void {
  processBase(vfs, config);
  processFrontend(vfs, config);
  processUi(vfs, config);
}
