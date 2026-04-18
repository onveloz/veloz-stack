import type { ProjectConfig } from "@veloz-stack/types";
import { processAddons } from "./handlers/addons";
import { processApi } from "./handlers/api";
import { processAuth } from "./handlers/auth";
import { processBackend } from "./handlers/backend";
import { processBase } from "./handlers/base";
import { processDb } from "./handlers/db";
import { processDeploy } from "./handlers/deploy";
import { processDesktop } from "./handlers/desktop";
import { processExamples } from "./handlers/examples";
import { processFrontend } from "./handlers/frontend";
import { processMobile } from "./handlers/mobile";
import { processModules } from "./handlers/modules";
import { postProcess } from "./handlers/post-process";
import { VirtualFs } from "./vfs";

export { VirtualFs } from "./vfs";

/**
 * Order matters — mirrors BTS: base → frontend → backend → db → api → auth
 * → deploy → modules → post-process. Each handler is responsible for its
 * own file tree; post-processors merge shared JSON at the end.
 *
 * This entry is browser-safe: it has NO node:fs imports so the web picker
 * can call it client-side to render a preview tree. Server-only writing
 * lives in `./scaffold`.
 */
export function generate(config: ProjectConfig): VirtualFs {
  const vfs = new VirtualFs();
  processBase(vfs, config);
  processFrontend(vfs, config);
  processMobile(vfs, config);
  processDesktop(vfs, config);
  processBackend(vfs, config);
  processDb(vfs, config);
  processApi(vfs, config);
  processAuth(vfs, config);
  processDeploy(vfs, config);
  processExamples(vfs, config);
  processModules(vfs, config);
  processAddons(vfs, config);
  postProcess(vfs, config);
  return vfs;
}
