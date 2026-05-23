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
  if (cfg.modules.length > 0) {
    flags.push(`--modules ${cfg.modules.join(",")}`);
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

export function buildCommand(
  cfg: ProjectConfig,
  opts?: { pm?: "bun" | "pnpm" | "npm" },
): string {
  const runner = opts?.pm ?? cfg.pm;
  const head = createHead(runner);
  const flags = [
    ...stackFlags(cfg),
    ...moduleAndExampleFlags(cfg),
    ...addonFlags(cfg),
    ...toolingFlags(cfg),
  ];

  return `${head} ${cfg.projectName.trim() || DEFAULT_CONFIG.projectName} ${flags.join(" ")}`
    .replaceAll(/\s+/g, " ")
    .trim();
}

function kebab(s: string): string {
  return s.replaceAll(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
