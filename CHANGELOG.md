# Changelog

All notable changes to this monorepo are documented here. The CLI package `create-veloz-stack` follows the same releases when published to npm.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- Root documentation: `LICENSE`, `SECURITY.md`, `AGENTS.md`, workspace READMEs, `docs/README.md`.
- Documentation health pass: marked `backend: "next"` plan as done; refreshed deploy runbook for Next.js 16.

### Changed

- Monorepo lint/format: **Biome → oxlint + oxfmt** (root config, Lefthook, CI); README/CONTRIBUTING/ARCHITECTURE updated.
- `CONTRIBUTING.md`: Node version wording aligned with CI vs local `engines`; link to `docs/vendors.md`; docs gates and `bulk-export-tsdoc` helper.
- `docs/ARCHITECTURE.md`: accurate `runGeneratePipeline()` stages; ADR policy for monorepo vs generated apps.
- `packages/types/README.md`: document `./labels` and `./resolve-stack` exports.
- `packages/types`: replace `@see`-only type-alias JSDoc with inferred-type descriptions.
- `AGENTS.md`: document `pnpm docs:lint` and `pnpm docs:links`.

## Recent history (main)

See git log for full detail. Highlights:

- `backend: "next"` — Route Handlers in generated Next.js apps (same-origin oRPC / Better Auth).
- ADRs emitted for generated projects; Better Auth demo UI in scaffolds.
- TypeScript 6, Vitest/Playwright testing scaffold, catalog/version sync hardening.
- Stack builder and template fixes from CodeRabbit review passes.
