/** All integration module ids the generator can emit (payments, SMS, observability, etc.). */
export const MODULE_IDS = [
  "claude",
  "abacatepay",
  "asaas",
  "pagarme",
  "mercadopago",
  "stripe-br",
  "ararahq-sms",
  "ararahq-wa",
  "twilio",
  "cpf-cnpj",
  "viacep",
  "brasilapi",
  "lgpd-consent",
  "nfe-io",
  "pt-br-i18n",
  "himetrica",
  "posthog",
  "sentry",
  "caramelosec",
  "resend",
  "better-auth-social",
  "upstash-redis",
  "s3",
  "cloudflare-r2",
  "pino",
  "opentelemetry",
  "next-intl",
] as const;

/** Union of valid {@link MODULE_IDS} entries. */
export type ModuleId = (typeof MODULE_IDS)[number];

/** Grouping used by the stack builder module picker. */
export type ModuleCategory =
  | "ai"
  | "payments"
  | "messaging"
  | "identity"
  | "compliance"
  | "i18n"
  | "analytics"
  | "errors"
  | "security"
  | "email"
  | "auth"
  | "cache"
  | "observability"
  | "storage";

/** Display and constraint metadata for one integration module. */
export interface ModuleMeta {
  id: ModuleId;
  name: string;
  category: ModuleCategory;
  tagline: string;
  brazilian?: boolean;
  /** Module appears in the picker but has no generator templates yet. */
  comingSoon?: boolean;
  requires?: { auth?: boolean; backend?: true; db?: true };
  docsUrl?: string;
  website?: string;
  defaultOn?: boolean;
}

