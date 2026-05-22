import type { AddonId, ProjectConfig } from "./index";
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
  if (id === "next" && cfg.frontend !== "next") {
    return "Backend Next só funciona com frontend Next.js";
  }
  if (id !== "hono" && id !== "none" && cfg.runtime === "workers") {
    return "Cloudflare Workers só suporta Hono por enquanto";
  }
  return null;
}

export function getRuntimeDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["runtime"],
): DisableReason {
  if (id === "workers" && cfg.backend === "next") {
    return "Route Handlers do Next.js não rodam em Cloudflare Workers";
  }
  if (id === "workers" && cfg.backend !== "hono" && cfg.backend !== "none") {
    return "Runtime Workers precisa de backend Hono";
  }
  if (id === "workers" && cfg.deploy !== "cloudflare" && cfg.deploy !== "none") {
    return "Runtime Workers só faz deploy no Cloudflare";
  }
  if (id === "workers" && cfg.auth === "better-auth") {
    return "Better Auth no Workers exige Hyperdrive/D1 — use runtime Bun ou Node por enquanto";
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
  if (id === "cloudflare" && cfg.backend === "next") {
    return "Backend Next não faz deploy no Cloudflare — use Vercel ou Veloz";
  }
  return null;
}

export function getUiDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["ui"],
): DisableReason {
  if (id === "shadcn" && cfg.frontend === "none") {
    return "shadcn precisa de um frontend React (tanstack-start ou next)";
  }
  if (
    id === "shadcn" &&
    cfg.frontend !== "tanstack-start" &&
    cfg.frontend !== "next"
  ) {
    return `shadcn é React-only — use tailwind ou none com ${cfg.frontend}`;
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
  if (id === "next-intl" && cfg.frontend !== "next") {
    return "next-intl funciona só com frontend Next.js";
  }
  if (
    cfg.frontend === "next" &&
    id === "pt-br-i18n" &&
    cfg.modules.includes("next-intl")
  ) {
    return "Com next-intl ativo, pt-BR i18n é redundante — next-intl já cobre locale e mensagens";
  }
  if (
    cfg.frontend === "next" &&
    id === "next-intl" &&
    cfg.modules.includes("pt-br-i18n")
  ) {
    return "Desative pt-BR i18n antes — no Next.js use next-intl para i18n do App Router";
  }
  if (id === "opentelemetry" && cfg.runtime === "workers") {
    return "@opentelemetry/sdk-node não roda em Cloudflare Workers (use Bun/Node)";
  }
  if (id === "pino" && cfg.runtime === "workers") {
    return "O template Pino usa transportes de Node (pino-pretty); em Workers exige setup diferente (use Bun/Node)";
  }
  return null;
}

export function getAddonDisableReason(
  cfg: ProjectConfig,
  id: AddonId,
): DisableReason {
  if (id === "husky" && cfg.addons.includes("lefthook")) {
    return "Incompatível com Lefthook — escolha um gerenciador de hooks";
  }
  if (id === "lefthook" && cfg.addons.includes("husky")) {
    return "Incompatível com Husky — escolha um gerenciador de hooks";
  }
  if (id === "biome" && cfg.addons.includes("oxlint")) {
    return "Incompatível com oxlint — escolha um linter/formatador";
  }
  if (id === "oxlint" && cfg.addons.includes("biome")) {
    return "Incompatível com Biome — escolha um linter/formatador";
  }
  return null;
}

/** Integrations shown under the Brasil step (flag `brazilian` on module meta). */
export function isBrazilModule(id: ModuleId): boolean {
  return MODULES[id].brazilian === true;
}

/**
 * Fields the caller set via CLI flags (or another explicit source).
 * Omitted fields may receive implicit defaults — same rules as the web stack builder.
 */
export type ExplicitStackFields = {
  frontend?: boolean;
  backend?: boolean;
  runtime?: boolean;
};

/** Shown when choosing Next.js frontend without an explicit separate backend. */
export const FRONTEND_NEXT_BACKEND_CASCADE_REASON =
  "Com frontend Next.js, as APIs nativas (Route Handlers em /app/api) ficam no mesmo app — sem servidor separado";

/** Shown when leaving Next.js frontend while backend was Route Handlers. */
export const LEAVE_NEXT_BACKEND_CASCADE_REASON =
  "Route Handlers do Next só funcionam com frontend Next.js";

/** Shown when reverting Node runtime after leaving Next + Route Handlers. */
export const LEAVE_NEXT_RUNTIME_CASCADE_REASON =
  "Stack Hono + TanStack usa Bun como runtime padrão";

/**
 * Aligns CLI/non-interactive config with the web builder's cascades when the user
 * did not pass every related flag. Keeps split stacks (`--frontend next --backend hono`)
 * valid while making `--frontend next` alone mean native Route Handlers.
 */
export function applyImplicitStackRules(
  cfg: ProjectConfig,
  explicit: ExplicitStackFields = {},
): ProjectConfig {
  const next = { ...cfg };

  if (
    next.frontend === "next" &&
    !explicit.backend &&
    next.backend !== "next" &&
    next.backend !== "none"
  ) {
    next.backend = "next";
  }

  if (next.frontend !== "next" && !explicit.backend && next.backend === "next") {
    next.backend = "hono";
    if (!explicit.runtime && next.runtime === "node") {
      next.runtime = "bun";
    }
  }

  return next;
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
  pushIf(getUiDisableReason(cfg, cfg.ui), "ui");

  // Cross-field invariants the per-field helpers don't cover
  if (cfg.auth === "better-auth" && cfg.db === "none") {
    errors.push(
      "auth: Better Auth precisa de um banco (usa o adapter Drizzle no packages/db)",
    );
  }
  if (cfg.auth === "better-auth" && cfg.runtime === "workers") {
    errors.push(
      "auth: Better Auth não está disponível em Cloudflare Workers neste template — use Bun ou Node",
    );
  }
  if (cfg.desktop === "tauri" && cfg.frontend === "none") {
    errors.push(
      "desktop: Tauri precisa de um frontend web — ele empacota a UI numa janela nativa",
    );
  }

  for (const m of cfg.modules) {
    pushIf(getModuleDisableReason(cfg, m), `módulo ${m}`);
  }

  if (cfg.addons.includes("biome") && cfg.addons.includes("oxlint")) {
    errors.push("addons: Biome e oxlint não podem ser usados juntos no mesmo projeto");
  }
  if (cfg.oxlintStrict && !cfg.addons.includes("oxlint")) {
    errors.push("addons: oxlint strict requer o addon oxlint");
  }
  if (cfg.addons.includes("husky") && cfg.addons.includes("lefthook")) {
    errors.push(
      "addons: Husky e Lefthook não podem ser usados juntos — escolha um gerenciador de hooks",
    );
  }
  if (cfg.lefthookCi && !cfg.addons.includes("lefthook")) {
    errors.push("lefthookCi: CI local/GitHub exige o addon Lefthook");
  }
  if (cfg.lefthookAdvanced && !cfg.addons.includes("lefthook")) {
    errors.push("lefthookAdvanced: modo avançado exige o addon Lefthook");
  }
  if (cfg.lefthookCi && cfg.lefthookAdvanced) {
    errors.push(
      "lefthook: escolha CI básico ou avançado — não use lefthookCi e lefthookAdvanced juntos",
    );
  }
  return errors;
}
