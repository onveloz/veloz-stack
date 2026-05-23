"use client";

import { useStackConfig } from "@/lib/use-stack-config";

import { StackBuilderLayout } from "./stack-builder-layout";
import { useStackBuilderState } from "./stack-builder-state";

/** @internal Scaffold pipeline step. */
export function StackBuilder() {
  const { config, basePreset, setState } = useStackConfig();
  const builder = useStackBuilderState(config, basePreset, setState);

  return (
    <StackBuilderLayout
      config={config}
      basePreset={basePreset}
      setState={setState}
      builder={builder}
    />
  );
}
