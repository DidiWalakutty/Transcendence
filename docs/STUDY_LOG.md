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

| When | h   | What                                                                                       | Done          |
| ---- | --- | ------------------------------------------------------------------------------------------ | ------------- |
| Sun  | 3   | Vocabulary (the 10 glossary terms) until they can be said cold. Prerequisite for the rest. | [x]           |
| Mon  | 4   | Real-time: events + heartbeat, presence, chat. The big one.                                | [x] chat left |
| Tue  | 4   | Friends, avatar upload, and one request traced end to end.                                 | [ ]           |
| Wed  | 4   | Infra + Playwright + responsive (1.5 h) → full mock (1.5 h) → patch the misses (1 h)       | [ ]           |

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
| 7   | DI                 | three places, decreasing knowledge; the service never knows which one arrived       | [x]  |
| 8   | Abstract repo      | abstract class not interface — interfaces are erased, Nest needs a runtime token    | [x]  |
| 9   | ORM / migration    | tables in TypeScript, Drizzle writes the SQL; a migration is one versioned change   | [x]  |
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

### Monday real-time block — 2026-09-21

**The seven-beat event chain (A creates, B updates), taught and recited:** mutation → write then
read back → emit → B already listening → yield → `onData` splits create from update/delete →
re-render.

**Invalidate vs patch — passed after two label slips.** Create refetches because the **server owns
the sort** (upcoming by date, newest, most popular by registration count) and `EventDto` carries no
count, so the client cannot compute the slot. Update/delete are patched in place because neither can
move a row under any of those sorts. Line: **"the message says _when_ to ask, the server decides
what the list looks like."**

**Read-back — passed after assembling three pieces.** The input lacks id, defaults and normalised
date → broadcasting it would make the stream disagree with a refetch → **"the input is a request,
not a record."** Wrong first answer was a concurrency story ("someone else may have changed the
row"); nobody else has the id yet.

**Presence — passed, including both limits.** Online is **a side effect of an open SSE stream**, not
a column: `presence.router.ts:35` calls `connect()` on open, line 52 calls `disconnect()` in a
**`finally`** (the RAII analogue). `Map<userId, Set<connectionId>>` — the `Set` is why closing one
of two tabs leaves the dot green; a boolean or a single id would flip it offline.

Two limits, own them rather than paper over them:

- **Hard power loss is not detected.** No FIN, no RST, and nothing writes to the presence socket to
  fail against (presence has **no heartbeat** — that belongs to the events stream). The entry sits
  in the Map until TCP keepalive gives up; Caddy sets no timeout either.
- **Single instance only** — the Map is process memory.
- **One fix covers both:** presence in Redis with a TTL refreshed by a client heartbeat.

**Correction worth keeping: do not fuse the two mechanisms.** The 25 s watchdog is client-side and
governs the _events_ stream only. Answering "the dot goes out in 25 seconds" invents a timeout that
does not exist in the code, and the next question is "show me where."

### Layering vocabulary — 2026-09-21

Asked for, taught, not yet drilled. Each layer answers one question: **router** = what arrived and
who is asking (`ctx`, Zod, middleware — the only layer that knows a network exists); **service** =
what should happen (no HTTP, no SQL — the layer that would survive a rewrite as a CLI);
**repository** = how it is stored (the only place Drizzle appears); **module** = who gets what (the
assembly manifest, no runtime logic). **Placement rule: mentions `ctx` → router; mentions a table →
repository; neither → service.**

**"Events" means three things in this repo** — say which one or the evaluator loses the thread:

