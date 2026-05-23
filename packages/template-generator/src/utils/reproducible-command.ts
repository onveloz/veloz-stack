import type { ProjectConfig } from "../project-config";
import { DEFAULT_CONFIG } from "@veloz-stack/types";

function flag(name: string, value: string | boolean | undefined): string[] {
  if (typeof value === "boolean") {
    return value ? [`--${name}`] : [];
  }
  if (value === undefined || value === "") {
    return [];
  }
  return [`--${name}`, value];
}

function listFlag(name: string, values: readonly string[]): string[] {
  if (values.length === 0) {
    return [];
  }
  return [`--${name}`, values.join(",")];
}

function hasShellMetacharacters(value: string): boolean {
  // Single quotes are omitted — shellEscape uses double quotes only.
  if (/[\s"`$\\]/.test(value)) {
    return true;
  }
  for (let i = 0; i < value.length; i++) {
    const code = value.codePointAt(i);
    if (code === undefined || code < 32 || code === 127) {
      return true;
    }
  }
  return false;
}

function shellEscape(value: string): string {
  if (!hasShellMetacharacters(value)) {
    return value;
  }
  return `"${value.replaceAll(/["\\`$]/g, String.raw`\$&`)}"`;
}

function createInvocation(pm: ProjectConfig["pm"]): string[] {
  if (pm === "bun") {
    return ["bun", "create", "veloz-stack@latest"];
  }
  if (pm === "pnpm") {
    return ["pnpm", "create", "veloz-stack@latest"];
  }
  return ["npm", "create", "veloz-stack@latest"];
}

interface AxisFlagSpec {
  readonly flag: string;
  readonly pick: (config: ProjectConfig) => string;
  readonly defaultPick: (defaults: ProjectConfig) => string;
}

const AXIS_FLAG_SPECS: readonly AxisFlagSpec[] = [
  { flag: "preset", pick: (c) => c.preset, defaultPick: (d) => d.preset },
  { flag: "frontend", pick: (c) => c.frontend, defaultPick: (d) => d.frontend },
  { flag: "mobile", pick: (c) => c.mobile, defaultPick: (d) => d.mobile },
  { flag: "desktop", pick: (c) => c.desktop, defaultPick: (d) => d.desktop },
  { flag: "backend", pick: (c) => c.backend, defaultPick: (d) => d.backend },
  { flag: "runtime", pick: (c) => c.runtime, defaultPick: (d) => d.runtime },
  { flag: "api", pick: (c) => c.api, defaultPick: (d) => d.api },
  { flag: "db", pick: (c) => c.db, defaultPick: (d) => d.db },
  { flag: "orm", pick: (c) => c.orm, defaultPick: (d) => d.orm },
  {
    flag: "db-hosting",
    pick: (c) => c.dbHosting,
    defaultPick: (d) => d.dbHosting,
  },
  { flag: "auth", pick: (c) => c.auth, defaultPick: (d) => d.auth },
  { flag: "deploy", pick: (c) => c.deploy, defaultPick: (d) => d.deploy },
  { flag: "pm", pick: (c) => c.pm, defaultPick: (d) => d.pm },
  { flag: "ui", pick: (c) => c.ui, defaultPick: (d) => d.ui },
];

function axisFlag(
  config: ProjectConfig,
  defaults: ProjectConfig,
  spec: AxisFlagSpec,
): string[] {
  const value = spec.pick(config);
  if (value === spec.defaultPick(defaults)) {
    return [];
  }
  return flag(spec.flag, value);
}

function axisFlags(config: ProjectConfig, defaults: ProjectConfig): string[] {
  return AXIS_FLAG_SPECS.flatMap((spec) => axisFlag(config, defaults, spec));
}

function listFlags(config: ProjectConfig): string[] {
  return [
    ...listFlag("modules", config.modules),
    ...listFlag("examples", config.examples),
    ...listFlag("addons", config.addons),
  ];
}

function booleanFlags(config: ProjectConfig): string[] {
  return [
    ...(config.oxlintStrict ? ["--oxlint-strict"] : []),
    ...(config.lefthookCi ? ["--lefthook-ci"] : []),
    ...(config.lefthookAdvanced ? ["--lefthook-advanced"] : []),
  ];
}

/**
 * CLI command that recreates this stack (mirrors create-veloz-stack flags).
 */
export function buildReproducibleCommand(config: ProjectConfig): string {
  const defaults = DEFAULT_CONFIG;
  const parts = [
    ...createInvocation(config.pm),
    shellEscape(config.projectName),
    ...axisFlags(config, defaults),
    ...listFlags(config),
    ...booleanFlags(config),
    "--yes",
  ].filter((part) => part !== "");

  return parts.join(" ");
}
