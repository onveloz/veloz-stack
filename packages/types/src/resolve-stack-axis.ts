import {
  ApiId,
  AuthId,
  BackendId,
  DbHostingId,
  DeployId,
  FrontendId,
  getApiDisableReason,
  getAuthDisableReason,
  getBackendDisableReason,
  getDbHostingDisableReason,
  getDeployDisableReason,
  getFrontendDisableReason,
  getOrmDisableReason,
  getRuntimeDisableReason,
  getUiDisableReason,
  OrmId,
  RuntimeId,
  UiId,
} from "./index";
import type { ProjectConfig } from "./resolve-stack-types";

/** Stack axis field names handled by {@link resolveStackChange} cascades. */
export type StackKey = Extract<
  keyof ProjectConfig,
  | "frontend"
  | "backend"
  | "runtime"
  | "api"
  | "auth"
  | "orm"
  | "dbHosting"
  | "deploy"
  | "ui"
>;

const STACK_KEY_LIST: StackKey[] = [
  "frontend",
  "backend",
  "runtime",
  "api",
  "auth",
  "orm",
  "dbHosting",
  "deploy",
  "ui",
];

const STACK_KEYS = new Set<string>(STACK_KEY_LIST);

/** Resolver metadata for one stack axis (options + disable-reason check). */
export interface StackResolver {
  key: StackKey;
  options: readonly string[];
  check: (cfg: ProjectConfig, id: string) => string | null;
}

function parseAxisOption<T extends string>(
  options: readonly T[],
  value: string,
): T | null {
  for (const option of options) {
    if (option === value) {
      return option;
    }
  }
  return null;
}

function wrapAxisCheck<T extends string>(
  options: readonly T[],
  check: (cfg: ProjectConfig, id: T) => string | null,
): (cfg: ProjectConfig, id: string) => string | null {
  return (cfg, id) => {
    const parsed = parseAxisOption(options, id);
    if (!parsed) {
      return null;
    }
    return check(cfg, parsed);
  };
}

/** Ordered axis resolvers used by stack repair and cascade logic. */
export const RESOLVERS: StackResolver[] = [
  {
    key: "frontend",
    options: FrontendId.options,
    check: wrapAxisCheck(FrontendId.options, getFrontendDisableReason),
  },
  {
    key: "backend",
    options: BackendId.options,
    check: wrapAxisCheck(BackendId.options, getBackendDisableReason),
  },
  {
    key: "runtime",
    options: RuntimeId.options,
    check: wrapAxisCheck(RuntimeId.options, getRuntimeDisableReason),
  },
  {
    key: "api",
    options: ApiId.options,
    check: wrapAxisCheck(ApiId.options, getApiDisableReason),
  },
  {
    key: "auth",
    options: AuthId.options,
    check: wrapAxisCheck(AuthId.options, getAuthDisableReason),
  },
  {
    key: "orm",
    options: OrmId.options,
    check: wrapAxisCheck(OrmId.options, getOrmDisableReason),
  },
  {
    key: "dbHosting",
    options: DbHostingId.options,
    check: wrapAxisCheck(DbHostingId.options, getDbHostingDisableReason),
  },
  {
    key: "deploy",
    options: DeployId.options,
    check: wrapAxisCheck(DeployId.options, getDeployDisableReason),
  },
  {
    key: "ui",
    options: UiId.options,
    check: wrapAxisCheck(UiId.options, getUiDisableReason),
  },
];

const STACK_AXIS_OPTIONS: {
  [K in StackKey]: readonly ProjectConfig[K][];
} = {
  frontend: FrontendId.options,
  backend: BackendId.options,
  runtime: RuntimeId.options,
  api: ApiId.options,
  auth: AuthId.options,
  orm: OrmId.options,
  dbHosting: DbHostingId.options,
  deploy: DeployId.options,
  ui: UiId.options,
};

/** Type guard for {@link StackKey} fields on {@link ProjectConfig}. */
export function isStackKey(key: keyof ProjectConfig): key is StackKey {
  return STACK_KEYS.has(key);
}

/** Reads the current string value for a stack axis. */
export function getStackAxisValue(cfg: ProjectConfig, key: StackKey): string {
  return cfg[key];
}

/** Assigns a typed axis value on the in-memory config. */
export function setStackAxisValue<K extends StackKey>(
  cfg: ProjectConfig,
  key: K,
  value: ProjectConfig[K],
): void {
  cfg[key] = value;
}

/** Parses a string picker value and assigns it when it matches axis options. */
export function assignStackAxisFromString(
  cfg: ProjectConfig,
  key: StackKey,
  value: string,
): void {
  const options = STACK_AXIS_OPTIONS[key];
  const parsed = parseAxisOption(options, value);
  if (parsed !== null) {
    setStackAxisValue(cfg, key, parsed);
  }
}

/** Returns the resolver entry for an axis key, if defined. */
export function findResolver(key: StackKey): StackResolver | undefined {
  return RESOLVERS.find((resolver) => resolver.key === key);
}
