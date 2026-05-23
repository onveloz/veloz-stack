# @veloz-stack/template-generator

Handlebars templates and handlers that emit generated project files.

## Before typecheck or tests

```bash
pnpm --filter @veloz-stack/template-generator gen
```

Produces `src/templates.generated.ts` (gitignored). CI and local `check-types` / `test` expect it to exist.

## Versions

Edit [`versions.yaml`](versions.yaml), then from repo root:

```bash
pnpm sync-versions
```

## Test

```bash
pnpm --filter @veloz-stack/template-generator test
```

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for module/addon checklists and [docs/vendors.md](../../docs/vendors.md) for vendor modules.
