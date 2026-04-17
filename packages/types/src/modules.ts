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
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

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
  | "storage";

export interface ModuleMeta {
  id: ModuleId;
  name: string;
  category: ModuleCategory;
  tagline: string;
  brazilian?: boolean;
  requires?: { auth?: boolean; backend?: true; db?: true };
  docsUrl?: string;
  website?: string;
  defaultOn?: boolean;
}

export const MODULES: Record<ModuleId, ModuleMeta> = {
  claude: {
    id: "claude",
    name: "Claude (Anthropic)",
    category: "ai",
    tagline: "Vibecoding pre-wired: CLAUDE.md, skills, Agent SDK, MCP",
    website: "https://claude.ai/code",
    defaultOn: true,
  },
  abacatepay: {
    id: "abacatepay",
    name: "AbacatePay",
    category: "payments",
    tagline: "PIX-first payments for Brazil",
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
    tagline: "Marketplace payments BR/LatAm",
    brazilian: true,
    requires: { backend: true },
    website: "https://mercadopago.com.br",
  },
  "stripe-br": {
    id: "stripe-br",
    name: "Stripe (BR)",
    category: "payments",
    tagline: "BRL + Boleto/PIX via Stripe",
    requires: { backend: true },
    website: "https://stripe.com/br",
  },
  "ararahq-sms": {
    id: "ararahq-sms",
    name: "Ararahq — SMS",
    category: "messaging",
    tagline: "SMS OTP and notifications",
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
    tagline: "SMS / WhatsApp / voice — global",
    requires: { backend: true },
    website: "https://twilio.com",
  },
  "cpf-cnpj": {
    id: "cpf-cnpj",
    name: "CPF / CNPJ",
    category: "identity",
    tagline: "Validation + formatting utilities",
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
    tagline: "Cookie banner + consent store",
    brazilian: true,
  },
  "nfe-io": {
    id: "nfe-io",
    name: "NFe.io",
    category: "compliance",
    tagline: "NFe / NFSe fiscal automation",
    brazilian: true,
    requires: { backend: true },
    website: "https://nfe.io",
  },
  "pt-br-i18n": {
    id: "pt-br-i18n",
    name: "pt-BR i18n",
    category: "i18n",
    tagline: "Locale, currency, date formatters",
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
    website: "https://posthog.com",
  },
  sentry: {
    id: "sentry",
    name: "Sentry",
    category: "errors",
    tagline: "Error tracking + performance",
    website: "https://sentry.io",
  },
  caramelosec: {
    id: "caramelosec",
    name: "CaramoSec",
    category: "security",
    tagline: "Vulnerability scanning — BR",
    brazilian: true,
    website: "https://caramelosec.com",
    defaultOn: true,
  },
  resend: {
    id: "resend",
    name: "Resend",
    category: "email",
    tagline: "Transactional email + React Email",
    requires: { backend: true },
    website: "https://resend.com",
  },
  "better-auth-social": {
    id: "better-auth-social",
    name: "Social login",
    category: "auth",
    tagline: "Google · GitHub · Apple OAuth",
    requires: { auth: true },
  },
  "upstash-redis": {
    id: "upstash-redis",
    name: "Upstash Redis",
    category: "cache",
    tagline: "Rate limit + session cache",
    requires: { backend: true },
    website: "https://upstash.com",
  },
  s3: {
    id: "s3",
    name: "AWS S3",
    category: "storage",
    tagline: "Object storage (+ presigned uploads)",
    requires: { backend: true },
  },
  "cloudflare-r2": {
    id: "cloudflare-r2",
    name: "Cloudflare R2",
    category: "storage",
    tagline: "S3-compatible, zero egress",
    requires: { backend: true },
  },
};

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
  "cache",
  "storage",
];

export const MODULE_CATEGORY_LABELS: Record<ModuleCategory, string> = {
  ai: "AI",
  auth: "Auth",
  payments: "Payments",
  messaging: "Messaging",
  email: "Email",
  identity: "Identity",
  compliance: "Compliance",
  i18n: "i18n",
  analytics: "Analytics",
  errors: "Error tracking",
  security: "Security",
  cache: "Cache",
  storage: "Storage",
};
