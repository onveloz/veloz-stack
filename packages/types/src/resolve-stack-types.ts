import type { ProjectConfig } from "./index";

/** @internal Generated-app type. */
export type { ProjectConfig };

/** One field change applied while resolving a stack picker edit (including cascades). */
export interface ConfigChange {
  key: keyof ProjectConfig | "modules";
  from: string;
  to: string | null;
  reason: string;
}
