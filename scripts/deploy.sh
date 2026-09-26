#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$script_dir/.."

if [ ! -f .env ]; then
  printf 'Missing .env. Copy .env.example to .env and configure it before deploying.\n' >&2
  exit 1
fi

vp install

case "${1:-}" in
  --detached)
    exec vp run -w repo:deploy:detached
    ;;
  '')
    exec vp run -w repo:deploy
    ;;
  *)
    printf 'Usage: %s [--detached]\n' "$0" >&2
    exit 2
    ;;
esac
