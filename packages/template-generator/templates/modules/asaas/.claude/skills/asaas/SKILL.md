---
name: Asaas
description: Brazilian payments — PIX, boleto, cartão, split. Use for checkout and recurring billing with CPF/CNPJ-validated customers.
---

# Asaas

Full-service Brazilian payments — PIX + boleto + cartão + marketplace split.

## Auth
**Header name is `access_token` — NOT Bearer.**
- Prod: `access_token: $aact_prod_...`
- Sandbox: `access_token: $aact_hmlg_...`

## Base URLs
- Prod: `https://api.asaas.com/v3`
- Sandbox: `https://api-sandbox.asaas.com/v3`

Sandbox is a separate host (unlike AbacatePay / Pagar.me / MP which use the same host + key prefix).

## Core endpoints
- `POST /v3/customers` — must pre-exist with valid **CPF or CNPJ**, you can't create a payment inline with just an email
- `POST /v3/payments` — `billingType: PIX | BOLETO | CREDIT_CARD | UNDEFINED`
- `GET /v3/payments/{id}/pixQrCode` — fetch QR after creation
- `POST /v3/webhooks` — register a webhook receiver

## Webhook verification
No HMAC. Asaas sends a shared-secret token in header `asaas-access-token`. Compare string equality against `ASAAS_WEBHOOK_TOKEN`.

## Quickstart
```ts
const r = await fetch("https://api-sandbox.asaas.com/v3/payments", {
  method: "POST",
  headers: {
    access_token: process.env.ASAAS_KEY!,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    customer: "cus_000001",
    billingType: "PIX",
    value: 29.9,             // reais (decimal) — NOT centavos
    dueDate: "2026-04-20",
  }),
});
const payment = await r.json();
```

## ⚠ Gotchas
- **Money unit: reais (decimal).** Opposite of AbacatePay/Pagar.me which use centavos (int).
- **Customer first**: payment creation references an existing `customer` id with CPF/CNPJ.
- **Header name**: `access_token`, not `Authorization: Bearer`.
- Sandbox ≠ prod — regenerate keys + re-create customers.

## Required env vars
- `ASAAS_KEY` — `$aact_prod_...` or `$aact_hmlg_...`
- `ASAAS_WEBHOOK_TOKEN` — shared secret for webhook header verification
