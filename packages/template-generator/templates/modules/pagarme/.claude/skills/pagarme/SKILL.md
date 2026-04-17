---
name: Pagar.me
description: Brazilian card + PIX + boleto payments (Stone group). v5 API. Use for multi-method checkout with a single provider.
---

# Pagar.me v5

Brazilian multi-method payments (cards + PIX + boleto + split). Part of Stone.

## Auth
**HTTP Basic** — username = secret key, **empty password**.
```
Authorization: Basic base64("sk_prod_xxx:")
```
Note the trailing colon.

## Base URL
`https://api.pagar.me/core/v5` — same host for test + prod; key prefix decides.

## Core endpoints
- `POST /orders` — the canonical entry point (order + customer + payment in one)
- `POST /charges` — standalone charge
- `POST /customers` — reusable customer records
- `POST /webhooks` — register webhook receivers

## Webhook verification
**No HMAC body signature.** Pagar.me hits your endpoint with HTTP Basic auth using a username/password you configure when registering the webhook. Verify the `Authorization: Basic ...` header matches your stored credentials server-side.

## Quickstart
```ts
const auth = "Basic " + Buffer.from(`${process.env.PAGARME_SK}:`).toString("base64");

const r = await fetch("https://api.pagar.me/core/v5/orders", {
  method: "POST",
  headers: { Authorization: auth, "Content-Type": "application/json" },
  body: JSON.stringify({
    items: [{ amount: 2990, description: "Plano Pro", quantity: 1 }], // centavos
    customer: {
      name: "João",
      email: "j@ex.com",
      type: "individual",
      document: "00000000000", // CPF digits only
    },
    payments: [{ payment_method: "pix", pix: { expires_in: 3600 } }],
  }),
});
```

## ⚠ Gotchas
- **Trailing colon** in Basic auth string — empty password, not missing.
- **Money unit: centavos (int).** Same as AbacatePay. Opposite of Asaas.
- **v4 and v5 coexist in docs.** Every URL you emit must be `/core/v5`.
- **Webhook auth is Basic, not HMAC.** First-timers hunt for a signature header that doesn't exist.

## Required env vars
- `PAGARME_SK` — `sk_prod_...` or `sk_test_...`
- `PAGARME_WEBHOOK_USER` / `PAGARME_WEBHOOK_PASS` — Basic auth credentials for inbound webhooks
