#!/usr/bin/env bash

set -euo pipefail

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "Error: nix-portable supports Linux only." >&2
  echo "Install Nix from https://nixos.org/download/ on macOS." >&2
  exit 1
fi

architecture="$(uname -m)"
case "$architecture" in
  x86_64 | aarch64) ;;
  *)
    echo "Error: unsupported architecture: $architecture" >&2
    echo "nix-portable supports x86_64 and aarch64." >&2
    exit 1
    ;;
esac

install_directory="${NIX_PORTABLE_INSTALL_DIR:-$HOME/.local/bin}"
portable_path="$install_directory/nix-portable"
download_url="https://github.com/DavHau/nix-portable/releases/latest/download/nix-portable-$architecture"

mkdir -p "$install_directory"
temporary_file="$(mktemp "$install_directory/.nix-portable.XXXXXX")"
trap 'rm -f "$temporary_file"' EXIT

echo "Downloading nix-portable for $architecture..."
if command -v curl >/dev/null 2>&1; then
  curl --fail --location --show-error "$download_url" --output "$temporary_file"
elif command -v wget >/dev/null 2>&1; then
  wget --output-document="$temporary_file" "$download_url"
else
  echo "Error: curl or wget is required to download nix-portable." >&2
  exit 1
fi

chmod +x "$temporary_file"
mv "$temporary_file" "$portable_path"
ln -sfn nix-portable "$install_directory/nix"
trap - EXIT

"$install_directory/nix" --version

echo
echo "nix-portable was installed in: $install_directory"
if [[ ":$PATH:" != *":$install_directory:"* ]]; then
  echo
  echo "Add this line to ~/.bashrc or ~/.zshrc, then restart your shell:"
  printf 'export PATH="%s:$PATH"\n' "$install_directory"
fi

if [[ -n "${NP_LOCATION:-}" ]]; then
  echo "Portable Nix state will be stored in: $NP_LOCATION"
else
  echo "Portable Nix state will be stored in: $HOME/.nix-portable"
fi

echo
echo "From the repository, run: nix develop"
