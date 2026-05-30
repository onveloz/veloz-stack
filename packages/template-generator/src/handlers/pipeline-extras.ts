import type { ProjectConfig } from "@veloz-stack/types";
import { processAddons } from "./addons";
import { processAdrs } from "./docs";
import { processExamples } from "./examples";
import { processModules } from "./modules";
import { processTesting } from "./testing";
import type { VirtualFs } from "../vfs";

/** @internal Scaffold pipeline step. */
export function runExtrasHandlers(vfs: VirtualFs, config: ProjectConfig): void {
  processModules(vfs, config);
  processExamples(vfs, config);
  processAddons(vfs, config);
  processTesting(vfs, config);
  processAdrs(vfs, config);
}
