import type { ModuleId, ProjectConfig } from "@veloz-stack/types";
import type { VirtualFs } from "../vfs";

/** Modules that ship a workspace package, and the directory under `packages/` each creates. */
const SERVER_WORKSPACE_PACKAGES: Partial<Record<ModuleId, string>> = {
  claude: "claude",
  abacatepay: "abacatepay",
  asaas: "asaas",
  pagarme: "pagarme",
  mercadopago: "mercadopago",
  twilio: "twilio",
  "stripe-br": "stripe",
  "ararahq-sms": "ararahq",
  "ararahq-wa": "ararahq",
  resend: "email",
  brasilapi: "brasilapi",
  posthog: "analytics",
  sentry: "errors",
  "upstash-redis": "cache",
};

const WEB_WORKSPACE_PACKAGES: Partial<Record<ModuleId, string>> = {
  "pt-br-i18n": "i18n",
  "lgpd-consent": "lgpd",
  "cpf-cnpj": "br-identity",
  viacep: "br-identity",
  himetrica: "himetrica",
};

/**
 * Post-processors run after every handler has written into the VFS.
 * They mutate shared JSON/YAML files (root package.json etc.) with the
 * final picture — scripts keyed off the final stack.
 */
export function postProcess(vfs: VirtualFs, config: ProjectConfig): void {
  setRootScripts(vfs, config);
  emitWorkspaceFile(vfs, config);
  wireModuleDependencies(vfs, config);
  appendModuleEnvVars(vfs, config);
}

function wireModuleDependencies(vfs: VirtualFs, config: ProjectConfig): void {
  const serverDeps: Record<string, string> = {};
  const webDeps: Record<string, string> = {};

  for (const m of config.modules) {
    const srv = SERVER_WORKSPACE_PACKAGES[m];
    if (srv && vfs.exists(`packages/${srv}/package.json`)) {
      serverDeps[`@${config.projectName}/${srv}`] = "workspace:*";
    }
    const web = WEB_WORKSPACE_PACKAGES[m];
    if (web && vfs.exists(`packages/${web}/package.json`)) {
      webDeps[`@${config.projectName}/${web}`] = "workspace:*";
    }
  }

  if (Object.keys(serverDeps).length > 0 && vfs.exists("apps/server/package.json")) {
    vfs.updateJson<Record<string, any>>("apps/server/package.json", (pkg) => {
      pkg.dependencies = { ...pkg.dependencies, ...serverDeps };
      return pkg;
    });
  }
  if (Object.keys(webDeps).length > 0 && vfs.exists("apps/web/package.json")) {
    vfs.updateJson<Record<string, any>>("apps/web/package.json", (pkg) => {
      pkg.dependencies = { ...pkg.dependencies, ...webDeps };
      return pkg;
    });
  }
}

function emitWorkspaceFile(vfs: VirtualFs, config: ProjectConfig): void {
  if (config.pm === "pnpm") {
    vfs.write("pnpm-workspace.yaml", "packages:\n  - apps/*\n  - packages/*\n");
  }
}

function setRootScripts(vfs: VirtualFs, config: ProjectConfig): void {
  const hasTurbo = config.addons.includes("turborepo");
  const hasBiome = config.addons.includes("biome");
  const hasHusky = config.addons.includes("husky");
  const pm = config.pm;

  vfs.updateJson<Record<string, any>>("package.json", (pkg) => {
    const run = hasTurbo
      ? "turbo run"
      : pm === "pnpm"
      ? "pnpm -r --parallel"
      : pm === "bun"
      ? "bun run --filter '*'"
      : "npm run -ws";

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
      ...(hasBiome
        ? {
            format: "biome format --write .",
            lint: "biome lint .",
            check: "biome check --write .",
          }
        : {}),
      ...(hasHusky ? { prepare: "husky" } : {}),
    };

    pkg.devDependencies = {
      ...(pkg.devDependencies ?? {}),
      ...(hasTurbo ? { turbo: "^2.6.3" } : {}),
      ...(hasBiome ? { "@biomejs/biome": "^1.9.4" } : {}),
      ...(hasHusky ? { husky: "^9.1.7", "lint-staged": "^16.3.2" } : {}),
    };

    if (hasHusky) {
      pkg["lint-staged"] = hasBiome
        ? { "*.{js,jsx,ts,tsx,json,md}": ["biome check --write --no-errors-on-unmatched"] }
        : { "*.{js,jsx,ts,tsx,json,md}": [] };
    }

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
