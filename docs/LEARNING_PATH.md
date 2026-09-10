# Learning Path

Seven sessions that teach the codebase by moving through it. Each one gives you a reading list in a
deliberate order, a set of questions you should be able to answer afterwards, and an exercise that
makes you change something and watch what happens.

The order matters. Every session assumes the one before it.

Companion doc: [Architecture Tour](./ARCHITECTURE_TOUR.md). Keep it open alongside these sessions.

| #   | Session                                                                     | Time    | You will be able to                                                     |
| --- | --------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------- |
| 1   | [Run the stack](#session-1-run-the-stack)                                   | ~45 min | Start the stack, read the task graph, know what each dev mode gives you |
| 2   | [Schemas and codegen](#session-2-schemas-and-codegen)                       | ~1 h    | Explain how one schema definition reaches four places                   |
| 3   | [A request through the backend](#session-3-a-request-through-the-backend)   | ~1.5 h  | Add a tRPC procedure end to end                                         |
| 4   | [A request through the frontend](#session-4-a-request-through-the-frontend) | ~1.5 h  | Wire a route, a loader, a query and a mutation                          |
| 5   | [Authentication](#session-5-authentication)                                 | ~1 h    | Say exactly why `main.ts` is ordered the way it is                      |
| 6   | [Realtime](#session-6-realtime)                                             | ~2 h    | Trace a push from `emit()` to a repainted list                          |
| 7   | [Capstone: ship registrations](#session-7-capstone-ship-registrations)      | ~4 h+   | Build a whole feature the way this repo builds features                 |

### Ground rules

- Work on a scratch branch. Most exercises ask you to break something on purpose.
- Run `git diff` before every revert. You want to see the change, not keep it.
- After any exercise that edits backend routers or `packages/schemas`, run `vp run check`. That is
  what CI and the pre-commit hook run, and it regenerates the tRPC types first.
- When a check fails, run `vp run check:fix` before reading the error. Half of them are formatting.

---

## Session 1: run the stack

**Goal.** Get the stack up, and learn what the tooling does for you before you need it to.

### Read, in this order

1. `docs/DEVELOPMENT.md` for setup and troubleshooting.
2. `package.json`. Every script is a one-line alias into Vite+; almost no logic lives here.
3. `vite.config.ts`, where the orchestration lives. Read the `run.tasks` block, skim `lint` and
   `test`.
4. `docker-compose.yml`. Four services, and where the ports come from.

### Notice

- Every task name is namespaced `repo:*`. `bun dev` is `vp run -w repo:dev`.
- `repo:dev` declares `dependsOn` on `repo:dev:prepare`, which chains services setup, migration,
  tRPC codegen and frontend codegen. You never run codegen by hand for the dev flow.
- Shell fragments like `$(if [ -f /.dockerenv ]; then printf postgres; else printf localhost; fi)`
  make the same task work from your host shell and from inside a devcontainer.
- Redis is mapped from host port 6380 to container port 6379 so it does not collide with a local
  Redis.

### Do

```bash
bun dev                          # or: vp run dev
```

Then, in a browser:

- `http://localhost:3000` for the app.
- `http://localhost:3001/health`. Read the JSON; it names its indicators.
- Open the app and find the TanStack devtools panel (bottom right). `__root.tsx` wires in both the
  Router and the Query plugin.

### Exercise 1.1: find the limit of fixtures mode

```bash
bun dev:fixtures
```

Browse the events listing. It works with no Docker running. Now try to create an event.

It fails. Find out why before reading on: start at `app.module.ts`, see which modules take a
`persistence` option, then open `events/events.module.ts`.

<details>
<summary>Answer</summary>

Only `UsersModule`, `EventListingsModule` and `FriendsModule` have a `static register({ persistence })`.
`EventsModule` is a plain `@Module` whose `imports` contains `DatabaseModule` unconditionally, so
creating an event always needs Postgres. The same goes for `RegistrationsModule`, `PresenceModule`
and `AuthModule`.

</details>

### You should be able to answer

- Which tasks list `repo:trpc:generate` in their `dependsOn`, and why is that the right set?
- Which three files does `repo:dev:prepare` generate?
- Which generated file is _not_ produced by any dev or build task?

---

## Session 2: schemas and codegen

**Goal.** Understand why the frontend and backend cannot disagree about a type.

### Read, in this order

1. `packages/schemas/package.json`, the `exports` map. Every subpath you can import.
2. `packages/schemas/src/database.ts`, all eight tables, top to bottom. This is the source of truth.
3. `packages/schemas/src/users.ts`, where Zod is derived from the table with `drizzle-zod`.
4. `packages/schemas/src/events.ts`, where Zod is written by hand. Compare it against the `events`
   table and list the differences.
5. `packages/schemas/src/@generated/server.ts`. Skim it, and look at a procedure body.
6. `docs/VALIDATION.md`.

### Notice

- `createSelectSchema(users)` tracks the table. `eventSchema` tracks nothing.
- `EventDto` has `date` and `time` as separate strings; the table has one `dateTime` timestamp.
  `EventDto.description` is a string; the column is `jsonb` keyed by locale.
- Every generated procedure body is `async () => 'PLACEHOLDER_DO_NOT_REMOVE' as any`. Only the types
  matter; nothing ever executes the file.
- The generated file imports the same Zod objects the backend imports. That is why they cannot drift.

### Exercise 2.1: break the contract on purpose

In `apps/backend/src/event-listings/event-listings.router.ts`, rename `getFeaturedEvents` to
`getSpotlightEvents`. Then:

```bash
vp run trpc:generate
git diff packages/schemas/src/@generated/server.ts
vp run check
```

Read the frontend error and find the component it points at. Then revert both the rename and the
regenerated file.

You never write a client. Rename a method and the compiler names every call site.

### Exercise 2.2: a column that goes nowhere

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

The check passes and the migration is real, but the field never reaches the client, because
`eventSchema` in `events.ts` is hand-written and knows nothing about it.

Now do the same for `users`. Add a column there and `userSchema` picks it up, because it is
`createSelectSchema(users)`.

To revert, delete the generated migration file and the journal entry it added in
`apps/backend/drizzle/meta/`, then undo the schema change.

### You should be able to answer

- Why is `EventsRepository` an `abstract class` rather than a TypeScript `interface`?
- If you add a field to `createEventSchema`, which files must change for it to reach Postgres?
- Where does the conversion from `date` and `time` to `dateTime` happen, and how many places do it?

---

## Session 3: a request through the backend

**Goal.** Add a tRPC procedure without copying one blindly.

### Read, in this order

1. `apps/backend/src/main.ts`. It is short, and every line is commented for a reason.
2. `apps/backend/src/app.module.ts`, the whole module list in one place.
3. `apps/backend/src/auth/auth.context.ts`, which runs before every procedure.
4. `apps/backend/src/events/events.router.ts`: decorators, guards, `assertCanManage`.
5. `apps/backend/src/events/events.service.ts`. Read `create`, `update` and `delete` for now, and
   leave the `listen*` methods for Session 6.
6. `apps/backend/src/events/repositories/`, the interface first, then the Drizzle implementation.
7. `apps/backend/src/event-listings/`, the whole module. It is the smallest complete example of the
   swappable-persistence pattern.

Then read [Trace 1](./ARCHITECTURE_TOUR.md#trace-1-creating-an-event) with those files open.

### Notice

- `organizerId` comes from `ctx.user.id`, never from the request body. Work out what would happen if
  it came from the body.
- The router does authorisation; the service does not. `assertCanManage` loads the event and compares
  ownership.
- `create()` inserts, then re-reads the row before broadcasting.
- Two guard styles exist: `@UseMiddlewares(ProtectedMiddleware)` in `events` and `users`, and a
  manual `if (!ctx.user) throw unauthorizedError(...)` in `friends` and `presence`.

### Exercise 3.1: defence in depth

Comment out `@UseMiddlewares(ProtectedMiddleware)` on `createEvent`. Restart, log out, and try to
create an event through the UI.

It still fails, with a different error from a different place. Find where. The guard is one layer;
reading `ctx.user.id` unconditionally is another. Revert.

### Exercise 3.2: add a procedure end to end

Add `getEventCount` to the listings module, the read side. Touch these files in order:

1. `packages/schemas/src/stats.ts`, or reuse the existing `eventStatsSchema`. Decide which, and say
   why.
2. `event-listings/repositories/event-listings.repository.ts`. Add the abstract method.
3. `event-listings/repositories/drizzle-event-listings.repository.ts`. Implement it with a `count(*)`
   select.
4. `event-listings/repositories/in-memory-event-listings.repository.ts`. Implement it here too, or
   the fixtures build stops compiling. The compiler enforces this, which is the point of the
   abstract-class pattern.
5. `event-listings/event-listings.service.ts`. Pass it through.
6. `event-listings/event-listings.router.ts`. Add `@Query({ output: ... })`.

Then:

```bash
vp run trpc:generate
git diff packages/schemas/src/@generated/server.ts
```

Your procedure is now typed on the client. You will consume it in Session 4.

### Exercise 3.3: write a test for it

Copy the shape of `apps/backend/src/users/users.router.spec.ts` or
`apps/backend/src/events/events.service.spec.ts`. Run:

```bash
vp test --project backend
```

### You should be able to answer

- What breaks if `app.use(express.json())` moves above the Better Auth mount? You will prove it in
  Session 5.
- Why does `create()` re-read the row instead of broadcasting its input?
- Which of the six routers has no procedures at all, and what already exists in the database for it?

---

## Session 4: a request through the frontend

**Goal.** Know where data enters a component, and what happens around it that you did not write.

### Read, in this order

1. `apps/frontend/src/routes/__root.tsx`: router context, `beforeLoad`, the shell.
2. `apps/frontend/src/integrations/tanstack-query/root-provider.tsx`, the file with the most in it.
   Read `getUrl`, the `splitLink` and the `MutationCache` separately.
3. `apps/frontend/src/integrations/trpc/react.ts`. Three lines, which now make sense.
4. `apps/frontend/src/routes/events/index.tsx`: `validateSearch`, `loaderDeps`, `loader`, then the
   component's `useQuery`.
5. `apps/frontend/src/components/events/EventForm.tsx`, the mutation side.
6. `apps/frontend/src/routes/create-event.tsx`, the `beforeLoad` redirect guard.

### Notice

- The loader calls `ensureQueryData(...).catch(() => undefined)`. Read the comment above it. A
  throwing loader turns a down backend into an error screen for the whole route.
- `splitLink` sends subscriptions over SSE and everything else over a batched HTTP link. Both use
  `superjson`, and so does the server in `app.module.ts`. All three must match.
- **Every mutation gets a toast.** The wording comes from string-matching the mutation key. Nobody
  wrote a toast in `EventForm`.
- `EventForm` uses a raw `FormData`, not TanStack Form. The auth forms do use TanStack Form with the
  shared schema. Both are safe; only one gives inline errors.
- Zod validates search params at the route level, through `validateSearch`.

### Exercise 4.1: consume your new procedure

Render the `getEventCount` you added in Session 3 somewhere on `/events`, using
`useQuery(trpc.events.getEventCount.queryOptions())`. Confirm the type flows through with no manual
annotation anywhere.

### Exercise 4.2: the toast heuristic

Rename a mutation so its key no longer contains `create`, `update` or `delete`, for example
`eventCreation.persistEvent`. Regenerate, submit the form, and read the toast.

You get "Working…" and "Complete" instead of "Creating…" and "Created". Now find
`mutationToastMessages()` and see why. Revert.

### Exercise 4.3: break superjson

In `root-provider.tsx`, remove `transformer: superjson` from the `httpBatchLink` only. Reload and
watch what happens to any query returning a `Date`.

Then read `mutationErrorMessage()` and find the branch that exists for this exact failure
(`'Unable to transform response from server'`). Revert.

### You should be able to answer

- Why does `getUrl()` prefer `SERVER_URL` on the server and `VITE_API_URL` in the browser?
- What are the two consumers of `queryClient` in the router context, and which one runs on the server?
- When does `EventsPage` refetch, and when does it read from cache? `staleTime` is 30 s.

---

## Session 5: authentication

**Goal.** Understand a subsystem that sits outside tRPC.

### Read, in this order

1. `docs/AUTHENTICATION.md`, the whole thing.
2. `apps/backend/src/main.ts` again, now for the ordering comments.
3. `apps/backend/src/auth/auth.instance.ts`: plugins, field mapping, `additionalFields`.
4. `apps/backend/src/auth/auth.context.ts`, `protected.middleware.ts`, `admin.middleware.ts`.
5. `apps/frontend/src/lib/auth-client.ts`. Compare the plugin list against the server's, line by
   line.
6. `apps/frontend/src/lib/auth-session.functions.ts`. Read the comment before the code.
7. `packages/schemas/src/database.ts`. Re-read `users`, `sessions`, `accounts`, `verifications` and
   `twoFactors` as a group.

Then read [Trace 2](./ARCHITECTURE_TOUR.md#trace-2-logging-in-and-staying-logged-in).

### Notice

- Hashed passwords live in `accounts.password`. `users` has no password column.
- Two independent mechanisms resolve the session on every page, and they share no state.
- `getAuthSession` catches everything and returns `null`. The comment explains the remount loop it
  prevents.
- Better Auth's `image` field maps onto the `avatar` column. `aboutMe`, `location` and
  `preferedLanguage` are declared as `additionalFields`.
- `role` is a comma-joined string, which is why you keep seeing `role?.split(',').includes('admin')`.

### Exercise 5.1: prove the order matters

In `main.ts`, move `app.use(express.json({ limit: '2mb' }))` above the
`app.use('/api/auth', toNodeHandler(...))` line. Restart. Try to sign in.

Watch it break, then use the comment in the file to explain why. Revert.

Then do the same with `app.enableCors(...)`, moving it below the auth mount, and watch preflight
requests fail instead.

### Exercise 5.2: become an admin

```bash
vp run db:studio
```

Find your user row and set `role` to `admin`. Reload the app and visit `/admin`. Trace which guard
let you in: `AdminMiddleware` on the server, and whatever the route does on the client.

### Exercise 5.3: the two user-creation paths

Create a user through `users.createUser`, which is admin-only. Then try to log in as that user.

You cannot. Find out why by looking at which table Better Auth reads the password from.

### You should be able to answer

- Which of the two session resolutions is authoritative for authorisation, and why?
- What happens if you add a Better Auth plugin on the server but not on the client?
- Why is `reset-password` a route outside any locale handling?

---

## Session 6: realtime

**Goal.** Understand the hardest part of the codebase well enough to extend it.

### Read, in this order

1. `packages/schemas/src/events.ts`, the `eventChangedSchema` discriminated union and the comment
   above it. Note that `heartbeat` carries no event.
2. `apps/backend/src/events/events.service.ts`. Now read `emit`, `listen`, `listenEventChanged` and
   `listenEventChangedWithHeartbeat`, in that order. Each builds on the last.
3. `apps/backend/src/events/events.router.ts`, the `@Subscription` procedure. Note that it is public.
4. `apps/backend/src/users/users.events.ts`, the same bus wrapped for a different feature.
5. `apps/frontend/src/hooks/use-event-stream.ts`. Read every comment in it.
6. `apps/backend/src/presence/presence.router.ts` and `presence.service.ts`, a second and different
   subscription shape.
7. `docs/API.md`, the subscription conventions section.

Then read [Trace 3](./ARCHITECTURE_TOUR.md#trace-3-a-change-reaching-every-open-browser).

### Notice

- `listen()` converts a callback API into an async generator, buffers up to 100 messages, throws on
  overflow, and cleans up in a `finally`.
- The event-name string `'event.changed'` exists in exactly one place. Routers call
  `listenEventChanged()` instead.
- `listenEventChangedWithHeartbeat` owns its timer, so it clears the timer in its own `finally` and
  calls `changes.return?.()`.
- `lastMessageAt` in the hook is module scope, not a ref. The comment says why.
- Updates and deletes are patched into the cache. Creates invalidate instead, and the comment gives
  the sort-order reason.
- Presence counts connections per user. Only the first connect and the last disconnect broadcast.

### Exercise 6.1: watch it work

Open `/events` in two browser windows, logged in as different users. Create an event in one. Watch
the other update without a reload, and watch the connection dot.

### Exercise 6.2: watch it fail, and recover

With both windows open, kill the backend with `Ctrl-C`. Watch the indicator on `/events`.

It should flip to reconnecting within about 25 seconds, which is 2.5 missed heartbeats at an
`EVENT_HEARTBEAT_INTERVAL_MS` of 10 s, checked by a 5 s watchdog. Restart the backend and watch it
resync.

Now lower `EVENT_HEARTBEAT_INTERVAL_MS` to `2_000` in `packages/schemas/src/events.ts` and repeat.
The detection window shrinks with it, because `STALE_AFTER_MS` derives from the same constant.
Revert.

### Exercise 6.3: why re-read before broadcasting

In `events.service.ts`, change `create()` to broadcast the input it was given instead of the row it
read back. Create an event with a second window open.

Watch what arrives on the other client, and what the frontend does with an event that has no `id`.
Revert. Write down, in one sentence, the rule this demonstrates.

### Exercise 6.4: add a channel

Make the friends feature realtime. Follow the existing convention exactly:

1. A `friends.events.ts` with named `emit*` and `listen*` methods over `EventsService`, modelled on
   `users.events.ts`.
2. Emit from `friends.service.ts` on add, accept and remove.
3. A `@Subscription` in `friends.router.ts`, guarded, unlike the public one on events.
4. A subscription schema in `packages/schemas/src/friends.ts`, typed as
   `z.custom<AsyncIterable<...>>()`. Read the comment in `events.ts` about why the output type is the
   yielded item, not the entity.
5. A `use-friend-stream.ts` hook that patches the friends query cache.

### You should be able to answer

- Why can a client not tell an idle SSE stream from a dead one without heartbeats?
- Why does the presence router yield the client's own `online` event directly instead of relying on
  the broadcast?
- What would break if the backend ran as two replicas?

---

## Session 7: capstone, ship registrations

**Goal.** Build a real feature the way this repo builds features, with nothing scaffolded for you.

The `registrations` table exists. `events` has a foreign key from it. Both listing repositories
already compute `registrationsCount` from it. And `RegistrationsRouter` is an empty class:

```ts
@Router({ alias: 'registrations' })
export class RegistrationsRouter {}
```

Fill it in. Registering for an event is the one thing the product obviously cannot do yet.

### Scope

- `register(eventId)` creates a row, or reactivates a `canceled` one. It must reject when the event
  is at `maxCapacity`.
- `cancel(eventId)` sets `status` to `canceled` rather than deleting the row. Work out why the schema
  has a status enum instead of relying on row deletion.
- `getMyRegistrations()` returns the events the current user is attending.
- `isRegistered(eventId)`, or fold it into the event detail query. Decide, and justify it.
- Realtime: a registration changes `registrationsCount`, which changes the `popular` sort order. Work
  out what the client can patch and what it must refetch, following the reasoning in
  `use-event-stream.ts`.
- UI: a register and cancel button on `/events/$eventId`, and the user's registrations on
  `/my-events` or `/profile`.

### Constraints

The constraints are the exercise, not the feature.

- Follow the module shape: `registrations.module.ts`, `.router.ts`, `.service.ts`, and
  `repositories/` with the interface, the Drizzle implementation and the in-memory one.
- Schemas go in `packages/schemas/src/registrations.ts`, and the DTO crosses the wire, not the row
  type.
- Guard with `@UseMiddlewares(ProtectedMiddleware)`, not hand-rolled `ctx.user` checks.
- Authorisation logic, such as whether this user can cancel this registration, goes in the router,
  matching `assertCanManage`.
- Capacity checking is business logic. Decide whether it belongs in the service or the repository and
  be able to defend the choice. Then work out what happens when two users register at the same
  moment.
- Write specs. `vp run test:backend` must pass.
- `vp run check` must pass before you consider it done.

### Reviewing your own work

Ask, of your diff:

- Could someone swap the persistence to fixtures without touching the service? If not, Drizzle leaked
  into the service.
- Does any event-name string appear outside a `*.events.ts` file?
- Does the client re-derive anything the server already computed?
- Did you add a column without regenerating a migration?
- If you added a subscription, does every resource it opens get closed in a `finally`?

---

## After the path

By the end you will know the codebase better than the docs do. Two things to do with that:

- Fix the drift listed under [Gotchas](./ARCHITECTURE_TOUR.md#gotchas). `CLAUDE.md` is wrong about
  the route structure and about `users.createUser`.
- Keep both documents current. `docs/README.md` indexes every doc; update it when you add one.
