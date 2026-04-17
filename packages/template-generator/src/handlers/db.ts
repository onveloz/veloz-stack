import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils.js";
import type { VirtualFs } from "../vfs.js";

export function processDb(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.db === "none") return;

  // Wave 2b: Drizzle + Postgres only. Prisma / MongoDB / MySQL come later.
  if (config.orm === "drizzle" && config.db === "postgres") {
    processTemplatesFromPrefix(vfs, "db/drizzle-postgres/", "", config);
  }
}
