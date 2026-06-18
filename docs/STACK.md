# Stack

## Overview

This document defines the primary technology stack for the project.

---

## Core Stack

### Frontend

| Category                     | Technology                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Framework                    | [React](https://react.dev/)                                                  |
| Web Framework                | [TanStack Start](https://tanstack.com/start)                                 |
| Styling                      | [Tailwind CSS](https://tailwindcss.com/)                                     |
| Forms & Validation           | [TanStack Form](https://tanstack.com/form)                                   |
| Schema Validation            | [Zod](https://zod.dev/)                                                      |
| Data Fetching & Server State | [TanStack Query](https://tanstack.com/query)                                 |
| Internationalization         | [Inlang Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) |
| tRPC                         | [tRPC](https://nestjs-trpc.io/)                                              |

### Notes

- [TanStack Form](https://tanstack.com/form) should be paired with a schema validator to provide both client-side and server-side validation.
- When using [tRPC](https://nestjs-trpc.io/), schema validation is performed directly through Zod validators, reducing duplicated validation logic.
- [TanStack Query](https://tanstack.com/query) remains the default solution for asynchronous state management and caching.
- [Inlang Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) provides generated locale-aware message helpers. See [Internationalization](./I18N.md).

---

### Backend

| Category                | Technology                                                          |
| ----------------------- | ------------------------------------------------------------------- |
| Framework               | [NestJS](https://nestjs.com/)                                       |
| Language                | TypeScript                                                          |
| Real-Time Communication | [tRPC Subscriptions](https://www.nestjs-trpc.io/docs/subscriptions) |

### Notes

- [NestJS](https://nestjs.com/) is the preferred backend architecture due to its modularity, dependency injection system, and TypeScript-first design.

---

### Database & Storage

| Category                | Technology                                |
| ----------------------- | ----------------------------------------- |
| Primary Database        | [PostgreSQL](https://www.postgresql.org/) |
| Cache / Key-Value Store | [Redis](https://redis.io/)                |
| ORM / Database Layer    | [Drizzle ORM](https://orm.drizzle.team/)  |

### Notes

- [PostgreSQL](https://www.postgresql.org/) serves as the primary source of truth.
- [Redis](https://redis.io/) is currently used for backend cache and throttling storage.
- [Drizzle ORM](https://orm.drizzle.team/) provides the typed database layer and migration workflow.
- Shared schema definitions are used for database access and validation. See [Validation](./VALIDATION.md) and [Database](./DATABASE.md).

---

### Tooling

| Category            | Technology                     |
| ------------------- | ------------------------------ |
| Runtime             | [Bun](https://bun.sh/)         |
| Package Manager     | [Bun](https://bun.sh/)         |
| Monorepo Management | [Vite+](https://viteplus.dev/) |
| Build Toolchain     | [Vite+](https://viteplus.dev/) |
| Development (HMR)   | [Vite+](https://viteplus.dev/) |
| Linting             | [Vite+](https://viteplus.dev/) |
| Typechecking        | [Vite+](https://viteplus.dev/) |
| Testing             | [Vite+](https://viteplus.dev/) |

### Notes

- [Bun](https://bun.sh/) is the primary runtime and package manager.
- [Vite+](https://viteplus.dev/) provides a unified TypeScript-centric development toolchain.
- [Vite+](https://viteplus.dev/) manages workspace orchestration, caching, dependency graphs, and task execution across the monorepo.
- See [Tooling](./TOOLING.md) for common commands and task details.

---

### Infrastructure

| Category          | Technology                                                        |
| ----------------- | ----------------------------------------------------------------- |
| Containerization  | [Docker Compose](https://docs.docker.com/compose/)                |
| Local Development | [Development Containers (Devcontainers)](https://containers.dev/) |
| Database Service  | PostgreSQL Container                                              |
| Cache Service     | Redis through Compose for backend cache and throttling storage    |

### Notes

- [Docker Compose](https://docs.docker.com/compose/) is used to orchestrate all local and deployment services.
- `vp run deploy` builds and starts the full Compose stack with `docker compose up --build`.
- [Development Containers (Devcontainers)](https://containers.dev/) provide reproducible tooling and editor environments and eliminate machine-specific dependency issues.
- Infrastructure services are provided by the root Compose stack, not by the devcontainer itself.

---

### HTTPS & Security

### Production

Preferred approaches:

1. [Caddy](https://caddyserver.com/) with automatic [Let's Encrypt](https://letsencrypt.org/) certificate management.

### Local Development

- The current local Compose deployment exposes HTTP on `localhost` ports for development.
- [mkcert](https://github.com/FiloSottile/mkcert) should be used to generate trusted local certificates.
- Local environments should mirror production HTTPS behavior whenever possible.

---

## Architecture Principles

- TypeScript-first development.
- End-to-end type safety where practical.
- Monorepo-based architecture.
- Modular service boundaries.
- Containerized local development.
- [PostgreSQL](https://www.postgresql.org/) as the primary datastore.
- [Redis](https://redis.io/) for shared cache and throttling state.
- Real-time capabilities available through tRPC subscriptions.
- Infrastructure reproducibility through [Docker Compose](https://docs.docker.com/compose/) and [Development Containers (Devcontainers)](https://containers.dev/).

## Preferred Stack Summary

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [TanStack Start](https://tanstack.com/start)
- [TanStack Form](https://tanstack.com/form)
- [TanStack Query](https://tanstack.com/query)
- [Inlang Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs)
- [NestJS](https://nestjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Bun](https://bun.sh/)
- [Vite+](https://viteplus.dev/)
- [Docker Compose](https://docs.docker.com/compose/)
- [Development Containers (Devcontainers)](https://containers.dev/)
- [Caddy](https://caddyserver.com/)
- [Let's Encrypt](https://letsencrypt.org/)
- [mkcert](https://github.com/FiloSottile/mkcert)
