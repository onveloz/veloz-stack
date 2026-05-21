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
  "$tmp" --yes --no-install "$@"

echo "━━━ [$name] install"
cd "$tmp"

# Lefthook's prepare script installs hooks and requires a git repo (config.git defaults on).
if ! git rev-parse --git-dir >/dev/null 2>&1; then
  git init -q
fi

# Respect whatever `packageManager` the scaffold emitted — pnpm bails
# out when trying to install a `packageManager: bun@…` project.
pm_field=$(node -p "require('./package.json').packageManager || 'pnpm@0'" 2>/dev/null || echo "pnpm@0")
pm=${pm_field%%@*}

install_with_retry() {
  local attempt=1
  local max=3
  while [ "$attempt" -le "$max" ]; do
    set +e
    eval "$1" 2>&1 | tail -5
    local status=${PIPESTATUS[0]}
    set -e
    if [ "$status" -eq 0 ]; then
      return 0
    fi
    if [ "$attempt" -eq "$max" ]; then
      return 1
    fi
    echo "   install failed (attempt $attempt/$max), retrying…" >&2
    attempt=$((attempt + 1))
    sleep 2
  done
}

case "$pm" in
  bun)
    echo "   using bun install"
    install_with_retry "bun install"
    ;;
  npm)
    echo "   using npm install"
    npm install --no-audit --no-fund 2>&1 | tail -5
    ;;
  *)
    echo "   using pnpm install"
    pnpm install --no-frozen-lockfile --ignore-scripts=false 2>&1 | tail -5
    ;;
esac

echo "━━━ [$name] typecheck"
case "$pm" in
  bun)
    bun run --filter='*' check-types
    ;;
  npm)
    npm run --workspaces --if-present check-types
    ;;
  *)
    pnpm -r --parallel check-types
    ;;
esac

cd "$ROOT"
rm -rf "$tmp"
echo "✓ [$name] passed"
