import type { AddonId, ProjectConfig } from "@veloz-stack/types";

/** @internal Generated-app type. */
export type GitHookChoice = "none" | "husky" | "lefthook";
/** @internal Generated-app type. */
export type LinterChoice = "none" | "biome" | "oxlint";

/** @internal Scaffold export. */
export const GIT_HOOK_CHOICES = [
  "none",
  "husky",
  "lefthook",
] as const satisfies readonly GitHookChoice[];
/** Visible in stack builder unless `?showLegacy=1` — Husky stays CLI-only outside that. */
export const GIT_HOOK_CHOICES_DEFAULT_UI = [
  "none",
  "lefthook",
] as const satisfies readonly GitHookChoice[];
/** @internal Scaffold export. */
export const LINTER_CHOICES = [
  "none",
  "biome",
  "oxlint",
] as const satisfies readonly LinterChoice[];

/** @internal Scaffold pipeline step. */
export function getGitHookChoice(addons: readonly AddonId[]): GitHookChoice {
  if (addons.includes("lefthook")) {
    return "lefthook";
  }
  if (addons.includes("husky")) {
    return "husky";
  }
  return "none";
}

/** @internal Scaffold pipeline step. */
export function getLinterChoice(addons: readonly AddonId[]): LinterChoice {
  if (addons.includes("oxlint")) {
    return "oxlint";
  }
  if (addons.includes("biome")) {
    return "biome";
  }
  return "none";
}

/** @internal Scaffold pipeline step. */
export function patchAddonsForGitHook(
  addons: readonly AddonId[],
  choice: GitHookChoice,
): AddonId[] {
  const without = addons.filter((a) => a !== "husky" && a !== "lefthook");
  if (choice === "none") {
    return without;
  }
  return [...without, choice];
}

/** @internal Scaffold pipeline step. */
export function patchAddonsForLinter(
  addons: readonly AddonId[],
  choice: LinterChoice,
): AddonId[] {
  const without = addons.filter((a) => a !== "biome" && a !== "oxlint");
  if (choice === "none") {
    return without;
  }
  return [...without, choice];
}

/** @internal Scaffold pipeline step. */
export function patchAddonsTurborepo(
  addons: readonly AddonId[],
  on: boolean,
): AddonId[] {
  if (on && !addons.includes("turborepo")) {
    return [...addons, "turborepo"];
  }
  if (on) {
    return [...addons];
  }
  return addons.filter((a) => a !== "turborepo");
}

/** Side effects when changing exclusive addon groups (clears dependent flags). */
export function addonFlagsAfterGitHook(
  choice: GitHookChoice,
): Partial<ProjectConfig> {
  if (choice !== "lefthook") {
    return { lefthookCi: false, lefthookAdvanced: false };
  }
  return {};
}

/** @internal Scaffold pipeline step. */
export function addonFlagsAfterLinter(
  choice: LinterChoice,
): Partial<ProjectConfig> {
  if (choice !== "oxlint") {
    return { oxlintStrict: false };
  }
  return {};
}
