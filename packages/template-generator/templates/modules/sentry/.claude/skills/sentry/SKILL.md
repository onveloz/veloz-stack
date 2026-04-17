---
name: Sentry
description: Error tracking + performance monitoring. Use to capture unhandled exceptions, trace slow endpoints, and alert on regressions.
---

# Sentry

## Server (Node / Bun / Hono)
```ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.2,
});

// Hono middleware
app.onError((err, c) => {
  Sentry.captureException(err);
  return c.json({ error: "Internal" }, 500);
});
```

## Frontend
```ts
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN, tracesSampleRate: 0.1 });
```

## ⚠ Gotchas
- **Source maps** — upload on build so stack traces point at your actual source, not the minified bundle. Use `@sentry/vite-plugin`.
- **PII filtering** — never send raw email/CPF into `extra` or `context`. Sentry has `sendDefaultPii: false` by default; don't enable it unless you've reviewed every `captureException` call.

## Required env vars
- `SENTRY_DSN` — server
- `VITE_SENTRY_DSN` — frontend (same DSN is fine)
- `SENTRY_AUTH_TOKEN` — for source-map uploads at build time
