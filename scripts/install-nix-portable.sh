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

shell_name="${SHELL:-}"
shell_name="${shell_name##*/}"
case "$shell_name" in
  bash) shell_configuration_file="$HOME/.bashrc" ;;
  zsh) shell_configuration_file="$HOME/.zshrc" ;;
  *) shell_configuration_file="" ;;
esac

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

configuration_lines=()
if [[ ":$PATH:" != *":$install_directory:"* ]]; then
  printf -v quoted_install_directory "%q" "$install_directory"
  configuration_lines+=("export PATH=$quoted_install_directory:\$PATH")
fi

if [[ -n "${NP_LOCATION:-}" ]]; then
  echo "Portable Nix state will be stored in: $NP_LOCATION"
  printf -v quoted_np_location "%q" "$NP_LOCATION"
  configuration_lines+=("export NP_LOCATION=$quoted_np_location")
else
  echo "Portable Nix state will be stored in: $HOME/.nix-portable"
fi

if ((${#configuration_lines[@]} > 0)); then
  if [[ -n "$shell_configuration_file" ]]; then
    added_configuration=false
    touch "$shell_configuration_file"

    for configuration_line in "${configuration_lines[@]}"; do
      if ! grep -Fqx -- "$configuration_line" "$shell_configuration_file"; then
        if [[ "$added_configuration" == false ]]; then
          printf '\n# Added by the ft_transcendence nix-portable installer\n' \
            >>"$shell_configuration_file"
        fi
        printf '%s\n' "$configuration_line" >>"$shell_configuration_file"
        added_configuration=true
      fi
    done

    if [[ "$added_configuration" == true ]]; then
      echo
      echo "Updated $shell_configuration_file for $shell_name."
      echo "Restart your shell or run: source \"$shell_configuration_file\""
    fi
  else
    echo
    echo "Could not configure unsupported shell: ${SHELL:-unknown}"
    echo "Add these lines to your shell configuration, then restart your shell:"
    printf '%s\n' "${configuration_lines[@]}"
  fi
fi

echo
echo "From the repository, run: nix develop"
