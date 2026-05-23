import {
  applyImplicitStackRules,
  FRONTEND_NEXT_BACKEND_CASCADE_REASON,
  getModuleDisableReason,
  LEAVE_NEXT_RUNTIME_CASCADE_REASON,
} from "./compatibility";
import type { ModuleId, ProjectConfig } from "./index";
import { MODULES } from "./modules";
import type { ConfigChange } from "./resolve-stack-types";

interface ModuleEnsureContext {
  proposed: ProjectConfig;
  changes: ConfigChange[];
  moduleId: ModuleId;
  block: string;
}

function ensureAuthForModule(ctx: ModuleEnsureContext): void {
  if (ctx.proposed.auth !== "none") {
    return;
  }
  ctx.changes.push({
    key: "auth",
    from: "none",
    to: "better-auth",
    reason: ctx.block,
  });
  ctx.proposed.auth = "better-auth";
}

function ensureBackendForModule(ctx: ModuleEnsureContext): void {
  if (ctx.proposed.backend !== "none") {
    return;
  }
  ctx.changes.push({
    key: "backend",
    from: "none",
    to: "hono",
    reason: ctx.block,
  });
  ctx.proposed.backend = "hono";
}

function ensureDbForModule(ctx: ModuleEnsureContext): void {
  if (ctx.proposed.db !== "none") {
    return;
  }
  ctx.changes.push({
    key: "db",
    from: "none",
    to: "postgres",
    reason: ctx.block,
  });
  ctx.proposed.db = "postgres";
}

function ensureNextFrontendForModule(ctx: ModuleEnsureContext): ProjectConfig {
  if (ctx.moduleId !== "next-intl" || ctx.proposed.frontend === "next") {
    return ctx.proposed;
  }

  const beforeCascade = { ...ctx.proposed, frontend: "next" as const };
  const withCascade = applyImplicitStackRules(beforeCascade, {
    backend: false,
    runtime: false,
  });

  ctx.changes.push({
    key: "frontend",
    from: ctx.proposed.frontend,
    to: "next",
    reason: ctx.block,
  });
  if (beforeCascade.backend !== withCascade.backend) {
    ctx.changes.push({
      key: "backend",
      from: beforeCascade.backend,
      to: withCascade.backend,
      reason: FRONTEND_NEXT_BACKEND_CASCADE_REASON,
    });
  }
  if (beforeCascade.runtime !== withCascade.runtime) {
    ctx.changes.push({
      key: "runtime",
      from: beforeCascade.runtime,
      to: withCascade.runtime,
      reason: LEAVE_NEXT_RUNTIME_CASCADE_REASON,
    });
  }

  return { ...withCascade, modules: ctx.proposed.modules };
}

function ensureRuntimeForObservabilityModule(ctx: ModuleEnsureContext): void {
  if (
    (ctx.moduleId !== "pino" && ctx.moduleId !== "opentelemetry") ||
    ctx.proposed.runtime !== "workers"
  ) {
    return;
  }
  ctx.changes.push({
    key: "runtime",
    from: "workers",
    to: "bun",
    reason: ctx.block,
  });
  ctx.proposed.runtime = "bun";
}

function buildEnabledModuleList(
  proposed: ProjectConfig,
  moduleId: ModuleId,
  changes: ConfigChange[],
): ModuleId[] {
  let modules = proposed.modules.includes(moduleId)
    ? proposed.modules
    : [...proposed.modules, moduleId];

  if (
    moduleId === "next-intl" &&
    proposed.frontend === "next" &&
    modules.includes("pt-br-i18n")
  ) {
    modules = modules.filter((entry) => entry !== "pt-br-i18n");
    changes.push({
      key: "modules",
      from: "pt-br-i18n",
      to: null,
      reason: "next-intl substitui pt-BR i18n no App Router",
    });
  }

  return modules;
}

function rejectComingSoonModule(
  cfg: ProjectConfig,
  moduleName: string,
): { newCfg: ProjectConfig; changes: ConfigChange[] } {
  return {
    newCfg: cfg,
    changes: [
      {
        key: "modules",
        from: "—",
        to: null,
        reason: `${moduleName} está em breve`,
      },
    ],
  };
}

/** Turn on a module, repairing stack fields first when {@link getModuleDisableReason} blocks it. */
export function resolveEnableModule(
  cfg: ProjectConfig,
  moduleId: ModuleId,
): { newCfg: ProjectConfig; changes: ConfigChange[] } {
  const meta = MODULES[moduleId];
  if (meta.comingSoon) {
    return rejectComingSoonModule(cfg, meta.name);
  }

  const block = getModuleDisableReason(cfg, moduleId);
  if (!block) {
    return {
      newCfg: {
        ...cfg,
        modules: cfg.modules.includes(moduleId)
          ? cfg.modules
          : [...cfg.modules, moduleId],
        preset: "custom",
      },
      changes: [],
    };
  }

  let proposed = { ...cfg };
  const changes: ConfigChange[] = [];
  const ctx: ModuleEnsureContext = { proposed, changes, moduleId, block };

  if (meta.requires?.auth) {
    ensureAuthForModule(ctx);
  }
  if (meta.requires?.backend) {
    ensureBackendForModule(ctx);
  }
  if (meta.requires?.db) {
    ensureDbForModule(ctx);
  }

  proposed = ensureNextFrontendForModule(ctx);
  ensureRuntimeForObservabilityModule(ctx);

  const modules = buildEnabledModuleList(proposed, moduleId, changes);
  changes.push({
    key: "modules",
    from: "—",
    to: moduleId,
    reason: `Ativar ${meta.name}`,
  });

  return { newCfg: { ...proposed, modules, preset: "custom" }, changes };
}
