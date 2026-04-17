#!/usr/bin/env bash
# Scaffold a project with the given flags, install deps, and type-check.
# Used by CI and locally — call from repo root:
#
#   scripts/e2e-combo.sh my-app --frontend next --orm prisma
#
# Exits non-zero on any step failure. Cleans up the generated project on
# success; leaves it in place on failure for inspection.
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "usage: $0 <name> [cli-flags...]" >&2
  exit 2
fi

name=$1
shift
tmp=${E2E_TMP:-/tmp}/veloz-e2e-$name

ROOT=$(cd "$(dirname "$0")/.." && pwd)

rm -rf "$tmp"

# Ensure the embedded template map is up to date before we scaffold.
# The template-generator's `gen` script emits src/templates.generated.ts.
( cd "$ROOT/packages/template-generator" && pnpm --silent gen >/dev/null )

echo "━━━ [$name] scaffold"
echo "    $@"
"$ROOT/apps/cli/node_modules/.bin/tsx" "$ROOT/apps/cli/src/index.ts" \
  "$tmp" --yes --no-install --pm pnpm "$@"

echo "━━━ [$name] install"
cd "$tmp"
pnpm install --no-frozen-lockfile --ignore-scripts=false 2>&1 | tail -5

echo "━━━ [$name] typecheck"
pnpm -r --parallel check-types

cd "$ROOT"
rm -rf "$tmp"
echo "✓ [$name] passed"
