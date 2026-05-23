import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { asPackageJson } from "../package-json";
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
  if (config.desktop === "none") {
    return;
  }

  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: "desktop/tauri/apps/",
    destPrefix: "apps/",
    config,
  });

  if (config.frontend === "tanstack-start") {
    processTemplatesFromPrefix({
      vfs,
      sourcePrefix: "desktop/tauri/frontend-tanstack/apps/",
      destPrefix: "apps/",
      config,
    });
    if (vfs.exists("apps/web/package.json")) {
      vfs.updateJson("apps/web/package.json", (raw) => {
        const pkg = asPackageJson(raw);
        pkg.dependencies = {
          ...pkg.dependencies,
          "@tauri-apps/api": version("@tauri-apps/api"),
        };
        return pkg;
      });
    }
  }
}
