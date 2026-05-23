import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { basename, resolve } from "node:path";
import { scaffold } from "@veloz-stack/template-generator/scaffold";
import {
  AddonId,
  applyImplicitStackRules,
  DEFAULT_CONFIG,
  ExampleId,
  getUiDisableReason,
  MODULE_IDS,
  PRESETS,
  validateConfig,
} from "@veloz-stack/types";
import type { ModuleId, ProjectConfig } from "./stack-types.js";
import chalk from "chalk";
import { gatherInteractive } from "./prompts.js";

const require = createRequire(import.meta.url);
const CLI_VERSION = readCliVersion();

/** CLI flags and options passed into {@link runCreate}. */
export type CreateInput = Partial<ProjectConfig> & {
  projectName?: string;
  modules?: string;
  examples?: string;
  addons?: string;
  lefthookCi?: boolean;
  lefthookAdvanced?: boolean;
  yes?: boolean;
  dryRun?: boolean;
  oxlintStrict?: boolean;
};

const SCALAR_FLAG_KEYS = [
  "frontend",
  "mobile",
  "desktop",
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
  "preset",
] as const satisfies readonly (keyof ProjectConfig)[];

function readCliVersion(): string {
  const raw: unknown = require("../package.json");
  if (
    typeof raw === "object" &&
    raw !== null &&
    "version" in raw &&
    typeof raw.version === "string"
  ) {
    return raw.version;
  }
  throw new Error("Invalid apps/cli/package.json");
}

function writeStdout(line: string): void {
  process.stdout.write(`${line}\n`);
}

function summaryLine(k: string, v: string): string {
  return `  ${chalk.dim(k.padEnd(12))} ${chalk.bold(v)}`;
}

/** Resolves config from flags or prompts, validates, and scaffolds the project directory. */
export async function runCreate(input: CreateInput): Promise<void> {
  const config = await resolveConfig(input);
  applyUiFallback(input, config);
  const target = resolveTargetDirectory(config);

  const errors = validateConfig(config);
  if (errors.length > 0) {
    printValidationErrors(errors);
    process.exit(1);
  }

  if (existsSync(target)) {
    console.error(
      chalk.red(`\n✗ A pasta "${config.projectName}" já existe em ${target}`),
    );
    process.exit(1);
  }

  printSummary(config, target);

  if (input.dryRun) {
    writeStdout(
      chalk.yellow("\n--dry-run ativo — nenhum arquivo foi escrito."),
    );
    return;
  }

  await writeScaffold(config, target);
}

async function resolveConfig(input: CreateInput): Promise<ProjectConfig> {
  const base = resolvePreset(input.preset);
  const fromFlags = coerceFlags(input);
  const seeded: ProjectConfig = { ...base, ...fromFlags };
  const explicit = explicitFromFlags(input);

  if (input.yes) {
    return applyImplicitStackRules(seeded, explicit);
  }
  const interactive = await gatherInteractive(seeded, input);
  return interactive;
}

function applyUiFallback(input: CreateInput, config: ProjectConfig): void {
  if (input.ui === undefined && getUiDisableReason(config, config.ui)) {
    config.ui = "tailwind";
  }
}

function resolveTargetDirectory(config: ProjectConfig): string {
  const target = resolve(process.cwd(), config.projectName);
  config.projectName = basename(target)
    .replaceAll(/[^a-z0-9-_]/gi, "-")
    .toLowerCase();
  return target;
}

function printValidationErrors(errors: string[]): void {
  console.error(chalk.red("\n✗ Configuração incompatível:"));
  for (const e of errors) {
    console.error(`  • ${e}`);
  }
}

async function writeScaffold(
  config: ProjectConfig,
  target: string,
): Promise<void> {
  const { fileCount } = await scaffold(config, target, {
    cliVersion: CLI_VERSION,
  });
  if (config.git) {
    execSync("git init", { cwd: target, stdio: "ignore" });
  }
  printScaffoldSuccess(config, fileCount);
}

function printScaffoldSuccess(config: ProjectConfig, fileCount: number): void {
  writeStdout(chalk.green(`\n✓ ${fileCount} arquivos criados.`));
  writeStdout(chalk.dim(`  cd ${config.projectName}`));
  writeStdout(chalk.dim(`  ${config.pm} install`));
  writeStdout(chalk.dim(`  ${config.pm} dev`));

  if (config.deploy === "veloz") {
    writeStdout(
      `\n${chalk.hex("#FF4D00")("→")} Deploy: ${chalk.bold("npx onveloz deploy")}${chalk.dim("  (o veloz.json já tá commitado na raiz)")}`,
    );
  }
}

