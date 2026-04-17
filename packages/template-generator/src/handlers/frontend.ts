import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils.js";
import type { VirtualFs } from "../vfs.js";

export function processFrontend(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.frontend === "none") return;
  const prefix =
    config.frontend === "tanstack-start"
      ? "frontend/tanstack-start/"
      : config.frontend === "next"
      ? "frontend/next/"
      : null;
  if (!prefix) return; // nuxt / svelte-kit / astro / native-expo: Wave 2d
  processTemplatesFromPrefix(vfs, prefix, "", config);
}
