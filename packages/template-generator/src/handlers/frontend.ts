import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

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
            : config.frontend === "svelte-kit"
              ? "frontend/svelte-kit/"
              : null;
  if (!prefix) return;
  processTemplatesFromPrefix(vfs, prefix, "", config);
}
