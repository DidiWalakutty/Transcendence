# Environment

This document lists the environment variables currently used by the project.

## Backend

The backend uses `@nestjs/config` and loads environment files in this order:

1. `apps/backend/.env`
2. `.env`
3. `apps/backend/.env.development`
4. `.env.development`

Earlier files take precedence when the same variable is defined.

### Variables

| Variable               | Required                   | Default Development Value                                             | Purpose                                                                                        |
| ---------------------- | -------------------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `NODE_ENV`             | No                         | `development`                                                         | Selects development, production, or test behavior.                                             |
| `DATABASE_URL`         | Unless `DEV_FIXTURES=true` | `postgres://transcendence:transcendence@localhost:5432/transcendence` | PostgreSQL connection string used by the backend and Drizzle Kit.                              |
| `PORT`                 | No                         | `3001`                                                                | Backend HTTP port.                                                                             |
| `REDIS_URL`            | No                         | `redis://localhost:6379`                                              | Redis connection string for backend cache and throttling storage.                              |
| `BETTER_AUTH_SECRET`   | Yes                        | (see `apps/backend/.env.development`)                                 | Signing secret for Better Auth sessions and tokens. See [Authentication](./AUTHENTICATION.md). |
| `BETTER_AUTH_URL`      | No                         | `http://localhost:3001`                                               | The backend's own base URL, used by Better Auth to build absolute links.                       |
| `CACHE_TTL_MS`         | No                         | `30000`                                                               | Default backend cache TTL in milliseconds.                                                     |
| `THROTTLE_TTL_SECONDS` | No                         | `60`                                                                  | Rate-limit window length in seconds.                                                           |
| `THROTTLE_LIMIT`       | No                         | `100`                                                                 | Maximum requests allowed during the throttle window.                                           |
| `DEV_FIXTURES`         | No                         | `false`                                                               | Use in-memory users, cache, and throttling without PostgreSQL or Redis.                        |
| `CORS_ORIGINS`         | No                         | `http://localhost:3000`                                               | Comma-separated browser origins allowed to call the backend.                                   |

The committed development fallback lives in:

```text
apps/backend/.env.development
```

Local secrets or overrides should go into ignored `.env` files. Paths are
resolved from the repository and backend directories rather than the command's
working directory. Invalid values stop the application during startup.

The `dev:fixtures` task sets `DEV_FIXTURES=true` for the backend process. This
mode is intended for UI and API-contract development; its data resets whenever
the backend restarts.

## Drizzle Kit

Drizzle Kit reads the same `DATABASE_URL` through `apps/backend/drizzle.config.ts`.

The config loads:

1. `apps/backend/.env`
2. `.env`
3. `apps/backend/.env.development`

## Frontend

The frontend uses `@t3-oss/env-core`.

Client-side variables must use the `VITE_` prefix.

| Variable         | Required | Purpose                                             |
| ---------------- | -------- | --------------------------------------------------- |
| `VITE_APP_TITLE` | No       | Optional frontend application title.                |
| `VITE_API_URL`   | No       | Optional frontend API URL.                          |
| `SERVER_URL`     | No       | Backend URL used by the frontend server during SSR. |

## Compose Variables

The root `docker-compose.yml` supports these optional overrides:

| Variable            | Default         | Purpose                                     |
| ------------------- | --------------- | ------------------------------------------- |
| `POSTGRES_DB`       | `transcendence` | PostgreSQL database name.                   |
| `POSTGRES_USER`     | `transcendence` | PostgreSQL user.                            |
| `POSTGRES_PASSWORD` | `transcendence` | PostgreSQL password.                        |
| `FRONTEND_PORT`     | `3000`          | Host port mapped to the frontend container. |
| `BACKEND_PORT`      | `3001`          | Host port mapped to the backend container.  |
| `POSTGRES_PORT`     | `5432`          | Host port mapped to PostgreSQL.             |
| `REDIS_PORT`        | `6380`          | Host port mapped to Redis.                  |
