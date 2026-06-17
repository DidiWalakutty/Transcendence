# Validation

The application uses a shared schema-first validation architecture to keep frontend and backend behavior consistent.

```mermaid
flowchart TD
    A["Shared schema package<br/>@repo/schemas"]
    B["Drizzle table definitions"]
    C["drizzle-zod schemas"]
    D["TanStack Form<br/>client validation"]
    E["tRPC mutation/query"]
    F["nestjs-trpc<br/>server validation"]
    G["NestJS service layer"]
    H[("PostgreSQL")]

    B --> C
    C --> D
    C --> F
    D --> E
    E --> F
    F --> G
    G --> H
```

## Flow

1. Drizzle table definitions live in `packages/schemas/src/database.ts`.
2. Zod schemas are derived from those definitions with `drizzle-zod`.
3. TanStack Form uses the shared schema for instant client-side validation.
4. tRPC sends validated input to the backend.
5. `nestjs-trpc` validates the request again on the server.
6. The NestJS service layer reads or writes data through Drizzle ORM.
7. PostgreSQL stores the persistent data.

## Why This Matters

- Validation is fast on the client.
- Validation cannot be bypassed on the server.
- Request contracts are shared instead of duplicated.
- Database schema, API inputs, and UI forms stay aligned.

For database details, see [Database](./DATABASE.md).
