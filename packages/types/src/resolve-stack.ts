import {
  applyImplicitStackRules,
  FRONTEND_NEXT_BACKEND_CASCADE_REASON,
  getModuleDisableReason,
  LEAVE_NEXT_BACKEND_CASCADE_REASON,
  LEAVE_NEXT_RUNTIME_CASCADE_REASON,
  validateConfig,
} from "./compatibility";
import type { ModuleId, ProjectConfig } from "./index";
import {
  assignStackAxisFromString,
  getStackAxisValue,
  RESOLVERS,
} from "./resolve-stack-axis";
/* oxlint-disable-next-line import/no-duplicate-imports, import/consistent-type-specifier-style -- split type import */
import type { StackKey } from "./resolve-stack-axis";
import { findReason, satisfyPendingChoice } from "./resolve-stack-pending";
import type { ConfigChange } from "./resolve-stack-types";

export type { ConfigChange } from "./resolve-stack-types";
export type { StackKey } from "./resolve-stack-axis";
export { isStackKey } from "./resolve-stack-axis";
export { resolveEnableModule } from "./resolve-stack-modules";

function getConfigStringValue(
  cfg: ProjectConfig,
  key: keyof ProjectConfig,
): string {
  const value = cfg[key];
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.join(",");
  }
  return `${value}`;
}

function applyPendingValue(
  cfg: ProjectConfig,
  pending: {
    key: Parameters<typeof assignStackAxisFromString>[1];
    value: string;
  },
): ProjectConfig {
  const next = { ...cfg };
  assignStackAxisFromString(next, pending.key, pending.value);
  return next;
}

function collectFrontendCascadeChanges(
  cfg: ProjectConfig,
  pendingValue: string,
): ConfigChange[] {
  const beforeCascade = applyPendingValue(cfg, {
    key: "frontend",
    value: pendingValue,
  });
  const withCascade = applyImplicitStackRules(beforeCascade, {
    backend: false,
    runtime: false,
  });
  const changes: ConfigChange[] = [];

  if (beforeCascade.backend !== withCascade.backend) {
    changes.push({
      key: "backend",
      from: beforeCascade.backend,
      to: withCascade.backend,
      reason:
        pendingValue === "next"
          ? FRONTEND_NEXT_BACKEND_CASCADE_REASON
          : LEAVE_NEXT_BACKEND_CASCADE_REASON,
    });
  }
  if (beforeCascade.runtime !== withCascade.runtime) {
    changes.push({
      key: "runtime",
      from: beforeCascade.runtime,
      to: withCascade.runtime,
      reason: LEAVE_NEXT_RUNTIME_CASCADE_REASON,
    });
  }

  return changes;
}

function findCompatibleStackOption(
  resolver: (typeof RESOLVERS)[number],
  proposed: ProjectConfig,
): { next: string; reason: string } | null {
  const current = getStackAxisValue(proposed, resolver.key);
  const currentReason = resolver.check(proposed, current);
  if (!currentReason) {
    return null;
  }
  const next = resolver.options.find(
    (option) => !resolver.check(proposed, option),
  );
  if (!next || next === current) {
    return null;
  }
  return { next, reason: currentReason };
}

function reconcileResolverPass(
  proposed: ProjectConfig,
  pendingKey: keyof ProjectConfig,
  changes: ConfigChange[],
): boolean {
  let dirty = false;
  for (const resolver of RESOLVERS) {
    if (resolver.key === pendingKey) {
      continue;
    }
    const repair = findCompatibleStackOption(resolver, proposed);
    if (!repair) {
      continue;
    }
    changes.push({
      key: resolver.key,
      from: getStackAxisValue(proposed, resolver.key),
      to: repair.next,
      reason: repair.reason,
    });
    assignStackAxisFromString(proposed, resolver.key, repair.next);
    dirty = true;
  }
  return dirty;
}

function reconcileResolverFields(
  proposed: ProjectConfig,
  pendingKey: keyof ProjectConfig,
  changes: ConfigChange[],
): void {
  for (let pass = 0; pass < 6; pass++) {
    if (!reconcileResolverPass(proposed, pendingKey, changes)) {
      break;
    }
  }
}

