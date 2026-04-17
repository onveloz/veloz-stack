import type { ProjectConfig } from "./index";
import { MODULES, type ModuleId } from "./modules";

export type DisableReason = string | null;

export function getFrontendDisableReason(
  _cfg: ProjectConfig,
  _id: ProjectConfig["frontend"],
): DisableReason {
  // Frontends don't constrain the server stack. Native apps (Expo) ship
  // to the app stores on their own pipeline; their database / deploy
  // target / runtime all belong to the server the app talks to.
  return null;
}

export function getBackendDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["backend"],
): DisableReason {
  if (id !== "hono" && cfg.runtime === "workers") {
    return "Cloudflare Workers só suporta Hono por enquanto";
  }
  return null;
}

export function getRuntimeDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["runtime"],
): DisableReason {
  if (id === "workers" && cfg.backend !== "hono" && cfg.backend !== "none") {
    return "Runtime Workers precisa de backend Hono";
  }
  if (id === "workers" && cfg.deploy !== "cloudflare" && cfg.deploy !== "none") {
    return "Runtime Workers só faz deploy no Cloudflare";
  }
  return null;
}

export function getOrmDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["orm"],
): DisableReason {
  if (cfg.db === "mongodb" && id !== "mongoose" && id !== "prisma" && id !== "none") {
    return "MongoDB só combina com Mongoose ou Prisma";
  }
  if (cfg.db !== "mongodb" && id === "mongoose") {
    return "Mongoose é só pra MongoDB";
  }
  if (cfg.db === "none" && id !== "none") {
    return "Nenhum banco selecionado";
  }
  return null;
}

export function getDbHostingDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["dbHosting"],
): DisableReason {
  if (cfg.db === "none" && id !== "none") return "Nenhum banco selecionado";
  if (id === "neon" && cfg.db !== "postgres") return "Neon é só Postgres";
  if (id === "supabase" && cfg.db !== "postgres") return "Supabase é só Postgres";
  if (id === "planetscale" && cfg.db !== "mysql") return "PlanetScale é só MySQL";
  if (id === "turso" && cfg.db !== "sqlite") return "Turso é só SQLite";
  if (id === "mongodb-atlas" && cfg.db !== "mongodb") return "Atlas é só MongoDB";
  return null;
}

export function getDeployDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["deploy"],
): DisableReason {
  if (id === "cloudflare" && cfg.runtime !== "workers" && cfg.runtime !== "node") {
    return "Deploy no Cloudflare precisa de runtime workers ou node";
  }
  return null;
}

export function getApiDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["api"],
): DisableReason {
  if (cfg.backend === "none" && id !== "none") return "Nenhum backend selecionado";
  return null;
}

export function getModuleDisableReason(
  cfg: ProjectConfig,
  id: ModuleId,
): DisableReason {
  const meta = MODULES[id];
  if (meta.requires?.auth && cfg.auth === "none") return "Precisa do Better Auth";
  if (meta.requires?.backend && cfg.backend === "none") return "Precisa de um backend";
  if (meta.requires?.db && cfg.db === "none") return "Precisa de um banco";
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

  // Cross-field invariants the per-field helpers don't cover
  if (cfg.auth === "better-auth" && cfg.db === "none") {
    errors.push(
      "auth: Better Auth precisa de um banco (usa o adapter Drizzle no packages/db)",
    );
  }

  for (const m of cfg.modules) {
    pushIf(getModuleDisableReason(cfg, m), `módulo ${m}`);
  }
  return errors;
}
