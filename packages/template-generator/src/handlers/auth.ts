import type { FrontendId, ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

const AUTH_FRONTEND_PREFIX: Partial<Record<FrontendId, string>> = {
  next: "auth/better-auth/next/",
  "tanstack-start": "auth/better-auth/tanstack-start/",
  "svelte-kit": "auth/better-auth/svelte-kit/",
  nuxt: "auth/better-auth/nuxt/",
  astro: "auth/better-auth/astro/",
};

function emitAuthSchemaOverlays(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.orm === "drizzle" && config.db === "postgres") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "auth/better-auth/drizzle-pg/",
      destPrefix: "",
      config,
    });
  }
  if (config.orm === "drizzle" && config.db === "sqlite") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "auth/better-auth/drizzle-sqlite/",
      destPrefix: "",
      config,
    });
  }
  if (config.orm === "prisma" && config.db !== "none") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "auth/better-auth/prisma/",
      destPrefix: "",
      config,
    });
  }
}

function emitAuthFrontendOverlays(vfs: VirtualFs, config: ProjectConfig): void {
  const prefix = AUTH_FRONTEND_PREFIX[config.frontend];
  if (!prefix) {
    return;
  }
  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: prefix,
    destPrefix: "",
    config,
  });
}

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
  if (config.auth !== "better-auth") {
    return;
  }

  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: "auth/better-auth/core/",
    destPrefix: "",
    config,
  });

  emitAuthSchemaOverlays(vfs, config);
  emitAuthFrontendOverlays(vfs, config);

  if (config.mobile === "expo") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "auth/better-auth/expo/",
      destPrefix: "",
      config,
    });
  }
}
