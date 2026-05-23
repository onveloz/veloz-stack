import type { ProjectConfig } from "@veloz-stack/types";
import { processBackend } from "./backend";
import { processDesktop } from "./desktop";
import { processMobile } from "./mobile";
import type { VirtualFs } from "../vfs";

export function runPlatformHandlers(
  vfs: VirtualFs,
  config: ProjectConfig,
): void {
  processMobile(vfs, config);
  processDesktop(vfs, config);
  processBackend(vfs, config);
}
