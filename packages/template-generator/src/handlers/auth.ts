import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Better Auth ships as per-ORM + per-dialect overlays:
 *   core/           — the auth package itself (always emitted)
 *   drizzle-pg/     — Drizzle schema for Postgres
 *   drizzle-sqlite/ — Drizzle schema for SQLite (sqliteTable / integer timestamps)
 *   prisma/         — Prisma schema fragment (auto-merged by prismaSchemaFolder)
 *
 * The core auth/index.ts.hbs branches internally on orm + db to pick the
 * right adapter + provider string. The schema overlays land into
 * packages/db alongside db's own files.
 */
export function processAuth(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.auth !== "better-auth") return;

  processTemplatesFromPrefix(vfs, "auth/better-auth/core/", "", config);

  if (config.orm === "drizzle" && config.db === "postgres") {
    processTemplatesFromPrefix(vfs, "auth/better-auth/drizzle-pg/", "", config);
  }
  if (config.orm === "drizzle" && config.db === "sqlite") {
    processTemplatesFromPrefix(vfs, "auth/better-auth/drizzle-sqlite/", "", config);
  }
  if (config.orm === "prisma" && config.db !== "none") {
    processTemplatesFromPrefix(vfs, "auth/better-auth/prisma/", "", config);
  }
  if (config.frontend === "next") {
    processTemplatesFromPrefix(vfs, "auth/better-auth/next/", "", config);
  }
  if (config.frontend === "tanstack-start") {
    processTemplatesFromPrefix(vfs, "auth/better-auth/tanstack-start/", "", config);
  }
}
