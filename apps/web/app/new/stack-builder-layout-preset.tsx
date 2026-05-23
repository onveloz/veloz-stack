"use client";

import type { PresetId, ProjectConfig } from "@/lib/veloz-stack-types";
import type { StackSetter } from "@/lib/use-stack-config";

import { StackBuilderPresetBar } from "./stack-builder-preset-shell";
import type { StackBuilderState } from "./stack-builder-state";

/** @internal Scaffold pipeline step. */
export function StackBuilderLayoutPresetSection({
  config,
  basePreset,
  setState,
  builder,
}: {
  config: ProjectConfig;
  basePreset: PresetId;
  setState: StackSetter;
  builder: StackBuilderState;
}) {
  return (
    <StackBuilderPresetBar
      config={config}
      basePreset={basePreset}
      mode={builder.mode}
      customizedFromPreset={builder.customizedFromPreset}
      onModeChange={builder.handleModeChange}
      onProjectNameChange={(name) => {
        void setState({ name });
      }}
      onInstallChange={(install) => {
        void setState({ install });
      }}
      onGitChange={(git) => {
        void setState({ git });
      }}
      onApplyPreset={builder.handleApplyPreset}
      isComingSoonPreset={builder.isComingSoonPreset}
      isPresetKey={builder.isPresetKey}
    />
  );
}
