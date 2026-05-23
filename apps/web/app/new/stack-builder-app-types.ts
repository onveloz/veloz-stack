import type { ProjectConfig } from "@veloz-stack/types";

export type { BuilderMode, StepId } from "./stack-builder-constants";

export type RequestChange = (
  key: keyof ProjectConfig,
  value: string,
  label?: string,
) => void;
