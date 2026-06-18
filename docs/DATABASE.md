# Database

The project uses PostgreSQL as the primary relational database and Drizzle ORM as the typed database layer.
Redis is also available through the local Compose stack for backend cache and throttling storage.

## Local Service

PostgreSQL is managed by the root `docker-compose.yml` file.

The default development connection string is:

```env
DATABASE_URL=postgres://transcendence:transcendence@localhost:5432/transcendence
```

The backend loads this value from `apps/backend/.env.development` unless it is overridden by an ignored local `.env` file.

## Drizzle

Drizzle is used for:

1. Defining database tables in TypeScript.
2. Generating SQL migrations.
3. Running migrations against PostgreSQL.
4. Building typed SQL queries in the backend service layer.

The shared database schema lives in:

```text
packages/schemas/src/database.ts
```

The backend imports the shared `schema` object from `@repo/schemas/database` and passes it to Drizzle.

```mermaid
flowchart LR
    A["packages/schemas/src/database.ts"]
    B["schema object"]
    C["apps/backend/src/database/database.provider.ts"]
    D["Drizzle ORM"]
    E[("PostgreSQL")]
    F["apps/backend/drizzle/*.sql"]

    A --> B
    B --> C
    C --> D
    D --> E
    A --> F
    F --> E
```

## Validation Integration

User-facing validation schemas are generated from the Drizzle table definitions with `drizzle-zod`.

The user schemas live in:

```text
packages/schemas/src/users.ts
```

This keeps the database model and request validation close together while still exposing explicit package subpaths:

```ts
import { schema, users } from '@repo/schemas/database';
import { createUserSchema, userSchema } from '@repo/schemas/users';
```

## Migrations

Migration files are stored in:

```text
apps/backend/drizzle
```

Common commands:

```bash
vp run db:setup
vp run db:generate
vp run db:migrate
vp run db:push
vp run db:studio
```

`vp run dev` and `vp run dev:backend` both depend on the database setup task, so local development normally starts PostgreSQL and runs migrations automatically.

```mermaid
erDiagram
    USERS {
        uuid id PK
        text email UK
        text name
        timestamp created_at
    }
```

## Compose Ownership

The devcontainer does not provide PostgreSQL or Redis directly. Infrastructure services are owned by the root Docker Compose stack so they can be used consistently inside or outside the devcontainer.

PostgreSQL is currently integrated as the durable data store. Redis is currently started by development backend tasks and used by the backend for cache and throttling storage.
