#!/usr/bin/env bash
# Free a TCP port: stop any Docker container publishing it, then kill any
# host process still listening on it.
#
# Usage: scripts/free-port.sh [PORT]   (default: 3001)

set -euo pipefail

PORT="${1:-3001}"

# 1. Docker containers publishing the port. Killing docker-proxy directly is
#    useless (Docker respawns it), so stop the container instead.
if command -v docker >/dev/null 2>&1; then
  containers="$(docker ps -q --filter "publish=${PORT}" 2>/dev/null || true)"
  if [[ -n "$containers" ]]; then
    echo "Stopping Docker container(s) publishing :${PORT}:"
    docker ps --filter "publish=${PORT}" --format '  {{.Names}} ({{.ID}})'
    # shellcheck disable=SC2086
    docker stop $containers >/dev/null
  fi
fi

# 2. Host processes listening on the port.
pids="$(ss -ltnpH "sport = :${PORT}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u || true)"
if [[ -n "$pids" ]]; then
  echo "Killing process(es) on :${PORT}:"
  for pid in $pids; do
    echo "  $pid ($(ps -o comm= -p "$pid" 2>/dev/null || echo '?'))"
    kill "$pid" 2>/dev/null || true
  done

  # Give them a moment to exit gracefully, then force-kill stragglers.
  sleep 1
  for pid in $pids; do
    if kill -0 "$pid" 2>/dev/null; then
      echo "  $pid still alive, sending SIGKILL"
      kill -9 "$pid" 2>/dev/null || true
    fi
  done
fi

if [[ -z "${containers:-}" && -z "$pids" ]]; then
  echo "Nothing is listening on :${PORT}."
else
  echo "Port ${PORT} is free."
fi
