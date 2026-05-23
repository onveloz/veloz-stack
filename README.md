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

- `apps/web` — landing + stack picker (Next.js 16)
- `apps/cli` — `create-veloz-stack` CLI (Bun + Ink)
- `packages/types` — canonical Zod schemas for all stack options
- `packages/template-generator` — templates & dependency map

Single source for dependency ranges: **[`packages/template-generator/versions.yaml`](packages/template-generator/versions.yaml)** — run **`pnpm sync-versions`** after edits (see [CONTRIBUTING](CONTRIBUTING.md)).

## Generated projects (pnpm / Bun)

When you choose **pnpm** or **Bun**, the scaffold can emit **pnpm catalogs** / Bun **`workspaces.catalog`** so generated monorepos share one version manifest. NPM-based installs keep literal semver ranges (npm has no catalogs).

## Implemented stack axes (today)

Options marked **coming soon (“Em breve”)** are not wired in the generator yet (they stay unavailable in validation too):

| Axis             | Built today                               |
| ---------------- | ----------------------------------------- |
| Backend          | hono · next · none                        |
| API              | orpc · none                               |
| Auth             | better-auth · none                        |
| ORM + DB         | Drizzle (postgres/sqlite) · Prisma · none |
| Featured presets | veloz-br · minimal · next-native          |

## Lint & hooks (this monorepo)

- **[oxlint](https://oxc.rs/docs/guide/usage/linter)** + **[oxfmt](https://oxc.rs/docs/guide/usage/formatter)** — `pnpm lint`, `pnpm lint:fix`; CI runs `pnpm lint` in the unit job.
- **[Lefthook](https://github.com/evilmartians/lefthook)** — pre-commit oxlint + oxfmt after `pnpm install` (`lefthook install` via `prepare`).
- **Husky addon** is **legacy**: templates and CLI `--addons husky` still work; the web picker hides Husky unless **`?showLegacy=1`** or **`NEXT_PUBLIC_SHOW_LEGACY_HUSKY=true`**.

## Docs

- [CONTRIBUTING.md](CONTRIBUTING.md) — contributor workflow
- [AGENTS.md](AGENTS.md) — monorepo guide for coding agents
- [docs/README.md](docs/README.md) — documentation index
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — how the monorepo and generator fit together
- [docs/stack-config.md](docs/stack-config.md) — stack axes and config file
- [LICENSE](LICENSE) — MIT

## Develop

```sh
pnpm install
pnpm dev
```
