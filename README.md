# Veloz Stack

Opinionated full-stack TypeScript scaffolder — 100% deployable on [Veloz](https://onveloz.com).

Default stack: **Bun · Hono · oRPC · TanStack Start (Vite SSR) · Better Auth · Drizzle · Postgres**.

```sh
bun create veloz-stack@latest my-app
# or
pnpm create veloz-stack@latest my-app
```

Pick your stack visually at [veloz-stack.runveloz.com/new](https://veloz-stack.runveloz.com/new).

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
