import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { ProjectConfig } from "./stack-types.js";
import chalk from "chalk";

function writeStdout(line: string): void {
  process.stdout.write(`${line}\n`);
}

interface RunOptions {
  cwd: string;
  stdio: "ignore" | "inherit";
}

function runCommand(
  command: string,
  args: string[],
  options: RunOptions,
): void {
  execFileSync(command, args, options);
}

/** Initialize git when requested; never fails the scaffold if git is unavailable. */
export function initGitRepo(target: string): void {
  try {
    runCommand("git", ["init"], { cwd: target, stdio: "ignore" });
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
    runCommand("git", ["rev-parse", "--git-dir"], {
      cwd: target,
      stdio: "ignore",
    });
  } catch {
    try {
      runCommand("git", ["init"], { cwd: target, stdio: "ignore" });
    } catch {
      /* install may still work without git */
    }
  }
}

function installArgs(pm: ProjectConfig["pm"]): {
  command: string;
  args: string[];
  label: string;
} {
  if (pm === "bun") {
    return { command: "bun", args: ["install"], label: "bun install" };
  }
  if (pm === "npm") {
    return {
      command: "npm",
      args: ["install", "--no-audit", "--no-fund"],
      label: "npm install --no-audit --no-fund",
    };
  }
  return { command: "pnpm", args: ["install"], label: "pnpm install" };
}

/**
 * Install dependencies in the scaffolded project when `config.install` is true.
 * No-ops when `config.install` is false (including direct callers and tests).
 * Warns and continues on failure so files on disk are not left in a confusing state.
 */
export function installDependencies(
  target: string,
  config: ProjectConfig,
): void {
  if (!config.install) {
    return;
  }

  ensureEnvFile(target);
  ensureGitForHooks(target);

  const { command, args, label } = installArgs(config.pm);
  writeStdout(chalk.dim(`\n  ${label}`));
  try {
    runCommand(command, args, { cwd: target, stdio: "inherit" });
    writeStdout(chalk.green("✓ Dependências instaladas."));
  } catch {
    writeStdout(
      chalk.yellow(
        `⚠ Falha ao instalar — rode \`${config.pm} install\` dentro do projeto.`,
      ),
    );
  }
}
