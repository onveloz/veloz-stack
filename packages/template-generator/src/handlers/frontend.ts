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
      : config.frontend === "astro"
      ? "frontend/astro/"
      : config.frontend === "nuxt"
      ? "frontend/nuxt/"
      : null;
  if (!prefix) return; // svelte-kit / native-expo: Wave 2d
  processTemplatesFromPrefix(vfs, prefix, "", config);
}
