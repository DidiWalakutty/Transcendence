# Development Setup

## Prerequisites

Before cloning the repo, make sure you have the following installed on your machine:

- [Nix](https://nixos.org/download/) (with flakes enabled)
- [Git](https://git-scm.com/)
- [VSCode](https://code.visualstudio.com/)
- [Docker](https://www.docker.com/)

> **Codam machines:** Nix cannot be installed with root. Use [nix-portable](#codam-machines) instead.

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
bun develop

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

---

## Codam machines

Codam machines do not allow root access, so Nix must be installed via nix-portable.

**1. Download nix-portable to goinfre:**

```bash
curl -L https://github.com/DavHau/nix-portable/releases/latest/download/nix-portable-x86_64 \
  -o /goinfre/$USER/nix-portable
chmod +x /goinfre/$USER/nix-portable
```

**2. Add an alias** (add to `~/.zshrc` or `~/.bashrc`):

```bash
export NIX_PORTABLE_STORE="$HOME/.nix-portable"
alias nix='/goinfre/$USER/nix-portable nix'
```

```bash
source ~/.zshrc
```

**4. Enter the dev environment:**

```bash
nix develop
```

---

## Troubleshooting

**On MacOS you may encounter this error regarding permissions of a node module**

```
Failed to execute nestjs-trpc CLI: spawnSync /Users/daria/codam/06-transcendence/ft_transcendence/node_modules/.bun/nestjs-trpc@2.10.0+4027ee5bbcdb762b/node_modules/nestjs-trpc/native/aarch64-apple-darwin/nestjs-trpc EACCES
```

Make the file executable:

```
chmod +x node_modules/.bun/nestjs-trpc@*/node_modules/nestjs-trpc/native/aarch64-apple-darwin/nestjs-trpc
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
