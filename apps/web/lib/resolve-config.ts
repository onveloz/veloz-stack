import {
  ApiId,
  AuthId,
  BackendId,
  DbHostingId,
  DbId,
  DeployId,
  FrontendId,
  ModuleId,
  OrmId,
  PackageManagerId,
  RuntimeId,
  UiId,
  getApiDisableReason,
  getBackendDisableReason,
  getDbHostingDisableReason,
  getDeployDisableReason,
  getFrontendDisableReason,
  getModuleDisableReason,
  getOrmDisableReason,
  getRuntimeDisableReason,
  getUiDisableReason,
  validateConfig,
  type ProjectConfig,
} from "@veloz-stack/types";
import { MODULES } from "@veloz-stack/types";
import {
  addonFlagsAfterGitHook,
  addonFlagsAfterLinter,
  getGitHookChoice,
  getLinterChoice,
  patchAddonsForGitHook,
  patchAddonsForLinter,
} from "@/lib/stack-addons";

export type ConfigChange = {
  key: keyof ProjectConfig | "modules";
  from: string;
  to: string | null;
  reason: string;
};

type StackKey = Extract<
  keyof ProjectConfig,
  "frontend" | "backend" | "runtime" | "api" | "orm" | "dbHosting" | "deploy" | "ui"
>;

const RESOLVERS: Array<{
  key: StackKey;
  options: readonly string[];
  check: (cfg: ProjectConfig, id: any) => string | null;
}> = [
  { key: "frontend", options: FrontendId.options, check: getFrontendDisableReason },
  { key: "backend", options: BackendId.options, check: getBackendDisableReason },
  { key: "runtime", options: RuntimeId.options, check: getRuntimeDisableReason },
  { key: "api", options: ApiId.options, check: getApiDisableReason },
  { key: "orm", options: OrmId.options, check: getOrmDisableReason },
  { key: "dbHosting", options: DbHostingId.options, check: getDbHostingDisableReason },
  { key: "deploy", options: DeployId.options, check: getDeployDisableReason },
  { key: "ui", options: UiId.options, check: getUiDisableReason },
];

/**
 * Apply a proposed change, then iteratively repair any cascading
 * incompatibilities by picking the first valid alternative for each
 * field. Returns the resulting config plus the list of changes
 * (including the original one the user requested).
 */
export function resolveConfig(
  cfg: ProjectConfig,
  pending: { key: keyof ProjectConfig; value: string },
): { newCfg: ProjectConfig; changes: ConfigChange[] } {
  const proposed = { ...cfg, [pending.key]: pending.value } as ProjectConfig;
  const cascadesBeforePrimary: ConfigChange[] = [];

  // Next.js App Router: prefer native Route Handlers (same-origin API routes)
  if (
    pending.key === "frontend" &&
    pending.value === "next" &&
    proposed.backend !== "next"
  ) {
    cascadesBeforePrimary.push({
      key: "backend",
      from: String(proposed.backend),
      to: "next",
      reason:
        "Com frontend Next.js, as APIs nativas (Route Handlers em /app/api) ficam no mesmo app — sem servidor separado",
    });
    proposed.backend = "next";
  }
  if (
    pending.key === "frontend" &&
    pending.value !== "next" &&
    proposed.backend === "next"
  ) {
    cascadesBeforePrimary.push({
      key: "backend",
      from: "next",
      to: "hono",
      reason: "Route Handlers do Next só funcionam com frontend Next.js",
    });
    proposed.backend = "hono";
    if (proposed.runtime === "node") {
      cascadesBeforePrimary.push({
        key: "runtime",
        from: "node",
        to: "bun",
        reason: "Stack Hono + TanStack usa Bun como runtime padrão",
      });
      proposed.runtime = "bun";
    }
  }

  // Primary change first — confirm dialog uses changes[0] + slice(1) for cascades
  const originReason = findReason(cfg, pending.key, pending.value);
  const changes: ConfigChange[] = [
    {
      key: pending.key,
      from: String((cfg as any)[pending.key]),
      to: String(pending.value),
      reason: originReason ?? "Mudança solicitada",
    },
    ...cascadesBeforePrimary,
  ];

  satisfyPendingChoice(proposed, pending, changes);

  // Iteratively repair until stable
  for (let pass = 0; pass < 6; pass++) {
    let dirty = false;
    for (const r of RESOLVERS) {
      if (r.key === pending.key) continue;
      const currentReason = r.check(proposed, (proposed as any)[r.key]);
      if (!currentReason) continue;
      const next = r.options.find((o) => !r.check(proposed, o));
      if (next && next !== (proposed as any)[r.key]) {
        changes.push({
          key: r.key,
          from: String((proposed as any)[r.key]),
          to: next,
          reason: currentReason,
        });
        (proposed as any)[r.key] = next;
        dirty = true;
      }
    }
    if (!dirty) break;
  }

  // Drop modules no longer valid
  const droppedModules: ModuleId[] = [];
  const keptModules = proposed.modules.filter((m) => {
    if (getModuleDisableReason(proposed, m)) {
      droppedModules.push(m);
      return false;
    }
    return true;
  });
  for (const m of droppedModules) {
    changes.push({
      key: "modules",
      from: m,
      to: null,
      reason: getModuleDisableReason(cfg, m) ?? "Incompatível",
    });
  }
  proposed.modules = keptModules;

  return { newCfg: proposed, changes };
}

