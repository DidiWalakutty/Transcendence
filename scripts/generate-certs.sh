#!/usr/bin/env bash

# Generates the local HTTPS certificate Caddy serves on https://localhost and
# registers the issuing mkcert root CA with this machine's browsers, so the
# certificate is trusted without a warning.
#
# mkcert ships with the Nix dev shell (`nix develop`). On machines without
# sudo (Codam) only the browser trust stores (Firefox/Chrome NSS) can be
# written; that is enough for the browser to trust the certificate.

set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cert_dir="$repo_root/caddy/certs"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "Error: mkcert is required. Enter the Nix dev shell (nix develop) or install it from https://github.com/FiloSottile/mkcert" >&2
  exit 1
fi

if sudo -n true >/dev/null 2>&1 || [[ "$(id -u)" == "0" ]]; then
  echo "Registering the mkcert root CA with the system and browser trust stores..."
  mkcert -install
else
  echo "No sudo available: registering the mkcert root CA with the browser trust stores only..."
  TRUST_STORES=nss mkcert -install
fi

mkdir -p "$cert_dir"
echo "Generating the certificate for localhost into $cert_dir..."
mkcert -cert-file "$cert_dir/local.pem" -key-file "$cert_dir/local-key.pem" localhost 127.0.0.1 ::1

echo
echo "Done. Root CA lives in: $(mkcert -CAROOT)"
echo "Next steps:"
echo "  - Restart your browser so it picks up the new root CA."
echo "  - If the Docker stack is running: docker compose restart caddy"
