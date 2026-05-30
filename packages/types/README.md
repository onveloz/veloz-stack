# @veloz-stack/types

Canonical Zod schemas and stack compatibility rules for the CLI, web builder, and template generator.

## Exports

- `.` — `ProjectConfig`, axis enums, `VelozStackConfigFile`
- `./modules` — `MODULE_IDS`, `MODULES`
- `./compatibility` — `validateConfig`, `applyImplicitStackRules`, disable-reason helpers
- `./defaults` — presets
- `./labels` — display labels and option hints for the stack builder
- `./resolve-stack` — `resolveStackChange`, `repairStackConfigCore`, cascade change types
- `./resolve-stack-axis` — per-axis cascade helpers used by the stack builder

## Check types

```bash
pnpm --filter @veloz-stack/types check-types
```

When changing an axis, update `compatibility.ts` and consumer tests in `packages/template-generator`.
