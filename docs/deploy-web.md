# Deploying `apps/web`

The stack builder is a **Next.js 16** app (`@veloz-stack/web`) configured for **static export**. It is not part of generated scaffolds — it ships this monorepo’s marketing site and `/new` picker.

## Build

From the repository root:

```bash
pnpm install
pnpm --filter @veloz-stack/template-generator gen   # required — templates.generated.ts is gitignored
pnpm --filter @veloz-stack/web build
```

`apps/web/next.config.mjs` sets `output: "export"`. Production artifacts land in **`apps/web/out/`** (HTML, JS, assets). Do not commit `out/` — it is gitignored.

The package script `pnpm --filter @veloz-stack/web start` runs `next start` against a server build; with static export, use a static file server to smoke-test locally instead:

```bash
pnpm dlx serve apps/web/out -p 3100
```

Dev server (hot reload): **`pnpm dev:web`** → http://localhost:3100.

## Environment

| Variable                             | Purpose                                                              |
| ------------------------------------ | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SHOW_LEGACY_HUSKY=true` | Show the legacy Husky addon in the stack picker (hidden by default). |

No database or secrets are required for the public stack builder.

## Veloz hosting

This repo’s production deploy is a **static site** on Veloz. Source of truth for build settings:

| File        | Role                                                                 |
| ----------- | -------------------------------------------------------------------- |
| `veloz.json` | Veloz project config — service type, build command, `outputDir`     |
| [`veloz-deploy-plano.md`](../veloz-deploy-plano.md) | Operational runbook (Portuguese) |

Current `veloz.json` (abridged):

- **Service type:** `static`
- **Build:** `pnpm --filter @veloz-stack/template-generator run gen && pnpm run build` (Turborepo)
- **Output directory:** `apps/web/out`
- **Live URL:** https://www.veloz-stack.com

`templates.generated.ts` is generated during the Veloz build — same as CI — so it does not need to be committed.

For architecture context, see [ARCHITECTURE.md](ARCHITECTURE.md).

## CI reference

E2E and unit jobs are defined in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). Docs gates: `pnpm docs:lint` and `pnpm docs:links`.
