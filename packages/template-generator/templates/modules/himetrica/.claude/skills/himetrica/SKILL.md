---
name: Himetrica
description: Brazilian product analytics with Stripe / AbacatePay / RevenueCat integrations. Use when instrumenting page views, user identify, and revenue events.
---

# Himetrica

Brazilian analytics + revenue tracking.

## Install
```html
<script defer src="https://cdn.himetrica.com/tracker.js"
  data-api-key="hm_your_key"></script>
```

## API
- `window.himetrica.track(name, props)` — custom event
- `window.himetrica.identify({ userId, email, name })` — associate a user
- `window.himetrica.reset()` — always call on logout (else the next identify merges two users)

## Integrations
Stripe (restricted key, not secret), AbacatePay, Google Search Console, Shopify, RevenueCat.

## Required env vars
- `HIMETRICA_API_KEY` — `hm_...` (public — injected into the tracker snippet)
