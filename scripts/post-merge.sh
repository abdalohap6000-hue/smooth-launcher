#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

bun install --frozen-lockfile

if [[ -f "artifacts/qalami-ai-mobile/package.json" ]]; then
  (
    cd artifacts/qalami-ai-mobile
    bun install --frozen-lockfile
  )
fi

bun run build