/** Repair cross-field incompatibilities without recording cascade changes (Surpreender, etc.). */
export function repairStackConfig(cfg: ProjectConfig): ProjectConfig {
  let proposed = { ...cfg, modules: [...cfg.modules], addons: [...cfg.addons] };

  for (let pass = 0; pass < 10; pass++) {
    let dirty = false;
    for (const r of RESOLVERS) {
      const current = (proposed as Record<string, unknown>)[r.key] as string;
      const currentReason = r.check(proposed, current as never);
      if (!currentReason) continue;
      const next = r.options.find((o) => !r.check(proposed, o));
      if (next && next !== current) {
        (proposed as Record<string, unknown>)[r.key] = next;
        dirty = true;
      }
    }

    const keptModules = proposed.modules.filter((m) => !getModuleDisableReason(proposed, m));
    if (keptModules.length !== proposed.modules.length) {
      proposed.modules = keptModules;
      dirty = true;
    }

    if (
      proposed.frontend === "next" &&
      proposed.modules.includes("next-intl") &&
      proposed.modules.includes("pt-br-i18n")
    ) {
      proposed.modules = proposed.modules.filter((m) => m !== "pt-br-i18n");
      dirty = true;
    }

    const linter = getLinterChoice(proposed.addons);
    const patchedLinter = patchAddonsForLinter(proposed.addons, linter);
    const gitHook = getGitHookChoice(proposed.addons);
    const patchedHooks = patchAddonsForGitHook(patchedLinter, gitHook);
    if (
      patchedHooks.length !== proposed.addons.length ||
      patchedHooks.some((a, i) => a !== proposed.addons[i])
    ) {
      proposed.addons = patchedHooks;
      dirty = true;
    }

    proposed = {
      ...proposed,
      ...addonFlagsAfterLinter(linter),
      ...addonFlagsAfterGitHook(gitHook),
    };
    if (proposed.lefthookCi && proposed.lefthookAdvanced) {
      proposed.lefthookAdvanced = false;
      dirty = true;
    }

    if (!dirty) break;
  }

  return proposed;
}

/** True when `validateConfig` reports no errors. */
export function isStackConfigValid(cfg: ProjectConfig): boolean {
  return validateConfig(cfg).length === 0;
}

