import type { ProjectConfig } from "@veloz-stack/types";
import type { VirtualFs } from "../vfs.js";

/**
 * Post-processors run after every handler has written into the VFS.
 * They mutate shared JSON/YAML files (root package.json etc.) with the
 * final picture — scripts keyed off the final stack.
 */
export function postProcess(vfs: VirtualFs, config: ProjectConfig): void {
  setRootScripts(vfs, config);
  emitWorkspaceFile(vfs, config);
  appendModuleEnvVars(vfs, config);
}

function emitWorkspaceFile(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.pm === "pnpm") {
    vfs.write("pnpm-workspace.yaml", "packages:\n  - apps/*\n  - packages/*\n");
  }
}

function setRootScripts(vfs: VirtualFs, config: ProjectConfig): void {
  vfs.updateJson<Record<string, any>>("package.json", (pkg) => {
    const pm = config.pm;
    const run = pm === "pnpm" ? "pnpm -r --parallel" : pm === "bun" ? "bun run --filter '*'" : "npm run -ws";
    pkg.scripts = {
      ...pkg.scripts,
      dev: `${run} dev`,
      build: `${run} build`,
      "check-types": `${run} check-types`,
      ...(config.db !== "none"
        ? {
            "db:push": pm === "pnpm" ? "pnpm -F @*/db db:push" : `${pm} --cwd packages/db run db:push`,
            "db:studio": pm === "pnpm" ? "pnpm -F @*/db db:studio" : `${pm} --cwd packages/db run db:studio`,
          }
        : {}),
    };
    return pkg;
  });
}

function appendModuleEnvVars(vfs: VirtualFs, config: ProjectConfig): void {
  const additions: string[] = [];

  if (config.modules.includes("abacatepay")) {
    additions.push("\n# AbacatePay", "ABACATE_KEY=", "ABACATE_WEBHOOK_SECRET=");
  }
  if (config.modules.includes("ararahq-sms") || config.modules.includes("ararahq-wa")) {
    additions.push("\n# Ararahq", "ARARA_KEY=", "ARARA_WEBHOOK_SECRET=");
  }
  if (config.modules.includes("himetrica")) {
    additions.push("\n# Himetrica", "HIMETRICA_API_KEY=");
  }
  if (config.modules.includes("claude")) {
    additions.push("\n# Anthropic / Claude", "ANTHROPIC_API_KEY=");
  }
  if (config.modules.includes("resend")) {
    additions.push("\n# Resend", "RESEND_API_KEY=");
  }

  if (additions.length === 0) return;

  const existing = vfs.read(".env.example") ?? "";
  vfs.write(".env.example", existing.trimEnd() + "\n" + additions.join("\n") + "\n");
}
