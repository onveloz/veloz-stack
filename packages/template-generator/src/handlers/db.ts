import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

export function processDb(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.db === "none" || config.orm === "none") return;

  if (config.orm === "drizzle") {
    if (config.db === "postgres") {
      processTemplatesFromPrefix(vfs, "db/drizzle-postgres/", "", config);
      return;
    }
    if (config.db === "sqlite") {
      processTemplatesFromPrefix(vfs, "db/drizzle-sqlite/", "", config);
      return;
    }
    // Drizzle + MySQL / MongoDB lands in a future wave.
    return;
  }

  if (config.orm === "prisma") {
    processTemplatesFromPrefix(vfs, "db/prisma/", "", config);
    return;
  }
}