/** Plan enabling a module that is currently blocked; returns prerequisite adjustments. */
export function resolveEnableModule(
  cfg: ProjectConfig,
  moduleId: ModuleId,
): { newCfg: ProjectConfig; changes: ConfigChange[] } {
  const block = getModuleDisableReason(cfg, moduleId);
  if (!block) {
    return {
      newCfg: {
        ...cfg,
        modules: cfg.modules.includes(moduleId) ? cfg.modules : [...cfg.modules, moduleId],
        preset: "custom",
      },
      changes: [],
    };
  }

  let proposed = { ...cfg } as ProjectConfig;
  const changes: ConfigChange[] = [];
  const meta = MODULES[moduleId];

  if (meta.requires?.auth && proposed.auth === "none") {
    changes.push({
      key: "auth",
      from: "none",
      to: "better-auth",
      reason: block,
    });
    proposed.auth = "better-auth";
  }
  if (meta.requires?.backend && proposed.backend === "none") {
    changes.push({
      key: "backend",
      from: "none",
      to: "hono",
      reason: block,
    });
    proposed.backend = "hono";
  }
  if (meta.requires?.db && proposed.db === "none") {
    changes.push({
      key: "db",
      from: "none",
      to: "postgres",
      reason: block,
    });
    proposed.db = "postgres";
  }

  if (moduleId === "next-intl" && proposed.frontend !== "next") {
    const resolved = resolveConfig(proposed, { key: "frontend", value: "next" });
    proposed = resolved.newCfg;
    changes.push(...resolved.changes);
  }

  if (
    (moduleId === "pino" || moduleId === "opentelemetry") &&
    proposed.runtime === "workers"
  ) {
    changes.push({
      key: "runtime",
      from: "workers",
      to: "bun",
      reason: block,
    });
    proposed.runtime = "bun";
  }

  let modules = proposed.modules.includes(moduleId)
    ? proposed.modules
    : [...proposed.modules, moduleId];

  if (
    moduleId === "next-intl" &&
    proposed.frontend === "next" &&
    modules.includes("pt-br-i18n")
  ) {
    modules = modules.filter((m) => m !== "pt-br-i18n");
    changes.push({
      key: "modules",
      from: "pt-br-i18n",
      to: null,
      reason: "next-intl substitui pt-BR i18n no App Router",
    });
  }

  changes.push({
    key: "modules",
    from: "—",
    to: moduleId,
    reason: `Ativar ${meta.name}`,
  });

  return { newCfg: { ...proposed, modules, preset: "custom" }, changes };
}

/**
 * When the user's pick is invalid with the current stack, adjust other fields
 * first (never revert the pending key) until the choice is valid or no progress.
 */
function satisfyPendingChoice(
  proposed: ProjectConfig,
  pending: { key: keyof ProjectConfig; value: string },
  changes: ConfigChange[],
) {
  const resolver = RESOLVERS.find((r) => r.key === (pending.key as StackKey));
  if (!resolver) return;

  for (let pass = 0; pass < 8; pass++) {
    const block = resolver.check(proposed, pending.value as never);
    if (!block) return;

    let fixed = false;
    for (const r of RESOLVERS) {
      if (r.key === pending.key) continue;
      for (const candidate of r.options) {
        const current = String((proposed as any)[r.key]);
        if (candidate === current) continue;
        if (r.check(proposed, candidate as never)) continue;
        const trial = { ...proposed, [r.key]: candidate } as ProjectConfig;
        if (resolver.check(trial, pending.value as never)) continue;
        changes.push({
          key: r.key,
          from: current,
          to: candidate,
          reason: block,
        });
        (proposed as any)[r.key] = candidate;
        fixed = true;
        break;
      }
      if (fixed) break;
    }
    if (!fixed) return;
  }
}

function findReason(
  cfg: ProjectConfig,
  key: keyof ProjectConfig,
  value: string,
): string | null {
  const r = RESOLVERS.find((x) => x.key === (key as StackKey));
  if (!r) return null;
  return r.check(cfg, value);
}

export function formatKey(key: ConfigChange["key"]): string {
  const map: Record<string, string> = {
    frontend: "Frontend",
    backend: "Backend",
    runtime: "Runtime",
    api: "API",
    db: "Banco",
    orm: "ORM",
    dbHosting: "Hospedagem",
    auth: "Auth",
    deploy: "Deploy",
    pm: "Package manager",
    ui: "UI",
    modules: "Módulo",
  };
  return map[key] ?? key;
}

// Unused guards for exhaustiveness — silence TS "unused" warnings
void AuthId;
void DbId;
void PackageManagerId;
