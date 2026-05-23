import type { AddonId, ModuleId, ProjectConfig } from "./index";
import { MODULES } from "./modules";

/** Human-readable reason an axis value is disabled in the picker, or `null` when allowed. */
export type DisableReason = string | null;

/** Returns a disable reason for the frontend axis, or `null` if allowed. */
export function getFrontendDisableReason(
  _cfg: ProjectConfig,
  _id: ProjectConfig["frontend"],
): DisableReason {
  // Frontends don't constrain the server stack. Native apps (Expo) ship
  // to the app stores on their own pipeline; their database / deploy
  // target / runtime all belong to the server the app talks to.
  return null;
}

/** Returns a Portuguese disable reason when this backend choice is invalid for `cfg`, or `null` if allowed. */
export function getBackendDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["backend"],
): DisableReason {
  if (id === "express" || id === "fastify" || id === "elysia") {
    return "Em breve";
  }
  if (id === "next" && cfg.frontend !== "next") {
    return "Backend Next só funciona com frontend Next.js";
  }
  if (id !== "hono" && id !== "none" && cfg.runtime === "workers") {
    return "Cloudflare Workers só suporta Hono por enquanto";
  }
  return null;
}

function getWorkersRuntimeDisableReason(cfg: ProjectConfig): DisableReason {
  if (cfg.backend === "next") {
    return "Route Handlers do Next.js não rodam em Cloudflare Workers";
  }
  if (cfg.backend !== "hono" && cfg.backend !== "none") {
    return "Runtime Workers precisa de backend Hono";
  }
  if (cfg.deploy !== "cloudflare" && cfg.deploy !== "none") {
    return "Runtime Workers só faz deploy no Cloudflare";
  }
  if (cfg.auth === "better-auth") {
    return "Better Auth no Workers exige Hyperdrive/D1 — use runtime Bun ou Node por enquanto";
  }
  return null;
}

/** Returns a disable reason for the runtime axis, or `null` if allowed. */
export function getRuntimeDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["runtime"],
): DisableReason {
  if (id === "workers") {
    return getWorkersRuntimeDisableReason(cfg);
  }
  return null;
}

function getDrizzleOrmDisableReason(cfg: ProjectConfig): DisableReason {
  if (cfg.db === "none" || cfg.db === "postgres" || cfg.db === "sqlite") {
    return null;
  }
  return "Em breve";
}

/** Returns a disable reason for the ORM axis, or `null` if allowed. */
export function getOrmDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["orm"],
): DisableReason {
  if (id === "mongoose") {
    return "Em breve";
  }
  if (id === "drizzle") {
    return getDrizzleOrmDisableReason(cfg);
  }
  if (cfg.db === "none" && id !== "none") {
    return "Nenhum banco selecionado";
  }
  return null;
}

const DB_HOSTING_DB_MISMATCH: Partial<
  Record<ProjectConfig["dbHosting"], string>
> = {
  neon: "Neon é só Postgres",
  supabase: "Supabase é só Postgres",
  planetscale: "PlanetScale é só MySQL",
  turso: "Turso é só SQLite",
  "mongodb-atlas": "Atlas é só MongoDB",
};

const DB_HOSTING_REQUIRED_DB: Partial<
  Record<ProjectConfig["dbHosting"], ProjectConfig["db"]>
> = {
  neon: "postgres",
  supabase: "postgres",
  planetscale: "mysql",
  turso: "sqlite",
  "mongodb-atlas": "mongodb",
};

/** Returns a disable reason for the database hosting axis, or `null` if allowed. */
export function getDbHostingDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["dbHosting"],
): DisableReason {
  if (cfg.db === "none" && id !== "none") {
    return "Nenhum banco selecionado";
  }
  const requiredDb = DB_HOSTING_REQUIRED_DB[id];
  if (requiredDb && cfg.db !== requiredDb) {
    return DB_HOSTING_DB_MISMATCH[id] ?? null;
  }
  return null;
}

/** Returns a disable reason for the deploy axis, or `null` if allowed. */
export function getDeployDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["deploy"],
): DisableReason {
  if (
    id === "cloudflare" &&
    cfg.runtime !== "workers" &&
    cfg.runtime !== "node"
  ) {
    return "Deploy no Cloudflare precisa de runtime workers ou node";
  }
  if (id === "cloudflare" && cfg.backend === "next") {
    return "Backend Next não faz deploy no Cloudflare — use Vercel ou Veloz";
  }
  return null;
}

