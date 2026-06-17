# @repo/schemas

Shared schema package for `ft_transcendence`.

This package holds database table definitions, Zod validation schemas, DTO types, and generated tRPC router types used by both apps. It is the main place where database shape, request validation, and API contracts meet.

## Start Here

- Shared validation architecture: [Validation](../../docs/VALIDATION.md)
- Database schema and migrations: [Database](../../docs/DATABASE.md)
- tRPC API contracts: [API](../../docs/API.md)
- Monorepo package layout: [Monorepo](../../docs/MONOREPO.md)
- Generated files policy: [Tooling](../../docs/TOOLING.md#generated-files)

## Important Files

| Path                                                   | Purpose                                                                                                         |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| [src/database.ts](./src/database.ts)                   | Drizzle table definitions and exported database schema object.                                                  |
| [src/users.ts](./src/users.ts)                         | User Zod schemas and DTO types derived from the Drizzle table.                                                  |
| [src/@generated/server.ts](./src/@generated/server.ts) | Generated tRPC router types from the backend.                                                                   |
| [src/index.ts](./src/index.ts)                         | Root package entry point.                                                                                       |
| [package.json](./package.json)                         | Package exports for `@repo/schemas`, `@repo/schemas/database`, `@repo/schemas/users`, and `@repo/schemas/trpc`. |

## Exports

```ts
import { schema, users } from '@repo/schemas/database';
import { createUserSchema, userSchema } from '@repo/schemas/users';
import type { AppRouter } from '@repo/schemas/trpc';
```

## Generated tRPC Types

The backend generates router types into:

```text
src/@generated/server.ts
```

Regenerate from the repository root:

```bash
vp run trpc:generate
```

Do not edit generated files by hand.
