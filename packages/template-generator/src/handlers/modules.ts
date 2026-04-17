import type { ModuleId, ProjectConfig } from "@veloz-stack/types";
import { processTemplatesFromPrefix } from "../template-utils";
import type { VirtualFs } from "../vfs";

/**
 * Each module owns a `templates/modules/<id>/` folder. When the user picks
 * the module, everything in that folder gets merged into the VFS verbatim
 * (or compiled, if `.hbs`). That's the whole plugin surface for Wave 2a.
 * Imperative extras (extra package.json fields, env vars) live in
 * post-process.ts.
 */
const MODULE_PREFIXES: Partial<Record<ModuleId, string>> = {
  claude: "modules/claude/",
  abacatepay: "modules/abacatepay/",
  asaas: "modules/asaas/",
  pagarme: "modules/pagarme/",
  mercadopago: "modules/mercadopago/",
  "stripe-br": "modules/stripe/",
  "ararahq-sms": "modules/ararahq/",
  "ararahq-wa": "modules/ararahq/",
  himetrica: "modules/himetrica/",
  caramelosec: "modules/caramelosec/",
  "pt-br-i18n": "modules/pt-br-i18n/",
  "cpf-cnpj": "modules/cpf-cnpj/",
  viacep: "modules/viacep/",
  brasilapi: "modules/brasilapi/",
  "lgpd-consent": "modules/lgpd-consent/",
  resend: "modules/resend/",
  posthog: "modules/posthog/",
  sentry: "modules/sentry/",
};

export function processModules(vfs: VirtualFs, config: ProjectConfig): void {
  const applied = new Set<string>();
  for (const m of config.modules) {
    const prefix = MODULE_PREFIXES[m];
    if (!prefix || applied.has(prefix)) continue; // ararahq-sms + ararahq-wa share a folder
    processTemplatesFromPrefix(vfs, prefix, "", config);
    applied.add(prefix);
  }
}
