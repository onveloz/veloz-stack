import { DEFAULT_CONFIG } from "@veloz-stack/types";

import type { ProjectConfig } from "@/lib/veloz-stack-types";

const STACK_KEYS = [
  "frontend",
  "backend",
  "runtime",
  "api",
  "db",
  "orm",
  "dbHosting",
  "auth",
  "deploy",
  "pm",
  "ui",
] as const satisfies readonly (keyof ProjectConfig)[];

function createHead(runner: ProjectConfig["pm"]): string {
  if (runner === "bun") {
    return "bun create veloz-stack@latest";
  }
  if (runner === "pnpm") {
    return "pnpm create veloz-stack@latest";
  }
  return "npm create veloz-stack@latest --";
}

function stackFlags(cfg: ProjectConfig): string[] {
  const flags: string[] = [];
  for (const key of STACK_KEYS) {
    const val = cfg[key];
    const dflt = DEFAULT_CONFIG[key];
    if (val !== dflt) {
      flags.push(`--${kebab(key)} ${val}`);
    }
  }
  return flags;
}

function moduleAndExampleFlags(cfg: ProjectConfig): string[] {
  const flags: string[] = [];
  const defaultModules = [...DEFAULT_CONFIG.modules].toSorted().join(",");
  const selectedModules = [...cfg.modules].toSorted().join(",");
  if (selectedModules !== defaultModules) {
    flags.push(`--modules ${selectedModules || "''"}`);
  }
  if (cfg.examples.length > 0) {
    flags.push(`--examples ${cfg.examples.join(",")}`);
  }
  return flags;
}

function addonFlags(cfg: ProjectConfig): string[] {
  const defaultAddons = [...DEFAULT_CONFIG.addons].toSorted().join(",");
  const selectedAddons = [...cfg.addons].toSorted().join(",");
  if (selectedAddons === defaultAddons) {
    return [];
  }
  return [`--addons ${selectedAddons || "''"}`];
}

function toolingFlags(cfg: ProjectConfig): string[] {
  const flags: string[] = [];
  if (cfg.lefthookCi) {
    flags.push("--lefthook-ci");
  }
  if (cfg.lefthookAdvanced) {
    flags.push("--lefthook-advanced");
  }
  if (!cfg.install) {
    flags.push("--no-install");
  }
  if (!cfg.git) {
    flags.push("--no-git");
  }
  if (cfg.oxlintStrict) {
    flags.push("--oxlint-strict");
  }
  flags.push("--yes");
  return flags;
}

function sanitizeProjectName(name: string): string {
  const normalized = name.trim() || DEFAULT_CONFIG.projectName;
  const sanitized = normalized
    .replaceAll(/[^a-zA-Z0-9._-]/g, "-")
    .replaceAll(/^-+/g, "");
  return sanitized || DEFAULT_CONFIG.projectName;
}

/**
 * Build a copy-paste CLI command for the current stack config.
 * Omits flags that match {@link DEFAULT_CONFIG}; emits explicit `--modules ''` when
 * modules are cleared so the CLI does not re-apply default-on modules.
 */
export function buildCommand(
  cfg: ProjectConfig,
  opts?: { pm?: "bun" | "pnpm" | "npm" },
): string {
  const runner = opts?.pm ?? cfg.pm;
  const head = createHead(runner);
  const projectName = sanitizeProjectName(cfg.projectName);
  const flags = [
    ...stackFlags(cfg),
    ...moduleAndExampleFlags(cfg),
    ...addonFlags(cfg),
    ...toolingFlags(cfg),
  ];

  return `${head} ${projectName} ${flags.join(" ")}`
    .replaceAll(/\s+/g, " ")
    .trim();
}

function kebab(s: string): string {
  return s.replaceAll(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
