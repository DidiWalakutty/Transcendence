# Development Setup

## Prerequisites

Before cloning the repo, make sure you have the following installed on your machine:

- [Nix](https://nixos.org/download/) (with flakes enabled)
- [Git](https://git-scm.com/)
- [VSCode](https://code.visualstudio.com/)
- [Docker](https://www.docker.com/)

> **No sudo access on Linux:** Use [nix-portable](#install-nix-without-sudo-linux)
> instead. This also applies to Codam machines.

---

## 1. Clone the repository

```bash
git clone https://github.com/milandekruijf/ft_transcendence.git
cd ft_transcendence
```

---

## 2. Enable Nix flakes

Add this to `~/.config/nix/nix.conf` (create the file if it doesn't exist):

```
experimental-features = flakes nix-command
```

---

## 3. Enter the dev environment

```bash
nix develop
```

You should see:

```
🚀 ft_transcendence dev environment
Bun: x.x.x
Node: vx.x.x
mkcert: vx.x.x
```

---

## 4. Install VSCode extensions

Open the project in VSCode. You will get a popup in the bottom right corner asking to install recommended extensions. Click **Install All**.

If the popup doesn't appear, open the command palette (`Ctrl+Shift+P`) and run:

```
Extensions: Show Recommended Extensions
```

## 5. Useful commands

```
# Starts the full dev server
bun dev

Frontend → http://localhost:3000
Backend → http://localhost:3001
```

```
# Check linting
bun check
```

```
# Check formatting
bun fmt
```

These are Bun's script shorthand for the root `package.json` scripts (`bun dev` == `bun run dev`), which in turn run the matching Vite+ task (`vp run -w repo:dev`). Inside this shell you never need a globally installed `vp` — `bun install` already pulled it in locally. For the full command list, see [Tooling](./TOOLING.md).

---

## Install Nix without sudo (Linux)

[nix-portable](https://github.com/DavHau/nix-portable) provides a rootless,
installation-free Nix environment. It supports `x86_64` and `aarch64` Linux
systems and enables `nix-command` and flakes by default. It does not support
macOS.

**1. Download `nix-portable` to a user-writable directory:**

```bash
mkdir -p "$HOME/.local/bin"
curl -L "https://github.com/DavHau/nix-portable/releases/latest/download/nix-portable-$(uname -m)" \
  -o "$HOME/.local/bin/nix-portable"
chmod +x "$HOME/.local/bin/nix-portable"
```

**2. Add it to your shell configuration:**

Add the following to `~/.zshrc` or `~/.bashrc`:

```bash
export PATH="$HOME/.local/bin:$PATH"
alias nix='nix-portable nix'
```

Reload your shell:

```bash
source "$HOME/.zshrc" # Use .bashrc when running Bash
```

**3. Verify the installation:**

```bash
nix --version
```

**4. Clone the repository and enter the development environment:**

```bash
git clone https://github.com/milandekruijf/ft_transcendence.git
cd ft_transcendence
nix develop
```

The first invocation creates the portable Nix store in `~/.nix-portable`.

### Codam machines and limited home directories

If your home directory has limited storage, place both the executable and its
state in another user-writable location. On Codam machines, `/goinfre/$USER` is
suitable:

```bash
mkdir -p "/goinfre/$USER/nix-portable"
curl -L "https://github.com/DavHau/nix-portable/releases/latest/download/nix-portable-$(uname -m)" \
  -o "/goinfre/$USER/nix-portable/nix-portable"
chmod +x "/goinfre/$USER/nix-portable/nix-portable"
```

Add this configuration to `~/.zshrc` or `~/.bashrc`:

```bash
export NP_LOCATION="/goinfre/$USER/nix-portable/state"
alias nix="/goinfre/$USER/nix-portable/nix-portable nix"
```

Reload the shell and run `nix develop` from the repository as described above.

---

## Troubleshooting

**`nestjs-trpc` reports an executable-permission error:**

```
Failed to execute nestjs-trpc CLI: spawnSync <repo-root>/node_modules/.bun/nestjs-trpc@2.10.0+4027ee5bbcdb762b/node_modules/nestjs-trpc/native/aarch64-apple-darwin/nestjs-trpc EACCES
```

The `nix develop` shell fixes the permissions automatically after installing
dependencies. Re-enter the shell first. If dependencies were installed outside
the Nix shell, repair all bundled Unix binaries manually:

```bash
chmod +x node_modules/.bun/nestjs-trpc@*/node_modules/nestjs-trpc/native/*/nestjs-trpc
```

**`flake.nix` not found error:**
Make sure the file is tracked by git:

```bash
git add flake.nix flake.lock
```

**`bun: command not found` after entering the shell:**
You are not inside the Nix shell. Run `nix develop` first.

**Packages out of date:**
Update the lockfile and commit it:

```bash
nix flake update
git add flake.lock
git commit -m "chore: update flake.lock"
```
