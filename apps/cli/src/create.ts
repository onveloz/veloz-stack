import chalk from "chalk";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  AddonId,
  DEFAULT_CONFIG,
  MODULE_IDS,
  PRESETS,
  type ProjectConfig,
  type ModuleId,
  validateConfig,
} from "@veloz-stack/types";
import { scaffold } from "@veloz-stack/template-generator";
import { gatherInteractive } from "./prompts.js";

export type CreateInput = Partial<ProjectConfig> & {
  projectName?: string;
  modules?: string;
  examples?: string;
  addons?: string;
  yes?: boolean;
  dryRun?: boolean;
};

export async function runCreate(input: CreateInput): Promise<void> {
  const base = resolvePreset(input.preset);
  const fromFlags = coerceFlags(input, base);
  const seeded: ProjectConfig = { ...base, ...fromFlags };

  const config = input.yes
    ? seeded
    : await gatherInteractive(seeded, input);

  const errors = validateConfig(config);
  if (errors.length > 0) {
    console.error(chalk.red("\n✗ Incompatible configuration:"));
    for (const e of errors) console.error("  • " + e);
    process.exit(1);
  }

  const target = resolve(process.cwd(), config.projectName);
  if (existsSync(target)) {
    console.error(
      chalk.red(`\n✗ Directory "${config.projectName}" already exists at ${target}`),
    );
    process.exit(1);
  }

  printSummary(config, target);

  if (input.dryRun) {
    console.log(chalk.yellow("\n--dry-run set — no files written."));
    return;
  }

  const { fileCount } = await scaffold(config, target);
  console.log(chalk.green(`\n✓ Wrote ${fileCount} files.`));
  console.log(chalk.dim(`  cd ${config.projectName}`));
  console.log(chalk.dim(`  ${config.pm} install`));
  console.log(chalk.dim(`  ${config.pm} dev`));

  if (config.deploy === "veloz") {
    console.log(
      "\n" +
        chalk.hex("#FF4D00")("→") +
        " Deploy: " +
        chalk.bold("npx onveloz deploy") +
        chalk.dim("  (veloz.json committed at project root)"),
    );
  }
}

function resolvePreset(preset: string | undefined): ProjectConfig {
  if (!preset || preset === "custom") return DEFAULT_CONFIG;
  const p = PRESETS[preset as keyof typeof PRESETS];
  return p ? p.config : DEFAULT_CONFIG;
}

function coerceFlags(input: CreateInput, base: ProjectConfig): Partial<ProjectConfig> {
  const out: Partial<ProjectConfig> = {};
  if (input.projectName) out.projectName = input.projectName;
  for (const k of [
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
    "preset",
  ] as const) {
    const v = (input as any)[k];
    if (v !== undefined) (out as any)[k] = v;
  }
  if (input.install !== undefined) out.install = input.install;
  if (input.git !== undefined) out.git = input.git;
  if (typeof input.modules === "string") {
    out.modules = parseModules(input.modules);
  }
  if (typeof input.examples === "string") {
    out.examples = input.examples
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as ProjectConfig["examples"];
  }
  if (typeof input.addons === "string") {
    const valid = new Set(AddonId.options);
    out.addons = input.addons
      .split(",")
      .map((s) => s.trim())
      .filter((a) => a && valid.has(a as any)) as ProjectConfig["addons"];
  }
  // If no modules flag passed and we're on a non-veloz preset, base already
  // has the right modules array.
  void base;
  return out;
}

function parseModules(csv: string): ModuleId[] {
  const known = new Set<string>(MODULE_IDS);
  const out: ModuleId[] = [];
  for (const raw of csv.split(",")) {
    const id = raw.trim();
    if (!id) continue;
    if (!known.has(id)) {
      console.warn(chalk.yellow(`⚠ Unknown module "${id}" — skipping`));
      continue;
    }
    out.push(id as ModuleId);
  }
  return out;
}

function printSummary(cfg: ProjectConfig, target: string): void {
  const line = (k: string, v: string) =>
    `  ${chalk.dim(k.padEnd(12))} ${chalk.bold(v)}`;
  console.log("\n" + chalk.hex("#FF4D00").bold("◆ veloz/stack"));
  console.log(chalk.dim(`  → ${target}\n`));
  console.log(line("preset", cfg.preset));
  console.log(line("frontend", cfg.frontend));
  console.log(line("backend", cfg.backend));
  console.log(line("runtime", cfg.runtime));
  console.log(line("api", cfg.api));
  console.log(
    line("db", cfg.db + (cfg.dbHosting !== "none" ? chalk.dim(` · ${cfg.dbHosting}`) : "")),
  );
  console.log(line("orm", cfg.orm));
  console.log(line("auth", cfg.auth));
  console.log(line("deploy", cfg.deploy));
  console.log(line("pm", cfg.pm));
  if (cfg.modules.length > 0) {
    console.log(line("modules", cfg.modules.join(", ")));
  }
  if (cfg.examples.length > 0) {
    console.log(line("examples", cfg.examples.join(", ")));
  }
}
