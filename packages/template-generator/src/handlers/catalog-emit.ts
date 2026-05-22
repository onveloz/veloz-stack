import type { ProjectConfig } from "@veloz-stack/types";
import { DEPENDENCY_VERSIONS } from "../deps";
import type { VirtualFs } from "../vfs";

/** Values that must keep their literal specifier (never catalog substitution). */
const SKIP_CATALOG_LITERAL = /^(workspace:|file:|link:|catalog:|catalogs:|git\+|npm:|\*)/i;

function depInCentralVersions(name: string): name is keyof typeof DEPENDENCY_VERSIONS {
  return Object.prototype.hasOwnProperty.call(DEPENDENCY_VERSIONS, name);
}

function yamlCatalogKey(pkg: string): string {
  return JSON.stringify(pkg);
}

/** After all handlers ran: centralize scaffold dependency versions behind pnpm / Bun catalogs. */
export function applyCatalogRefs(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.pm === "npm") return;

  const used = new Set<string>();

  for (const [p, raw] of vfs.entries()) {
    if (!p.endsWith("package.json")) continue;
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      continue;
    }
    scanPackageJsonForCandidates(data, used);
  }

  const catalogSorted = [...used]
    .sort((a, b) => a.localeCompare(b))
    .map((pkg) => {
      const v = DEPENDENCY_VERSIONS[pkg as keyof typeof DEPENDENCY_VERSIONS];
      return [pkg, v] as const;
    });

  mutatePackageJsonsToCatalog(vfs);

  if (config.pm === "pnpm") writePnpmWorkspaceYaml(vfs, catalogSorted);

  if (config.pm === "bun") writeBunWorkspacesCatalog(vfs, catalogSorted);
}

function scanPackageJsonForCandidates(data: Record<string, unknown>, used: Set<string>): void {
  for (const blockName of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
    const block = data[blockName];
    if (!block || typeof block !== "object") continue;

    for (const [pkg, ver] of Object.entries(block)) {
      if (!depInCentralVersions(pkg)) continue;
      if (typeof ver !== "string") continue;
      if (SKIP_CATALOG_LITERAL.test(ver.trim())) continue;
      used.add(pkg);
    }
  }
}

function mutatePackageJsonsToCatalog(vfs: VirtualFs): void {
  for (const [p, raw] of [...vfs.entries()]) {
    if (!p.endsWith("package.json")) continue;
    const data = JSON.parse(raw) as Record<string, any>;
    let changed = false;

    for (const blockName of ["dependencies", "devDependencies", "optionalDependencies", "peerDependencies"]) {
      const block = data[blockName];
      if (!block || typeof block !== "object") continue;

      for (const [pkg, ver] of Object.entries(block)) {
        if (!depInCentralVersions(pkg)) continue;
        if (typeof ver !== "string") continue;
        if (SKIP_CATALOG_LITERAL.test(ver.trim())) continue;
        block[pkg] = "catalog:";
        changed = true;
      }
    }

    if (changed) vfs.write(p, `${JSON.stringify(data, null, 2)}\n`);
  }
}

function writePnpmWorkspaceYaml(vfs: VirtualFs, entries: readonly (readonly [string, string])[]): void {
  const lines = ["packages:", "  - apps/*", "  - packages/*", ""];
  if (entries.length > 0) {
    lines.push("catalog:");
    for (const [pkg, ver] of entries) lines.push(`  ${yamlCatalogKey(pkg)}: ${ver.trim()}`);
    lines.push("");
  }
  vfs.write("pnpm-workspace.yaml", lines.join("\n"));
}

function writeBunWorkspacesCatalog(vfs: VirtualFs, entries: readonly (readonly [string, string])[]): void {
  if (!vfs.exists("package.json")) return;

  vfs.updateJson<Record<string, any>>("package.json", (pkg) => {
    const ws = pkg.workspaces;

    /** @type {string[]} */
    let packagesPaths: string[];
    if (Array.isArray(ws)) {
      packagesPaths = ws.map(String);
    } else if (ws && typeof ws === "object" && Array.isArray(ws.packages)) {
      packagesPaths = ws.packages.map(String);
    } else {
      packagesPaths = ["apps/*", "packages/*"];
    }

    const nextWs: Record<string, unknown> = { packages: packagesPaths };
    if (entries.length > 0) {
      nextWs.catalog = Object.fromEntries(entries);
    }

    return { ...pkg, workspaces: nextWs };
  });
}
