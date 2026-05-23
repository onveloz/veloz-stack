import type { ProjectConfig } from "@veloz-stack/types";
import { DEPENDENCY_VERSIONS } from "../deps";
import { isJsonObject } from "../package-json";
import type { VirtualFs } from "../vfs";

/** Values that must keep their literal specifier (never catalog substitution). */
const SKIP_CATALOG_LITERAL =
  /^(workspace:|file:|link:|catalog:|git\+|npm:|\*)/i;

const DEP_BLOCKS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const;

function depInCentralVersions(
  name: string,
): name is keyof typeof DEPENDENCY_VERSIONS {
  return Object.hasOwn(DEPENDENCY_VERSIONS, name);
}

function yamlCatalogKey(pkg: string): string {
  return JSON.stringify(pkg);
}

function yamlCatalogValue(ver: string): string {
  return JSON.stringify(ver.trim());
}

function parsePackageJson(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isJsonObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function shouldCatalogDep(pkg: string, ver: unknown): boolean {
  if (!depInCentralVersions(pkg)) {
    return false;
  }
  if (typeof ver !== "string") {
    return false;
  }
  return !SKIP_CATALOG_LITERAL.test(ver.trim());
}

function scanDepBlock(block: unknown, used: Set<string>): void {
  if (!isJsonObject(block)) {
    return;
  }
  for (const [pkg, ver] of Object.entries(block)) {
    if (shouldCatalogDep(pkg, ver)) {
      used.add(pkg);
    }
  }
}

function scanPackageJsonForCandidates(
  data: Record<string, unknown>,
  used: Set<string>,
): void {
  for (const blockName of DEP_BLOCKS) {
    scanDepBlock(data[blockName], used);
  }
}

function catalogizeDepBlock(block: Record<string, unknown>): boolean {
  let changed = false;
  for (const [pkg, ver] of Object.entries(block)) {
    if (!shouldCatalogDep(pkg, ver)) {
      continue;
    }
    block[pkg] = "catalog:";
    changed = true;
  }
  return changed;
}

function mutatePackageJsonToCatalog(data: Record<string, unknown>): boolean {
  let changed = false;
  for (const blockName of DEP_BLOCKS) {
    const block = data[blockName];
    if (!isJsonObject(block)) {
      continue;
    }
    if (catalogizeDepBlock(block)) {
      changed = true;
    }
  }
  return changed;
}

function mutatePackageJsonsToCatalog(vfs: VirtualFs): void {
  for (const [p, raw] of vfs.entries()) {
    if (!p.endsWith("package.json")) {
      continue;
    }
    const data = parsePackageJson(raw);
    if (!data) {
      continue;
    }
    if (!mutatePackageJsonToCatalog(data)) {
      continue;
    }
    vfs.write(p, `${JSON.stringify(data, null, 2)}\n`);
  }
}

function writePnpmWorkspaceYaml(
  vfs: VirtualFs,
  entries: readonly (readonly [string, string])[],
): void {
  const lines = ["packages:", "  - apps/*", "  - packages/*", ""];
  if (entries.length > 0) {
    lines.push("catalog:");
    for (const [pkg, ver] of entries) {
      lines.push(`  ${yamlCatalogKey(pkg)}: ${yamlCatalogValue(ver)}`);
    }
    lines.push("");
  }
  vfs.write("pnpm-workspace.yaml", lines.join("\n"));
}

function workspacePackagePaths(ws: unknown): string[] {
  if (Array.isArray(ws)) {
    return ws.map(String);
  }
  if (isJsonObject(ws) && Array.isArray(ws.packages)) {
    return ws.packages.map(String);
  }
  return ["apps/*", "packages/*"];
}

function writeBunWorkspacesCatalog(
  vfs: VirtualFs,
  entries: readonly (readonly [string, string])[],
): void {
  if (!vfs.exists("package.json")) {
    return;
  }

  vfs.updateJson("package.json", (pkg) => {
    const packagesPaths = workspacePackagePaths(pkg.workspaces);
    const nextWs: Record<string, unknown> = { packages: packagesPaths };
    if (entries.length > 0) {
      nextWs.catalog = Object.fromEntries(entries);
    }
    return { ...pkg, workspaces: nextWs };
  });
}

function collectCatalogCandidates(vfs: VirtualFs): Set<string> {
  const used = new Set<string>();
  for (const [p, raw] of vfs.entries()) {
    if (!p.endsWith("package.json")) {
      continue;
    }
    const data = parsePackageJson(raw);
    if (!data) {
      continue;
    }
    scanPackageJsonForCandidates(data, used);
  }
  return used;
}

/** After all handlers ran: centralize scaffold dependency versions behind pnpm / Bun catalogs. */
export function applyCatalogRefs(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.pm === "npm") {
    return;
  }

  const used = collectCatalogCandidates(vfs);

  const catalogSorted = [...used]
    .toSorted((a, b) => a.localeCompare(b))
    .filter((pkg) => depInCentralVersions(pkg))
    .map((pkg) => [pkg, DEPENDENCY_VERSIONS[pkg]] as const);

  mutatePackageJsonsToCatalog(vfs);

  if (config.pm === "pnpm") {
    writePnpmWorkspaceYaml(vfs, catalogSorted);
  }

  if (config.pm === "bun") {
    writeBunWorkspacesCatalog(vfs, catalogSorted);
  }
}
