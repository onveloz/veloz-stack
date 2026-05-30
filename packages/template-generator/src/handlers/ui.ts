import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { asPackageJson } from "../package-json";
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
  if (config.frontend === "none") {
    return;
  }

  const frontendKey = frontendDirKey(config.frontend);
  if (!frontendKey) {
    return;
  }

  processTemplatesFromPrefix({
    vfs,
    sourcePrefix: `ui/${config.ui}/${frontendKey}/`,
    destPrefix: "",
    config,
  });

  if (config.ui === "shadcn") {
    addShadcnDeps(vfs);
  } else if (config.ui === "none") {
    stripTailwindDeps(vfs);
  }
}

function frontendDirKey(frontend: ProjectConfig["frontend"]): string | null {
  switch (frontend) {
    case "tanstack-start": {
      return "frontend-tanstack";
    }
    case "next": {
      return "frontend-next";
    }
    case "astro":
    case "none":
    case "nuxt":
    case "svelte-kit": {
      return null;
    }
    default: {
      return null;
    }
  }
}

function stripTailwindDeps(vfs: VirtualFs): void {
  if (!vfs.exists("apps/web/package.json")) {
    return;
  }

  vfs.updateJson("apps/web/package.json", (raw) => {
    const pkg = asPackageJson(raw);
    if (pkg.dependencies) {
      delete pkg.dependencies.tailwindcss;
      delete pkg.dependencies["@tailwindcss/vite"];
    }
    if (pkg.devDependencies) {
      delete pkg.devDependencies["@tailwindcss/postcss"];
    }
    return pkg;
  });
}

function addShadcnDeps(vfs: VirtualFs): void {
  if (!vfs.exists("apps/web/package.json")) {
    return;
  }

  vfs.updateJson("apps/web/package.json", (raw) => {
    const pkg = asPackageJson(raw);
    pkg.dependencies = {
      ...pkg.dependencies,
      "@radix-ui/react-dialog": version("@radix-ui/react-dialog"),
      "@radix-ui/react-slot": version("@radix-ui/react-slot"),
      "class-variance-authority": version("class-variance-authority"),
      clsx: version("clsx"),
      "tailwind-merge": version("tailwind-merge"),
      "tw-animate-css": version("tw-animate-css"),
    };
    return pkg;
  });
}
