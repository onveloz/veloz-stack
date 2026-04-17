import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils.js";
import type { VirtualFs } from "../vfs.js";

export function processFrontend(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.frontend === "none") return;
  // Wave 2b: TanStack Start only. Next / Nuxt / Svelte / Astro / Expo later.
  if (config.frontend !== "tanstack-start") return;
  processTemplatesFromPrefix(vfs, "frontend/tanstack-start/", "", config);
}
