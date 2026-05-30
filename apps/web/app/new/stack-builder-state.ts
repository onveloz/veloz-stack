"use client";

import type { PresetId, ProjectConfig } from "@/lib/veloz-stack-types";
import type { StackSetter } from "@/lib/use-stack-config";

import { assembleStackBuilderHandlers } from "./stack-builder-state-handlers-bind";
import { useStackBuilderCoreState } from "./stack-builder-state-core";

/** @internal Generated-app type. */
export type { PendingChange } from "./stack-builder-state-core";

/** @internal Scaffold pipeline step. */
export function useStackBuilderState(
  config: ProjectConfig,
  basePreset: PresetId,
  setState: StackSetter,
) {
  const core = useStackBuilderCoreState(config, basePreset);
  const handlers = assembleStackBuilderHandlers(config, core, setState);

  return { ...core, ...handlers };
}

/** @internal Generated-app type. */
export type StackBuilderState = ReturnType<typeof useStackBuilderState>;