/** Registry of all modules keyed by {@link ModuleId}. */
export const MODULES: Record<ModuleId, ModuleMeta> = {
  claude: {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "ai",
    tagline: "Vibecoding pronto: CLAUDE.md, skills, Agent SDK, MCP",
    website: "https://claude.ai/code",
    defaultOn: true,
  },
  abacatepay: {
    id: "abacatepay",
    name: "AbacatePay",
    category: "payments",
    tagline: "Pagamentos PIX-first pro Brasil",
    brazilian: true,
    requires: { backend: true },
    website: "https://abacatepay.com",
    defaultOn: true,
  },
  asaas: {
    id: "asaas",
    name: "Asaas",
    category: "payments",
    tagline: "PIX, boleto, cartão, split",
    brazilian: true,
    requires: { backend: true },
    website: "https://asaas.com",
  },
  pagarme: {
    id: "pagarme",
    name: "Pagar.me",
    category: "payments",
    tagline: "Cartão, PIX e boleto — Stone group",
    brazilian: true,
    requires: { backend: true },
    website: "https://pagar.me",
  },
  mercadopago: {
    id: "mercadopago",
    name: "Mercado Pago",
    category: "payments",
    tagline: "Pagamentos marketplace BR/LatAm",
    brazilian: true,
    requires: { backend: true },
    website: "https://mercadopago.com.br",
  },
  "stripe-br": {
    id: "stripe-br",
    name: "Stripe (BR)",
    category: "payments",
    tagline: "BRL + boleto/PIX via Stripe",
    brazilian: true,
    requires: { backend: true },
    website: "https://stripe.com/br",
  },
  "ararahq-sms": {
    id: "ararahq-sms",
    name: "Ararahq — SMS",
    category: "messaging",
    tagline: "SMS OTP e notificações",
    brazilian: true,
    requires: { backend: true },
    website: "https://ararahq.com",
    defaultOn: true,
  },
  "ararahq-wa": {
    id: "ararahq-wa",
    name: "Ararahq — WhatsApp",
    category: "messaging",
    tagline: "WhatsApp Business API",
    brazilian: true,
    requires: { backend: true },
    website: "https://ararahq.com",
  },
  twilio: {
    id: "twilio",
    name: "Twilio",
    category: "messaging",
    tagline: "SMS / WhatsApp / voz — global",
    requires: { backend: true },
    website: "https://twilio.com",
  },
  "cpf-cnpj": {
    id: "cpf-cnpj",
    name: "CPF / CNPJ",
    category: "identity",
    tagline: "Validação + formatação",
    brazilian: true,
  },
  viacep: {
    id: "viacep",
    name: "ViaCEP",
    category: "identity",
    tagline: "CEP → endereço lookup",
    brazilian: true,
  },
  brasilapi: {
    id: "brasilapi",
    name: "BrasilAPI",
    category: "identity",
    tagline: "Feriados, bancos, FIPE, DDD",
    brazilian: true,
  },
  "lgpd-consent": {
    id: "lgpd-consent",
    name: "LGPD Consent",
    category: "compliance",
    tagline: "Banner de cookies + storage de consentimento",
    brazilian: true,
  },
  "nfe-io": {
    id: "nfe-io",
    name: "NFe.io",
    category: "compliance",
    tagline: "Automação fiscal NFe / NFSe",
    brazilian: true,
    comingSoon: true,
    requires: { backend: true },
    website: "https://nfe.io",
  },
  "pt-br-i18n": {
    id: "pt-br-i18n",
    name: "pt-BR i18n",
    category: "i18n",
    tagline:
      "Formatadores BRL/data — TanStack, Hono, etc. (não use com next-intl no Next)",
    brazilian: true,
    defaultOn: true,
  },
  himetrica: {
    id: "himetrica",
    name: "Himetrica",
    category: "analytics",
    tagline: "Dados e métricas — BR",
    brazilian: true,
    website: "https://himetrica.com",
    defaultOn: true,
  },
  posthog: {
    id: "posthog",
    name: "PostHog",
    category: "analytics",
    tagline: "Product analytics + feature flags",
    // (mantido em inglês — termos consagrados)
    website: "https://posthog.com",
  },
  sentry: {
    id: "sentry",
    name: "Sentry",
    category: "errors",
    tagline: "Rastreamento de erros + performance",
    website: "https://sentry.io",
  },
  caramelosec: {
    id: "caramelosec",
    name: "CaramoSec",
    category: "security",
    tagline: "Varredura de vulnerabilidades — BR",
    brazilian: true,
    website: "https://caramelosec.com",
    defaultOn: true,
  },
  resend: {
    id: "resend",
    name: "Resend",
    category: "email",
    tagline: "Email transacional + React Email",
    requires: { backend: true },
    website: "https://resend.com",
  },
  "better-auth-social": {
    id: "better-auth-social",
    name: "Social login",
    category: "auth",
    tagline: "OAuth do Google · GitHub · Apple",
    requires: { auth: true },
  },
  "upstash-redis": {
    id: "upstash-redis",
    name: "Upstash Redis",
    category: "cache",
    tagline: "Rate limit + cache de sessão",
    requires: { backend: true },
    website: "https://upstash.com",
  },
  s3: {
    id: "s3",
    name: "AWS S3",
    category: "storage",
    tagline: "Object storage (+ uploads presigned)",
    requires: { backend: true },
  },
  "cloudflare-r2": {
    id: "cloudflare-r2",
    name: "Cloudflare R2",
    category: "storage",
    tagline: "Compatível com S3, sem custo de egress",
    comingSoon: true,
    requires: { backend: true },
  },
  pino: {
    id: "pino",
    name: "Pino",
    category: "observability",
    tagline: "Logs estruturados — substitui hono/logger no servidor",
    requires: { backend: true },
    website: "https://getpino.io",
  },
  opentelemetry: {
    id: "opentelemetry",
    name: "OpenTelemetry",
    category: "observability",
    tagline: "Traces OTLP no Node/Bun — complementa observabilidade",
    requires: { backend: true },
    website: "https://opentelemetry.io",
  },
  "next-intl": {
    id: "next-intl",
    name: "next-intl",
    category: "i18n",
    tagline:
      "Locale + mensagens no App Router (só Next.js; substitui pt-BR i18n)",
    website: "https://next-intl.dev",
  },
};

/** Category order for the module picker UI. */
export const MODULE_CATEGORIES: ModuleCategory[] = [
  "ai",
  "auth",
  "payments",
  "messaging",
  "email",
  "identity",
  "compliance",
  "i18n",
  "analytics",
  "errors",
  "security",
  "observability",
  "cache",
  "storage",
];

/** Portuguese labels for {@link ModuleCategory} values. */
export const MODULE_CATEGORY_LABELS: Record<ModuleCategory, string> = {
  ai: "IA",
  auth: "Auth",
  payments: "Pagamentos",
  messaging: "Mensageria",
  email: "Email",
  identity: "Identidade",
  compliance: "Compliance",
  i18n: "i18n",
  analytics: "Analytics",
  errors: "Erros",
  security: "Segurança",
  observability: "Observabilidade",
  cache: "Cache",
  storage: "Storage",
};
