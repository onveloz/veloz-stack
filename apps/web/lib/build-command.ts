import type { ProjectConfig } from "@veloz-stack/types";
import { DEFAULT_CONFIG } from "@veloz-stack/types";

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

export function buildCommand(cfg: ProjectConfig, opts?: { pm?: "bun" | "pnpm" | "npm" }): string {
  const runner = opts?.pm ?? cfg.pm;
  const head =
    runner === "bun"
      ? "bun create veloz-stack@latest"
      : runner === "pnpm"
      ? "pnpm create veloz-stack@latest"
      : "npm create veloz-stack@latest --";

  const flags: string[] = [];
  for (const key of STACK_KEYS) {
    const val = cfg[key];
    const dflt = DEFAULT_CONFIG[key];
    if (val !== dflt) flags.push(`--${kebab(key)} ${val}`);
  }
  if (cfg.modules.length > 0) {
    flags.push(`--modules ${cfg.modules.join(",")}`);
  }
  if (cfg.examples.length > 0) {
    flags.push(`--examples ${cfg.examples.join(",")}`);
  }
  if (!cfg.install) flags.push("--no-install");
  if (!cfg.git) flags.push("--no-git");
  flags.push("--yes");

  return `${head} ${cfg.projectName} ${flags.join(" ")}`.replace(/\s+/g, " ").trim();
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}
