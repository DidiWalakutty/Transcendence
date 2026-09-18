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
4. Building typed SQL queries in the backend repository adapter.

The shared database schema lives in:

```text
packages/schemas/src/database.ts
```

The backend imports the shared `schema` object from `@repo/schemas/database` and passes it to Drizzle.

```mermaid
flowchart LR
    A["packages/schemas/src/database.ts"]
    B["schema object"]
    C["apps/backend/src/database/database.service.ts"]
    D["Drizzle ORM + managed pg Pool"]
    E[("PostgreSQL")]
    F["apps/backend/drizzle/*.sql"]

    A --> B
    B --> C
    C --> D
    D --> E
    A --> F
    F --> E
```

`DatabaseService` owns the PostgreSQL pool and closes it through Nest's
application-shutdown lifecycle. User-facing services access the database through
`DrizzleUsersRepository`; fixture mode replaces that adapter with
`InMemoryUsersRepository` and does not import `DatabaseModule`.

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
vp run db:seed
vp run db:push
vp run db:studio
```

`vp run dev` and `vp run dev:backend` both depend on the database setup task, so local development normally starts PostgreSQL and runs migrations automatically.

## Seeding

`vp run db:setup` only starts PostgreSQL and runs migrations. It does not
insert demo data. Use `vp run db:seed`, not `npm run db:setup` — the project uses Bun and Vite+, not npm.

Seeding runs:

```text
apps/backend/seed.ts
```

It creates the admin user plus two demo users through Better Auth email
signup, then inserts demo events from `apps/backend/seed-data/events.ts`.
Run migrations first:

```bash
vp run db:setup
vp run db:seed
```

The script is idempotent: reruns skip users and events that already exist
(matched by email and title). Seed passwords come from the `SEED_*` variables
described in [Environment](./ENVIRONMENT.md), with development defaults in
`apps/backend/.env.development`.

Do not confuse persistent seeding with fixture mode (`vp run dev:fixtures`),
which uses an in-memory user store without PostgreSQL and resets whenever the
backend restarts.

```mermaid
erDiagram
    USERS {
        uuid id PK
        text email UK
        text name
        text role
        boolean banned
        timestamp created_at
    }
    USERS ||--o{ EVENTS : organizes
    USERS ||--o{ REGISTRATIONS : makes
    EVENTS ||--o{ REGISTRATIONS : has
```

User-owned authentication rows, events, friendships, and registrations use foreign-key cascades.
Deleting a user therefore removes their sessions/accounts, owned events, friendships, and event
registrations; deleting an event removes its registrations. Migration `0007` also introduces the
Better Auth admin-plugin fields and session impersonation metadata.

## Compose Ownership

The devcontainer does not provide PostgreSQL or Redis directly. Infrastructure services are owned by the root Docker Compose stack so they can be used consistently inside or outside the devcontainer.

PostgreSQL is currently integrated as the durable data store. Redis is currently started by development backend tasks and used by the backend for cache and throttling storage.