function collectDroppedModuleChanges(proposed: ProjectConfig): ConfigChange[] {
  const changes: ConfigChange[] = [];
  const keptModules: ModuleId[] = [];

  for (const moduleId of proposed.modules) {
    const reason = getModuleDisableReason(proposed, moduleId);
    if (reason) {
      changes.push({
        key: "modules",
        from: moduleId,
        to: null,
        reason,
      });
      continue;
    }
    keptModules.push(moduleId);
  }

  proposed.modules = keptModules;
  return changes;
}

/**
 * Apply a proposed stack change, then iteratively repair cascading
 * incompatibilities. Shared by the web picker and CLI surfaces.
 */
export function resolveStackChange(
  cfg: ProjectConfig,
  pending: {
    key: Parameters<typeof assignStackAxisFromString>[1];
    value: string;
  },
): { newCfg: ProjectConfig; changes: ConfigChange[] } {
  const proposed = applyPendingValue(cfg, pending);
  const cascadesBeforePrimary =
    pending.key === "frontend"
      ? collectFrontendCascadeChanges(cfg, pending.value)
      : [];

  if (cascadesBeforePrimary.length > 0) {
    Object.assign(
      proposed,
      applyImplicitStackRules(proposed, { backend: false, runtime: false }),
    );
  }

  const originReason = findReason(cfg, pending.key, pending.value);
  const changes: ConfigChange[] = [
    {
      key: pending.key,
      from: getConfigStringValue(cfg, pending.key),
      to: pending.value,
      reason: originReason ?? "Mudança solicitada",
    },
    ...cascadesBeforePrimary,
  ];

  satisfyPendingChoice(proposed, pending, changes);
  reconcileResolverFields(proposed, pending.key, changes);
  changes.push(...collectDroppedModuleChanges(proposed));

  return { newCfg: proposed, changes };
}

/** @deprecated Use `resolveStackChange` — kept for existing imports. */
export const resolveConfig = resolveStackChange;

function repairResolverFields(proposed: ProjectConfig): boolean {
  let dirty = false;
  for (const resolver of RESOLVERS) {
    const repair = findCompatibleStackOption(resolver, proposed);
    if (!repair) {
      continue;
    }
    assignStackAxisFromString(proposed, resolver.key, repair.next);
    dirty = true;
  }
  return dirty;
}

function repairModuleList(proposed: ProjectConfig): boolean {
  const keptModules = proposed.modules.filter(
    (moduleId) => !getModuleDisableReason(proposed, moduleId),
  );
  if (keptModules.length === proposed.modules.length) {
    return false;
  }
  proposed.modules = keptModules;
  return true;
}

function repairNextIntlConflict(proposed: ProjectConfig): boolean {
  if (
    proposed.frontend !== "next" ||
    !proposed.modules.includes("next-intl") ||
    !proposed.modules.includes("pt-br-i18n")
  ) {
    return false;
  }
  proposed.modules = proposed.modules.filter(
    (moduleId) => moduleId !== "pt-br-i18n",
  );
  return true;
}

/** Repair cross-field incompatibilities without recording cascade changes. */
export function repairStackConfigCore(cfg: ProjectConfig): ProjectConfig {
  const proposed = { ...cfg, modules: [...cfg.modules] };

  for (let pass = 0; pass < 10; pass++) {
    const dirty =
      repairResolverFields(proposed) ||
      repairModuleList(proposed) ||
      repairNextIntlConflict(proposed);
    if (!dirty) {
      break;
    }
  }

  return proposed;
}

/** True when {@link validateConfig} reports no blocking incompatibilities. */
export function isStackConfigValid(cfg: ProjectConfig): boolean {
  return validateConfig(cfg).length === 0;
}

/** Human-readable label for a {@link ConfigChange} key in UI copy. */
export function formatConfigChangeKey(key: ConfigChange["key"]): string {
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
