import {
  DEFAULT_CONFIG,
  getModuleDisableReason,
  MODULE_IDS,
  type ModuleId,
  PRESETS,
  type PresetKey,
  type ProjectConfig,
} from "@veloz-stack/types";
import { isStackConfigValid, repairStackConfig, resolveConfig } from "@/lib/resolve-config";
import {
  addonFlagsAfterGitHook,
  addonFlagsAfterLinter,
  type GitHookChoice,
  LINTER_CHOICES,
  type LinterChoice,
  patchAddonsForGitHook,
  patchAddonsForLinter,
  patchAddonsTurborepo,
} from "@/lib/stack-addons";

const SURPRISE_PRESETS = [
  "veloz-br",
  "next-native",
  "minimal",
] as const satisfies readonly PresetKey[];

const SPICE_KEYS = ["deploy", "auth", "api", "pm"] as const;

function pick<T>(arr: readonly T[]): T {
  if (arr.length === 0) throw new Error("Cannot pick from empty array");
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

function randomCompatibleModules(cfg: ProjectConfig): ModuleId[] {
  const pool = MODULE_IDS.filter((id) => !getModuleDisableReason(cfg, id));
  const max = Math.min(8, pool.length);
  const count = Math.floor(Math.random() * (max + 1));
  let picked = shuffle(pool).slice(0, count);
  if (cfg.frontend === "next" && picked.includes("next-intl") && picked.includes("pt-br-i18n")) {
    picked = picked.filter((m) => m !== "pt-br-i18n");
  }
  return picked;
}

function randomAddons(): Pick<
  ProjectConfig,
  "addons" | "oxlintStrict" | "lefthookCi" | "lefthookAdvanced"
> {
  let addons: ProjectConfig["addons"] = Math.random() < 0.85 ? ["turborepo"] : [];

  const linter: LinterChoice = pick(LINTER_CHOICES);
  addons = patchAddonsForLinter(addons, linter);
  const oxlintStrict = linter === "oxlint" && Math.random() < 0.2;

  // Deprecated Husky in product surface — randomized stacks never pick it (CLI/templates still accept it).
  const hook: GitHookChoice = Math.random() < 0.35 ? "lefthook" : "none";
  addons = patchAddonsForGitHook(addons, hook);

  let lefthookCi = false;
  let lefthookAdvanced = false;
  if (hook === "lefthook" && Math.random() < 0.45) {
    if (Math.random() < 0.55) lefthookCi = true;
    else lefthookAdvanced = true;
  }

  return {
    addons,
    oxlintStrict,
    lefthookCi,
    lefthookAdvanced,
    ...addonFlagsAfterLinter(linter),
    ...addonFlagsAfterGitHook(hook),
  };
}

/**
 * Build a valid random stack: start from a known-good preset, optionally spice,
 * then repair until `validateConfig` passes.
 */
export function buildSurpriseConfig(keep: {
  projectName: string;
  git: boolean;
  install: boolean;
}): ProjectConfig {
  const presetKey = pick(SURPRISE_PRESETS);
  let cfg: ProjectConfig = {
    ...structuredClone(PRESETS[presetKey].config),
    preset: "custom",
    projectName: keep.projectName,
    git: keep.git,
    install: keep.install,
    mobile: "none",
    desktop: "none",
    examples: [],
    oxlintStrict: false,
    lefthookCi: false,
    lefthookAdvanced: false,
  };

  cfg = repairStackConfig(cfg);

  if (Math.random() < 0.35) {
    const key = pick(SPICE_KEYS);
    const resolverOpts: Record<(typeof SPICE_KEYS)[number], readonly string[]> = {
      deploy: ["veloz", "vercel", "fly", "render"],
      auth: ["better-auth", "none"],
      api: ["orpc", "none"],
      pm: ["pnpm", "bun", "npm"],
    };
    const value = pick(resolverOpts[key]);
    cfg = resolveConfig(cfg, { key, value }).newCfg;
  }

  cfg = repairStackConfig({
    ...cfg,
    modules: Math.random() < 0.55 ? randomCompatibleModules(cfg) : [],
    ...randomAddons(),
  });

  if (!isStackConfigValid(cfg)) {
    cfg = repairStackConfig({
      ...structuredClone(DEFAULT_CONFIG),
      preset: "custom",
      projectName: keep.projectName,
      git: keep.git,
      install: keep.install,
      mobile: "none",
      desktop: "none",
      examples: [],
      ...randomAddons(),
      addons: patchAddonsTurborepo(patchAddonsForLinter([], "biome"), true),
    });
  }

  return cfg;
}
