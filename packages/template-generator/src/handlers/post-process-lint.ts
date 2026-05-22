import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";

/**
 * Root `package.json` scripts for lint/format/check + lint-staged / prepare.
 * Extracted from post-process so oxlint/Biome/Husky branches stay in one place.
 */

function runCommand(config: ProjectConfig): string {
  const hasTurbo = config.addons.includes("turborepo");
  const pm = config.pm;
  return hasTurbo
    ? "turbo run"
    : pm === "pnpm"
      ? "pnpm -r --parallel"
      : pm === "bun"
        ? "bun run --filter '*'"
        : "npm run -ws";
}

/** Mutates `pkg.scripts` with format/lint/check when Biome or oxlint is active. */
export function setLintScripts(pkg: Record<string, any>, config: ProjectConfig): void {
  const hasTurbo = config.addons.includes("turborepo");
  const hasBiome = config.addons.includes("biome");
  const hasOxlint = config.addons.includes("oxlint");
  const hasLefthook = config.addons.includes("lefthook");
  const lefthookAdvanced = hasLefthook && config.lefthookAdvanced;
  const run = runCommand(config);
  const pm = config.pm;

  pkg.scripts = {
    ...pkg.scripts,
    dev: `${run} dev`,
    build: `${run} build`,
    "check-types": `${run} check-types`,
    test: hasTurbo ? `${run} test` : "vitest run",
    ...(config.frontend !== "none" ? { "test:e2e": "playwright test" } : {}),
    ...(config.db !== "none"
      ? {
          "db:push":
            pm === "pnpm" ? "pnpm -F @*/db db:push" : `${pm} --cwd packages/db run db:push`,
          "db:studio":
            pm === "pnpm" ? "pnpm -F @*/db db:studio" : `${pm} --cwd packages/db run db:studio`,
        }
      : {}),
    ...(hasBiome
      ? {
          format: "biome format --write .",
          lint: "biome lint .",
          check: "biome check --write .",
          ...(lefthookAdvanced ? { "lint:ci": "biome ci ." } : {}),
        }
      : hasOxlint
        ? {
            format: "oxfmt .",
            lint: "oxlint .",
            check: "oxlint . && oxfmt --check .",
          }
        : {}),
  };
}

/** Mutates `pkg.devDependencies`, optional `prepare`, and `lint-staged` for Husky. */
export function setLintStaged(pkg: Record<string, any>, config: ProjectConfig): void {
  const hasTurbo = config.addons.includes("turborepo");
  const hasBiome = config.addons.includes("biome");
  const hasOxlint = config.addons.includes("oxlint");
  const hasHusky = config.addons.includes("husky");
  const hasLefthook = config.addons.includes("lefthook");
  const lefthookAdvanced = hasLefthook && config.lefthookAdvanced;

  pkg.devDependencies = {
    ...(pkg.devDependencies ?? {}),
    ...(hasTurbo ? { turbo: version("turbo") } : {}),
    ...(hasBiome ? { "@biomejs/biome": version("@biomejs/biome") } : {}),
    ...(hasOxlint
      ? {
          oxlint: version("oxlint"),
          oxfmt: version("oxfmt"),
        }
      : {}),
    ...(hasHusky ? { husky: version("husky"), "lint-staged": version("lint-staged") } : {}),
    ...(hasLefthook ? { lefthook: version("lefthook") } : {}),
    ...(lefthookAdvanced
      ? {
          "@commitlint/cli": version("@commitlint/cli"),
          "@commitlint/config-conventional": version("@commitlint/config-conventional"),
        }
      : {}),
  };

  if (hasHusky) {
    pkg.scripts = { ...pkg.scripts, prepare: "husky" };
    pkg["lint-staged"] = hasBiome
      ? { "*.{js,jsx,ts,tsx,json,md}": ["biome check --write --no-errors-on-unmatched"] }
      : hasOxlint
        ? {
            "*.{js,jsx,ts,tsx}": ["oxlint --fix"],
            "*.{js,jsx,ts,tsx,json,md,css}": ["oxfmt --write"],
          }
        : { "*.{js,jsx,ts,tsx,json,md}": [] };
  }
  if (hasLefthook) {
    pkg.scripts = { ...pkg.scripts, prepare: "lefthook install" };
  }
}

/** Apply root scripts + lint tooling to the given package object (used by postProcess). */
export function applyRootScriptsToPkg(pkg: Record<string, any>, config: ProjectConfig): void {
  setLintScripts(pkg, config);
  setLintStaged(pkg, config);
}
