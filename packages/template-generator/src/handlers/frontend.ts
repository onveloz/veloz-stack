import type { FrontendId, ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

const FRONTEND_PREFIX: Partial<Record<FrontendId, string>> = {
  "tanstack-start": "frontend/tanstack-start/",
  next: "frontend/next/",
  astro: "frontend/astro/",
  nuxt: "frontend/nuxt/",
  "svelte-kit": "frontend/svelte-kit/",
};

/** @internal Scaffold pipeline step. */
export function processFrontend(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.frontend === "none") {
    return;
  }
  const prefix = FRONTEND_PREFIX[config.frontend];
  if (!prefix) {
    return;
  }
  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: prefix,
    destPrefix: "",
    config,
  });
}
