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
  getApiDisableReason,
  getBackendDisableReason,
  getDbHostingDisableReason,
  getDeployDisableReason,
  getFrontendDisableReason,
  getModuleDisableReason,
  getOrmDisableReason,
  getRuntimeDisableReason,
} from "@veloz-stack/types";
import type { ProjectConfig } from "@veloz-stack/types";

export type ConfigChange = {
  key: keyof ProjectConfig | "modules";
  from: string;
  to: string | null;
  reason: string;
};

type StackKey = Extract<
  keyof ProjectConfig,
  "frontend" | "backend" | "runtime" | "api" | "orm" | "dbHosting" | "deploy"
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
  const changes: ConfigChange[] = [];

  // Seed with the primary change and its reason (if any)
  const originReason = findReason(cfg, pending.key, pending.value);
  changes.push({
    key: pending.key,
    from: String((cfg as any)[pending.key]),
    to: String(pending.value),
    reason: originReason ?? "Change requested",
  });

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
      reason: getModuleDisableReason(cfg, m) ?? "Incompatible",
    });
  }
  proposed.modules = keptModules;

  return { newCfg: proposed, changes };
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
    db: "Database",
    orm: "ORM",
    dbHosting: "DB hosting",
    auth: "Auth",
    deploy: "Deploy",
    pm: "Package manager",
    modules: "Module",
  };
  return map[key] ?? key;
}

// Unused guards for exhaustiveness — silence TS "unused" warnings
void AuthId;
void DbId;
void PackageManagerId;
