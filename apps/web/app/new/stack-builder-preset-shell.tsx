"use client";

import type {
  PresetId,
  PresetKey,
  ProjectConfig,
} from "@/lib/veloz-stack-types";

import {
  StackBuilderPresetButtons,
  StackBuilderPresetFields,
} from "./stack-builder-preset-bar";

function CustomizedPresetNote({ label }: { label: string }) {
  return (
    <p className="max-w-6xl mx-auto mt-2 text-[11px] text-muted-foreground">
      Baseado em <span className="text-foreground font-medium">{label}</span>
      {" · "}personalizado
    </p>
  );
}

/** @internal Scaffold pipeline step. */
export function StackBuilderPresetBar({
  config,
  basePreset,
  mode,
  customizedFromPreset,
  onModeChange,
  onProjectNameChange,
  onInstallChange,
  onGitChange,
  onApplyPreset,
  isComingSoonPreset,
  isPresetKey,
}: {
  config: ProjectConfig;
  basePreset: PresetId;
  mode: "quick" | "full";
  customizedFromPreset: string | null;
  onModeChange: (mode: "quick" | "full") => void;
  onProjectNameChange: (name: string) => void;
  onInstallChange: (install: boolean) => void;
  onGitChange: (git: boolean) => void;
  onApplyPreset: (id: PresetKey) => void;
  isComingSoonPreset: (id: string) => boolean;
  isPresetKey: (id: string) => id is PresetKey;
}) {
  return (
    <div className="border-b border-border bg-secondary/20 px-4 sm:px-6 py-4">
      <StackBuilderPresetFields
        config={config}
        mode={mode}
        onModeChange={onModeChange}
        onProjectNameChange={onProjectNameChange}
        onInstallChange={onInstallChange}
        onGitChange={onGitChange}
      />
      <StackBuilderPresetButtons
        config={config}
        basePreset={basePreset}
        onApplyPreset={onApplyPreset}
        isComingSoonPreset={isComingSoonPreset}
        isPresetKey={isPresetKey}
      />
      {customizedFromPreset ? (
        <CustomizedPresetNote label={customizedFromPreset} />
      ) : null}
    </div>
  );
}
