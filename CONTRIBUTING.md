# Contributing to Veloz Stack

Guidance for changing the **template generator**, **CLI**, and **stack builder** web app.

## Toolchain

- **Node.js** 22 and **pnpm** for this repo (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
- **Bun** is installed in CI for e2e scaffolds that use `bun create` / Bun workspaces.
- Generated monorepos may use Bun or pnpm per `--pm`.

## Local verification

From the repository root:

```bash
pnpm install
pnpm --filter @veloz-stack/template-generator gen
pnpm -r --parallel check-types
pnpm --filter @veloz-stack/template-generator test
```

`packages/template-generator/src/templates.generated.ts` is **gitignored**; it is produced by `gen` (see `packages/template-generator/scripts/build-templates.mjs`). Always run **`gen`** before typecheck or tests so embedded templates match `templates/` on disk.

## Pre-PR: CodeRabbit CLI

Run an AI review **locally before opening a PR** (same engine as PR reviews, scoped for fast iteration). Install once, authenticate once, then run from the repo root.

**Install** (pick one):

```bash
brew install coderabbit
# or: curl -fsSL https://cli.coderabbit.ai/install.sh | sh
```

**Auth** (browser OAuth):

```bash
cr auth login
# `cr` is a short alias for `coderabbit`
```

**Review** (compare your branch + working tree to `main`):

```bash
coderabbit review --plain --base main
```

This repo’s [`.coderabbit.yaml`](.coderabbit.yaml) sets **`reviews.profile: assertive`** (stricter than the default `chill`). The CLI loads it automatically from the repo root; you can still pass **`-c <file>`** for extra instruction files.

Useful variants:

- **Uncommitted only:** `coderabbit review --plain --type uncommitted`
- **Committed only (staged snapshot):** `coderabbit review --plain --type committed --base main`
- **Structured output for an agent:** `coderabbit review --agent --base main`
- **Interactive UI:** `coderabbit review --interactive --base main`

If your default branch is not `main`, pass `--base <branch>`. Large reviews can take several minutes.

CLI reviews may show a notice if the GitHub repo is not linked to a CodeRabbit organization install; you still get review output, with possible plan limits.

## Concept map

| Area | Location |
|------|-----------|
| Enums / `ProjectConfig` Zod schema | [`packages/types/src/index.ts`](packages/types/src/index.ts) |
| Module registry (`MODULE_IDS`, `MODULES`) | [`packages/types/src/modules.ts`](packages/types/src/modules.ts) |
| `includes` and Handlebars helpers | [`packages/template-generator/src/processor.ts`](packages/template-generator/src/processor.ts) |
| Template merge (`processTemplatesFromPrefix`) | [`packages/template-generator/src/template-utils.ts`](packages/template-generator/src/template-utils.ts) |
| Per-axis handlers | [`packages/template-generator/src/handlers/`](packages/template-generator/src/handlers/) |
| Central dependency versions for generated apps | [`packages/template-generator/src/deps.ts`](packages/template-generator/src/deps.ts) |
| Invalid combinations / disable reasons | [`packages/types/src/compatibility.ts`](packages/types/src/compatibility.ts) |

### Handlebars partials (shared snippets)

Files under `packages/template-generator/templates/**` named `*.partial.hbs` are **not** emitted as output files. They are registered as Handlebars partials (name = basename without `.partial.hbs`) and included with `{{> partial-name}}`. Use this for shared fragments (e.g. Hono bootstrap) so the same logic is not copied into Bun, Node, and Workers entry files.

## Checklist — new **module**

1. Add `MODULE_IDS` + `MODULES` in [`packages/types/src/modules.ts`](packages/types/src/modules.ts).
2. Add `MODULE_PREFIXES[id]` in [`packages/template-generator/src/handlers/modules.ts`](packages/template-generator/src/handlers/modules.ts) pointing at `templates/modules/<id>/`.
3. If the module adds `packages/*`, map it in `SERVER_WORKSPACE_PACKAGES` and/or `WEB_WORKSPACE_PACKAGES` in [`post-process.ts`](packages/template-generator/src/handlers/post-process.ts) so `apps/server` / `apps/web` get `workspace:*` deps when those packages exist.
4. Add `appendModuleEnvVars` entries when the module needs documented env vars in `.env.example`.
5. Add any new **central** npm versions to [`deps.ts`](packages/template-generator/src/deps.ts) if you wire versions through `version()` from handlers; otherwise inline versions in generated `package.json.hbs` (as many existing modules do).
6. Update [`compatibility.ts`](packages/types/src/compatibility.ts): `getModuleDisableReason` / `validateConfig` for `requires` or runtime constraints (e.g. Cloudflare Workers).
7. Add coverage in [`generator.test.ts`](packages/template-generator/src/__tests__/generator.test.ts) and, for user-visible stacks, a **single** focused e2e matrix row in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (avoid matrix explosion).
8. Update [`apps/web/components/brand-logo.tsx`](apps/web/components/brand-logo.tsx): extend `CONCEPTS` and/or `PNG_IDS` and add `public/logos/<id>.svg` (or png) when the picker should show a real logo.

## Checklist — new **addon**

1. Extend `AddonId` + `ProjectConfig` in [`packages/types/src/index.ts`](packages/types/src/index.ts).
2. Add templates under `packages/template-generator/templates/addons/<id>/`.
3. Register processing in [`addons.ts`](packages/template-generator/src/handlers/addons.ts).
4. Update post-process (and [`post-process-lint.ts`](packages/template-generator/src/handlers/post-process-lint.ts) when touching lint/format/Husky): root `package.json` scripts, `lint-staged`, optional Husky.
5. Wire CLI flags in [`apps/cli`](apps/cli) and the web UI in [`stack-builder.tsx`](apps/web/app/new/stack-builder.tsx) / [`use-stack-config.ts`](apps/web/lib/use-stack-config.ts) / [`build-command.ts`](apps/web/lib/build-command.ts) as needed.

## Biome vs oxlint

**Biome** and **oxlint** (with **oxfmt**) are **mutually exclusive** in a generated project: both want to own formatting and linting, and combining them creates conflicting scripts and pre-commit behavior. The scaffolder validates this in `validateConfig`; CI includes an invalid-combo guard.
