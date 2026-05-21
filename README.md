# Veloz Stack

Opinionated full-stack TypeScript scaffolder — 100% deployable on [Veloz](https://onveloz.com).

Default stack: **Bun · Hono · oRPC · TanStack Start (Vite SSR) · Better Auth · Drizzle · Postgres**.

For **Next.js on Vercel** (same-origin API, no separate server), use `--frontend next` — the CLI and builder default to Route Handlers (`backend: next`) automatically. oRPC, Better Auth, and `/api/health` live under `apps/web/app/api`. For a separate Hono API server instead, pass `--frontend next --backend hono`.

```sh
bun create veloz-stack@latest my-app
# or
pnpm create veloz-stack@latest my-app
```

Pick your stack visually at [www.veloz-stack.com/new](https://www.veloz-stack.com/new).

## Packages

- `apps/web` — landing + stack picker (Next.js 15)
- `apps/cli` — `create-veloz-stack` CLI (Bun + Ink)
- `packages/types` — canonical Zod schemas for all stack options
- `packages/template-generator` — templates & dependency map (Wave 2)

## Develop

```sh
pnpm install
pnpm dev
```
