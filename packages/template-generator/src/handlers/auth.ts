import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Better Auth ships in three layers:
 *   core/       — the auth package itself (always emitted)
 *   drizzle/    — Drizzle schema drop-in (only when orm=drizzle)
 *   prisma/     — Prisma schema fragment (only when orm=prisma)
 *
 * The auth/index.ts.hbs branches on `orm` internally to pick the right
 * adapter. The schema overlays land into packages/db alongside db's
 * own files.
 */
export function processAuth(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.auth !== "better-auth") return;

  processTemplatesFromPrefix(vfs, "auth/better-auth/core/", "", config);

  if (config.orm === "drizzle" && config.db !== "none") {
    processTemplatesFromPrefix(vfs, "auth/better-auth/drizzle/", "", config);
  }
  if (config.orm === "prisma" && config.db !== "none") {
    processTemplatesFromPrefix(vfs, "auth/better-auth/prisma/", "", config);
  }
}
