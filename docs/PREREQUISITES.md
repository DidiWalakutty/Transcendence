# Prerequisites

This document lists the host tools needed before working on the project.

## Required

| Requirement             | Description                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| Git                     | Required to clone the repository and collaborate through version control.                  |
| Docker / Docker Desktop | Required to run root Docker Compose services such as PostgreSQL, Redis, Caddy and Mailpit. |
| Vite+                   | Provides the `vp` command and manages Bun for the project. See below.                      |

## Vite+

Install Vite+ globally with the commands in [Development](./DEVELOPMENT.md). A global `vp` is what bootstraps `node_modules` (via `vp install`) before any workspace scripts exist.

You do not need to install Bun manually. Vite+ manages the project runtime and package manager.

## Optional: trusted local HTTPS

The Compose stack serves `https://localhost:3000` with the [mkcert](https://github.com/FiloSottile/mkcert) certificate committed in `caddy/certs`. Browsers only trust it once the mkcert root CA is in their trust store, which `scripts/generate-certs.sh` sets up. That script needs:

| Tool                  | Why                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------- |
| mkcert                | Generates the certificate and registers its root CA. A single binary; on Linux it can be dropped into `~/.local/bin`. |
| certutil (Linux only) | From the `libnss3-tools` package. mkcert needs it to write the Chrome and Firefox trust stores.                       |

Without them the site still works, but the browser shows a certificate warning once per session. See [Browser Support](./BROWSER_SUPPORT.md#4-certificate-trust-per-browser) for the per-browser details.

## Docker Compose

Infrastructure services are provided by the root `docker-compose.yml` file.

The devcontainer is responsible for tooling and editor consistency only. PostgreSQL and Redis are not provided by the devcontainer itself.

## Devcontainer

Once the devcontainer is available, it should provide the expected tooling and editor setup automatically.

Until then, contributors should use the Vite+ installer plus Docker / Docker Desktop.
