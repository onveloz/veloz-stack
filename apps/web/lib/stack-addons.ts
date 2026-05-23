import type { AddonId, ProjectConfig } from "@veloz-stack/types";

export type GitHookChoice = "none" | "husky" | "lefthook";
export type LinterChoice = "none" | "biome" | "oxlint";

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
export const LINTER_CHOICES = [
  "none",
  "biome",
  "oxlint",
] as const satisfies readonly LinterChoice[];

export function getGitHookChoice(addons: readonly AddonId[]): GitHookChoice {
  if (addons.includes("lefthook")) {
    return "lefthook";
  }
  if (addons.includes("husky")) {
    return "husky";
  }
  return "none";
}

export function getLinterChoice(addons: readonly AddonId[]): LinterChoice {
  if (addons.includes("oxlint")) {
    return "oxlint";
  }
  if (addons.includes("biome")) {
    return "biome";
  }
  return "none";
}

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

export function addonFlagsAfterLinter(
  choice: LinterChoice,
): Partial<ProjectConfig> {
  if (choice !== "oxlint") {
    return { oxlintStrict: false };
  }
  return {};
}
