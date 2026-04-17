import type { ProjectConfig } from "@veloz-stack/types";
import { processApi } from "./handlers/api.js";
import { processAuth } from "./handlers/auth.js";
import { processBackend } from "./handlers/backend.js";
import { processBase } from "./handlers/base.js";
import { processDb } from "./handlers/db.js";
import { processDeploy } from "./handlers/deploy.js";
import { processExamples } from "./handlers/examples.js";
import { processFrontend } from "./handlers/frontend.js";
import { processModules } from "./handlers/modules.js";
import { postProcess } from "./handlers/post-process.js";
import { VirtualFs } from "./vfs.js";
import { writeTree } from "./writer.js";

export { VirtualFs } from "./vfs.js";
export { writeTree } from "./writer.js";

/**
 * Order matters — mirrors BTS: base → frontend → backend → db → api → auth
 * → deploy → modules → post-process. Each handler is responsible for its
 * own file tree; post-processors merge shared JSON at the end.
 */
export function generate(config: ProjectConfig): VirtualFs {
  const vfs = new VirtualFs();
  processBase(vfs, config);
  processFrontend(vfs, config);
  processBackend(vfs, config);
  processDb(vfs, config);
  processApi(vfs, config);
  processAuth(vfs, config);
  processDeploy(vfs, config);
  processExamples(vfs, config);
  processModules(vfs, config);
  postProcess(vfs, config);
  return vfs;
}

export async function scaffold(
  config: ProjectConfig,
  targetDir: string,
): Promise<{ fileCount: number }> {
  const vfs = generate(config);
  const fileCount = await writeTree(vfs, targetDir);
  return { fileCount };
}
