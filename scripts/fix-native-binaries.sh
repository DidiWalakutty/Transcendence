#!/usr/bin/env bash
# scripts/fix-nestjs-trpc-binary.sh

set -euo pipefail

BINARY_PATH="$(find node_modules/.bun -path "*/nestjs-trpc/native/x86_64-unknown-linux-gnu/nestjs-trpc" 2>/dev/null | head -1)"

if [ -z "$BINARY_PATH" ]; then
  echo "nestjs-trpc binary not found, skipping patch"
  exit 0
fi

# Get the interpreter from bun itself — it's in the same Nix shell closure
# so it's guaranteed to use the right glibc version
NIX_INTERP="$(patchelf --print-interpreter "$(which bun)")"
NIX_RPATH="$(dirname "$NIX_INTERP")"

echo "Using interpreter from bun: $NIX_INTERP"
echo "Patching: $BINARY_PATH"

patchelf \
  --set-interpreter "$NIX_INTERP" \
  --set-rpath "$NIX_RPATH" \
  "$BINARY_PATH"

echo "Verifying..."
patchelf --print-interpreter "$BINARY_PATH"
echo "Patch successful"