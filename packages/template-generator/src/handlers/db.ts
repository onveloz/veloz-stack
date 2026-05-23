import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/** @internal Scaffold pipeline step. */
export function processDb(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.db === "none" || config.orm === "none") {
    return;
  }

  if (config.orm === "drizzle") {
    if (config.db === "postgres") {
      processTemplatesFromPrefix({
        vfs,
        sourcePrefix: "db/drizzle-postgres/",
        destPrefix: "",
        config,
      });
      return;
    }
    if (config.db === "sqlite") {
      processTemplatesFromPrefix({
        vfs,
        sourcePrefix: "db/drizzle-sqlite/",
        destPrefix: "",
        config,
      });
      return;
    }
    // Drizzle + MySQL / MongoDB lands in a future wave.
    return;
  }

  if (config.orm === "prisma") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "db/prisma/",
      destPrefix: "",
      config,
    });
  }
}
