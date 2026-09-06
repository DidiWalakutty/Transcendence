# Learning Path

Seven sessions that teach the codebase by moving through it. Each one is a reading list in a
deliberate order, a set of questions you should be able to answer afterwards, and an exercise that
makes you change something and watch what happens.

The order matters. Every session assumes the one before it.

Companion doc: [Architecture Tour](./ARCHITECTURE_TOUR.md) — the map. This is the route.

| #   | Session                                                                      | Time    | You will be able to                                                     |
| --- | ---------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------- |
| 1   | [Run it and find the seams](#session-1--run-it-and-find-the-seams)           | ~45 min | Start the stack, read the task graph, know what each dev mode gives you |
| 2   | [The spine: schemas and codegen](#session-2--the-spine-schemas-and-codegen)  | ~1 h    | Explain how one schema definition reaches four places                   |
| 3   | [A request through the backend](#session-3--a-request-through-the-backend)   | ~1.5 h  | Add a tRPC procedure end to end                                         |
| 4   | [A request through the frontend](#session-4--a-request-through-the-frontend) | ~1.5 h  | Wire a route, a loader, a query and a mutation                          |
| 5   | [Authentication](#session-5--authentication)                                 | ~1 h    | Say exactly why `main.ts` is ordered the way it is                      |
| 6   | [Realtime](#session-6--realtime)                                             | ~2 h    | Trace a push from `emit()` to a repainted list                          |
| 7   | [Capstone: ship registrations](#session-7--capstone-ship-registrations)      | ~4 h+   | Build a whole feature the way this repo builds features                 |

**Ground rules**

- Work on a scratch branch. Most exercises ask you to break something on purpose.
- `git diff` before every revert. The point is to see the change, not to keep it.
- After any exercise that edits backend routers or `packages/schemas`, run `vp run check`. That is
  what CI and the pre-commit hook run, and it regenerates the tRPC types first.
- When a check fails, run `vp run check:fix` before reading the error. Half of them are formatting.

---

## Session 1 — Run it and find the seams

**Goal:** get the stack up, and learn what the tooling does for you before you need it to.

### Read, in this order

1. `docs/DEVELOPMENT.md` — setup and troubleshooting.
2. `package.json` — every script is a one-line alias into Vite+. Note there is almost no logic here.
3. `vite.config.ts` — the real orchestration. Read only the `run.tasks` block; skim the `lint` and
   `test` blocks.
4. `docker-compose.yml` — four services, and where the ports come from.

### Notice

- Every task name is namespaced `repo:*`. `bun dev` is `vp run -w repo:dev`.
- `repo:dev` `dependsOn` `repo:dev:prepare`, which chains services setup → migrate → tRPC codegen →
  frontend codegen. You never run codegen by hand for the dev flow.
- The shell fragments like `$(if [ -f /.dockerenv ]; then printf postgres; else printf localhost; fi)`
  make the same task work from your host shell and from inside a devcontainer.
- Redis is mapped `6380 → 6379` on the host so it does not collide with a local Redis.

### Do

```bash
bun dev                          # or: vp run dev
```

Then, in a browser:

- `http://localhost:3000` — the app.
- `http://localhost:3001/health` — read the JSON; it names its indicators.
- Open the app and find the TanStack devtools panel (bottom right). Both the Router and the Query
  plugin are wired in `__root.tsx`.

### Exercise 1.1 — find the limit of fixtures mode

```bash
bun dev:fixtures
```

Browse the events listing — it works, with no Docker running. Now try to create an event.

It will fail. **Before reading on, find out why yourself**: start at `app.module.ts`, see which
modules take a `persistence` option, then open `events/events.module.ts`.

<details>
<summary>Answer</summary>

Only `UsersModule`, `EventListingsModule` and `FriendsModule` have a `static register({ persistence })`.
`EventsModule` is a plain `@Module` whose `imports` contains `DatabaseModule` unconditionally, so
event creation always needs Postgres. Same for `RegistrationsModule`, `PresenceModule` and
`AuthModule`.
</details>

### You should be able to answer

- Which tasks list `repo:trpc:generate` in their `dependsOn`, and why is that the right set?
- What are the three generated artifacts that `repo:dev:prepare` produces?
- Which generated artifact is _not_ produced automatically by any dev or build task?

---

## Session 2 — The spine: schemas and codegen

**Goal:** understand why the frontend and backend cannot disagree about a type.

### Read, in this order

1. `packages/schemas/package.json` — the `exports` map. Every subpath you can import.
2. `packages/schemas/src/database.ts` — all eight tables, top to bottom. This is the source of truth.
3. `packages/schemas/src/users.ts` — Zod **derived** from the table with `drizzle-zod`.
4. `packages/schemas/src/events.ts` — Zod written **by hand**. Compare it against the `events` table
   and list the differences.
5. `packages/schemas/src/@generated/server.ts` — skim it. Look at a procedure body.
6. `docs/VALIDATION.md`.

### Notice

- `createSelectSchema(users)` tracks the table automatically; `eventSchema` does not track anything.
- `EventDto` has `date` and `time` as separate strings; the table has one `dateTime` timestamp.
  `EventDto.description` is a string; the column is `jsonb` keyed by locale.
- Every generated procedure body is `async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any`. Only the
  types matter — the file is never executed.
- The generated file imports the _same_ Zod objects the backend imports. That is the whole trick.

### Exercise 2.1 — break the contract on purpose

In `apps/backend/src/event-listings/event-listings.router.ts`, rename `getFeaturedEvents` to
`getSpotlightEvents`. Then:

```bash
vp run trpc:generate
git diff packages/schemas/src/@generated/server.ts
vp run check
```

Read the frontend error. Find the component it points at. Then revert both the rename and the
regenerated file.

**The lesson:** you never write a client. You rename a method and the compiler tells you every call
site.

### Exercise 2.2 — a column that goes nowhere

Add a column to the `events` table in `packages/schemas/src/database.ts`:

```ts
website: text('website'),
```

Then:

```bash
vp run db:generate
cat apps/backend/drizzle/00*_*.sql | tail -20
vp run check
```

The check passes. The migration is real. And the field is **invisible to the client** — because
`eventSchema` in `events.ts` is hand-written and does not know about it.

Now do the same thought experiment for `users`: add a column there, and `userSchema` picks it up for
free because it is `createSelectSchema(users)`.

Revert: delete the generated migration file and the journal entry it added in
`apps/backend/drizzle/meta/`, and undo the schema change.

### You should be able to answer

- Why is `EventsRepository` an `abstract class` rather than a TypeScript `interface`?
- If you add a field to `createEventSchema`, which files must change for it to reach Postgres?
- Where does the `date` + `time` → `dateTime` conversion happen, and how many places do it?

---

## Session 3 — A request through the backend

**Goal:** be able to add a tRPC procedure without copying blindly.

### Read, in this order

1. `apps/backend/src/main.ts` — short, and every line is commented for a reason.
2. `apps/backend/src/app.module.ts` — the whole module list in one place.
3. `apps/backend/src/auth/auth.context.ts` — runs before every procedure.
4. `apps/backend/src/events/events.router.ts` — decorators, guards, `assertCanManage`.
5. `apps/backend/src/events/events.service.ts` — read only `create`, `update`, `delete` for now;
   leave the `listen*` methods for Session 6.
6. `apps/backend/src/events/repositories/` — the interface, then the Drizzle implementation.
7. `apps/backend/src/event-listings/` — the whole module. It is the smallest complete example of the
   swappable-persistence pattern.

Then read [Trace 1](./ARCHITECTURE_TOUR.md#trace-1-creating-an-event) with those files open.

### Notice

- `organizerId` comes from `ctx.user.id`, never from the request body. Ask yourself what would
  happen if it did.
- The router does authorisation; the service does not. `assertCanManage` loads the event and
  compares ownership.
- `create()` inserts, then **re-reads the row** before broadcasting.
- Two different guard styles exist. `@UseMiddlewares(ProtectedMiddleware)` in `events`/`users`;
  a manual `if (!ctx.user) throw unauthorizedError(...)` in `friends`/`presence`.

### Exercise 3.1 — defence in depth, demonstrated

Comment out `@UseMiddlewares(ProtectedMiddleware)` on `createEvent`. Restart, log out, and try to
create an event through the UI.

It still fails — but with a different error, from a different place. Find where. That is the
difference between the guard and the fact that `ctx.user.id` is read unconditionally. Revert.

### Exercise 3.2 — add a procedure end to end

Add `getEventCount` to the **listings** module (the read side). Touch these files in order:

1. `packages/schemas/src/stats.ts` — or reuse the existing `eventStatsSchema`; decide which and say why.
2. `event-listings/repositories/event-listings.repository.ts` — add the abstract method.
3. `event-listings/repositories/drizzle-event-listings.repository.ts` — implement with a
   `count(*)` select.
4. `event-listings/repositories/in-memory-event-listings.repository.ts` — implement it too, or the
   fixtures build stops compiling. (Notice that the compiler enforces this. That is the payoff of
   the abstract-class pattern.)
5. `event-listings/event-listings.service.ts` — pass it through.
6. `event-listings/event-listings.router.ts` — add `@Query({ output: ... })`.

Then:

```bash
vp run trpc:generate
git diff packages/schemas/src/@generated/server.ts
```

Your procedure is now typed on the client. You will consume it in Session 4.

### Exercise 3.3 — write a test for it

Copy the shape of `apps/backend/src/users/users.router.spec.ts` or
`apps/backend/src/events/events.service.spec.ts`. Run:

```bash
vp test --project backend
```

### You should be able to answer

- What exactly breaks if `app.use(express.json())` is moved above the Better Auth mount? (You will
  prove it in Session 5.)
- Why does `create()` re-read the row instead of broadcasting its input?
- Which of the six routers has no procedures at all, and what already exists in the database for it?

---

## Session 4 — A request through the frontend

**Goal:** know where data enters a component, and what happens around it that you did not write.

### Read, in this order

1. `apps/frontend/src/routes/__root.tsx` — router context, `beforeLoad`, the shell.
2. `apps/frontend/src/integrations/tanstack-query/root-provider.tsx` — the densest file in the
   frontend. Read `getUrl`, the `splitLink`, and the `MutationCache` separately.
3. `apps/frontend/src/integrations/trpc/react.ts` — three lines, and now they make sense.
4. `apps/frontend/src/routes/events/index.tsx` — `validateSearch`, `loaderDeps`, `loader`, then the
   component's `useQuery`.
5. `apps/frontend/src/components/events/EventForm.tsx` — the mutation side.
6. `apps/frontend/src/routes/create-event.tsx` — the `beforeLoad` redirect guard.

### Notice

- The loader calls `ensureQueryData(...).catch(() => undefined)`. Read the comment above it. A
  throwing loader turns a down backend into an error screen for the whole route.
- `splitLink` sends subscriptions over SSE and everything else over a batched HTTP link. Both use
  `superjson` — and so does the server, in `app.module.ts`. They must match.
- **Every mutation gets a toast automatically**, and the wording is chosen by string-matching the
  mutation key. Nobody wrote a toast in `EventForm`.
- `EventForm` uses a raw `FormData`, not TanStack Form. The auth forms do use TanStack Form with the
  shared schema. Both are safe; only one gives inline errors.
- Search params are Zod-validated at the route level via `validateSearch`.

### Exercise 4.1 — consume your new procedure

Render the `getEventCount` you added in Session 3 somewhere on `/events`. Use
`useQuery(trpc.events.getEventCount.queryOptions())`. Confirm the type flows through with no manual
annotation anywhere.

### Exercise 4.2 — meet the toast heuristic

Temporarily rename a mutation so its key no longer contains `create`, `update` or `delete` — for
example call it `eventCreation.persistEvent`. Regenerate, submit the form, and read the toast.

You get "Working… / Complete" instead of "Creating… / Created". Now go find
`mutationToastMessages()` and see why. Revert.

### Exercise 4.3 — break superjson

In `root-provider.tsx`, remove `transformer: superjson` from the `httpBatchLink` only. Reload and
watch what happens to any query returning a `Date`.

Then read `mutationErrorMessage()` and find the branch that exists specifically for this failure
(`'Unable to transform response from server'`). Revert.

### You should be able to answer

- Why does `getUrl()` prefer `SERVER_URL` on the server and `VITE_API_URL` in the browser?
- What are the two consumers of `queryClient` in the router context, and which one runs on the server?
- When does `EventsPage` refetch, and when does it read from cache? (`staleTime` is 30 s.)

---

## Session 5 — Authentication

**Goal:** understand a subsystem that deliberately sits _outside_ tRPC.

### Read, in this order

1. `docs/AUTHENTICATION.md` — the whole thing.
2. `apps/backend/src/main.ts` again, now for the ordering comments specifically.
3. `apps/backend/src/auth/auth.instance.ts` — plugins, field mapping, `additionalFields`.
4. `apps/backend/src/auth/auth.context.ts`, `protected.middleware.ts`, `admin.middleware.ts`.
5. `apps/frontend/src/lib/auth-client.ts` — compare the plugin list against the server's, line by line.
6. `apps/frontend/src/lib/auth-session.functions.ts` — read the comment before the code.
7. `packages/schemas/src/database.ts` — re-read `users`, `sessions`, `accounts`, `verifications`,
   `twoFactors` as a group.

Then read [Trace 2](./ARCHITECTURE_TOUR.md#trace-2-logging-in-and-being-recognised).

### Notice

- Hashed passwords live in `accounts.password`. `users` has no password column.
- The session is resolved **twice per page** by two independent mechanisms that share no state.
- `getAuthSession` catches everything and returns `null`. The comment explains the remount loop it
  prevents.
- Better Auth's `image` field is mapped onto the `avatar` column; `aboutMe` / `location` /
  `preferedLanguage` are declared as `additionalFields`.
- `role` is a comma-joined string, which is why you keep seeing `role?.split(',').includes('admin')`.

### Exercise 5.1 — prove the ordering is load-bearing

In `main.ts`, move `app.use(express.json({ limit: '2mb' }))` **above** the
`app.use('/api/auth', toNodeHandler(...))` line. Restart. Try to sign in.

Watch it break, then explain precisely why using the comment in the file. Revert.

Optionally do the same with `app.enableCors(...)`, moving it below the auth mount, and watch
preflight requests fail instead.

### Exercise 5.2 — become an admin

```bash
vp run db:studio
```

Find your user row and set `role` to `admin`. Reload the app and visit `/admin`. Trace which guard
let you in — `AdminMiddleware` on the server, and whatever the route does on the client.

### Exercise 5.3 — the two user-creation paths

Create a user through `users.createUser` (admin-only). Then try to log in as that user.

You cannot. Find out why by looking at which table Better Auth reads the password from.

### You should be able to answer

- Which of the two session resolutions is authoritative for authorisation, and why?
- What happens if you add a Better Auth plugin on the server but not on the client?
- Why is `reset-password` a route outside any locale handling?

---

## Session 6 — Realtime

**Goal:** the hardest part of the codebase, understood well enough to extend.

### Read, in this order

1. `packages/schemas/src/events.ts` — the `eventChangedSchema` discriminated union and the comment
   above it. Note `heartbeat` carries no event.
2. `apps/backend/src/events/events.service.ts` — now read `emit`, `listen`,
   `listenEventChanged`, `listenEventChangedWithHeartbeat`. Read them in that order; each builds on
   the last.
3. `apps/backend/src/events/events.router.ts` — the `@Subscription` procedure. Note it is public.
4. `apps/backend/src/users/users.events.ts` — the same bus, wrapped for a different feature.
5. `apps/frontend/src/hooks/use-event-stream.ts` — every comment in this file is load-bearing.
6. `apps/backend/src/presence/presence.router.ts` + `presence.service.ts` — a second, different
   subscription shape.
7. `docs/API.md` — the subscription conventions section.

Then read [Trace 3](./ARCHITECTURE_TOUR.md#trace-3-a-change-reaching-every-open-browser).

### Notice

- `listen()` converts a callback API into an async generator, buffers up to 100 messages, throws on
  overflow, and cleans up in a `finally`.
- The event-name string `'event.changed'` exists in exactly one place. Routers call
  `listenEventChanged()` instead.
- `listenEventChangedWithHeartbeat` owns its timer, so it clears it in its own `finally` and calls
  `changes.return?.()`.
- `lastMessageAt` in the hook is **module scope, not a ref** — read the comment for why.
- Updates and deletes are patched into the cache. Creates invalidate instead. The comment explains
  the sort-order reason.
- Presence counts connections per user: only the first connect and last disconnect broadcast.

### Exercise 6.1 — watch it work

Open `/events` in two browser windows, logged in as different users. Create an event in one. Watch
the other update without a reload, and watch the connection dot.

### Exercise 6.2 — watch it fail, and recover

With both windows open, kill the backend (`Ctrl-C`). Watch the indicator on `/events`.

It should flip to reconnecting within about 25 seconds — 2.5 missed heartbeats at
`EVENT_HEARTBEAT_INTERVAL_MS` of 10 s, checked by a 5 s watchdog. Restart the backend and watch it
resync.

Now lower `EVENT_HEARTBEAT_INTERVAL_MS` to `2_000` in `packages/schemas/src/events.ts` and repeat.
The detection window shrinks with it, because `STALE_AFTER_MS` is derived from the same constant.
Revert.

### Exercise 6.3 — why re-read before broadcasting

In `events.service.ts`, change `create()` to broadcast the input it was given instead of the row it
read back. Create an event with a second window open.

Watch what arrives on the other client, and what the frontend does with an event that has no `id`.
Revert. Write down, in one sentence, the rule this demonstrates.

### Exercise 6.4 — add a channel

Make the friends feature realtime. Follow the existing convention exactly:

1. A `friends.events.ts` with named `emit*` / `listen*` methods over `EventsService`, modelled on
   `users.events.ts`.
2. Emit from `friends.service.ts` on add/accept/remove.
3. A `@Subscription` in `friends.router.ts`, guarded — this one is **not** public, unlike events.
4. A subscription schema in `packages/schemas/src/friends.ts`, typed as
   `z.custom<AsyncIterable<...>>()`. Read the comment in `events.ts` about why the output type is the
   _yielded item_, not the entity.
5. A `use-friend-stream.ts` hook that patches the friends query cache.

### You should be able to answer

- Why can a client not distinguish an idle SSE stream from a dead one without heartbeats?
- Why does the presence router yield the client's own `online` event directly instead of relying on
  the broadcast?
- What would break if the backend ran as two replicas?

---

## Session 7 — Capstone: ship registrations

**Goal:** build a real feature the way this repo builds features, with nothing scaffolded for you.

The `registrations` table exists. `events` has a foreign key from it. Both listing repositories
already compute `registrationsCount` from it. And `RegistrationsRouter` is an empty class:

```ts
@Router({ alias: 'registrations' })
export class RegistrationsRouter {}
```

Fill it in. "Register for an event" is the one obvious missing verb in the product.

### Scope

- `register(eventId)` — creates a row, or reactivates a `canceled` one. Must reject when the event is
  at `maxCapacity`.
- `cancel(eventId)` — sets `status` to `canceled` rather than deleting. (Ask yourself why the schema
  has a status enum instead of relying on row deletion.)
- `getMyRegistrations()` — the events the current user is attending.
- `isRegistered(eventId)` — or fold it into the event detail query. Decide, and justify it.
- Realtime: a registration changes `registrationsCount`, which changes the `popular` sort order. Work
  out what the client can patch and what it must refetch, using the reasoning in
  `use-event-stream.ts` as your guide.
- UI: a register/cancel button on `/events/$eventId`, and the user's registrations on `/my-events` or
  `/profile`.

### Constraints — this is the actual exercise

- Follow the module shape: `registrations.module.ts` / `.router.ts` / `.service.ts` /
  `repositories/{interface, drizzle, in-memory}`.
- Schemas go in `packages/schemas/src/registrations.ts`, and the DTO is what crosses the wire — not
  the row type.
- Guard with `@UseMiddlewares(ProtectedMiddleware)`, not hand-rolled `ctx.user` checks.
- Authorisation logic (can this user cancel this registration?) goes in the router, matching
  `assertCanManage`.
- Capacity checking is business logic. Decide whether it belongs in the service or the repository,
  and be able to defend the choice. Then consider what happens when two users register
  simultaneously.
- Write specs. `vp run test:backend` must pass.
- `vp run check` must pass before you consider it done.

### Reviewing your own work

Ask, of your diff:

- Could someone swap the persistence to fixtures without touching the service? If not, you leaked
  Drizzle upward.
- Does any event-name string appear outside a `*.events.ts` file?
- Does the client re-derive anything the server already computed?
- Did you add a column without regenerating a migration?
- If you added a subscription: does every resource it opens get closed in a `finally`?

---

## After the path

You will know the codebase better than the docs do. Two things worth doing with that:

- Fix the drift listed at the end of [Architecture Tour](./ARCHITECTURE_TOUR.md#sharp-edges) —
  `CLAUDE.md` is wrong about route structure and about `users.createUser`.
- Keep both documents current. `docs/README.md` indexes every doc; update it when you add one.
