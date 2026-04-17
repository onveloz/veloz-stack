---
name: Mercado Pago
description: BR/LatAm payments with Checkout Pro + direct PIX/card. Use for marketplace-style flows and when you need Bricks for embedded checkout UI.
---

# Mercado Pago

BR + LatAm payments. Official SDK: `mercadopago` (Node), `@mercadopago/sdk-react` (Bricks UI).

## Auth
`Authorization: Bearer <ACCESS_TOKEN>` — `TEST-...` for test, live token for prod. Same host either way.

## Base URL
`https://api.mercadopago.com`

## Core endpoints
- `POST /v1/payments` (use `payment_method_id: "pix"` for PIX)
- `POST /checkout/preferences` — Checkout Pro redirect URLs
- `POST /v1/customers` — saved cards + metadata
- `GET /v1/payments/{id}` — status poll

## Webhook verification
**HMAC-SHA256**. Headers: `x-signature: ts=...,v1=...` + `x-request-id`.
Recompute HMAC over the template string:
```
id:{data.id};request-id:{x-request-id};ts:{ts};
```
Compare hex digest to `v1`. The trailing `;` chars are **required** — a missing one silently breaks verification.

## Quickstart
```ts
import { MercadoPagoConfig, Payment } from "mercadopago";

const client = new MercadoPagoConfig({ accessToken: process.env.MP_TOKEN! });

const payment = await new Payment(client).create({
  body: {
    transaction_amount: 29.9,   // reais (decimal)
    description: "Plano Pro",
    payment_method_id: "pix",
    payer: { email: "j@ex.com" },
  },
  requestOptions: { idempotencyKey: crypto.randomUUID() },
});
```

## ⚠ Gotchas
- **`idempotencyKey` is required** in prod on `Payment.create`. Omitting it causes sporadic duplicates.
- **HMAC template** — the template string format is fragile, a missing `;` breaks everything silently.
- **Money: reais (decimal).**
- **TEST- credentials** only work against test users — real cards silently fail on test keys.

## Required env vars
- `MP_TOKEN` — `TEST-...` or live
- `MP_WEBHOOK_SECRET` — HMAC secret configured in your MP dashboard
