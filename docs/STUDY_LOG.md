# Study Log

Working file for eval 1. Rewritten 2026-09-20 after a terminology diagnostic scored 2/12: the
earlier plan (a 12-construct TypeScript primer, taught line by line) aimed at code-level fluency
that is not reachable in the time left and is not what this evaluation tests.

To resume in a fresh session: say "resume study". The agent reads this file and continues from
[Where we stopped](#where-we-stopped).

Companion docs: [Architecture Tour](./ARCHITECTURE_TOUR.md) for diagrams, [Subject](./SUBJECT.md)
for what the evaluator checks. `EVAL_PREP.md` is kept for its evaluator questions only — **its
compliance audit is stale** (see [Stale docs](#stale-docs)). `LEARNING_PATH.md` and `print-lessons/`
stay shelved.

## Format of the evaluation

Eval 1 is **Thursday 2026-09-24 at the earliest** (postponed from 2026-09-19; the project was not
ready). Each member is interrogated on **their own features**: talk through what it does and how it
was built. Milan (`mde-krui`) carries architecture and the harder cross-cutting parts. So the work
here is **spoken narration of my own areas**, not reading unfamiliar code.

## Goal

For each of my areas: say what it does, how it works, and why it was built that way — out loud,
without notes, and survive three follow-ups. Everything outside my areas needs one sentence only:
what it is and where it lives.

## My areas

From `README.md` §2 and confirmed against git.

| Area                          | Weight | Evidence                                                                                 |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| Real-time: events + heartbeat | High   | `events/events.service.ts`, `events.router.ts`, `hooks/use-event-stream.ts`              |
| Real-time: presence           | High   | `presence/presence.service.ts`, `hooks/use-presence.ts`                                  |
| Real-time: chat               | High   | `chat/chat.{events,router,module}.ts`, `hooks/use-chat-stream.ts`, `ChatWidget.tsx`      |
| Friends                       | Medium | `friends/*`, `packages/schemas/src/friends.ts`                                           |
| Avatar upload                 | Medium | profile route + `express.json({ limit })` in `main.ts`                                   |
| HTTPS / Caddy / Docker        | Low\*  | `caddy/Caddyfile`, `docker-compose.yml`, mkcert script (`00cd7b6`, `0a882d6`, `78d8c2d`) |
| Browser-compat test suite     | Low\*  | Playwright specs (`277640f`, `8ecce75`, `9c4d20e`)                                       |
| Responsive layout             | Low\*  | `3c8344c`, `6c0a46b`, `a0cb489`, `326e497`                                               |

\* Low **study** weight because these are already the strongest — not low likelihood of being asked.

Also mine and worth claiming: server-side validation hardening (`3ae6595`), auto migrate + seed on
`docker compose up` (`42ddc4d`), keeping the TLS key and auth secret out of the repo (`61b149d`).

## Protocol

Speaking-first. Every sitting, no exceptions:

1. **The agent asks the question an evaluator would ask.** One at a time.
2. **I answer first**, in full sentences, even if wrong. Typed out, not skimmed in my head.
3. **The agent corrects**, then gives a three-sentence model answer.
4. **I say it back in my own words.** This is the rep. Step 3 without step 4 does nothing.
5. **The accepted version goes in the [answer bank](#answer-bank)** in my words, not the agent's.
6. **Terms are defined before use.** If a word I do not have appears, I say "term" and the agent
   stops and defines it, with a C++ analogue where one exists.

## Schedule

15 hours. Today is Sunday 2026-09-20.

| When | h   | What                                                                                       | Done        |
| ---- | --- | ------------------------------------------------------------------------------------------ | ----------- |
| Sun  | 3   | Vocabulary (the 10 glossary terms) until they can be said cold. Prerequisite for the rest. | [x] partial |
| Mon  | 4   | Real-time: events + heartbeat, presence, chat. The big one.                                | [ ]         |
| Tue  | 4   | Friends, avatar upload, and one request traced end to end.                                 | [ ]         |
| Wed  | 4   | Infra + Playwright + responsive (1.5 h) → full mock (1.5 h) → patch the misses (1 h)       | [ ]         |

Monday is load-bearing: the real-time layer is the most mine and the hardest to explain. If it
overruns, chat compresses into Tuesday and the avatar drops to one sentence.

## Glossary

Established 2026-09-20. **Format: term — what it is · where in this repo · C++ analogue.**
Rewrite each in my own words before ticking.

| #   | Term               | Mine                                                                                | Done |
| --- | ------------------ | ----------------------------------------------------------------------------------- | ---- |
| 1   | tRPC               | call a server function; types generated; mismatch breaks the build, not the browser | [x]  |
| 2   | `ctx`              | cookie -> session lookup -> `ctx.user`; the router only reads it                    | [x]  |
| 3   | Zod                | runtime validator; types are erased so nothing else checks the client               | [x]  |
| 4   | TLS / cert         |                                                                                     | [ ]  |
| 5   | mkcert             |                                                                                     | [ ]  |
| 6   | Reverse proxy      |                                                                                     | [ ]  |
| 7   | DI                 |                                                                                     | [ ]  |
| 8   | Abstract repo      |                                                                                     | [ ]  |
| 9   | ORM / migration    |                                                                                     | [ ]  |
| 10  | Subscription / SSE | opened once, server pushes; heartbeat because silence is ambiguous                  | [x]  |

### Reference answers

**tRPC** — the browser calls a function that runs on the server as if it were local. Over REST it
buys: no URL, no hand-written JSON contract. The router definitions compile to
`packages/schemas/src/@generated/server.ts`; the frontend imports it, so renaming a server field
breaks the frontend build. _C++: a shared header, generated, crossing the network._

**`ctx`** — an object built fresh per request in `apps/backend/src/auth/auth.context.ts`, before any
router code runs. `create()` returns `{ req, res, session, user }`: it reads the cookie, asks Better
Auth whose session it is, and puts the answer in. **`ctx.user` is how a router knows who is
calling** — derived server-side from the cookie, never sent by the client.

**Zod** — a runtime validator. TypeScript types are **erased** at compile time, so nothing is left
at runtime to check untrusted JSON against; Zod is actual code that inspects the value, and it also
produces the TypeScript type, so the shape is written once. Here the shapes derive from the Drizzle
table definitions.

**TLS** — two jobs. (1) Encryption: everything above TCP is ciphertext. (2) Identity: the
certificate is a statement signed by a CA the browser already trusts, saying this key belongs to
this domain. Without (2), (1) is useless — a perfectly private conversation with an attacker.

**mkcert** — no real CA will sign a certificate for `localhost`, so mkcert installs its own CA into
the machine's trust store and signs with that. Works on my laptop and nowhere else. Let's Encrypt
does the same job in production, against a public CA.

**Reverse proxy** — one public entrance in front of several private services. `caddy/Caddyfile`:
`reverse_proxy /api/* backend:3001`, `reverse_proxy /* frontend:3000`. The browser only ever talks
to `https://localhost:3000`. Why: TLS terminates in one place instead of two, and the browser sees
a single origin, so there is no cross-origin problem to solve.

**Dependency injection** — a class lists what it needs as constructor parameters and never builds
them itself; NestJS reads those parameter types at startup, constructs everything in order, and
passes each in. I never write `new FriendsService(...)`. _C++: constructor injection with the wiring
generated._

**Abstract repository** — the repositories are `abstract class`es with two implementations
(Drizzle-backed and in-memory). Because the service depends on the abstraction, one line in
`app.module.ts` swaps which one is injected: that is what `dev:fixtures` does — the whole app runs
with no Docker and no database, and the services are testable without one. **Best "good design
decision" talking point.**

**ORM / migration** — Drizzle is the ORM: tables are declared in TypeScript
(`packages/schemas/src/database.ts`) and it writes the SQL. A migration is a versioned SQL file
recording one structural change, so every machine replays the same changes in the same order and
lands on the same schema. Without it, "what shape is the database" is folklore.

**Subscription / SSE** — a query is one request, one response, connection closed. A subscription
holds the connection open and the server pushes down it. Transport is **SSE** (Server-Sent Events):
an HTTP response that never ends. `root-provider.tsx` uses `splitLink` to send subscription calls to
`httpSubscriptionLink` and everything else to `httpBatchLink`. The browser reconnects on drop.
**Mine:** a dead stream and an idle stream look identical over SSE, so
`listenEventChangedWithHeartbeat()` in `events.service.ts` races the event stream against a timer and
yields `{ action: 'heartbeat' }` when the timer wins — proof of life.

## Answer bank

_One entry per area, in my words, ticked once said cold. Filled Mon–Wed._

### Known model answers

**Presence, two backend instances** — `presence.service.ts` is one `Map<userId, Set<connectionId>>`.
Two instances would each have their own Map, so a user online on A looks offline to anyone served by
B, and a restart wipes everyone offline. The `Set` is also the two-tabs answer: closing one tab
leaves the user online until the set empties.

### Sunday afternoon block — DI and the abstract repository

**Passed:** abstract repository, including the sharp question — _why an `abstract class` and not an
`interface`?_ Because **interfaces are erased**; an abstract class compiles to a real JS class, so
Nest has a runtime token to inject against. Same erasure fact that justifies Zod. Erasure is the
load-bearing fact of this whole stack.

**DI — partial.** Payoff and boundary land; the _mechanism_ keeps slipping. Four reps, each holding
a different two of the three parts.

- **Payoff:** two run modes, database-backed or in-memory. `DEV_FIXTURES=true` → no Postgres, no
  Docker.
- **Boundary (the strong part, most people cannot give it):** it is _not_ the whole app. Swappable
  via `.register({ persistence })`: `UsersModule`, `EventListingsModule`, `FriendsModule`,
  `HealthModule`, plus cache (Redis → in-memory) and the throttler. **Always database:**
  `EventsModule`, `RegistrationsModule` — so in fixtures mode I can browse events but not create one
  or register for one. Chat and presence do not participate: nothing to persist.
- **Mechanism (the gap):** `FriendsService`'s constructor asks for the abstract `FriendsRepository`
  and **never finds out** which implementation arrived. `FriendsModule.register()` maps the token
  with `{ provide: FriendsRepository, useClass: repository }`; only `app.module.ts` reads
  `DEV_FIXTURES`. The knowledge lives in one place and the feature code stays ignorant. **Hook: "the
  service never knows."** `DEV_FIXTURES` is the switch, not the mechanism — I reached for the env
  var three times running.

**Third method rule, from the pattern across tRPC, DI and friends:** I reliably retain beats 1–2
(mechanism) and drop beat 3 (the payoff) — the worst half to lose, since beat 3 is the only one the
evaluator cares about. **Fix: answer payoff first, then mechanism, then the boundary.** It is also
simply a better answer shape.

**Retention check, 1 h gap:** heartbeat, friends chain and Zod all survived. One slip worth noting:
said **SSL** when meaning **SSE**. SSL/TLS = encryption and certificates, Caddy's job. SSE =
Server-Sent Events, the subscription's transport. Unrelated, three shared letters. Also killed the
phrase "Zod recreates the types" — nothing recreates types at runtime; **Zod replaces types with
code that checks**.

## TypeScript for C++ programmers

The mental-model shifts. Read once, refer back when something feels wrong.

| C/C++ habit                                         | TypeScript reality                                                                                                                    |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Types are checked and then compiled into the binary | Types are checked and then **erased**. At runtime there are no types. `as any` and `z.custom<...>()` exist because of this.           |
| Header + implementation                             | One file. `export` marks what is visible; `import { x } from './file'` is the include. No forward declarations.                       |
| A type is its name (nominal)                        | A type is its **shape** (structural). `{ id: string }` is assignable to anything that needs an `id: string`, whatever it is called.   |
| Value vs pointer vs reference                       | Primitives (`string`, `number`, `boolean`) copy; everything else (objects, arrays, functions) is a reference. No `*`, no `&`.         |
| `NULL`                                              | Two of them: `null` (deliberate absence) and `undefined` (never set). `?.` and `??` exist to handle both.                             |
| Threads and mutexes                                 | One thread, an **event loop**. `await` yields to it. Nothing runs "at the same time"; things interleave at `await` points.            |
| `std::future`                                       | `Promise<T>`. `await p` blocks _this function only_ until it resolves; the loop keeps running other work.                             |
| Templates                                           | Generics: `listen<TPayload>(...)`. Same idea, no specialisation, no SFINAE.                                                           |
| Pure virtual class                                  | `abstract class` with `abstract` methods, or `interface`. This repo uses `abstract class` for repositories so NestJS can inject them. |
| Destructor / RAII                                   | No destructors. Cleanup goes in `finally` blocks. Every generator in this repo has one.                                               |
| Lambda with `[&]` capture                           | Every arrow function `(x) => ...` captures its enclosing scope by reference, forever. That is a **closure**.                          |
| `#define` / `const`                                 | `const` means the _binding_ cannot be reassigned; the object it points to can still change.                                           |
| `new`/`delete`                                      | Garbage collected. `new` exists for classes and `Promise`; there is no `delete` for memory.                                           |
| Function overloading                                | None. Optional params (`signal?: AbortSignal`) and default values (`intervalMs = 10_000`) instead.                                    |

## Stale docs

Do not revise from these rows; they describe a repo that no longer exists.

- `CLAUDE.md` still tells contributors to run `nix develop`. **Nix was removed** in `b3d90f3`.
- `docs/EVAL_PREP.md` compliance audit lists **HTTPS as a fail** — fixed by `0a882d6` and `78d8c2d`
  (the stack now serves `https://localhost:3000` through Caddy).
- Same audit lists **multi-language as a fail** (en + nl only) — Spanish is now a registered locale.
- `EVAL_PREP.md` session 2 reading list names `flake.nix` and `docs/DEVENVIRONMENT.md`; neither
  applies.

Both audit rows were fixed **by my own commits**, which makes them talking points rather than
liabilities.

## History

**Sitting 1 — 2026-09-16 (~45 min).** Plan revised, log created and pushed (`8f63a2f`), `glow`
installed. No constructs done.

**Sitting 2 — 2026-09-20 (~1 h).** Terminology diagnostic across five clusters: **2/12**. Partial
credit on TLS (had encryption + certificate-proves-identity), Drizzle ("transforms data into a form
useful to the database"), and the instinct behind DI (pointed at the wrong layer — described a
package manager). Blanks on tRPC, `ctx`, Zod, reverse proxy, abstract repositories, subscriptions,
presence. Conclusion: the TypeScript primer is the wrong target; pivot to concept-level for the
system plus block-level for my own areas. Eval confirmed postponed to Thursday 2026-09-24 at the
earliest. Reference answers for all ten terms written into the glossary above.

**Sitting 2, part 2 — 2026-09-20.** Drilled subscription/SSE, `ctx`, and the friends authorisation
chain. Result on subscription: passed (mechanism and the 10 s interval correct; the _why_ —
"silence is ambiguous" — had to be supplied). Result on `ctx` and friends: **three reps produced
three different fragments and never the whole structure** (rep 1 = signed cookie only; rep 2 = put
the DB check in the router, twice; rep 3 = a blurry ownership check with layers 1 and 2 gone).

**Finding that changes the method:** reading a well-written model answer does not convert into a
spoken one. Fragments stick, structure does not. **Fix: memorise an ordered skeleton of beats
first, improvise the sentences around it.** Prose-reproduction reps are abandoned.

## Where we stopped

_Rewritten at the end of every sitting: file, line, concept, next step._

2026-09-20, sitting 2. **Passed: term 10 (subscription / SSE), term 2 (`ctx`), and the friends
authorisation chain** — the last one only after switching from prose reps to beat skeletons (three
prose reps failed, the first skeleton rep passed). Accepted answer for friends, in my words: "I
cannot fake ctx data, and if the request is not made to my id there is no way to accept it."

**Two method rules, earned tonight and non-negotiable from here:**

1. **Beats before prose.** Memorise the ordered skeleton, improvise the sentences around it.
2. **Every answer needs a contrast.** "`ctx` has my id" is inert; "`ctx` has my id _and the input
   does not_" is an argument. Name the thing it is not.

Skeletons established so far, to be recited before any prose:

- **Subscription:** opened once → server pushes → silence is ambiguous → heartbeat 10 s → watchdog
  stale at 25 s (2.5x) → reset + refetch.
- **`ctx`:** cookie → session lookup → `ctx.user`. The router only _reads_ the third one.
- **"Can I accept someone else's friend request?":** 1. COOKIE signed · 2. MIDDLEWARE
  (`ProtectedMiddleware`) · 3. **`ctx`, NOT INPUT** — client sends only `friendId`, `myId` comes
  from `ctx.user.id`, and the WHERE only matches a row where I am the recipient. Layers 1-2 are
  _authentication_, layer 3 is _authorisation_.

**Sunday finished: 5 passed** — subscription/SSE, `ctx`, the friends authorisation chain, tRPC,
Zod. All four load-bearing terms for Monday are done. Skeletons for tRPC and Zod:

- **tRPC:** 1. call a server function · 2. types are generated · 3. **a mismatch breaks the build,
  not the browser** (REST finds out at runtime, in production; tRPC at compile time, on my machine).
- **Zod:** 1. runtime validator · 2. **types are erased** — at runtime there is nothing left to
  check against · 3. one shape, two jobs (validates _and_ types; derived from the Drizzle tables).
  Contrast: tRPC protects me from my own team renaming a field; Zod protects me from a hostile
  client. Types cannot stop an attacker — the attacker is not running my build.

Still untaught, and deliberately deferred: TLS/cert, mkcert, reverse proxy (Wednesday, with infra —
already my strongest area), DI, abstract repository, ORM/migration (fold into Mon/Tue as they come
up).

Next, Monday: **cold retention check first** — friends chain, heartbeat, Zod, and above all **DI's
mechanism** ("the service never knows"), which was left deliberately undrilled on Sunday in favour of
spacing. If it is still missing, it needs a different approach, not another rep. Then the real-time
session: events + heartbeat, presence, chat.

Remaining untaught: ORM/migration, TLS/cert, mkcert, reverse proxy (the last three on Wednesday with
infra).
