# API

The backend exposes a tRPC API through `nestjs-trpc`.

## Base Path

```text
http://localhost:3001/api/trpc
```

The tRPC router implementation currently lives in:

```text
apps/backend/src/trpc.router.ts
```

Generated client router types live in:

```text
packages/schemas/src/@generated/server.ts
```

Regenerate them with:

```bash
vp run trpc:generate
```

## Current Router

The current router alias is:

```text
example
```

| Procedure            | Type     | Input              | Output                  | Notes                                                 |
| -------------------- | -------- | ------------------ | ----------------------- | ----------------------------------------------------- |
| `example.getTodos`   | Query    | None               | Array of `{ id, name }` | Temporary example data.                               |
| `example.getUsers`   | Query    | None               | Array of users          | Reads users from PostgreSQL through Drizzle.          |
| `example.createUser` | Mutation | `createUserSchema` | User                    | Creates a user and rejects duplicate email addresses. |

## Shared Contracts

User input/output contracts are imported from:

```text
@repo/schemas/users
```

The frontend calls these procedures through TanStack Query and `@trpc/tanstack-react-query`.

The backend validates inputs through `nestjs-trpc` decorators before data reaches the service layer.

```mermaid
sequenceDiagram
    participant UI as "React UI"
    participant Query as "TanStack Query"
    participant TRPC as "tRPC client"
    participant Router as "nestjs-trpc router"
    participant Service as "UsersService"
    participant DB as "PostgreSQL"

    UI->>Query: submit create user / load users
    Query->>TRPC: call example procedure
    TRPC->>Router: HTTP request to /api/trpc
    Router->>Router: validate with shared Zod schema
    Router->>Service: call service method
    Service->>DB: Drizzle query
    DB-->>Service: rows
    Service-->>Router: typed result
    Router-->>TRPC: response
    TRPC-->>Query: cached data
    Query-->>UI: render state
```
