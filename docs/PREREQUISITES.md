# Prerequisites

This document lists the host tools needed before working on the project.

## Required

| Requirement                    | Description                                                                                     |
| ------------------------------ | ----------------------------------------------------------------------------------------------- |
| Git                            | Required to clone the repository and collaborate through version control.                       |
| Docker / Docker Desktop        | Required to run root Docker Compose services such as PostgreSQL and Redis. Not provided by Nix. |
| Nix (recommended) **or** Vite+ | Either path gets you a working Bun + Vite+ toolchain. See below.                                |

## Recommended: Nix

`nix develop` provisions Bun, Node, Git, and mkcert for you — including on Codam machines, where it works without root access — and its shell hook automatically runs `bun install`. From inside the shell you never need a globally installed `vp`: commands like `bun dev` and `bun check` resolve to the locally installed Vite+ (`node_modules/.bin/vp`) through Bun's script shorthand.

See [Dev Environment](./DEVENVIRONMENT.md) for setup steps.

## Alternative: Vite+ installer

If you are not using Nix, install Vite+ globally with the commands in [Development](./DEVELOPMENT.md). A global `vp` is what bootstraps `node_modules` (via `vp install`) before any workspace scripts exist, so this path needs the installer where the Nix path does not.

You do not need to install Bun manually on either path. Vite+ manages the project runtime and package manager.

## Docker Compose

Infrastructure services are provided by the root `docker-compose.yml` file.

The devcontainer is responsible for tooling and editor consistency only. PostgreSQL and Redis are not provided by the devcontainer itself.

## Devcontainer

Once the devcontainer is available, it should provide the expected tooling and editor setup automatically.

Until then, contributors should use Nix (or the Vite+ installer) plus Docker / Docker Desktop.
