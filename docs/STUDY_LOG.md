# Study Log

Working file for eval 1 (Saturday 2026-09-19). Revised on 2026-09-16 after three days on the
original plan produced two files' worth of understanding. Root cause: zero TypeScript on a C/C++
base, and a study method (solo skimming, whole-file AI explanations) that does not work without the
language. The fix is a TS primer built from this repo's own lines, then pair-tracing under the
protocol below.

To resume in a fresh session: say "resume study". The agent reads this file and continues from
[Where we stopped](#where-we-stopped).

Companion docs: [Eval Prep](./EVAL_PREP.md) for reading lists and evaluator questions,
[Architecture Tour](./ARCHITECTURE_TOUR.md) for diagrams. `LEARNING_PATH.md` and `print-lessons/`
are shelved until after eval 1.

## Goal

Explain and defend my parts under questioning: realtime events (incl. realtime-events-to-main),
presence, friends, profile, avatar, infra. Ship a basic chat so the User Interaction module
(subject: "basic chat, profile views, friends list") is complete. Architecture-level only for auth,
SSR, i18n, CI.

## Protocol

Every sitting, no exceptions:

1. **≤10 lines at a time.** The agent pastes the block with line numbers. Nothing more until it is
   done.
2. **I narrate first.** "I think this does X", even if wrong. Then the agent corrects.
3. **Terms defined before use**, with a C++ analogue where one exists. If a word I do not have
   appears, I say "term" and the agent stops and defines it.
4. **Every construct ends with "why this and not Y".** Not finished until the alternative is named
   and rejected.
5. **I write the glossary line**, one sentence, the agent corrects it. Narration is typed.

## Schedule

| When   | h   | What                                                                                                 | Done |
| ------ | --- | ---------------------------------------------------------------------------------------------------- | ---- |
| Wed    | 3   | Cheat sheet → primer constructs 1–8 on lines from `events.service.ts`, `friends.*`                   | [ ]  |
| Thu AM | 4   | Primer 9–12 → `events.service.ts` `emit`/`listen`/heartbeat → `use-event-stream.ts`                  | [ ]  |
| Thu PM | 4   | Build chat (scope below), branch `feature/chat` off `main`, PR Thursday night                        | [ ]  |
| Fri AM | 4   | Presence → friends → infra refresh (45 min) → profile/avatar (1 h)                                   | [ ]  |
| Fri PM | 4   | Architecture pass (auth, SSR, i18n, CI, 1.5 h) → answer bank → mock 17:00–18:00 → patch → stop 20:00 | [ ]  |

Thursday is the load-bearing day. If the primer runs past noon, chat stays at global-room scope
and presence/friends compress into Friday morning. The mock is not skippable.

### Chat scope

Ephemeral global room, no table, no migration. Subject asks for _basic_ chat; persistent history is
the separate advanced minor.

- `apps/backend/src/chat/chat.events.ts`: `emitMessage` / `listenMessages` over `EventsService`,
  same shape as `users.events.ts`.
- `chat.router.ts`: `send` mutation guarded with `ProtectedMiddleware`, `@Subscription` guarded too.
- `packages/schemas/src/chat.ts`: `chatMessageSchema` `{ from, fromName, text, at }`, send input,
  subscription output typed as `z.custom<AsyncIterable<...>>()` (see comment in `events.ts`).
- `apps/frontend/src/hooks/use-chat-stream.ts`, modelled on `use-event-stream.ts`.
- `apps/frontend/src/components/chat/ChatWidget.tsx`: bottom-right box, open/minimise, list + input.
- Exactly one line in `__root.tsx`: `<ChatWidget />`, rendered only when a session exists.

Open item: confirm with the team that chat lands Thursday night for Friday review, and who reviews.

## Where we stopped

_Rewritten at the end of every sitting: file, line, concept, next step._

2026-09-16, sitting 1: log created. Next: cheat sheet, then construct 1 (`const`, arrow functions,
closures) on `events.service.ts:142-153`.

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

## Primer constructs

Each is taught on the anchor line, then written up in the glossary by me. Tick when the glossary
line is accepted.

| #   | Construct                                                     | Anchor                                                  | Done |
| --- | ------------------------------------------------------------- | ------------------------------------------------------- | ---- |
| 1   | `const`, arrow functions, closures                            | `events.service.ts:138-153` (`resume`, `onEvent`)       | [ ]  |
| 2   | Destructuring, spread, object literals, shorthand             | `events.service.ts:77` (`{ action, event }`)            | [ ]  |
| 3   | `?.`, `??`, `!`, union types, `undefined` vs `null`           | `events.service.ts:145,178`; `friends.repository.ts:45` | [ ]  |
| 4   | `interface` vs `type`, structural typing, `type` imports      | `events.service.ts:8-10`; `friends.router.ts:66`        | [ ]  |
| 5   | Generics                                                      | `events.service.ts:128,133`                             | [ ]  |
| 6   | Classes, `abstract`, constructor DI, `private readonly`       | `friends.service.ts:5-7`; `friends.repository.ts`       | [ ]  |
| 7   | `Promise`, `async`/`await`, `Promise.race`                    | `events.service.ts:32-41,98-102`                        | [ ]  |
| 8   | `try`/`finally` as cleanup, `throw`                           | `events.service.ts:163-185`                             | [ ]  |
| 9   | `function*`, `yield`, `async function*`, `for await`          | `events.service.ts:88-125`                              | [ ]  |
| 10  | Decorators: `@Injectable`, `@Router`, `@Query`, `@Ctx`        | `friends.router.ts:61-66`                               | [ ]  |
| 11  | Zod schemas as runtime validators _and_ types                 | `packages/schemas/src/friends.ts`                       | [ ]  |
| 12  | React hooks as black boxes: `useEffect`, `useRef`, `useQuery` | `use-event-stream.ts`                                   | [ ]  |

## Glossary

_One line each, in my words, corrected by the agent. Format: **term** — what it is · repo line ·
C++ analogue._

## Answer bank

_Evaluator questions from `EVAL_PREP.md` sessions 1–2, answered in my words on Friday. Marked
✅/❌ after the mock, ❌ items patched before 20:00._
