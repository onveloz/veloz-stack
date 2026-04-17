---
name: PostHog
description: Product analytics + feature flags + session replay. Use for event tracking, A/B tests, and release gating.
---

# PostHog

Product analytics + feature flags. Self-hostable; default here is PostHog Cloud.

## Server-side
```ts
import { PostHog } from "posthog-node";
const posthog = new PostHog(process.env.POSTHOG_KEY!, { host: "https://us.i.posthog.com" });

posthog.capture({
  distinctId: user.id,
  event: "subscription_created",
  properties: { plan: "pro", currency: "BRL" },
});

await posthog.shutdown(); // flush queue before exit
```

## Feature flags
```ts
const onNewCheckout = await posthog.isFeatureEnabled("new-checkout", user.id);
if (onNewCheckout) { /* variant B */ }
```

## ⚠ Gotchas
- **Always `shutdown()`** before process exit or you lose the event queue.
- **Use server-side capture** for anything revenue-related — client-side can be blocked by ad-blockers.
- **EU vs US region** — base host differs (`eu.i.posthog.com` vs `us.i.posthog.com`). Pick once.

## Required env vars
- `POSTHOG_KEY` — public project API key (`phc_...`)
- `POSTHOG_HOST` — region host
