# Database Infrastructure & Architecture

The project features a full-stack relational persistence engine backed by PostgreSQL as the primary durable data store and Drizzle ORM as the type-safe, SQL-first Object-Relational Mapping layer. High-throughput operational pipelines (caching, rate limiting, and session throttling) are decoupled from the relational layer and routed to an instances cluster managed via Redis.

---

## 1. Architecture Flow & Lifecycle

Database definitions are managed directly inside the TypeScript scope of the monorepo packages directory. Backend infrastructure modules import this singular schema representation, instantiate connection pooling networks, and process business transactions through decoupled abstract repository adapters.

```mermaid
flowchart TD
    A["packages/schemas/src/database.ts (Source Declarations)"]
    B["Compiled Shared Schema Object"]
    C["apps/backend/src/database/database.module.ts"]
    D["database.service.ts (Pool Initialization)"]
    E["Drizzle ORM Execution Client"]
    F[("PostgreSQL Cluster Engine")]
    G["apps/backend/drizzle/ (SQL Migration Assets)"]

    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    A --> G
    G --> F
```

- **Connection Management:** DatabaseService coordinates the lifecycle of the underlying PostgreSQL driver client network (pg). It instantiates connection limits dynamically and wires up safe connection termination arrays into the NestJS framework onApplicationShutdown event handlers.
- **Decoupled Repositories:** Services never touch the database context layer directly. Business domains consume abstract interface models (e.g., EventsRepository). In local mock testing or testing profiles (vp run dev:fixtures), the application layer hooks intercept data requests using decoupled in-memory arrays (e.g., InMemoryEventsRepository) to completely eliminate local PostgreSQL driver dependency.

---

## 2. Core Configurations & Service Mappings

The persistence engine relies on specific orchestration constants, workspace settings file structures, and connection paths across the repository.

### Key Configuration Paths

- **Relational Tables Core Module:** packages/schemas/src/database.ts — Contains the definitive Drizzle table declarations, column limits, schema index targets, and foreign-key relation mappings.
- **Drizzle Configuration Profile:** apps/backend/drizzle.config.ts — Governs asset generations, pointing directly to the schema paths and defining output directory destinations.
- **Backend Service Bridge:** apps/backend/src/database/database.service.ts — Mounts the physical connection driver, maps constants, and triggers local environment migration verification steps.

### Environment Context Variables

Connection handling hooks read configurations out of the localized environment structures, reverting to developer defaults (apps/backend/.env.development) unless overridden by local files:

