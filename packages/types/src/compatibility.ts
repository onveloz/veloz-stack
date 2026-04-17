import type { ProjectConfig } from "./index";
import { MODULES, type ModuleId } from "./modules";

export type DisableReason = string | null;

export function getFrontendDisableReason(
  _cfg: ProjectConfig,
  _id: ProjectConfig["frontend"],
): DisableReason {
  // Frontends don't constrain the server stack. Native apps (Expo) ship to the
  // app stores on their own pipeline; their database / deploy target / runtime
  // all belong to the server the app talks to — not the app itself.
  return null;
}

export function getBackendDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["backend"],
): DisableReason {
  if (id !== "hono" && cfg.runtime === "workers") {
    return "Cloudflare Workers only supports Hono today";
  }
  return null;
}

export function getRuntimeDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["runtime"],
): DisableReason {
  if (id === "workers" && cfg.backend !== "hono" && cfg.backend !== "none") {
    return "Workers runtime requires Hono backend";
  }
  if (id === "workers" && cfg.deploy !== "cloudflare" && cfg.deploy !== "none") {
    return "Workers runtime only deploys to Cloudflare";
  }
  return null;
}

export function getOrmDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["orm"],
): DisableReason {
  if (cfg.db === "mongodb" && id !== "mongoose" && id !== "prisma" && id !== "none") {
    return "MongoDB only pairs with Mongoose or Prisma";
  }
  if (cfg.db !== "mongodb" && id === "mongoose") {
    return "Mongoose only pairs with MongoDB";
  }
  if (cfg.db === "none" && id !== "none") {
    return "No database selected";
  }
  return null;
}

export function getDbHostingDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["dbHosting"],
): DisableReason {
  if (cfg.db === "none" && id !== "none") return "No database selected";
  if (id === "neon" && cfg.db !== "postgres") return "Neon is Postgres-only";
  if (id === "supabase" && cfg.db !== "postgres") return "Supabase is Postgres-only";
  if (id === "planetscale" && cfg.db !== "mysql") return "PlanetScale is MySQL-only";
  if (id === "turso" && cfg.db !== "sqlite") return "Turso is SQLite-only";
  if (id === "mongodb-atlas" && cfg.db !== "mongodb") return "Atlas is MongoDB-only";
  return null;
}

export function getDeployDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["deploy"],
): DisableReason {
  if (id === "cloudflare" && cfg.runtime !== "workers" && cfg.runtime !== "node") {
    return "Cloudflare deploy needs workers or node runtime";
  }
  return null;
}

export function getApiDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["api"],
): DisableReason {
  if (cfg.backend === "none" && id !== "none") return "No backend selected";
  return null;
}

export function getModuleDisableReason(
  cfg: ProjectConfig,
  id: ModuleId,
): DisableReason {
  const meta = MODULES[id];
  if (meta.requires?.auth && cfg.auth === "none") return "Requires Better Auth";
  if (meta.requires?.backend && cfg.backend === "none") return "Requires a backend";
  if (meta.requires?.db && cfg.db === "none") return "Requires a database";
  return null;
}

export function validateConfig(cfg: ProjectConfig): string[] {
  const errors: string[] = [];
  const pushIf = (reason: DisableReason, prefix: string) => {
    if (reason) errors.push(`${prefix}: ${reason}`);
  };
  pushIf(getFrontendDisableReason(cfg, cfg.frontend), "frontend");
  pushIf(getBackendDisableReason(cfg, cfg.backend), "backend");
  pushIf(getRuntimeDisableReason(cfg, cfg.runtime), "runtime");
  pushIf(getApiDisableReason(cfg, cfg.api), "api");
  pushIf(getOrmDisableReason(cfg, cfg.orm), "orm");
  pushIf(getDbHostingDisableReason(cfg, cfg.dbHosting), "dbHosting");
  pushIf(getDeployDisableReason(cfg, cfg.deploy), "deploy");
  for (const m of cfg.modules) {
    pushIf(getModuleDisableReason(cfg, m), `module ${m}`);
  }
  return errors;
}
