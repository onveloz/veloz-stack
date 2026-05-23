import type { ModuleId } from "@veloz-stack/types";

/** Generator wiring for a stack module — single source for templates, workspace deps, and env vars. */
export interface ModuleGeneratorEntry {
  /** Path under `templates/` passed to `processTemplatesFromPrefix`. */
  templatePrefix?: string;
  /** `packages/<name>` created on the server app (Hono or Next backend). */
  serverWorkspacePackage?: string;
  /** `packages/<name>` wired into `apps/web/package.json`. */
  webWorkspacePackage?: string;
  /** Lines appended to `.env.example` when this module is selected. */
  envVarLines?: string[];
  /** When true with next-intl, remove `apps/web/app/page.tsx` to avoid duplicate routes. */
  stripNextRootPage?: boolean;
}

/**
 * Canonical module → generator mapping. Handlers read from here instead of
 * duplicating prefix/workspace/env tables across files.
 */
export const MODULE_GENERATOR: Partial<Record<ModuleId, ModuleGeneratorEntry>> =
  {
    claude: {
      templatePrefix: "modules/claude/",
      serverWorkspacePackage: "claude",
      envVarLines: ["\n# Anthropic / Claude", "ANTHROPIC_API_KEY="],
    },
    abacatepay: {
      templatePrefix: "modules/abacatepay/",
      serverWorkspacePackage: "abacatepay",
      envVarLines: [
        "\n# AbacatePay",
        "ABACATE_KEY=",
        "ABACATE_WEBHOOK_SECRET=",
      ],
    },
    asaas: {
      templatePrefix: "modules/asaas/",
      serverWorkspacePackage: "asaas",
      envVarLines: ["\n# Asaas", "ASAAS_KEY=", "ASAAS_WEBHOOK_TOKEN="],
    },
    pagarme: {
      templatePrefix: "modules/pagarme/",
      serverWorkspacePackage: "pagarme",
      envVarLines: [
        "\n# Pagar.me",
        "PAGARME_SK=",
        "PAGARME_WEBHOOK_USER=",
        "PAGARME_WEBHOOK_PASS=",
      ],
    },
    mercadopago: {
      templatePrefix: "modules/mercadopago/",
      serverWorkspacePackage: "mercadopago",
      envVarLines: ["\n# Mercado Pago", "MP_TOKEN=", "MP_WEBHOOK_SECRET="],
    },
    "stripe-br": {
      templatePrefix: "modules/stripe/",
      serverWorkspacePackage: "stripe",
      envVarLines: [
        "\n# Stripe",
        "STRIPE_SECRET=",
        "STRIPE_WEBHOOK_SECRET=",
        "STRIPE_PUBLISHABLE_KEY=",
      ],
    },
    "ararahq-sms": {
      templatePrefix: "modules/ararahq/",
      serverWorkspacePackage: "ararahq",
      envVarLines: ["\n# Ararahq", "ARARA_KEY=", "ARARA_WEBHOOK_SECRET="],
    },
    "ararahq-wa": {
      templatePrefix: "modules/ararahq/",
      serverWorkspacePackage: "ararahq",
      envVarLines: ["\n# Ararahq", "ARARA_KEY=", "ARARA_WEBHOOK_SECRET="],
    },
    twilio: {
      templatePrefix: "modules/twilio/",
      serverWorkspacePackage: "twilio",
      envVarLines: [
        "\n# Twilio",
        "TWILIO_SID=",
        "TWILIO_TOKEN=",
        "TWILIO_SMS_FROM=",
      ],
    },
    "cpf-cnpj": {
      templatePrefix: "modules/cpf-cnpj/",
      webWorkspacePackage: "br-identity",
    },
    viacep: {
      templatePrefix: "modules/viacep/",
      webWorkspacePackage: "br-identity",
    },
    brasilapi: {
      templatePrefix: "modules/brasilapi/",
      serverWorkspacePackage: "brasilapi",
    },
    "lgpd-consent": {
      templatePrefix: "modules/lgpd-consent/",
      webWorkspacePackage: "lgpd",
    },
    "pt-br-i18n": {
      templatePrefix: "modules/pt-br-i18n/",
      webWorkspacePackage: "i18n",
    },
    himetrica: {
      templatePrefix: "modules/himetrica/",
      webWorkspacePackage: "himetrica",
      envVarLines: ["\n# Himetrica", "HIMETRICA_API_KEY="],
    },
    posthog: {
      templatePrefix: "modules/posthog/",
      serverWorkspacePackage: "analytics",
    },
    sentry: {
      templatePrefix: "modules/sentry/",
      serverWorkspacePackage: "errors",
    },
    caramelosec: { templatePrefix: "modules/caramelosec/" },
    resend: {
      templatePrefix: "modules/resend/",
      serverWorkspacePackage: "email",
      envVarLines: ["\n# Resend", "RESEND_API_KEY="],
    },
    "better-auth-social": {
      envVarLines: [
        "\n# OAuth providers (Better Auth social — populate the ones you want)",
        "GOOGLE_CLIENT_ID=",
        "GOOGLE_CLIENT_SECRET=",
        "GITHUB_CLIENT_ID=",
        "GITHUB_CLIENT_SECRET=",
        "APPLE_CLIENT_ID=",
        "APPLE_CLIENT_SECRET=",
      ],
    },
    "upstash-redis": {
      templatePrefix: "modules/upstash-redis/",
      serverWorkspacePackage: "cache",
      envVarLines: [
        "\n# Upstash Redis",
        "UPSTASH_REDIS_URL=",
        "UPSTASH_REDIS_TOKEN=",
      ],
    },
    s3: {
      templatePrefix: "modules/s3/",
      serverWorkspacePackage: "storage",
      envVarLines: [
        "\n# Object storage (S3-compatible)",
        "S3_BUCKET=",
        "S3_REGION=us-east-1",
        "S3_ACCESS_KEY_ID=",
        "S3_SECRET_ACCESS_KEY=",
      ],
    },
    pino: {
      templatePrefix: "modules/pino/",
      serverWorkspacePackage: "logging",
    },
    opentelemetry: {
      templatePrefix: "modules/opentelemetry/",
      serverWorkspacePackage: "observability",
      envVarLines: [
        "\n# OpenTelemetry (OTLP)",
        "OTEL_SERVICE_NAME=",
        "OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318",
      ],
    },
    "next-intl": {
      templatePrefix: "modules/next-intl/",
      stripNextRootPage: true,
    },
  };

