#!/usr/bin/env bash

set -euo pipefail

if [[ "$(uname -s)" == "Windows_NT" ]]; then
  echo "Error: the Vite+ installer script is intended for macOS and Linux shells." >&2
  echo "Use PowerShell on Windows: irm https://vite.plus/ps1 | iex" >&2
  exit 1
fi

installer_url="https://vite.plus"

if command -v curl >/dev/null 2>&1; then
  curl --fail --location --show-error "$installer_url" | bash
elif command -v wget >/dev/null 2>&1; then
  wget --quiet --output-document=- "$installer_url" | bash
else
  echo "Error: curl or wget is required to install Vite+." >&2
  exit 1
fi
