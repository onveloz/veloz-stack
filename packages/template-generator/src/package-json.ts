/** Minimal package.json shape used by VFS post-processors. */
export interface PackageJson extends Record<string, unknown> {
  name?: string;
  private?: boolean;
  type?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?:
    | string[]
    | { packages?: string[]; catalog?: Record<string, string> };
  prepare?: string;
  packageManager?: string;
  "lint-staged"?: Record<string, string[]>;
}

export function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function asPackageJson(data: Record<string, unknown>): PackageJson {
  return data;
}
