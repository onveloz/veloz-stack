---
name: AbacatePay
description: PIX-first payments for Brazil. Use when implementing checkout, subscription billing, or PIX QR code generation.
---

# AbacatePay

PIX-first Brazilian payments. Official TypeScript SDK: `abacatepay-nodejs-sdk`.

## Auth
`Authorization: Bearer <key>`. Create keys at [app.abacatepay.com/api](https://app.abacatepay.com/api).
Dev keys never move real money — use them for local work and E2E tests.

## Base URL
`https://api.abacatepay.com/v1` (prod + dev share the host; behaviour depends on the key used).

## Core endpoints
- `POST /v1/pixQrCode/create` — create PIX QR (returns `brCode` + `brCodeBase64`)
- `GET /v1/pixQrCode/check` — poll payment status
- `POST /v1/pixQrCode/simulate-payment` — dev-only simulation
- `POST /v1/billing/create` — recurring billing

## Webhook verification
HMAC-SHA256 over **raw body**, signature in `X-Webhook-Signature`. Compare with
`crypto.timingSafeEqual` against your account webhook secret.

## Quickstart
```ts
import AbacatePay from "abacatepay-nodejs-sdk";

const abacate = AbacatePay(process.env.ABACATE_KEY!);

const charge = await abacate.pixQrCode.create({
  amount: 2000, // centavos — NOT reais
  expiresIn: 3600,
  description: "Pedido #42",
});

console.log(charge.data?.brCode, charge.data?.brCodeBase64);
```

## ⚠ Gotchas
- **Money unit:** integer centavos. Sending `29.90` creates a R$0,30 charge.
- **v1 vs v2:** v2 is current; payload shapes differ from v1. Check SDK version.
- **Sandbox:** dev key → same host, no real money. Never mix with live keys.

## Required env vars
- `ABACATE_KEY` — bearer token for AbacatePay API
- `ABACATE_WEBHOOK_SECRET` — HMAC secret for webhook verification