- DATABASE_URL: Connection string (postgres://transcendence:transcendence@localhost:5432/transcendence).
- REDIS_URL: Caching engine endpoint (redis://localhost:6379).

---

## 3. Migrations & Seed Mechanics

Schema evolution and seed state management are handled strictly via standard monorepo validation routines rather than random raw SQL execution scripts.

### Common Workspace Orchestration Targets

- vp run db:setup — Spins up the raw Docker container services and applies pending schema migrations.
- vp run db:generate — Audits database.ts and generates incremental, chronological .sql tracking migrations.
- vp run db:migrate — Applies unexecuted SQL scripts against the active PostgreSQL database instance.
- vp run db:seed — Triggers idempotent population handlers to load baseline demo datasets.
- vp run db:studio — Boots up Drizzle's interactive GUI data manager on a local browser port.

### Idempotent Seeding Pipeline

When executing database initialization targets (vp run db:seed), the script boots up via apps/backend/seed.ts. It securely writes an initial application system admin, sets up user profiles through Better Auth authentication protocols, and injects default event configurations extracted from apps/backend/seed-data/events.ts. The script tracks creation states using uniquely indexable constraints (e.g., matching titles and emails) to prevent duplicate key errors on subsequent execution runs.

---

## 4. Validation & Schema Cohesion

Data validation shapes match database rows natively by pairing Drizzle schemas directly with drizzle-zod. Table properties are translated directly into runtime Zod constraints inside packages/schemas/src/users.ts and packages/schemas/src/events.ts. This structure ensures validation limits match the physical database columns while exposing clean package subpaths across the workspace:

```ts
import { schema, events } from '@repo/schemas/database';
import { createEventSchema, eventSchema } from '@repo/schemas/events';
```

---

## 5. Entity Relationship Diagram (ERD)

The relational schema map below outlines all tables, primary keys, structural indices, and cross-table foreign key dependencies across the domain space. To protect data hygiene, cascading parameters (onDelete: 'cascade') are enforced down all dependent relational lines.

```mermaid
erDiagram
    USERS {
        uuid id PK
        text email UK "Not Null"
        text name "Not Null"
        timestamp created_at "Not Null"
        timestamp updated_at "Not Null"
        text role "Not Null, Default: user"
        text about_me "Nullable"
        text location "Nullable"
        text language "Default: english"
        text avatar_link "Default: PLACEHOLDER"
        text username UK "Not Null"
        text display_username "Nullable"
        boolean email_verified "Not Null, Default: false"
        boolean two_factor_enabled "Not Null, Default: false"
    }
    SESSIONS {
        uuid id PK
        uuid user_id FK "References users.id, Cascade"
        text token UK "Not Null"
        timestamp expires_at "Not Null"
        text ip_address "Nullable"
        text user_agent "Nullable"
        timestamp created_at "Not Null"
        timestamp updated_at "Not Null"
        text impersonated_by "Nullable"
    }
    ACCOUNTS {
        uuid id PK
        uuid user_id FK "References users.id, Cascade"
        text account_id "Not Null"
        text provider_id "Not Null"
        text access_token "Nullable"
        text refresh_token "Nullable"
        text id_token "Nullable"
        timestamp access_token_expires_at "Nullable"
        timestamp refresh_token_expires_at "Nullable"
        text scope "Nullable"
        text password "Nullable"
        timestamp created_at "Not Null"
        timestamp updated_at "Not Null"
    }
    VERIFICATIONS {
        uuid id PK
        text identifier "Not Null"
        text value "Not Null"
        timestamp expires_at "Not Null"
        timestamp created_at "Not Null"
        timestamp updated_at "Not Null"
    }
    TWO_FACTORS {
        uuid id PK
        uuid user_id FK "References users.id, Cascade"
        text secret "Not Null"
        text backup_codes "Not Null"
        boolean verified "Not Null, Default: true"
        integer failed_verification_count "Not Null, Default: 0"
        timestamp locked_until "Nullable"
    }
    EVENTS {
        uuid id PK
        text title "Not Null"
        timestamp created_at "Not Null"
        jsonb description "Not Null, Record<string, string>"
        text image_link "Not Null"
        uuid organizer_id FK "References users.id, Cascade"
        text location "Not Null"
        text address "Not Null"
        timestamp date_time "Not Null"
        integer max_capacity "Not Null"
        text_array category "Not Null, Array"
        text contact_name "Nullable, Optional Feature Field"
        text contact_email "Nullable, Optional Feature Field"
    }
    FRIENDS {
        uuid my_id FK "References users.id, Cascade"
        uuid friend_id FK "References users.id, Cascade"
        friendship_status f_status "Not Null, Default: pending"
        timestamp created_at "Not Null"
    }
    REGISTRATIONS {
        uuid event_id FK "References events.id, Cascade"
        uuid user_id FK "References users.id, Cascade"
        registration_status r_status "Not Null, Default: active"
        timestamp created_at "Not Null"
    }

    USERS ||--o{ SESSIONS : "establishes"
    USERS ||--o{ ACCOUNTS : "links"
    USERS ||--o{ TWO_FACTORS : "configures"
    USERS ||--o{ EVENTS : "organizes"
    USERS ||--o{ FRIENDS : "befriends"
    USERS ||--o{ REGISTRATIONS : "submits"
    EVENTS ||--o{ REGISTRATIONS : "accepts"
```
