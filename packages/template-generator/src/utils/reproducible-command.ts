import type { ProjectConfig } from "@veloz-stack/types";
import { DEFAULT_CONFIG } from "@veloz-stack/types";

function flag(name: string, value: string | boolean | undefined): string[] {
  if (typeof value === "boolean") {
    return value ? [`--${name}`] : [];
  }
  if (value === undefined || value === "") return [];
  return [`--${name}`, value];
}

function listFlag(name: string, values: readonly string[]): string[] {
  if (values.length === 0) return [];
  return [`--${name}`, values.join(",")];
}

function hasShellMetacharacters(value: string): boolean {
  // Single quotes are omitted — shellEscape uses double quotes only.
  if (/[\s"`$\\]/.test(value)) return true;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

function shellEscape(value: string): string {
  if (!hasShellMetacharacters(value)) return value;
  return `"${value.replace(/["\\`$]/g, "\\$&")}"`;
}

/**
 * CLI command that recreates this stack (mirrors create-veloz-stack flags).
 */
export function buildReproducibleCommand(config: ProjectConfig): string {
  const d = DEFAULT_CONFIG;
  const pm = config.pm;
  const create =
    pm === "bun"
      ? ["bun", "create", "veloz-stack@latest"]
      : pm === "pnpm"
        ? ["pnpm", "create", "veloz-stack@latest"]
        : ["npm", "create", "veloz-stack@latest"];

  const parts = [
    ...create,
    shellEscape(config.projectName),
    ...flag("preset", config.preset !== d.preset ? config.preset : ""),
    ...flag("frontend", config.frontend !== d.frontend ? config.frontend : ""),
    ...flag("mobile", config.mobile !== d.mobile ? config.mobile : ""),
    ...flag("desktop", config.desktop !== d.desktop ? config.desktop : ""),
    ...flag("backend", config.backend !== d.backend ? config.backend : ""),
    ...flag("runtime", config.runtime !== d.runtime ? config.runtime : ""),
    ...flag("api", config.api !== d.api ? config.api : ""),
    ...flag("db", config.db !== d.db ? config.db : ""),
    ...flag("orm", config.orm !== d.orm ? config.orm : ""),
    ...flag("db-hosting", config.dbHosting !== d.dbHosting ? config.dbHosting : ""),
    ...flag("auth", config.auth !== d.auth ? config.auth : ""),
    ...flag("deploy", config.deploy !== d.deploy ? config.deploy : ""),
    ...flag("pm", config.pm !== d.pm ? config.pm : ""),
    ...flag("ui", config.ui !== d.ui ? config.ui : ""),
    ...listFlag("modules", config.modules),
    ...listFlag("examples", config.examples),
    ...listFlag("addons", config.addons),
    ...(config.oxlintStrict ? ["--oxlint-strict"] : []),
    ...(config.lefthookCi ? ["--lefthook-ci"] : []),
    ...(config.lefthookAdvanced ? ["--lefthook-advanced"] : []),
    "--yes",
  ].filter((p) => p !== "");

  return parts.join(" ");
}
