# Contributing to Veloz Stack

Guidance for changing the **template generator**, **CLI**, and **stack builder** web app.

## Toolchain

- **Node.js** 22 in CI; local **>=20.11.0** per root `package.json` `engines` (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).
- **oxlint** + **oxfmt** lint and format this monorepo (`pnpm lint`, `pnpm lint:fix`; see [`.oxlintrc.json`](.oxlintrc.json) and [`lefthook.yml`](lefthook.yml)).
- **Lefthook** installs local git hooks (`pnpm prepare` → `lefthook install`).
- **Bun** is installed in CI for e2e scaffolds that use `bun create` / Bun workspaces.
- Generated monorepos may use Bun or pnpm per `--pm`. The **legacy Husky addon** still exists for generated projects and CLI reproducibility; the web picker steers contributors to **Lefthook** and hides Husky unless `?showLegacy=1` (see root [README](README.md)).

## Bumping dependency versions

1. Edit [`packages/template-generator/versions.yaml`](packages/template-generator/versions.yaml): add or change semver ranges under **`packages`** (everything the generator emits through `version()`) or **`repoOnly`** (pnpm catalog entries for workspace-only packages).
2. Run **`pnpm sync-versions`** — it regenerates `src/deps.ts`, `src/package-manager-pins.generated.ts`, and the root `pnpm-workspace.yaml` **catalog** block from scanned `catalog:` protocol refs.
3. Run **`pnpm install`** at the repo root so the lockfile matches.
4. Commit `versions.yaml`, generated files, and `pnpm-lock.yaml` together. CI fails on drift via `pnpm sync-versions:check`.

## Local verification

From the repository root:

```bash
pnpm install
pnpm sync-versions --check # optional sanity: manifest ↔ generated deps/catalog
pnpm lint
pnpm docs:lint
pnpm docs:links
pnpm --filter @veloz-stack/template-generator gen # whenever templates/*.hbs change
pnpm --filter @veloz-stack/template-generator exec tsc --noEmit
pnpm -r --parallel --filter '!@veloz-stack/template-generator' check-types
pnpm --filter @veloz-stack/template-generator test
```

After editing markdown under the paths in [`.markdownlint-cli2.yaml`](.markdownlint-cli2.yaml), run **`pnpm docs:lint`** and **`pnpm docs:links`**. CI runs both in the unit job.

Optional one-off helper to prepend stub JSDoc on exports missing docs (review diff before committing):

```bash
node scripts/bulk-export-tsdoc.mjs packages/template-generator/src --dry-run
```

`packages/template-generator/src/templates.generated.ts` is **gitignored**; it is produced by `gen` (see `packages/template-generator/scripts/build-templates.mjs`). Always run **`gen`** before typecheck or tests so embedded templates match `templates/` on disk. Run **template-generator `tsc` first**, then parallel `check-types` on the other packages — same as CI — so `prebuild`/`gen` does not race with a workspace-wide typecheck.

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

| Area                                                          | Location                                                                                                                                                                                  |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Enums / `ProjectConfig` Zod schema                            | [`packages/types/src/index.ts`](packages/types/src/index.ts)                                                                                                                              |
| Module registry (`MODULE_IDS`, `MODULES`)                     | [`packages/types/src/modules.ts`](packages/types/src/modules.ts)                                                                                                                          |
| Generator module wiring (templates, workspace deps, env vars) | [`packages/template-generator/src/module-registry.ts`](packages/template-generator/src/module-registry.ts)                                                                                |
| Stack cascade / repair logic (web + CLI)                      | [`packages/types/src/resolve-stack.ts`](packages/types/src/resolve-stack.ts)                                                                                                              |
| Display labels & option hints                                 | [`packages/types/src/labels.ts`](packages/types/src/labels.ts)                                                                                                                            |
| `includes` and Handlebars helpers                             | [`packages/template-generator/src/processor.ts`](packages/template-generator/src/processor.ts)                                                                                            |
| Template merge (`processTemplatesFromPrefix`)                 | [`packages/template-generator/src/template-utils.ts`](packages/template-generator/src/template-utils.ts)                                                                                  |
| Per-axis handlers                                             | [`packages/template-generator/src/handlers/`](packages/template-generator/src/handlers/) (orchestrated by [`generate-pipeline.ts`](packages/template-generator/src/generate-pipeline.ts)) |
| Central dependency versions for generated apps                | `versions.yaml` → `pnpm sync-versions` generates [`packages/template-generator/src/deps.ts`](packages/template-generator/src/deps.ts)                                                     |
| Invalid combinations / disable reasons                        | [`packages/types/src/compatibility.ts`](packages/types/src/compatibility.ts)                                                                                                              |
| Vendor integration reference (Wave 2 modules)                 | [`docs/vendors.md`](docs/vendors.md)                                                                                                                                                      |

### Handlebars partials (shared snippets)

