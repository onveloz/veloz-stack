---
name: Resend
description: Transactional email with React Email templates. Use for auth emails, receipts, and notifications.
---

# Resend

Transactional email. Pairs well with `react-email` for typed JSX templates.

## Auth
`Authorization: Bearer re_...`

## Quickstart
```ts
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY!);

await resend.emails.send({
  from: "Veloz <noreply@yourdomain.com>",
  to: "user@example.com",
  subject: "Bem-vindo!",
  html: "<p>Obrigado por se cadastrar.</p>",
});
```

## ⚠ Gotchas
- **Verify your sending domain** in the dashboard before sending to prod. `onresend.com` subdomains work only for testing.
- **Rate limits** are per-day + per-minute — queue bulk sends.

## Required env vars
- `RESEND_API_KEY` — `re_...`
