# @veloz-stack/web

Next.js app: marketing landing and interactive stack builder at `/new`.

## Develop

From repo root:

```bash
pnpm dev:web
# or: pnpm --filter @veloz-stack/web dev
```

Runs on **http://localhost:3100** (`next dev --port 3100`).

## Depends on

- `@veloz-stack/types` — stack enums and validation shared with CLI/generator.

## Notes

- Husky addon is hidden unless `?showLegacy=1` or `NEXT_PUBLIC_SHOW_LEGACY_HUSKY=true` (see root README).
