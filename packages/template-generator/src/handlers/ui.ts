import type { ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * UI styling axis. Overlays the frontend output with a Veloz-branded
 * showcase page that demonstrates whichever styling stack was picked.
 *
 * Templates live in templates/ui/<id>/frontend-<frontend>/ — only the
 * (frontend, ui) combos we support exist on disk; everything else
 * silently no-ops (the frontend's stock home stays in place).
 *
 * Validator already rejects shadcn + non-React frontends, so by the
 * time we get here the combo is guaranteed sane.
 */
export function processUi(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.frontend === "none") return;

  const frontendKey = frontendDirKey(config.frontend);
  if (!frontendKey) return;

  processTemplatesFromPrefix(vfs, `ui/${config.ui}/${frontendKey}/`, "", config);

  if (config.ui === "shadcn") {
    addShadcnDeps(vfs);
  } else if (config.ui === "none") {
    stripTailwindDeps(vfs, config);
  }
}

function frontendDirKey(frontend: ProjectConfig["frontend"]): string | null {
  switch (frontend) {
    case "tanstack-start":
      return "frontend-tanstack";
    case "next":
      return "frontend-next";
    default:
      return null;
  }
}

function stripTailwindDeps(vfs: VirtualFs, config: ProjectConfig): void {
  if (!vfs.exists("apps/web/package.json")) return;

  vfs.updateJson<Record<string, any>>("apps/web/package.json", (pkg) => {
    if (pkg.dependencies) {
      delete pkg.dependencies.tailwindcss;
      delete pkg.dependencies["@tailwindcss/vite"];
    }
    if (pkg.devDependencies) {
      delete pkg.devDependencies["@tailwindcss/postcss"];
    }
    return pkg;
  });

  // Next ships an empty postcss.config since the page no longer uses
  // Tailwind utilities; nothing else to do for tanstack (vite.config
  // overlay already drops the plugin).
  void config;
}

function addShadcnDeps(vfs: VirtualFs): void {
  if (!vfs.exists("apps/web/package.json")) return;

  vfs.updateJson<Record<string, any>>("apps/web/package.json", (pkg) => {
    pkg.dependencies = {
      ...(pkg.dependencies ?? {}),
      "@radix-ui/react-dialog": "^1.1.6",
      "@radix-ui/react-slot": "^1.1.2",
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.6.0",
      "tw-animate-css": "^1.2.3",
    };
    return pkg;
  });
}