/** Unique template prefixes (ararahq-sms + ararahq-wa share one folder). */
export function moduleTemplatePrefixes(modules: ModuleId[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of modules) {
    const prefix = MODULE_GENERATOR[id]?.templatePrefix;
    if (!prefix || seen.has(prefix)) {
      continue;
    }
    seen.add(prefix);
    out.push(prefix);
  }
  return out;
}

const R2_STORAGE_ENV_LINES = [
  "\n# Object storage (S3-compatible)",
  "S3_BUCKET=",
  "S3_REGION=us-east-1",
  "S3_ACCESS_KEY_ID=",
  "S3_SECRET_ACCESS_KEY=",
  "# S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com  # for R2",
] as const;

function skipDuplicateArarahq(id: ModuleId, seenArarahq: Set<string>): boolean {
  if (id !== "ararahq-sms" && id !== "ararahq-wa") {
    return false;
  }
  if (seenArarahq.has("ararahq")) {
    return true;
  }
  seenArarahq.add("ararahq");
  return false;
}

function appendStorageModuleEnvLines(
  id: ModuleId,
  lines: string[],
  seenStorage: Set<string>,
): "handled" | "skip" | "fallthrough" {
  if (id !== "s3" && id !== "cloudflare-r2") {
    return "fallthrough";
  }
  if (seenStorage.has("storage")) {
    return "skip";
  }
  seenStorage.add("storage");
  if (id === "cloudflare-r2") {
    lines.push(...R2_STORAGE_ENV_LINES);
    return "handled";
  }
  return "fallthrough";
}

function appendKnownModuleEnvLines(id: ModuleId, lines: string[]): boolean {
  if (id === "posthog") {
    lines.push(
      "\n# PostHog",
      "POSTHOG_KEY=",
      "POSTHOG_HOST=https://us.i.posthog.com",
    );
    return true;
  }
  if (id === "sentry") {
    lines.push("\n# Sentry", "SENTRY_DSN=");
    return true;
  }
  return false;
}

interface ModuleEnvVarContext {
  lines: string[];
  seenArarahq: Set<string>;
  seenStorage: Set<string>;
}

function appendModuleEnvVarEntry(
  id: ModuleId,
  ctx: ModuleEnvVarContext,
  entry: NonNullable<(typeof MODULE_GENERATOR)[ModuleId]>,
): void {
  if (skipDuplicateArarahq(id, ctx.seenArarahq)) {
    return;
  }

  const storageResult = appendStorageModuleEnvLines(
    id,
    ctx.lines,
    ctx.seenStorage,
  );
  if (storageResult === "skip" || storageResult === "handled") {
    return;
  }
  if (appendKnownModuleEnvLines(id, ctx.lines)) {
    return;
  }

  const { envVarLines } = entry;
  if (envVarLines) {
    ctx.lines.push(...envVarLines);
  }
}

/** @internal Scaffold pipeline step. */
export function collectModuleEnvVarLines(modules: ModuleId[]): string[] {
  const ctx: ModuleEnvVarContext = {
    lines: [],
    seenArarahq: new Set<string>(),
    seenStorage: new Set<string>(),
  };

  for (const id of modules) {
    const entry = MODULE_GENERATOR[id];
    if (!entry?.envVarLines?.length) {
      continue;
    }
    appendModuleEnvVarEntry(id, ctx, entry);
  }

  return ctx.lines;
}
