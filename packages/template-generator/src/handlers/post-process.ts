import type { ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { MODULE_GENERATOR } from "../module-registry";
import { asPackageJson, isJsonObject } from "../package-json";
import type { VirtualFs } from "../vfs";
import { applyCatalogRefs } from "./catalog-emit";
import { applyRootScriptsToPkg } from "./post-process-lint";
import { appendModuleEnvVarsFromRegistry } from "./post-process-module-env";

/**
 * Post-processors run after every handler has written into the VFS.
 * They mutate shared JSON/YAML files (root package.json etc.) with the
 * final picture — scripts keyed off the final stack.
 */
export function postProcess(vfs: VirtualFs, config: ProjectConfig): void {
  stripOrpcClientWhenApiNone(vfs, config);
  setRootScripts(vfs, config);
  wireModuleDependencies(vfs, config);
  wireNextIntlDependency(vfs, config);
  stripNextRootPageForIntlModules(vfs, config);
  appendModuleEnvVarsFromRegistry(vfs, config);
  applyCatalogRefs(vfs, config);
}

/** No `packages/api` — remove generated oRPC client files and workspace api/orpc deps from package.json. */
function stripOrpcClientWhenApiNone(
  vfs: VirtualFs,
  config: ProjectConfig,
): void {
  if (config.api !== "none") {
    return;
  }

  const paths = [
    "apps/web/lib/orpc.ts",
    "apps/web/lib/orpc-server.ts",
    "apps/web/src/utils/orpc.ts",
    "apps/web/src/lib/orpc.ts",
    "apps/mobile/src/lib/orpc.ts",
    "apps/web/composables/useOrpc.ts",
  ];
  for (const p of paths) {
    if (vfs.exists(p)) {
      vfs.remove(p);
    }
  }

  const projApi = `@${config.projectName}/api`;
  for (const [path] of vfs.entries()) {
    if (!path.endsWith("package.json")) {
      continue;
    }
    vfs.updateJson(path, (raw) => {
      const pkg = asPackageJson(raw);
      const deps = pkg.dependencies;
      if (isJsonObject(deps)) {
        const next = { ...deps };
        for (const k of Object.keys(next)) {
          if (k === projApi || k.startsWith("@orpc/")) {
            delete next[k];
          }
        }
        pkg.dependencies = next;
      }
      return pkg;
    });
  }
}

function setRootScripts(vfs: VirtualFs, config: ProjectConfig): void {
  vfs.updateJson("package.json", (raw) => {
    const pkg = asPackageJson(raw);
    applyRootScriptsToPkg(pkg, config);
    return pkg;
  });
}

function wireNextIntlDependency(vfs: VirtualFs, config: ProjectConfig): void {
  if (!config.modules.includes("next-intl")) {
    return;
  }
  if (!vfs.exists("apps/web/package.json")) {
    return;
  }
  vfs.updateJson("apps/web/package.json", (raw) => {
    const pkg = asPackageJson(raw);
    pkg.dependencies = {
      ...pkg.dependencies,
      "next-intl": version("next-intl"),
    };
    return pkg;
  });
}

/** Avoid duplicate routes when a module emits locale-scoped pages. */
function stripNextRootPageForIntlModules(
  vfs: VirtualFs,
  config: ProjectConfig,
): void {
  const shouldStrip = config.modules.some(
    (m) => MODULE_GENERATOR[m]?.stripNextRootPage,
  );
  if (!shouldStrip) {
    return;
  }
  if (vfs.exists("apps/web/app/page.tsx")) {
    vfs.remove("apps/web/app/page.tsx");
  }
}

interface WorkspaceDepCollector {
  vfs: VirtualFs;
  projectName: string;
  serverDeps: Record<string, string>;
  webDeps: Record<string, string>;
}

function maybeAddServerWorkspaceDep(
  collector: WorkspaceDepCollector,
  packageName: string | undefined,
): void {
  if (!packageName) {
    return;
  }
  const pkgPath = `packages/${packageName}/package.json`;
  if (!collector.vfs.exists(pkgPath)) {
    return;
  }
  collector.serverDeps[`@${collector.projectName}/${packageName}`] =
    "workspace:*";
}

function maybeAddWebWorkspaceDep(
  collector: WorkspaceDepCollector,
  packageName: string | undefined,
): void {
  if (!packageName) {
    return;
  }
  const pkgPath = `packages/${packageName}/package.json`;
  if (!collector.vfs.exists(pkgPath)) {
    return;
  }
  collector.webDeps[`@${collector.projectName}/${packageName}`] = "workspace:*";
}

function collectModuleWorkspaceDeps(
  vfs: VirtualFs,
  config: ProjectConfig,
): { serverDeps: Record<string, string>; webDeps: Record<string, string> } {
  const collector: WorkspaceDepCollector = {
    vfs,
    projectName: config.projectName,
    serverDeps: {},
    webDeps: {},
  };

  for (const m of config.modules) {
    const entry = MODULE_GENERATOR[m];
    if (!entry) {
      continue;
    }
    maybeAddServerWorkspaceDep(collector, entry.serverWorkspacePackage);
    maybeAddWebWorkspaceDep(collector, entry.webWorkspacePackage);
  }

  return {
    serverDeps: collector.serverDeps,
    webDeps: collector.webDeps,
  };
}

function mergeWorkspaceDeps(
  vfs: VirtualFs,
  pkgPath: string,
  deps: Record<string, string>,
): void {
  if (Object.keys(deps).length === 0 || !vfs.exists(pkgPath)) {
    return;
  }
  vfs.updateJson(pkgPath, (raw) => {
    const pkg = asPackageJson(raw);
    pkg.dependencies = { ...pkg.dependencies, ...deps };
    return pkg;
  });
}

function wireModuleDependencies(vfs: VirtualFs, config: ProjectConfig): void {
  const { serverDeps, webDeps } = collectModuleWorkspaceDeps(vfs, config);

  const serverPkg =
    config.backend === "next"
      ? "apps/web/package.json"
      : "apps/server/package.json";
  mergeWorkspaceDeps(vfs, serverPkg, serverDeps);
  mergeWorkspaceDeps(vfs, "apps/web/package.json", webDeps);
}
