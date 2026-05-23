# Vendor reference — source-of-truth for Wave 2 SKILL.md + SDK wrappers

Each module in `packages/types/src/modules.ts` maps to a vendor below. When we generate code we emit:

1. A typed SDK wrapper (`packages/vendors/<id>/index.ts`)
2. A Claude skill (`.claude/skills/<id>/SKILL.md`) generated from this data
3. Env var additions (`.env.example`)
4. Webhook handler stub when applicable

## AbacatePay (`abacatepay`)

- Auth: `Authorization: Bearer <token>`. Keys at app.abacatepay.com/api
- Base URL: `https://api.abacatepay.com/v1` (prod; dev behavior via `ara_test_`-style key + `/pixQrCode/simulate-payment`)
- SDK: `abacatepay-nodejs-sdk` (official, TS/ESM). Official MCP at `abacatepay/abacatepay-mcp`
- Endpoints: `POST /v1/pixQrCode/create`, `GET /v1/pixQrCode/check`, `POST /v1/pixQrCode/simulate-payment`, `POST /v1/billing/create`, `GET /v1/billing/list`
- Webhooks: HMAC-SHA256 over raw body, `X-Webhook-Signature`, `crypto.timingSafeEqual`
- Money: **centavos (int)**
- Gotchas: v1 legacy, v2 current — payload shapes differ. Never mix dev & live keys.

## Arara (`ararahq-sms`, `ararahq-wa`)

- Auth: `Authorization: Bearer ara_live_...` / `ara_test_...`
- Base URL: `https://new-api.ararahq.com/api/v2/`
- SDK: `@ararahq/sdk` (MIT, official)
- Endpoints: `POST /messages` (template + freeform), templates, webhooks
- Webhooks: signature header NOT confirmed from public index — read `/api-reference/endpoint/webhook` before shipping
- Gotchas: template vs freeform (24h window rule), `ara_test_` vs `ara_live_` billing separation

## Himetrica (`himetrica`)

- Auth: public `data-api-key` (`hm_...`) for web tracker. Server API header NOT FOUND on public docs
- Tracker: `https://cdn.himetrica.com/tracker.js` (`<script data-api-key>`)
- Methods: `window.himetrica.track/identify/reset`. Integrations with Stripe, GSC, Shopify, RevenueCat, AbacatePay. Built-in MCP with 11 tools
- Gotchas: client-only tracker, always `reset()` on logout, Stripe requires restricted key

## CaramoSec (`caramelosec`)

- **NOT FOUND.** Pre-launch landing only. Emit placeholder SKILL.md stub, no SDK wrapper until docs published

## Veloz (`deploy: veloz` + db hosting)

- Auth: `veloz login` (browser) or `VELOZ_API_KEY=veloz_...`
- No public REST SDK. Programmatic surface = `onveloz` CLI + MCP server (`mcp__veloz__deploy/db_create/env_set/domains_add/logs_search/...`)
- Quickstart: `npm i -g onveloz && veloz login && veloz init && veloz deploy`
- Gotchas: commit `veloz.json`; monorepos need per-app deploy selection; scaffold SKILL.md around CLI + MCP, not imagined REST

## Asaas (`asaas`)

- Auth: `access_token: $aact_prod_...` / `$aact_hmlg_...` (header name is `access_token` — **not** Bearer)
- Base URL: prod `https://api.asaas.com/v3`, sandbox `https://api-sandbox.asaas.com/v3`
- SDK: no first-party; wrap `fetch` directly
- Endpoints: `POST /customers`, `POST /payments` (`billingType: PIX|BOLETO|CREDIT_CARD`), `GET /payments/{id}/pixQrCode`
- Webhooks: shared-secret token in header `asaas-access-token` (string equality, no HMAC body signing)
- Money: **reais (decimal)** ⚠
- Gotchas: customer must pre-exist with CPF/CNPJ; sandbox ≠ prod data

## Pagar.me v5 (`pagarme`)

- Auth: HTTP Basic, username = `sk_...`, empty password → `Authorization: Basic base64("sk_xxx:")`
- Base URL: `https://api.pagar.me/core/v5` (test/prod by key prefix)
- SDK: first-party `pagarme-core-api-*` (multi-language); current actively-maintained TS SDK NOT FOUND — wrap fetch
- Endpoints: `POST /orders`, `POST /charges`, `POST /customers`, `POST /webhooks`
- Webhooks: HTTP Basic on the receiving endpoint (no HMAC)
- Money: **centavos (int)**
- Gotchas: trailing colon in Basic auth string, v4/v5 coexist in docs

## Mercado Pago (`mercadopago`)

- Auth: `Authorization: Bearer <TOKEN>` (`TEST-...` or live)
- Base URL: `https://api.mercadopago.com`
- SDK: `mercadopago` (official, actively maintained); `@mercadopago/sdk-react` for Bricks
- Endpoints: `POST /v1/payments` (`payment_method_id: "pix"`), `POST /checkout/preferences`, `POST /v1/customers`
- Webhooks: `x-signature: ts=...,v1=...` + `x-request-id`. HMAC-SHA256 over template `id:{id};request-id:{x-request-id};ts:{ts};`
- Money: **reais (decimal)**
- Gotchas: `idempotencyKey` required on `Payment.create`; HMAC template must include trailing `;` exactly

## BrasilAPI (`brasilapi`)

- Auth: none
- Base: `https://brasilapi.com.br/api`
- Endpoints: `/cep/v2/{cep}`, `/cnpj/v1/{cnpj}`, `/banks/v1`, `/ddd/v1/{ddd}`, `/feriados/v1/{ano}`, `/ibge/municipios/v1/{uf}`, `/fipe/preco/v1/{cod}`, `/pix/v1/participants`, `/registrobr/v1/{dominio}`
- Gotchas: CNPJ can be slow/5xx when Receita down; no SLA; ToS forbids sweeping

## ViaCEP (`viacep`)

- Auth: none
- Base: `https://viacep.com.br/ws/`
- Endpoints: `GET /ws/{cep}/json/`, address search `/ws/{UF}/{City}/{Street}/json/`
- Gotchas: non-existent CEP returns HTTP 200 with `{ "erro": "true" }` (string, not bool!); sweeping → permaban

---

## Cross-cutting invariants

- **Money units differ per vendor.** Encode in the SDK wrapper's input types so you can't accidentally send reais where centavos are expected — that's a 100× billing bug.
- **Sandbox model** — same-URL+key-prefix (AbacatePay, Arara, Pagar.me, Mercado Pago) vs separate host (Asaas). The SDK wrapper must branch on env.
- **Webhook verification** — HMAC body sig (AbacatePay, Mercado Pago), shared-token header (Asaas), Basic auth on endpoint (Pagar.me), unknown (Arara). Each handler stub must get the right pattern.
