import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Desktop target axis. Currently only Tauri 2.
 *
 * Tauri WRAPS a web frontend, so it requires `frontend !== "none"`.
 * The validator enforces this; here we just emit the shell.
 *
 * For TanStack Start frontends we also drop a /desktop route into
 * apps/web that demonstrates Rust ↔ Web IPC via @tauri-apps/api.
 */
export function processDesktop(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.desktop === "none") return;
  if (config.desktop !== "tauri") return;

  processTemplatesFromPrefix(vfs, "desktop/tauri/apps/", "apps/", config);

  if (config.frontend === "tanstack-start") {
    processTemplatesFromPrefix(
      vfs,
      "desktop/tauri/frontend-tanstack/apps/",
      "apps/",
      config,
    );
    if (vfs.exists("apps/web/package.json")) {
      vfs.updateJson<Record<string, any>>("apps/web/package.json", (pkg) => {
        pkg.dependencies = {
          ...(pkg.dependencies ?? {}),
          "@tauri-apps/api": version("@tauri-apps/api"),
        };
        return pkg;
      });
    }
  }
}
