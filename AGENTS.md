# Agent guide — veloz-stack monorepo

Short context for coding agents working in this repository.

## What this repo is

- **Scaffolder** for opinionated TypeScript full-stack apps (CLI + Handlebars templates).
- **Not** a generated app — do not assume `apps/server` exists here; this repo has `apps/web` (stack picker) and `apps/cli`.

## Layout

| Path                                        | Role                                                 |
| ------------------------------------------- | ---------------------------------------------------- |
| `apps/web`                                  | Next.js stack builder UI (`pnpm dev:web`, port 3100) |
| `apps/cli`                                  | `create-veloz-stack` CLI                             |
| `packages/types`                            | Zod schemas, `ProjectConfig`, compatibility rules    |
| `packages/template-generator`               | Templates, handlers, `generate()`                    |
| `packages/template-generator/versions.yaml` | Canonical dependency versions for scaffolds          |

## Commands (repo root)

```bash
pnpm install
pnpm dev                    # turbo dev (web + cli)
pnpm --filter @veloz-stack/template-generator gen   # REQUIRED before typecheck/tests
pnpm sync-versions          # after editing versions.yaml
pnpm lint                    # oxlint + oxfmt
pnpm docs:lint              # markdownlint on canonical docs
pnpm docs:links             # relative link check across repo markdown
pnpm --filter @veloz-stack/template-generator exec tsc --noEmit
pnpm -r --parallel --filter '!@veloz-stack/template-generator' check-types
pnpm --filter @veloz-stack/template-generator test
```

## Do not edit / commit

- `packages/template-generator/src/templates.generated.ts` — **gitignored**, produced by `pnpm gen`.
- `.claude/skills/veloz-llms.txt` — local agent artifact.

## Source of truth

- Stack options and validation: `packages/types` (`ProjectConfig`, `validateConfig`, `applyImplicitStackRules`).
- Template output: `packages/template-generator/templates/**/*.hbs` + handlers in `src/handlers/`.
- Contributor workflow: [CONTRIBUTING.md](CONTRIBUTING.md).
- Vendor module notes: [docs/vendors.md](docs/vendors.md).

## Implicit CLI / web rules

- `--frontend next` without `--backend` → implicit `backend: next` (Route Handlers).
- Split server: `--frontend next --backend hono`.

When changing axis behavior, update **types**, **compatibility**, **handlers**, **stack-builder**, **CLI**, and **generator tests** together.
