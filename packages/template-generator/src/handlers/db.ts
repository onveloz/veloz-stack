import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

export function processDb(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.db === "none" || config.orm === "none") return;

  if (config.orm === "drizzle" && config.db === "postgres") {
    processTemplatesFromPrefix(vfs, "db/drizzle-postgres/", "", config);
    return;
  }
  if (config.orm === "prisma") {
    processTemplatesFromPrefix(vfs, "db/prisma/", "", config);
    return;
  }
  // Other combinations (Drizzle+MySQL, Prisma+Mongo via Mongoose, …) land
  // in future waves.
}