Files under `packages/template-generator/templates/**` named `*.partial.hbs` are **not** emitted as output files. They are registered as Handlebars partials (name = basename without `.partial.hbs`) and included with `{{> partial-name}}`. Use this for shared fragments (e.g. Hono bootstrap) so the same logic is not copied into Bun, Node, and Workers entry files.

## Checklist — new **module**

1. Add `MODULE_IDS` + `MODULES` in [`packages/types/src/modules.ts`](packages/types/src/modules.ts). Set `comingSoon: true` until templates ship.
2. Add a `MODULE_GENERATOR` entry in [`packages/template-generator/src/module-registry.ts`](packages/template-generator/src/module-registry.ts): `templatePrefix`, optional `serverWorkspacePackage` / `webWorkspacePackage`, `envVarLines`, and `stripNextRootPage` when needed.
3. Add templates under `packages/template-generator/templates/modules/<id>/`. [`handlers/modules.ts`](packages/template-generator/src/handlers/modules.ts) reads prefixes from the registry — no separate prefix table.
4. Workspace deps and `.env.example` lines are wired in [`post-process.ts`](packages/template-generator/src/handlers/post-process.ts) via the same registry (do not duplicate mappings elsewhere).
5. Add any new **central** npm versions to [`packages/template-generator/versions.yaml`](packages/template-generator/versions.yaml) under `packages:` (and `repoOnly:` if needed only by this monorepo), then run `pnpm sync-versions`.
6. Update [`compatibility.ts`](packages/types/src/compatibility.ts): `getModuleDisableReason` / `validateConfig` for `requires`, `comingSoon`, or runtime constraints (e.g. Cloudflare Workers).
7. Add coverage in [`generator.test.ts`](packages/template-generator/src/__tests__/generator.test.ts) and, for user-visible stacks, a **single** focused e2e matrix row in [`.github/workflows/ci.yml`](.github/workflows/ci.yml) (avoid matrix explosion).
8. Update [`apps/web/components/brand-logo.tsx`](apps/web/components/brand-logo.tsx): extend `CONCEPTS` and/or `PNG_IDS` and add `public/logos/<id>.svg` (or png) when the picker should show a real logo.

### Post-process contract

Handlers write axis-specific files into the VFS first; [`postProcess`](packages/template-generator/src/handlers/post-process.ts) runs **last** and may only:

- Mutate shared JSON (`package.json`, `apps/*/package.json`) — scripts, workspace deps, dependency pins
- Append to `.env.example` via `collectModuleEnvVarLines`
- Remove conflicting files (e.g. oRPC client when `api=none`, root `app/page.tsx` when `next-intl` owns routes)
- Apply catalog refs from `versions.yaml`

Do **not** add imperative file generation in post-process; new output belongs in templates or a dedicated handler.

## Checklist — new **addon**

1. Extend `AddonId` + `ProjectConfig` in [`packages/types/src/index.ts`](packages/types/src/index.ts).
2. Add templates under `packages/template-generator/templates/addons/<id>/`.
3. Register processing in [`addons.ts`](packages/template-generator/src/handlers/addons.ts).
4. Update post-process (and [`post-process-lint.ts`](packages/template-generator/src/handlers/post-process-lint.ts) when touching lint/format): root `package.json` scripts — prefer **Lefthook**/`lint-staged` patterns from the scaffold; **Husky** remains supported as a legacy addon.
5. Wire CLI flags in [`apps/cli`](apps/cli) and the web stack builder: client shell [`stack-builder-client.tsx`](apps/web/app/new/stack-builder-client.tsx) → [`stack-builder.tsx`](apps/web/app/new/stack-builder.tsx); state core [`stack-builder-state-core.ts`](apps/web/app/new/stack-builder-state-core.ts), handlers [`stack-builder-state-handlers.ts`](apps/web/app/new/stack-builder-state-handlers.ts) / [`stack-builder-state-handlers-bind.ts`](apps/web/app/new/stack-builder-state-handlers-bind.ts), utils [`stack-builder-state-utils.ts`](apps/web/app/new/stack-builder-state-utils.ts), assembler [`stack-builder-state.ts`](apps/web/app/new/stack-builder-state.ts); layout [`stack-builder-layout.tsx`](apps/web/app/new/stack-builder-layout.tsx) and grid/preset/aside splits; step modules [`stack-builder-step-*.tsx`](apps/web/app/new/); URL config [`use-stack-config.ts`](apps/web/lib/use-stack-config.ts) / [`use-stack-config-parsers.ts`](apps/web/lib/use-stack-config-parsers.ts); command string [`build-command.ts`](apps/web/lib/build-command.ts).

## Generated projects: Biome vs oxlint

**Biome** and **oxlint** (with **oxfmt**) are **mutually exclusive** in a **generated** project: both want to own formatting and linting, and combining them creates conflicting scripts and pre-commit behavior. The scaffolder validates this in `validateConfig`; CI includes an invalid-combo guard.
