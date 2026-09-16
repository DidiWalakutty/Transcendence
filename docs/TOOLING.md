# Tooling

The project uses Vite+ as the unified local toolchain.

Vite+ manages:

1. Workspace dependency installation.
2. Bun runtime and package manager usage.
3. Development task orchestration.
4. Formatting, linting, and typechecking.
5. Test execution.
6. Commit hooks.
7. Generated artifacts such as tRPC router types.

## Nix Shell Equivalent

Inside a [Nix dev shell](./DEVENVIRONMENT.md), `node_modules/.bin/vp` is already installed locally, and every command below also works as a Bun script shorthand: `bun dev` runs the same task as `vp run dev`, `bun check:fix` the same as `vp run check:fix`, and so on. There is no need to install Vite+ globally on this path.

## Install

Install Vite+ before running the project outside the devcontainer (skip this if you use Nix — see above).

You can also run the repository helper script:

```bash
./scripts/install-viteplus.sh
```

### macOS / Linux

```bash
curl -fsSL https://vite.plus | bash
```

### Windows PowerShell

```powershell
irm https://vite.plus/ps1 | iex
```

Then install project dependencies:

```bash
vp install
```

The root `postinstall` script repairs the executable permissions of the
`nestjs-trpc` native generator on Unix systems. This runs for both the Vite+
installation path and direct `bun install`. On Linux, the recommended Nix shell
then uses Nix's `autoPatchelfHook` to connect the packaged generator to the
shell-provided GLIBC. This supports hosts whose system GLIBC is older than the
packaged binary requires.

## Common Commands

| Command                  | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `vp run dev`             | Start the full local development stack.                        |
| `vp run dev:fixtures`    | Start frontend/backend with in-memory fixtures and no Docker.  |
| `vp run dev:frontend`    | Start only the frontend.                                       |
| `vp run dev:backend`     | Start the database setup and backend.                          |
| `vp run deploy`          | Build and run the full Docker Compose stack.                   |
| `vp run deploy:detached` | Build and run the full Docker Compose stack in the background. |
| `vp run build`           | Build all workspaces.                                          |
| `vp run test`            | Run all tests.                                                 |
| `vp run check`           | Run formatting, linting, and type checks.                      |
| `vp run check:fix`       | Fix formatting and safe lint issues where possible.            |
| `vp run lint`            | Run lint checks.                                               |
| `vp run fmt`             | Check formatting.                                              |
| `vp run fmt:fix`         | Write formatting changes.                                      |
| `vp run trpc:generate`   | Regenerate the shared tRPC router types.                       |
| `vp run trpc:watch`      | Watch backend tRPC changes and regenerate types.               |
| `vp run services:setup`  | Start PostgreSQL and Redis, then run database migrations.      |
| `vp run db:setup`        | Start PostgreSQL and run migrations.                           |
| `vp run redis:setup`     | Start Redis through Docker Compose.                            |
| `vp run db:generate`     | Generate Drizzle migration files.                              |
| `vp run db:migrate`      | Run Drizzle migrations.                                        |
| `vp run db:seed`         | Seed demo users and events (requires migrated DB).             |
| `vp run db:push`         | Push schema changes directly to the database.                  |
| `vp run db:studio`       | Open Drizzle Studio.                                           |

Vite+ installs and manages Bun for the project, so contributors do not need to install Bun manually.

For environments that cannot use Nix, the repository also vendors a compiled
`nestjs-trpc` CLI at `bin/nestjs-trpc`. The tRPC generation tasks invoke that
binary directly from the backend workspace, so you can run the code generation
path without relying on the packaged `bunx nestjs-trpc` executable.

## Task Configuration

Workspace tasks are configured in:

```text
vite.config.ts
```

This file defines the repository task graph, including dependencies such as:

- generating tRPC types before frontend/backend tasks that need them;
- starting PostgreSQL, Redis, and database migrations before backend development;
- building and running the full containerized deployment stack;
- running frontend route and localization generation before frontend development.

```mermaid
flowchart TD
    DEV["repo:dev"]
    DEV_PREPARE["repo:dev:prepare"]
    DEPLOY["repo:deploy"]
    DEV_BACKEND["repo:dev:backend"]
    DEV_FRONTEND["repo:dev:frontend"]
    COMPOSE["docker compose up --build"]
    SERVICES_SETUP["repo:services:setup"]
    SERVICES["docker compose up -d --wait postgres redis"]
    DB_MIGRATE["repo:db:migrate"]
    TRPC["repo:trpc:generate"]
    FRONTEND_GEN["repo:frontend:generate"]
    BACKEND["Backend dev server"]
    FRONTEND["Frontend dev server"]

    DEV --> DEV_PREPARE
    DEV_PREPARE --> SERVICES_SETUP
    DEV_PREPARE --> TRPC
    DEV_PREPARE --> FRONTEND_GEN
    DEV --> BACKEND
    DEV --> FRONTEND

    DEV_BACKEND --> SERVICES_SETUP
    DEV_BACKEND --> TRPC
    DEV_BACKEND --> BACKEND

    DEV_FRONTEND --> TRPC
    DEV_FRONTEND --> FRONTEND_GEN
    DEV_FRONTEND --> FRONTEND

    SERVICES_SETUP --> SERVICES
    SERVICES_SETUP --> DB_MIGRATE
    DEPLOY --> COMPOSE
```

## Generated Files

Generated files should not be edited by hand.

Important generated paths include:

| Path                                        | Generated By                     |
| ------------------------------------------- | -------------------------------- |
| `packages/schemas/src/@generated/server.ts` | `vp run trpc:generate`           |
| `apps/frontend/src/routeTree.gen.ts`        | frontend route generation        |
| `apps/frontend/src/@generated/paraglide`    | frontend localization generation |

## Task Caching

Vite+ caches deterministic tasks by default. The repository keeps dev servers,
Docker setup, database operations, generated-file writers, watch tasks, staged
checks, and autofix tasks uncached because they either run continuously, mutate
external state, or rewrite files.

Build tasks use explicit cache outputs:

| Task                  | Cached Outputs                                           |
| --------------------- | -------------------------------------------------------- |
| `repo:build:frontend` | `apps/frontend/.output/**`, `apps/frontend/.tanstack/**` |
| `repo:build:backend`  | `apps/backend/dist/**`                                   |

The top-level `repo:build` task only orchestrates the frontend and backend
build tasks, so each build can be restored independently from cache.

## CI And Hooks

The pre-commit hook runs staged checks through Vite+.

GitHub Actions runs:

```bash
vp install --frozen-lockfile
vp run -w repo:check
vp run -w repo:test
vp run -w repo:build
```

See [Commit Hooks](./COMMIT_HOOKS.md) and [CI](./CI.md).
