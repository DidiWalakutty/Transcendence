# STACK.md

## Overview

This document defines the primary technology stack for the project, including preferred technologies, supporting infrastructure, and approved alternatives.

---

# Core Stack

## Frontend

| Category                          | Technology                                                 |
| --------------------------------- | ---------------------------------------------------------- |
| Framework                         | [React](https://react.dev/)                                |
| Web Framework                     | [TanStack Start](https://tanstack.com/start)               |
| Styling                           | [Tailwind CSS](https://tailwindcss.com/)                   |
| Forms & Validation                | [TanStack Form](https://tanstack.com/form)                 |
| Schema Validation                 | [Zod](https://zod.dev/)                                    |
| Data Fetching & Server State      | [TanStack Query](https://tanstack.com/query)               |
| tRPC                              | [tRPC](https://nestjs-trpc.io/)                            |

### Notes

* [TanStack Form](https://tanstack.com/form) should be paired with a schema validator to provide both client-side and server-side validation.
* When using [tRPC](https://nestjs-trpc.io/), schema validation is performed directly through Zod validators, reducing duplicated validation logic.
* [TanStack Query](https://tanstack.com/query) remains the default solution for asynchronous state management and caching.

---

## Backend

| Category                | Technology                                                          |
| ----------------------- | ------------------------------------------------------------------- |
| Framework               | [NestJS](https://nestjs.com/)                                       |
| Language                | TypeScript                                                          |
| Real-Time Communication | [tRPC Subscriptions](https://www.nestjs-trpc.io/docs/subscriptions) |

### Notes

* [NestJS](https://nestjs.com/) is the preferred backend architecture due to its modularity, dependency injection system, and TypeScript-first design.
* [Socket.IO](https://socket.io/) provides bidirectional real-time communication for notifications, presence, live updates, and collaborative features.

---

## Database & Storage

| Category                | Technology                                                    |
| ----------------------- | ------------------------------------------------------------- |
| Primary Database        | [PostgreSQL](https://www.postgresql org/)                     |
| Cache / Key-Value Store | [Redis](https://redis.io/)                                    |
| ORM / Database Layer    | [TypeORM](https://typeorm.io/), Raw SQL, or a Hybrid Approach |

### Notes

* [PostgreSQL](https://www.postgresql.org/) serves as the primary source of truth.
* [Redis](https://redis.io/) is used for caching, sessions, distributed locks, queues, pub/sub, and real-time state.
* Database access may use an ORM, raw SQL, or a combination of both depending on performance and maintainability requirements.

---

## Tooling

| Category            | Technology                        |
| ------------------- | --------------------------------- |
| Runtime             | [Bun](https://bun.sh/)            |
| Package Manager     | [Bun](https://bun.sh/)            |
| Monorepo Management | [Vite+](https://viteplus.dev/)    |
| Build Toolchain     | [Vite+](https://viteplus.dev/)    |
| Development (HMR)   | [Vite+](https://viteplus.dev/)    |
| Linting             | [Vite+](https://viteplus.dev/)    |
| Typechecking        | [Vite+](https://viteplus.dev/)    |
| Testing             | [Vite+](https://viteplus.dev/)    |

### Notes

* [Bun](https://bun.sh/) is the primary runtime and package manager.
* [Vite+](https://viteplus.dev/) provides a unified TypeScript-centric development toolchain.
* [Vite+](https://viteplus.dev/) manages workspace orchestration, caching, dependency graphs, and task execution across the monorepo.

---

## Infrastructure

| Category          | Technology                                                        |
| ----------------- | ----------------------------------------------------------------- |
| Containerization  | [Docker Compose](https://docs.docker.com/compose/)                |
| Local Development | [Development Containers (Devcontainers)](https://containers.dev/) |
| Database Service  | PostgreSQL Container                                              |
| Cache Service     | Redis Container                                                   |

### Notes

* [Docker Compose](https://docs.docker.com/compose/) is used to orchestrate all local and deployment services.
* [Development Containers (Devcontainers)](https://containers.dev/) provide reproducible development environments and eliminate machine-specific dependency issues.
* PostgreSQL and Redis should run as isolated services within the Compose stack.

---

## HTTPS & Security

### Production

Preferred approaches:

1. [Caddy](https://caddyserver.com/) with automatic [Let's Encrypt](https://letsencrypt.org/) certificate management.

### Local Development

* [mkcert](https://github.com/FiloSottile/mkcert) should be used to generate trusted local certificates.
* Local environments should mirror production HTTPS behavior whenever possible.

---

# Architecture Principles

* TypeScript-first development.
* End-to-end type safety where practical.
* Monorepo-based architecture.
* Modular service boundaries.
* Containerized local development.
* [PostgreSQL](https://www.postgresql.org/) as the primary datastore.
* [Redis](https://redis.io/) for ephemeral and distributed state.
* Real-time capabilities available through tRPC subscriptions.
* Infrastructure reproducibility through [Docker Compose](https://docs.docker.com/compose/) and [Development Containers (Devcontainers)](https://containers.dev/).

# Preferred Stack Summary

* [React](https://react.dev/)
* [Tailwind CSS](https://tailwindcss.com/)
* [TanStack Start](https://tanstack.com/start)
* [TanStack Form](https://tanstack.com/form)
* [TanStack Query](https://tanstack.com/query)
* [NestJS](https://nestjs.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [Redis](https://redis.io/)
* [Prisma](https://www.prisma.io/) / [TypeORM](https://typeorm.io/) / Raw SQL
* [Bun](https://bun.sh/)
* [Vite+](https://viteplus.dev/)
* [Docker Compose](https://docs.docker.com/compose/)
* [Development Containers (Devcontainers)](https://containers.dev/)
* [Caddy](https://caddyserver.com/)
* [Let's Encrypt](https://letsencrypt.org/)
* [mkcert](https://github.com/FiloSottile/mkcert)
