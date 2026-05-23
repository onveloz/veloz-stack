"use client";

import type { ProjectConfig } from "@/lib/veloz-stack-types";
import type { useStackConfig } from "@/lib/use-stack-config";

import { StepBrazil } from "./stack-builder-step-brazil";
import { StepData } from "./stack-builder-step-data";
import { StepPlatform } from "./stack-builder-step-platform";
import { StepReview } from "./stack-builder-step-review";
import { StepTools } from "./stack-builder-step-tools";
import type { StackBuilderState } from "./stack-builder-state";

function renderPlatformStep(builder: StackBuilderState, config: ProjectConfig) {
  return (
    <StepPlatform
      config={config}
      extraPlatforms={builder.extraPlatforms}
      onExtraPlatformsChange={builder.handleExtraPlatformsChange}
      requestChange={builder.requestChange}
    />
  );
}

function renderDataStep(builder: StackBuilderState, config: ProjectConfig) {
  return <StepData config={config} requestChange={builder.requestChange} />;
}

function renderBrazilStep(builder: StackBuilderState, config: ProjectConfig) {
  return (
    <StepBrazil
      config={config}
      modules={builder.filteredModules}
      moduleSearch={builder.moduleSearch}
      onModuleSearchChange={builder.handleModuleSearchChange}
      moduleFilter={builder.moduleFilter}
      onModuleFilterChange={builder.handleModuleFilterChange}
      onToggleModule={builder.handleToggleModule}
    />
  );
}

function renderToolsStep(
  builder: StackBuilderState,
  config: ProjectConfig,
  setState: ReturnType<typeof useStackConfig>["setState"],
) {
  return (
    <StepTools
      config={config}
      onGitHookChange={builder.handleGitHookChange}
      onLinterChange={builder.handleLinterChange}
      onTurborepoChange={builder.handleTurborepoChange}
      onToggleExample={builder.handleToggleExample}
      setState={setState}
    />
  );
}

function renderReviewStep(builder: StackBuilderState, config: ProjectConfig) {
  return (
    <StepReview
      config={config}
      command={builder.command}
      errors={builder.errors}
      onEdit={builder.handleGoToStepForKey}
    />
  );
}

/** @internal Scaffold pipeline step. */
export function StackBuilderStepContent({
  builder,
  config,
  setState,
}: {
  builder: StackBuilderState;
  config: ProjectConfig;
  setState: ReturnType<typeof useStackConfig>["setState"];
}) {
  switch (builder.step) {
    case "platform": {
      return renderPlatformStep(builder, config);
    }
    case "data": {
      return renderDataStep(builder, config);
    }
    case "brazil": {
      return renderBrazilStep(builder, config);
    }
    case "tools": {
      return renderToolsStep(builder, config, setState);
    }
    case "review": {
      return renderReviewStep(builder, config);
    }
    default: {
      return null;
    }
  }
}
