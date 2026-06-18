# @repo/backend

NestJS backend for `ft_transcendence`.

This app owns the HTTP server, tRPC router, database access, backend cache, throttling, and internal domain events. The root Vite+ task graph should be used for normal development so generated types, PostgreSQL, Redis, and migrations stay in sync.

## Start Here

- Project setup and commands: [Development](../../docs/DEVELOPMENT.md)
- API surface and subscriptions: [API](../../docs/API.md)
- Database and migrations: [Database](../../docs/DATABASE.md)
- Environment variables: [Environment](../../docs/ENVIRONMENT.md)
- Shared validation flow: [Validation](../../docs/VALIDATION.md)
- Tooling and task graph: [Tooling](../../docs/TOOLING.md)
- Local ports: [Ports](../../docs/PORTS.md)

## Important Files

| Path                                                       | Purpose                                                                      |
| ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [src/main.ts](./src/main.ts)                               | Starts the NestJS application on `PORT` or `3001`.                           |
| [src/app.module.ts](./src/app.module.ts)                   | Wires config, Redis-backed cache, throttling, local events, users, and tRPC. |
| [src/trpc.router.ts](./src/trpc.router.ts)                 | Defines the current `example` tRPC router.                                   |
| [src/users/users.service.ts](./src/users/users.service.ts) | Handles user persistence, cache invalidation, and user events.               |
| [src/database](./src/database)                             | Provides the Drizzle database connection.                                    |
| [drizzle](./drizzle)                                       | Stores generated SQL migrations and Drizzle metadata.                        |
| [drizzle.config.ts](./drizzle.config.ts)                   | Drizzle Kit configuration.                                                   |

## Common Commands

Run commands from the repository root:

```bash
vp run dev:backend
vp run test:backend
vp run test:backend:e2e
vp run check:backend
vp run build:backend
```

For the full stack, prefer:

```bash
vp run dev
```

## Generated Contracts

tRPC router types are generated from this app into:

```text
../../packages/schemas/src/@generated/server.ts
```

Regenerate them from the repository root with:

```bash
vp run trpc:generate
```

Generated files should not be edited by hand. See [Tooling](../../docs/TOOLING.md#generated-files).
