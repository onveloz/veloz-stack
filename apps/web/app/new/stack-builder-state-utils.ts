import {
  COMING_SOON_PRESETS,
  MODULES,
  MODULE_CATEGORY_LABELS,
  PRESETS,
} from "@veloz-stack/types";

import type {
  ModuleMeta,
  PresetId,
  PresetKey,
  ProjectConfig,
} from "@/lib/veloz-stack-types";

import type { StepId } from "./stack-builder-app-types";
import { QUICK_STEPS, STEPS } from "./stack-builder-constants";

export function isPresetKey(id: string): id is PresetKey {
  return id in PRESETS;
}

export function isComingSoonPreset(id: string): boolean {
  return (COMING_SOON_PRESETS as readonly string[]).includes(id);
}

export function getVisibleSteps(mode: "quick" | "full") {
  return mode === "quick"
    ? STEPS.filter((stepItem) => QUICK_STEPS.includes(stepItem.id))
    : STEPS;
}

export function getCustomizedFromPreset(
  config: ProjectConfig,
  basePreset: PresetId,
): string | null {
  if (
    config.preset !== "custom" ||
    basePreset === "custom" ||
    !isPresetKey(basePreset)
  ) {
    return null;
  }
  return PRESETS[basePreset].label;
}

export function filterModules(
  moduleSearch: string,
  moduleFilter: string,
): ModuleMeta[] {
  const query = moduleSearch.trim().toLowerCase();
  return Object.values(MODULES).filter((module) => {
    if (moduleFilter !== "all" && module.category !== moduleFilter) {
      return false;
    }
    if (!query) {
      return true;
    }
    const category = MODULE_CATEGORY_LABELS[module.category].toLowerCase();
    return (
      module.name.toLowerCase().includes(query) ||
      module.tagline.toLowerCase().includes(query) ||
      category.includes(query) ||
      module.id.includes(query)
    );
  });
}

export function getStepProgress(
  visibleSteps: typeof STEPS,
  step: StepId,
): number {
  const stepIndex = visibleSteps.findIndex((stepItem) => stepItem.id === step);
  if (visibleSteps.length === 0) {
    return 0;
  }
  return Math.round(((stepIndex + 1) / visibleSteps.length) * 100);
}
