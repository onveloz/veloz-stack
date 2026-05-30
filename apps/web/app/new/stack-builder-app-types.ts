import type { ProjectConfig } from "@veloz-stack/types";

/** @internal Generated-app type. */
export type { BuilderMode, StepId } from "./stack-builder-constants";

/** @internal Generated-app type. */
export type RequestChange = (
  key: keyof ProjectConfig,
  value: string,
  label?: string,
) => void;
