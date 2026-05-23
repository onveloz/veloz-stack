import type { ProjectConfig } from "@veloz-stack/types";
import { processApi } from "./api";
import { processAuth } from "./auth";
import { processDb } from "./db";
import { processDeploy } from "./deploy";
import type { VirtualFs } from "../vfs";

export function runDataHandlers(vfs: VirtualFs, config: ProjectConfig): void {
  processApi(vfs, config);
  processDb(vfs, config);
  processAuth(vfs, config);
  processDeploy(vfs, config);
}
