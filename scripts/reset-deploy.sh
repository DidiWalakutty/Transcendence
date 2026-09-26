#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$script_dir/.."

confirm=false
for argument in "$@"; do
  case "$argument" in
    --yes)
      confirm=true
      ;;
    *)
      printf 'Usage: %s [--yes]\n' "$0" >&2
      exit 2
      ;;
  esac
done

if [ ! -f .env ]; then
  printf 'Missing .env. Copy .env.example to .env and configure it before resetting.\n' >&2
  exit 1
fi

if [ "$confirm" != true ]; then
  printf 'This removes the deployment containers, networks, and database volumes. Continue? [y/N] '
  read -r answer
  case "$answer" in
    y|Y|yes|YES)
      ;;
    *)
      printf 'Reset cancelled.\n'
      exit 0
      ;;
  esac
fi

docker compose --env-file .env down --volumes --remove-orphans