function isPresetKey(preset: string): preset is keyof typeof PRESETS {
  return Object.hasOwn(PRESETS, preset);
}

function resolvePreset(preset: string | undefined): ProjectConfig {
  if (!preset || preset === "custom" || !isPresetKey(preset)) {
    return DEFAULT_CONFIG;
  }
  return PRESETS[preset].config;
}

function explicitFromFlags(input: CreateInput) {
  return {
    frontend: input.frontend !== undefined,
    backend: input.backend !== undefined,
    runtime: input.runtime !== undefined,
  };
}

function coerceFlags(input: CreateInput): Partial<ProjectConfig> {
  const out: Partial<ProjectConfig> = {};
  applyScalarFlags(input, out);
  applyCsvFlags(input, out);
  return out;
}

function applyScalarFlags(
  input: CreateInput,
  out: Partial<ProjectConfig>,
): void {
  if (input.projectName) {
    out.projectName = input.projectName;
  }
  for (const k of SCALAR_FLAG_KEYS) {
    assignScalarFlag(out, k, input[k]);
  }
  if (input.install !== undefined) {
    out.install = input.install;
  }
  if (input.git !== undefined) {
    out.git = input.git;
  }
  if (input.lefthookCi !== undefined) {
    out.lefthookCi = input.lefthookCi;
  }
  if (input.lefthookAdvanced !== undefined) {
    out.lefthookAdvanced = input.lefthookAdvanced;
  }
  if (input.oxlintStrict !== undefined) {
    out.oxlintStrict = input.oxlintStrict;
  }
}

function assignScalarFlag<K extends (typeof SCALAR_FLAG_KEYS)[number]>(
  out: Partial<ProjectConfig>,
  key: K,
  value: CreateInput[K],
): void {
  if (value !== undefined) {
    out[key] = value;
  }
}

function applyCsvFlags(input: CreateInput, out: Partial<ProjectConfig>): void {
  if (typeof input.modules === "string") {
    out.modules = parseModules(input.modules);
  }
  if (typeof input.examples === "string") {
    out.examples = parseExamples(input.examples);
  }
  if (typeof input.addons === "string") {
    out.addons = parseAddons(input.addons);
  }
}

function parseModules(csv: string): ModuleId[] {
  const out: ModuleId[] = [];
  for (const raw of csv.split(",")) {
    const id = raw.trim();
    if (!id) {
      continue;
    }
    if (!isModuleId(id)) {
      console.warn(chalk.yellow(`⚠ Módulo desconhecido "${id}" — ignorando`));
      continue;
    }
    out.push(id);
  }
  return out;
}

function isModuleId(id: string): id is ModuleId {
  return (MODULE_IDS as readonly string[]).includes(id);
}

function parseExamples(csv: string): ProjectConfig["examples"] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isExampleId(s));
}

function isExampleId(id: string): id is ProjectConfig["examples"][number] {
  return (ExampleId.options as readonly string[]).includes(id);
}

function parseAddons(csv: string): ProjectConfig["addons"] {
  return csv
    .split(",")
    .map((s) => s.trim())
    .filter((s) => isAddonId(s));
}

function isAddonId(id: string): id is ProjectConfig["addons"][number] {
  return (AddonId.options as readonly string[]).includes(id);
}

function printSummary(cfg: ProjectConfig, target: string): void {
  writeStdout(`\n${chalk.hex("#FF4D00").bold("◆ veloz/stack")}`);
  writeStdout(chalk.dim(`  → ${target}\n`));
  writeStdout(summaryLine("preset", cfg.preset));
  writeStdout(summaryLine("frontend", cfg.frontend));
  writeStdout(summaryLine("backend", cfg.backend));
  writeStdout(summaryLine("runtime", cfg.runtime));
  writeStdout(summaryLine("api", cfg.api));
  writeStdout(
    summaryLine(
      "db",
      cfg.db +
        (cfg.dbHosting !== "none" ? chalk.dim(` · ${cfg.dbHosting}`) : ""),
    ),
  );
  writeStdout(summaryLine("orm", cfg.orm));
  writeStdout(summaryLine("auth", cfg.auth));
  writeStdout(summaryLine("ui", cfg.ui));
  writeStdout(summaryLine("deploy", cfg.deploy));
  writeStdout(summaryLine("pm", cfg.pm));
  if (cfg.modules.length > 0) {
    writeStdout(summaryLine("módulos", cfg.modules.join(", ")));
  }
  if (cfg.examples.length > 0) {
    writeStdout(summaryLine("exemplos", cfg.examples.join(", ")));
  }
}
