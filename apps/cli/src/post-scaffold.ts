import { execSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ProjectConfig } from "./stack-types.js";
import chalk from "chalk";

function writeStdout(line: string): void {
  process.stdout.write(`${line}\n`);
}

/** Initialize git when requested; never fails the scaffold if git is unavailable. */
export function initGitRepo(target: string): void {
  try {
    execSync("git init", { cwd: target, stdio: "ignore" });
  } catch {
    writeStdout(
      chalk.yellow(
        "⚠ Não foi possível inicializar o git — você pode rodar `git init` manualmente.",
      ),
    );
  }
}

function ensureEnvFile(target: string): void {
  const example = join(target, ".env.example");
  const env = join(target, ".env");
  if (existsSync(example) && !existsSync(env)) {
    copyFileSync(example, env);
  }
}

/** Lefthook prepare scripts expect a git repo even when `config.git` is false. */
function ensureGitForHooks(target: string): void {
  try {
    execSync("git rev-parse --git-dir", { cwd: target, stdio: "ignore" });
  } catch {
    try {
      execSync("git init", { cwd: target, stdio: "ignore" });
    } catch {
      /* install may still work without git */
    }
  }
}

function installCommand(pm: ProjectConfig["pm"]): string {
  if (pm === "bun") {
    return "bun install";
  }
  if (pm === "npm") {
    return "npm install --no-audit --no-fund";
  }
  return "pnpm install";
}

/**
 * Install dependencies in the scaffolded project when `config.install` is true.
 * Warns and continues on failure so files on disk are not left in a confusing state.
 */
export function installDependencies(
  target: string,
  config: ProjectConfig,
): void {
  ensureEnvFile(target);
  ensureGitForHooks(target);

  const cmd = installCommand(config.pm);
  writeStdout(chalk.dim(`\n  ${cmd}`));
  try {
    execSync(cmd, { cwd: target, stdio: "inherit" });
    writeStdout(chalk.green("✓ Dependências instaladas."));
  } catch {
    writeStdout(
      chalk.yellow(
        `⚠ Falha ao instalar — rode \`${config.pm} install\` dentro do projeto.`,
      ),
    );
  }
}
