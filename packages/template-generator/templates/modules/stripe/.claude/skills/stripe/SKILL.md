---
name: Stripe
description: Global payment processor — cards + Boleto + PIX in BR. Use for subscriptions, one-shot charges, and when you need the widest international coverage.
---

# Stripe (BR-aware)

Global but supports BRL + boleto + PIX for Brazilian customers when the account is set up as a Stripe Brazil entity.

## Auth
`Authorization: Bearer sk_test_...` or `sk_live_...`.

## Base URL
`https://api.stripe.com/v1`

## Quickstart
```ts
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET!, { apiVersion: "2025-01-27.acacia" });

const intent = await stripe.paymentIntents.create({
  amount: 2990,                  // centavos
  currency: "brl",
  payment_method_types: ["card", "boleto", "pix"],
});
```

## Webhook verification
```ts
const event = stripe.webhooks.constructEvent(
  rawBody,
  req.headers["stripe-signature"]!,
  process.env.STRIPE_WEBHOOK_SECRET!,
);
```

## ⚠ Gotchas
- **Money: centavos (int).** Same convention as internal "cents in all currencies" rule.
- **BR payment methods** need a Stripe Brazil account — a US account can't take boleto or PIX.
- **Raw body required** for webhook sig — don't let middleware parse JSON before the webhook handler.

## Required env vars
- `STRIPE_SECRET` — `sk_live_...` / `sk_test_...`
- `STRIPE_WEBHOOK_SECRET` — `whsec_...`
- `STRIPE_PUBLISHABLE_KEY` — for the Elements / Payment Element in the frontend
