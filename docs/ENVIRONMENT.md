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

| Variable       | Required | Default Development Value                                             | Purpose                                                           |
| -------------- | -------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | `postgres://transcendence:transcendence@localhost:5432/transcendence` | PostgreSQL connection string used by the backend and Drizzle Kit. |
| `PORT`         | No       | `3001`                                                                | Backend HTTP port.                                                |

The committed development fallback lives in:

```text
apps/backend/.env.development
```

Local secrets or overrides should go into ignored `.env` files.

## Drizzle Kit

Drizzle Kit reads the same `DATABASE_URL` through `apps/backend/drizzle.config.ts`.

The config loads:

1. `apps/backend/.env`
2. `.env`
3. `apps/backend/.env.development`

## Frontend

The frontend uses `@t3-oss/env-core`.

Client-side variables must use the `VITE_` prefix.

| Variable         | Required | Purpose                                                   |
| ---------------- | -------- | --------------------------------------------------------- |
| `VITE_APP_TITLE` | No       | Optional frontend application title.                      |
| `SERVER_URL`     | No       | Optional server-side URL value for frontend runtime code. |

## Compose Variables

The root `docker-compose.yml` supports these optional overrides:

| Variable            | Default         | Purpose                         |
| ------------------- | --------------- | ------------------------------- |
| `POSTGRES_DB`       | `transcendence` | PostgreSQL database name.       |
| `POSTGRES_USER`     | `transcendence` | PostgreSQL user.                |
| `POSTGRES_PASSWORD` | `transcendence` | PostgreSQL password.            |
| `POSTGRES_PORT`     | `5432`          | Host port mapped to PostgreSQL. |
