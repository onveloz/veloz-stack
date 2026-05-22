import type { ModuleId, ProjectConfig } from "@veloz-stack/types";
import { version } from "../deps";
import { applyCatalogRefs } from "./catalog-emit";
import { applyRootScriptsToPkg } from "./post-process-lint";
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
  s3: "storage",
  "cloudflare-r2": "storage",
  pino: "logging",
  opentelemetry: "observability",
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
  wireModuleDependencies(vfs, config);
  wireNextIntlDependency(vfs, config);
  stripNextRootPageForNextIntl(vfs, config);
  appendModuleEnvVars(vfs, config);
  applyCatalogRefs(vfs, config);
}

function setRootScripts(vfs: VirtualFs, config: ProjectConfig): void {
  vfs.updateJson<Record<string, any>>("package.json", (pkg) => {
    applyRootScriptsToPkg(pkg, config);
    return pkg;
  });
}

function wireNextIntlDependency(vfs: VirtualFs, config: ProjectConfig): void {
  if (!config.modules.includes("next-intl")) return;
  if (!vfs.exists("apps/web/package.json")) return;
  vfs.updateJson<Record<string, any>>("apps/web/package.json", (pkg) => {
    pkg.dependencies = { ...pkg.dependencies, "next-intl": version("next-intl") };
    return pkg;
  });
}

/** Avoid duplicate routes: the module emits `app/[locale]/page.tsx`. */
function stripNextRootPageForNextIntl(vfs: VirtualFs, config: ProjectConfig): void {
  if (!config.modules.includes("next-intl")) return;
  if (vfs.exists("apps/web/app/page.tsx")) vfs.remove("apps/web/app/page.tsx");
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

  if (Object.keys(serverDeps).length > 0) {
    const serverPkg =
      config.backend === "next" ? "apps/web/package.json" : "apps/server/package.json";
    if (vfs.exists(serverPkg)) {
      vfs.updateJson<Record<string, any>>(serverPkg, (pkg) => {
        pkg.dependencies = { ...pkg.dependencies, ...serverDeps };
        return pkg;
      });
    }
  }
  if (Object.keys(webDeps).length > 0 && vfs.exists("apps/web/package.json")) {
    vfs.updateJson<Record<string, any>>("apps/web/package.json", (pkg) => {
      pkg.dependencies = { ...pkg.dependencies, ...webDeps };
      return pkg;
    });
  }
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
  if (config.modules.includes("better-auth-social")) {
    additions.push(
      "\n# OAuth providers (Better Auth social — populate the ones you want)",
      "GOOGLE_CLIENT_ID=",
      "GOOGLE_CLIENT_SECRET=",
      "GITHUB_CLIENT_ID=",
      "GITHUB_CLIENT_SECRET=",
      "APPLE_CLIENT_ID=",
      "APPLE_CLIENT_SECRET=",
    );
  }
  if (config.modules.includes("posthog")) {
    additions.push("\n# PostHog", "POSTHOG_KEY=", "POSTHOG_HOST=https://us.i.posthog.com");
  }
  if (config.modules.includes("sentry")) {
    additions.push("\n# Sentry", "SENTRY_DSN=");
  }
  if (config.modules.includes("opentelemetry")) {
    additions.push(
      "\n# OpenTelemetry (OTLP)",
      "OTEL_SERVICE_NAME=",
      "OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318",
    );
  }
  if (config.modules.includes("twilio")) {
    additions.push(
      "\n# Twilio",
      "TWILIO_SID=",
      "TWILIO_TOKEN=",
      "TWILIO_SMS_FROM=",
    );
  }
  if (config.modules.includes("upstash-redis")) {
    additions.push("\n# Upstash Redis", "UPSTASH_REDIS_URL=", "UPSTASH_REDIS_TOKEN=");
  }
  if (config.modules.includes("s3") || config.modules.includes("cloudflare-r2")) {
    additions.push(
      "\n# Object storage (S3-compatible)",
      "S3_BUCKET=",
      "S3_REGION=us-east-1",
      "S3_ACCESS_KEY_ID=",
      "S3_SECRET_ACCESS_KEY=",
      "# S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com  # for R2",
    );
  }
  if (
    config.modules.includes("asaas") ||
    config.modules.includes("pagarme") ||
    config.modules.includes("mercadopago") ||
    config.modules.includes("stripe-br")
  ) {
    if (config.modules.includes("asaas")) {
      additions.push("\n# Asaas", "ASAAS_KEY=", "ASAAS_WEBHOOK_TOKEN=");
    }
    if (config.modules.includes("pagarme")) {
      additions.push(
        "\n# Pagar.me",
        "PAGARME_SK=",
        "PAGARME_WEBHOOK_USER=",
        "PAGARME_WEBHOOK_PASS=",
      );
    }
    if (config.modules.includes("mercadopago")) {
      additions.push("\n# Mercado Pago", "MP_TOKEN=", "MP_WEBHOOK_SECRET=");
    }
    if (config.modules.includes("stripe-br")) {
      additions.push(
        "\n# Stripe",
        "STRIPE_SECRET=",
        "STRIPE_WEBHOOK_SECRET=",
        "STRIPE_PUBLISHABLE_KEY=",
      );
    }
  }

  if (additions.length === 0) return;

  const existing = vfs.read(".env.example") ?? "";
  vfs.write(".env.example", existing.trimEnd() + "\n" + additions.join("\n") + "\n");
}
