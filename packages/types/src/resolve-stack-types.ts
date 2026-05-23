import type { ProjectConfig } from "./index";

export type { ProjectConfig };

/** One field change applied while resolving a stack picker edit (including cascades). */
export interface ConfigChange {
  key: keyof ProjectConfig | "modules";
  from: string;
  to: string | null;
  reason: string;
}
