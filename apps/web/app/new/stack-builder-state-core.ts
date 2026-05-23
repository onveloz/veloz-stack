"use client";

import { validateConfig } from "@veloz-stack/types";
import { useEffect, useMemo, useState } from "react";

import { buildCommand } from "@/lib/build-command";
import type {
  ConfigChange,
  PresetId,
  ProjectConfig,
} from "@/lib/veloz-stack-types";

import type { BuilderMode, StepId } from "./stack-builder-app-types";
import {
  filterModules,
  getCustomizedFromPreset,
  getStepProgress,
  getVisibleSteps,
} from "./stack-builder-state-utils";

export interface PendingChange {
  title: string;
  primaryReason: string;
  changes: ConfigChange[];
  apply: () => void;
}

export function useStackBuilderCoreState(
  config: ProjectConfig,
  basePreset: PresetId,
) {
  const [step, setStep] = useState<StepId>("platform");
  const [mode, setMode] = useState<BuilderMode>("full");
  const [extraPlatforms, setExtraPlatforms] = useState(
    () => config.mobile !== "none" || config.desktop !== "none",
  );
  const [moduleSearch, setModuleSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [shareCopied, setShareCopied] = useState(false);
  const [pending, setPending] = useState<PendingChange | null>(null);

  const visibleSteps = getVisibleSteps(mode);
  const command = useMemo(() => buildCommand(config), [config]);
  const errors = useMemo(() => validateConfig(config), [config]);
  const customizedFromPreset = getCustomizedFromPreset(config, basePreset);
  const filteredModules = useMemo(
    () => filterModules(moduleSearch, moduleFilter),
    [moduleSearch, moduleFilter],
  );
  const progress = getStepProgress(visibleSteps, step);

  useClampStepToVisibleSteps(visibleSteps, step, setStep);

  return {
    step,
    setStep,
    mode,
    setMode,
    extraPlatforms,
    setExtraPlatforms,
    moduleSearch,
    setModuleSearch,
    moduleFilter,
    setModuleFilter,
    shareCopied,
    setShareCopied,
    pending,
    setPending,
    visibleSteps,
    command,
    errors,
    customizedFromPreset,
    filteredModules,
    progress,
  };
}

export type StackBuilderCoreState = ReturnType<typeof useStackBuilderCoreState>;

function useClampStepToVisibleSteps(
  visibleSteps: ReturnType<typeof getVisibleSteps>,
  step: StepId,
  setStep: (step: StepId) => void,
) {
  useEffect(() => {
    if (!visibleSteps.some((item) => item.id === step)) {
      setStep(visibleSteps[0]?.id ?? "platform");
    }
  }, [visibleSteps, step, setStep]);
}
