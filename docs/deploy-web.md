# Deploying `apps/web`

The stack builder is a standard **Next.js 16** app (`@veloz-stack/web`). It is not part of generated scaffolds — it ships this monorepo’s marketing site and `/new` picker.

## Build

From the repository root:

```bash
pnpm install
pnpm --filter @veloz-stack/web build
```

Production output uses Next’s default `.next` build. Run **`pnpm --filter @veloz-stack/web start`** locally to smoke-test the production server (default port **3100** when using the package script).

## Environment

| Variable                             | Purpose                                                              |
| ------------------------------------ | -------------------------------------------------------------------- |
| `NEXT_PUBLIC_SHOW_LEGACY_HUSKY=true` | Show the legacy Husky addon in the stack picker (hidden by default). |

No database or secrets are required for the public stack builder.

## Veloz hosting

For Veloz-specific deploy steps (project linking, build command, domain), see the operational notes in [`veloz-deploy-plano.md`](../veloz-deploy-plano.md) (Portuguese). Canonical English architecture context lives in [ARCHITECTURE.md](ARCHITECTURE.md).

## CI reference

E2E and unit jobs are defined in [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). Docs gates: `pnpm docs:lint` and `pnpm docs:links`.
