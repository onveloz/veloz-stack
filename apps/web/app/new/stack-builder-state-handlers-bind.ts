"use client";

import type { ProjectConfig } from "@/lib/veloz-stack-types";
import type { useStackConfig } from "@/lib/use-stack-config";

import {
  createApplyPresetHandler,
  createGitHookHandler,
  createGoToStepHandler,
  createLinterHandler,
  createRandomizeHandler,
  createRequestChangeHandler,
  createShareHandler,
  createToggleExampleHandler,
  createToggleModuleHandler,
  createTurborepoHandler,
} from "./stack-builder-state-handlers";
import type { StackBuilderCoreState } from "./stack-builder-state-core";
import { isComingSoonPreset, isPresetKey } from "./stack-builder-state-utils";

type SetState = ReturnType<typeof useStackConfig>["setState"];

export function assembleStackBuilderHandlers(
  config: ProjectConfig,
  core: StackBuilderCoreState,
  setState: SetState,
) {
  const handlerCtx = {
    config,
    mode: core.mode,
    setState,
    setStep: core.setStep,
    setMode: core.setMode,
    setPending: core.setPending,
    setShareCopied: core.setShareCopied,
  };

  return {
    handleShare: createShareHandler(handlerCtx),
    handleApplyPreset: createApplyPresetHandler(handlerCtx),
    handleRandomize: createRandomizeHandler(handlerCtx),
    handleToggleModule: createToggleModuleHandler(handlerCtx),
    handleGitHookChange: createGitHookHandler(handlerCtx),
    handleLinterChange: createLinterHandler(handlerCtx),
    handleTurborepoChange: createTurborepoHandler(handlerCtx),
    handleToggleExample: createToggleExampleHandler(handlerCtx),
    requestChange: createRequestChangeHandler(handlerCtx),
    handleGoToStepForKey: createGoToStepHandler(handlerCtx),
    handleStepChange: core.setStep,
    handleModeChange: core.setMode,
    handleExtraPlatformsChange: core.setExtraPlatforms,
    handleModuleSearchChange: core.setModuleSearch,
    handleModuleFilterChange: core.setModuleFilter,
    handlePendingClear: () => {
      core.setPending(null);
    },
    handleShowFullMode: () => {
      core.setMode("full");
    },
    isComingSoonPreset,
    isPresetKey,
  };
}
