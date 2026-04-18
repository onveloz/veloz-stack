import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Mobile (native) target axis. Independent from `frontend` (web) — you
 * can pick a web frontend AND a mobile target and get both apps in
 * the same monorepo, sharing @proj/api types.
 */
export function processMobile(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.mobile === "none") return;
  if (config.mobile === "expo") {
    processTemplatesFromPrefix(vfs, "mobile/expo/", "", config);
  }
}