/** Returns a disable reason for the UI axis, or `null` if allowed. */
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

/** Returns a disable reason for the API axis, or `null` if allowed. */
export function getApiDisableReason(
  cfg: ProjectConfig,
  id: ProjectConfig["api"],
): DisableReason {
  if (cfg.backend === "none" && id !== "none") {
    return "Nenhum backend selecionado";
  }
  if (id === "trpc" || id === "rest") {
    return "Em breve";
  }
  return null;
}

/** Returns a disable reason for the auth axis, or `null` if allowed. */
export function getAuthDisableReason(
  _cfg: ProjectConfig,
  id: ProjectConfig["auth"],
): DisableReason {
  if (id === "clerk") {
    return "Em breve";
  }
  return null;
}

function getModuleRequiresDisableReason(
  cfg: ProjectConfig,
  meta: (typeof MODULES)[ModuleId],
): DisableReason {
  if (meta.requires?.auth && cfg.auth === "none") {
    return "Precisa do Better Auth";
  }
  if (meta.requires?.backend && cfg.backend === "none") {
    return "Precisa de um backend";
  }
  if (meta.requires?.db && cfg.db === "none") {
    return "Precisa de um banco";
  }
  return null;
}

function getNextIntlModuleDisableReason(
  cfg: ProjectConfig,
  id: ModuleId,
): DisableReason {
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
  return null;
}

function getWorkersModuleDisableReason(
  cfg: ProjectConfig,
  id: ModuleId,
): DisableReason {
  if (id === "opentelemetry" && cfg.runtime === "workers") {
    return "@opentelemetry/sdk-node não roda em Cloudflare Workers (use Bun/Node)";
  }
  if (id === "pino" && cfg.runtime === "workers") {
    return "O template Pino usa transportes de Node (pino-pretty); em Workers exige setup diferente (use Bun/Node)";
  }
  return null;
}

/** Returns a disable reason for an integration module, or `null` if allowed. */
export function getModuleDisableReason(
  cfg: ProjectConfig,
  id: ModuleId,
): DisableReason {
  const meta = MODULES[id];
  if (meta.comingSoon) {
    return "Em breve";
  }

  const requiresReason = getModuleRequiresDisableReason(cfg, meta);
  if (requiresReason) {
    return requiresReason;
  }

  const nextIntlReason = getNextIntlModuleDisableReason(cfg, id);
  if (nextIntlReason) {
    return nextIntlReason;
  }

  return getWorkersModuleDisableReason(cfg, id);
}

/** Returns a disable reason for a monorepo addon, or `null` if allowed. */
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
export interface ExplicitStackFields {
  frontend?: boolean;
  backend?: boolean;
  runtime?: boolean;
}

/** Shown when choosing Next.js frontend without an explicit separate backend. */
export const FRONTEND_NEXT_BACKEND_CASCADE_REASON =
  "Com frontend Next.js, as APIs nativas (Route Handlers em /app/api) ficam no mesmo app — sem servidor separado";

/** Shown when leaving Next.js frontend while backend was Route Handlers. */
export const LEAVE_NEXT_BACKEND_CASCADE_REASON =
  "Route Handlers do Next só funcionam com frontend Next.js";

/** Shown when reverting Node runtime after leaving Next + Route Handlers. */
export const LEAVE_NEXT_RUNTIME_CASCADE_REASON =
  "Stack Hono + TanStack usa Bun como runtime padrão";

function applyNextFrontendBackendRule(
  cfg: ProjectConfig,
  explicit: ExplicitStackFields,
): void {
  if (
    cfg.frontend === "next" &&
    !explicit.backend &&
    cfg.backend !== "next" &&
    cfg.backend !== "none"
  ) {
    cfg.backend = "next";
  }
}

function applyLeaveNextFrontendBackendRule(
  cfg: ProjectConfig,
  explicit: ExplicitStackFields,
): void {
  if (cfg.frontend !== "next" && !explicit.backend && cfg.backend === "next") {
    cfg.backend = "hono";
    if (!explicit.runtime && cfg.runtime === "node") {
      cfg.runtime = "bun";
    }
  }
}

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
  applyNextFrontendBackendRule(next, explicit);
  applyLeaveNextFrontendBackendRule(next, explicit);
  return next;
}

