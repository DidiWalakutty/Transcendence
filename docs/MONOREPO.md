# Monorepo

The repository is a Vite+ managed monorepo.

The monorepo setup follows the Vite+ guide:

```text
https://viteplus.dev/guide/monorepo
```

## Workspaces

| Path                | Purpose                                                               |
| ------------------- | --------------------------------------------------------------------- |
| `apps/backend`      | NestJS backend and tRPC router implementation.                        |
| `apps/frontend`     | TanStack Start frontend.                                              |
| `packages/schemas`  | Shared database schema, validation schemas, and generated tRPC types. |
| `packages/tsconfig` | Shared TypeScript configuration.                                      |

## Root Configuration

The main repository task graph is configured in:

```text
vite.config.ts
```

This file defines development, build, test, check, database, and generation tasks.

For command details, see [Tooling](./TOOLING.md).

```mermaid
flowchart TD
    ROOT["ft_transcendence"]
    APPS["apps"]
    PACKAGES["packages"]
    BACKEND["apps/backend<br/>NestJS, tRPC, Drizzle provider"]
    FRONTEND["apps/frontend<br/>TanStack Start"]
    SCHEMAS["packages/schemas<br/>Drizzle schema, Zod schemas, generated tRPC types"]
    TSCONFIG["packages/tsconfig<br/>Shared TypeScript config"]
    VITE["vite.config.ts<br/>Vite+ task graph"]
    COMPOSE["docker-compose.yml<br/>Infrastructure services"]

    ROOT --> APPS
    ROOT --> PACKAGES
    ROOT --> VITE
    ROOT --> COMPOSE
    APPS --> BACKEND
    APPS --> FRONTEND
    PACKAGES --> SCHEMAS
    PACKAGES --> TSCONFIG
    BACKEND --> SCHEMAS
    FRONTEND --> SCHEMAS
```
