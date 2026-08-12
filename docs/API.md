# API

The backend exposes a tRPC API through `nestjs-trpc`.

## Base Path

```text
http://localhost:3001/api/trpc
```

The non-tRPC health endpoint is available at:

```text
GET http://localhost:3001/health
```

This is a Terminus readiness check for PostgreSQL and Redis. It returns `200` when
both dependencies respond and `503` when either check fails. In fixture mode, both
checks are marked as skipped because that mode intentionally runs without external
services.

The tRPC router implementation currently lives in:

```text
apps/backend/src/users/users.router.ts
apps/backend/src/event-listings/event-listings.router.ts
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

The current router aliases are:

```text
events, users
```

| Procedure             | Type         | Input              | Output          | Notes                                                    |
| --------------------- | ------------ | ------------------ | --------------- | -------------------------------------------------------- |
| `events.getEvents`    | Query        | `eventSortSchema`  | Array of events | Reads events and orders them in the backend by sort key. |
| `users.getUsers`      | Query        | None               | Array of users  | Reads users through the configured repository.           |
| `users.createUser`    | Mutation     | `createUserSchema` | User            | Creates a user and rejects duplicate email addresses.    |
| `users.updateUser`    | Mutation     | `updateUserSchema` | User            | Updates a user and rejects missing or duplicate records. |
| `users.deleteUser`    | Mutation     | `deleteUserSchema` | User            | Deletes a user and rejects missing records.              |
| `users.onUserCreated` | Subscription | None               | User stream     | Streams newly created users to subscribed clients.       |
| `users.onUserUpdated` | Subscription | None               | User stream     | Streams updated users to subscribed clients.             |
| `users.onUserDeleted` | Subscription | None               | User stream     | Streams deleted users to subscribed clients.             |

## Shared Contracts

User input/output contracts are imported from:

```text
@repo/schemas/users
@repo/schemas/events
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
    participant Repo as "UsersRepository"

    UI->>Query: create, update, delete, or load users
    Query->>TRPC: call users procedure
    TRPC->>Router: HTTP request to /api/trpc
    Router->>Router: validate with shared Zod schema
    Router->>Service: call service method
    Service->>Repo: repository query
    Repo-->>Service: users
    Service-->>Router: typed result
    Router-->>TRPC: response
    TRPC-->>Query: cached data
    Query-->>UI: render state
```

## Realtime Subscriptions

Realtime updates use tRPC subscriptions over the existing `/api/trpc` endpoint. The frontend routes subscription operations through `httpSubscriptionLink` and keeps queries/mutations on `httpBatchLink`.

Backend subscription procedures should stay small and delegate event ownership to a service:

```ts
import { userCreatedSubscriptionSchema } from '@repo/schemas/users';

@Subscription({ output: userCreatedSubscriptionSchema })
async *onUserCreated(@Options() opts: { signal?: AbortSignal }) {
  for await (const user of this.usersEvents.listenUserCreated(opts.signal)) {
    yield user;
  }
}
```

For tRPC v11 subscriptions, the static output type must be an `AsyncIterable` of yielded values. Do not use `output: userSchema` for a subscription that yields users; that describes a single user, not the stream, and the client cannot infer the `onData` payload type.

The tRPC server and every frontend terminating link use `superjson` as the transformer. Keep those settings matched so values like `Date` keep the same type across queries, mutations, and subscriptions.

Internal backend events go through `EventsService`, which wraps Nest's `@nestjs/event-emitter` package. These events are local to the current backend process; Redis is not used for subscription delivery. Domain-specific services, such as `UsersEvents`, should expose named methods like `emitUserCreated()` and `listenUserCreated()` instead of putting raw event names in routers or feature services.

### Cleanup Rules

The `AbortSignal` passed by `nestjs-trpc` is how a subscription learns that the client disconnected. `EventsService.listen()` uses that signal to:

- wake any pending listener promise;
- remove the Nest event listener;
- remove its own abort listener;
- end the async generator cleanly.

This cleanup only covers resources opened by `EventsService.listen()` itself. If a feature-level subscription opens another resource, the same service that opens it must close it with `try`/`finally`:

```ts
async *listenUserCreated(signal?: AbortSignal) {
  const resource = await openSomething();

  try {
    for await (const user of this.eventsService.listen<UserDto>('user.created', signal)) {
      yield user;
    }
  } finally {
    await resource.close();
  }
}
```

The ownership rule is: whoever opens a resource closes it. The shared `EventsService` deduplicates event listener and abort handling, while feature services remain responsible for database cursors, timers, sockets, file handles, or other resources they create.
