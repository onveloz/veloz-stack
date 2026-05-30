import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import type { PackageJson } from "../package-json";

/**
 * Root `package.json` scripts for lint/format/check + lint-staged / prepare.
 * Extracted from post-process so oxlint/Biome/Husky branches stay in one place.
 */

function runCommand(config: ProjectConfig): string {
  const hasTurbo = config.addons.includes("turborepo");
  const { pm } = config;
  return hasTurbo
    ? "turbo run"
    : pm === "pnpm"
      ? "pnpm -r --parallel"
      : pm === "bun"
        ? "bun run --filter '*'"
        : "npm run -ws";
}

function dbScripts(config: ProjectConfig): Record<string, string> {
  if (config.db === "none") {
    return {};
  }
  const { pm } = config;
  const push =
    pm === "pnpm"
      ? "pnpm -F @*/db db:push"
      : `${pm} --prefix packages/db run db:push`;
  const studio =
    pm === "pnpm"
      ? "pnpm -F @*/db db:studio"
      : `${pm} --prefix packages/db run db:studio`;
  return { "db:push": push, "db:studio": studio };
}

function biomeScripts(lefthookAdvanced: boolean): Record<string, string> {
  return {
    format: "biome format --write .",
    lint: "biome lint .",
    check: "biome check --write .",
    ...(lefthookAdvanced ? { "lint:ci": "biome ci ." } : {}),
  };
}

function oxlintScripts(): Record<string, string> {
  return {
    format: "oxfmt .",
    lint: "oxlint .",
    check: "oxlint . && oxfmt --check .",
  };
}

function lintFormatScripts(
  config: ProjectConfig,
  lefthookAdvanced: boolean,
): Record<string, string> {
  if (config.addons.includes("biome")) {
    return biomeScripts(lefthookAdvanced);
  }
  if (config.addons.includes("oxlint")) {
    return oxlintScripts();
  }
  return {};
}

/** Mutates `pkg.scripts` with format/lint/check when Biome or oxlint is active. */
export function setLintScripts(pkg: PackageJson, config: ProjectConfig): void {
  const hasTurbo = config.addons.includes("turborepo");
  const hasLefthook = config.addons.includes("lefthook");
  const lefthookAdvanced = hasLefthook && config.lefthookAdvanced;
  const run = runCommand(config);

  pkg.scripts = {
    ...pkg.scripts,
    dev: `${run} dev`,
    build: `${run} build`,
    "check-types": `${run} check-types`,
    test: hasTurbo ? `${run} test` : "vitest run",
    ...(config.frontend !== "none" ? { "test:e2e": "playwright test" } : {}),
    ...dbScripts(config),
    ...lintFormatScripts(config, lefthookAdvanced),
  };
}

function lintToolDevDeps(config: ProjectConfig): Record<string, string> {
  const hasTurbo = config.addons.includes("turborepo");
  const hasBiome = config.addons.includes("biome");
  const hasOxlint = config.addons.includes("oxlint");
  const hasHusky = config.addons.includes("husky");
  const hasLefthook = config.addons.includes("lefthook");
  const lefthookAdvanced = hasLefthook && config.lefthookAdvanced;

  return {
    ...(hasTurbo ? { turbo: version("turbo") } : {}),
    ...(hasBiome ? { "@biomejs/biome": version("@biomejs/biome") } : {}),
    ...(hasOxlint
      ? {
          oxlint: version("oxlint"),
          oxfmt: version("oxfmt"),
        }
      : {}),
    ...(hasHusky
      ? { husky: version("husky"), "lint-staged": version("lint-staged") }
      : {}),
    ...(hasLefthook ? { lefthook: version("lefthook") } : {}),
    ...(lefthookAdvanced
      ? {
          "@commitlint/cli": version("@commitlint/cli"),
          "@commitlint/config-conventional": version(
            "@commitlint/config-conventional",
          ),
        }
      : {}),
  };
}

function huskyLintStaged(config: ProjectConfig): PackageJson["lint-staged"] {
  if (config.addons.includes("biome")) {
    return {
      "*.{js,jsx,ts,tsx,json,md}": [
        "biome check --write --no-errors-on-unmatched",
      ],
    };
  }
  if (config.addons.includes("oxlint")) {
    return {
      "*.{js,jsx,ts,tsx}": ["oxlint --fix"],
      "*.{js,jsx,ts,tsx,json,md,css}": ["oxfmt --write"],
    };
  }
  return { "*.{js,jsx,ts,tsx,json,md}": [] };
}

function applyGitHookPrepare(pkg: PackageJson, config: ProjectConfig): void {
  if (config.addons.includes("husky")) {
    pkg.scripts = { ...pkg.scripts, prepare: "husky" };
    pkg["lint-staged"] = huskyLintStaged(config);
  }
  if (config.addons.includes("lefthook")) {
    pkg.scripts = { ...pkg.scripts, prepare: "lefthook install" };
  }
}

/** Mutates `pkg.devDependencies`, optional `prepare`, and `lint-staged` for Husky. */
export function setLintStaged(pkg: PackageJson, config: ProjectConfig): void {
  pkg.devDependencies = {
    ...pkg.devDependencies,
    ...lintToolDevDeps(config),
  };
  applyGitHookPrepare(pkg, config);
}

/** Apply root scripts + lint tooling to the given package object (used by postProcess). */
export function applyRootScriptsToPkg(
  pkg: PackageJson,
  config: ProjectConfig,
): void {
  setLintScripts(pkg, config);
  setLintStaged(pkg, config);
}