1. the **feature** (`events` table, listings users create), 2. the **subscription bus**
   (`EventsService.emit/listen`, `EventEmitter2`, pushes to browsers over SSE), 3. **app events**
   (`app-events.ts`, Node's `process.emit`, server-side side effects — `notification.listener.ts`).

Why two buses: bus 2 is injected, so only Nest-managed classes reach it. `auth/auth.instance.ts` is
Better Auth's own config object, built outside Nest's container — **not a provider, so there is
nothing to inject into it** — hence `process.emit`. Same DI idea from the other side.

### Monday retention check — 2026-09-21

Cold, no notes, 24 h gap. **4 of 4 recovered**, but two needed a format change to come out.

**Friends chain — passed on the second route.** Two "describe the defence" reps gave one beat each
and reintroduced the word _mismatch_. Switching to **"walk the attack"** produced all four steps
immediately. Correction that stuck: **nothing is compared.** `addFriendSchema` carries only
`friendId` — there is no "my id" field in the payload to swap, so the evaluator's premise is false.
The `UPDATE`'s `WHERE` is built from `ctx.user.id` (`drizzle-friends.repository.ts:62`), the row
`myId=bob AND friendId=alice` was never written, zero rows change, `orNotFound`.

**Heartbeat — passed.** Two fixes: the arrow points **server → client** (it tells the _browser_ the
stream is alive, not the server that the client is), and the answer has to end at the **watchdog**,
not at "proof of life". Follow-up ammo held back: why 2.5 and not 1 (one late tick must not kill a
healthy stream) and that `EVENT_HEARTBEAT_INTERVAL_MS` / `..._STALE_MULTIPLIER` live in
`packages/schemas/src/events.ts`, so client and server cannot drift.

**Zod — the real misconception, now found.** Asked how an attacker defeats browser-side validation,
I answered **"you cannot."** That belief is why the server-side answer never had a reason attached.
**Client-side validation is not bypassed, it is skipped** — `curl` straight at the endpoint, no
React, no form, no `onSubmit`. General law to keep: **anything that runs on the client is a
suggestion.** Also, second slip of the same phrase: Zod types do **not** "survive at runtime".
Nothing about a type survives; a schema is a runtime object with `.parse()`. Zod replaces types with
code that checks.

**DI mechanism — landed, fifth attempt, cold, without reaching for `DEV_FIXTURES`.** The opening
trap ("where in `FriendsService` decides?") answered correctly: _there is no code there that
decides._ New hook that made the mechanism stick — **three places, knowledge decreasing:**

1. `app.module.ts:80` reads `DEV_FIXTURES`. Knows the environment, knows nothing about SQL.
2. `friends.module.ts` `register(options)` is **told** which persistence and maps the token:
   `{ provide: FriendsRepository, useClass: repository }`. Does not know why.
3. `friends.service.ts` asks its constructor for the abstract `FriendsRepository` — **and never
   finds out which one arrived.**

Step 2 only works because the token is an `abstract class`, not an `interface`: interfaces are
erased. Erasure now carries three separate answers (Zod, abstract repo, DI) — say that out loud and
it reads as one system instead of three facts.

**Method rule 4, earned today:** when a beat will not come out as a description, ask for the
**attack trace** instead — "you are the attacker, defeat this." Knowledge that is present but
unspeakable in one format comes out immediately in the other.

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

**2026-09-21, Monday (sitting 3).** Retention check 4/4 after 24 h, then the real-time block.
Details in the [answer bank](#answer-bank): Monday retention check, Monday real-time block, layering
vocabulary.

**Passed today:** friends chain (via attack trace), heartbeat + watchdog, Zod's trust boundary, the
DI mechanism (fifth attempt, cold), the seven-beat event chain, invalidate-vs-patch, read-back,
presence including both its limits.

**Three method rules confirmed or added:**

4. **When a beat will not come out as a description, ask for the attack trace** — "you are the
   attacker, defeat this." Twice today knowledge that was unspeakable in one format came out
   immediately in the other.
5. **Never invent a mechanism that is not in the code.** Two near-misses: a 25 s presence timeout
   (that watchdog is client-side and belongs to events) and a heartbeat on the presence stream
   (there is none). An invented detail invites "show me where," and there is no where.
6. **Own the limitation.** Presence's hard-disconnect blindness and single-instance ceiling are
   stronger answers than a tidy evasion, because the fix — Redis with a TTL — covers both.

**The failure mode to watch: paired nouns swap under load.** Four times today — `create`/`update`,
`db`/`list`, `input`/`output`, and earlier `SSL`/`SSE`. The concept was right every time; the label
was wrong. The evaluator cannot see the concept. **Slow down on the one word when reaching for a
paired term.** Cheapest available fix.

**Still open, in priority order:**

1. **Chat** — the only High-weight area untouched. Do it first tomorrow.
2. Tuesday as scheduled: friends (done — retest cold only), avatar upload, one request traced end to
   end.
3. Wednesday: TLS/cert, mkcert, reverse proxy (terms 4-6, still untaught), infra, Playwright,
   responsive, then the full mock.

**Open cold-check list for tomorrow:** the seven-beat chain, invalidate-vs-patch, presence's two
limits, and the DI mechanism again (it landed once — once is not retention).

**Doc bug spotted, not yet fixed:** `CLAUDE.md` claims `ProtectedMiddleware` "isn't applied anywhere
yet". It is applied throughout `friends.router.ts` and on the event mutations. Add to
[Stale docs](#stale-docs) or fix the file.
