"use client";

import type { PresetId, ProjectConfig } from "@/lib/veloz-stack-types";
import type { useStackConfig } from "@/lib/use-stack-config";

import { ConfirmCascadeDialog } from "@/components/confirm-dialog";

import {
  StackBuilderCommandBar,
  StackBuilderHeader,
} from "./stack-builder-chrome";
import { StackBuilderLayoutGrid } from "./stack-builder-layout-grid";
import { StackBuilderLayoutPresetSection } from "./stack-builder-layout-preset";
import type { StackBuilderState } from "./stack-builder-state";

function StackBuilderConfirmDialog({
  builder,
}: {
  builder: StackBuilderState;
}) {
  const { pending, handlePendingClear } = builder;
  return (
    <ConfirmCascadeDialog
      open={pending !== null}
      title={pending?.title ?? ""}
      primaryReason={pending?.primaryReason ?? ""}
      changes={pending?.changes ?? []}
      onConfirm={() => {
        pending?.apply();
      }}
      onCancel={handlePendingClear}
    />
  );
}

export function StackBuilderLayout({
  config,
  basePreset,
  setState,
  builder,
}: {
  config: ProjectConfig;
  basePreset: PresetId;
  setState: ReturnType<typeof useStackConfig>["setState"];
  builder: StackBuilderState;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <StackBuilderHeader
        shareCopied={builder.shareCopied}
        onShare={() => {
          void builder.handleShare();
        }}
        onRandomize={builder.handleRandomize}
      />

      <StackBuilderLayoutPresetSection
        config={config}
        basePreset={basePreset}
        setState={setState}
        builder={builder}
      />

      <StackBuilderLayoutGrid
        builder={builder}
        config={config}
        setState={setState}
      />

      <StackBuilderCommandBar
        command={builder.command}
        visible={builder.step !== "review"}
      />

      <StackBuilderConfirmDialog builder={builder} />
    </div>
  );
}
