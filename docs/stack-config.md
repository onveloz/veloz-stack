# Stack configuration

Generated projects and the Veloz Stack builder share one configuration model: **`ProjectConfig`** in `@veloz-stack/types`, serialized as **`veloz-stack.config.json`** in scaffolds.

## File on disk

| Constant   | Value                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------- |
| Filename   | `veloz-stack.config.json`                                                                      |
| Schema URL | `https://veloz-stack.com/schema/veloz-stack.config.json` (see `VELOZ_STACK_CONFIG_SCHEMA_URL`) |

The generator writes this file in `postProcess` so teams can diff stack choices and re-run `create-veloz-stack` with the same flags.

## Axes (high level)

| Field                      | Values (implemented)                                               | Notes                                                      |
| -------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------- |
| `frontend`                 | `tanstack-start`, `next`, `nuxt`, `svelte-kit`, `astro`, `none`    | `next` triggers implicit `backend: next` unless overridden |
| `backend`                  | `hono`, `next`, `none`                                             | `next` only valid with `frontend: next`                    |
| `runtime`                  | `bun`, `node`, `workers`                                           | Workers pairs with Cloudflare deploy                       |
| `api`                      | `orpc`, `none`                                                     |                                                            |
| `auth`                     | `better-auth`, `none`                                              | Requires a database when enabled                           |
| `orm` / `db` / `dbHosting` | Drizzle/Prisma, postgres/sqlite, hosting vendors                   | See compatibility helpers                                  |
| `deploy`                   | `veloz`, `vercel`, `fly`, `render`, `docker`, `cloudflare`, `none` |                                                            |
| `ui`                       | `shadcn`, `tailwind`, `none`                                       | shadcn only for React frontends                            |
| `mobile` / `desktop`       | `expo` / `tauri`, `none`                                           | Tauri requires a web frontend                              |
| `modules`                  | See `MODULES` in types                                             | Feature packs (payments, i18n, observability, …)           |
| `addons`                   | `turborepo`, `biome`, `lefthook`, `husky`, `oxlint`                | Biome and oxlint are mutually exclusive                    |
| `examples`                 | `todo`, `pix-checkout`, …                                          | Optional starter apps                                      |
| `preset`                   | `veloz-br`, `minimal`, `next-native`, `custom`                     | Builder may set `custom` after edits                       |
| `pm`                       | `pnpm`, `bun`, `npm`                                               | Affects catalog emission in monorepos                      |

Options marked **coming soon** in the UI are excluded from `validateConfig()` until templates exist.

## Validation and cascades

- **`validateConfig(cfg)`** — returns human-readable errors for impossible combinations.
- **`resolveStackChange(cfg, { key, value })`** — applies a single picker change and returns `{ newCfg, changes }` where `changes` lists cascaded field updates. Import from `@veloz-stack/types/resolve-stack`.
- **`repairStackConfigCore(cfg)`** — silent repair without change log (used before generate).

Disable reasons for UI tooltips come from `get*DisableReason()` in `compatibility.ts`.

## Presets

`PRESETS` in `@veloz-stack/types` bundles common stacks:

- **veloz-br** — default Veloz-oriented BR modules
- **minimal** — smallest useful API + DB stack
- **next-native** — Next.js with route-handler backend

## CLI reproduction

After scaffold, `veloz-stack.config.json` includes enough data to rebuild the equivalent CLI invocation; the generator also embeds a reproducible command in project docs via `buildReproducibleCommand()`.

## Type reference

Import from `@veloz-stack/types`:

```ts
import type { ProjectConfig } from "@veloz-stack/types";
import { ProjectConfig as ProjectConfigSchema } from "@veloz-stack/types";
```

For module metadata and categories, see `MODULES` and `MODULE_CATEGORIES` in the same package.