interface AxisValidator {
  prefix: string;
  reason: (cfg: ProjectConfig) => DisableReason;
}

const AXIS_VALIDATORS: AxisValidator[] = [
  {
    prefix: "frontend",
    reason: (cfg) => getFrontendDisableReason(cfg, cfg.frontend),
  },
  {
    prefix: "backend",
    reason: (cfg) => getBackendDisableReason(cfg, cfg.backend),
  },
  {
    prefix: "runtime",
    reason: (cfg) => getRuntimeDisableReason(cfg, cfg.runtime),
  },
  { prefix: "api", reason: (cfg) => getApiDisableReason(cfg, cfg.api) },
  { prefix: "auth", reason: (cfg) => getAuthDisableReason(cfg, cfg.auth) },
  { prefix: "orm", reason: (cfg) => getOrmDisableReason(cfg, cfg.orm) },
  {
    prefix: "dbHosting",
    reason: (cfg) => getDbHostingDisableReason(cfg, cfg.dbHosting),
  },
  {
    prefix: "deploy",
    reason: (cfg) => getDeployDisableReason(cfg, cfg.deploy),
  },
  { prefix: "ui", reason: (cfg) => getUiDisableReason(cfg, cfg.ui) },
];

function collectAxisValidationErrors(cfg: ProjectConfig): string[] {
  const errors: string[] = [];
  for (const axis of AXIS_VALIDATORS) {
    const reason = axis.reason(cfg);
    if (reason) {
      errors.push(`${axis.prefix}: ${reason}`);
    }
  }
  return errors;
}

function collectCrossFieldValidationErrors(cfg: ProjectConfig): string[] {
  const errors: string[] = [];
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
  return errors;
}

function collectModuleValidationErrors(cfg: ProjectConfig): string[] {
  const errors: string[] = [];
  for (const moduleId of cfg.modules) {
    const reason = getModuleDisableReason(cfg, moduleId);
    if (reason) {
      errors.push(`módulo ${moduleId}: ${reason}`);
    }
  }
  return errors;
}

interface AddonValidationRule {
  when: (cfg: ProjectConfig) => boolean;
  message: string;
}

const ADDON_VALIDATION_RULES: AddonValidationRule[] = [
  {
    when: (cfg) =>
      cfg.addons.includes("biome") && cfg.addons.includes("oxlint"),
    message:
      "addons: Biome e oxlint não podem ser usados juntos no mesmo projeto",
  },
  {
    when: (cfg) => cfg.oxlintStrict && !cfg.addons.includes("oxlint"),
    message: "addons: oxlint strict requer o addon oxlint",
  },
  {
    when: (cfg) =>
      cfg.addons.includes("husky") && cfg.addons.includes("lefthook"),
    message:
      "addons: Husky e Lefthook não podem ser usados juntos — escolha um gerenciador de hooks",
  },
  {
    when: (cfg) => cfg.lefthookCi && !cfg.addons.includes("lefthook"),
    message: "lefthookCi: CI local/GitHub exige o addon Lefthook",
  },
  {
    when: (cfg) => cfg.lefthookAdvanced && !cfg.addons.includes("lefthook"),
    message: "lefthookAdvanced: modo avançado exige o addon Lefthook",
  },
  {
    when: (cfg) => cfg.lefthookCi && cfg.lefthookAdvanced,
    message:
      "lefthook: escolha CI básico ou avançado — não use lefthookCi e lefthookAdvanced juntos",
  },
];

function collectAddonValidationErrors(cfg: ProjectConfig): string[] {
  return ADDON_VALIDATION_RULES.filter((rule) => rule.when(cfg)).map(
    (rule) => rule.message,
  );
}

/**
 * Validates a stack configuration. Returns human-readable errors (`"axis: reason"`), empty when valid.
 * Used by the web builder, CLI, and generator before emitting files.
 */
export function validateConfig(cfg: ProjectConfig): string[] {
  return [
    ...collectAxisValidationErrors(cfg),
    ...collectCrossFieldValidationErrors(cfg),
    ...collectModuleValidationErrors(cfg),
    ...collectAddonValidationErrors(cfg),
  ];
}
