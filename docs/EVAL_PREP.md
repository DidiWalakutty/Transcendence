# Evaluation Prep

A 15-hour plan to be ready to explain this repository at the 42 peer evaluation. It is built for
one person's gaps, but 80 % of it is repo facts every team member needs. Replace the
[Your gaps](#your-gaps) section with your own and keep the rest.

Companion docs: [Learning Path](./LEARNING_PATH.md) for exercises, [Architecture Tour](./ARCHITECTURE_TOUR.md)
for diagrams, [Subject](./SUBJECT.md) for what the evaluator is checking, and the root
[`CONTEXT.md`](../CONTEXT.md) for the vocabulary (say "Registration", "Ticket", "Attendee" the way
it defines them).

The evaluation tests **explaining under questioning**, not building. Every session below is a
tracing drill: you are given a user action, you narrate the path through the code file by file,
then you check yourself against the source. Reading is preparation; narrating out loud is the work.

## Target

| Level        | Means                                                                        | Areas                                                                               |
| ------------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Code-level   | Open any file in it and narrate what each block does and why it is there.    | Your own parts (see [Your gaps](#your-gaps)).                                       |
| Narration    | Trace a request or a schema end to end from memory, naming files or folders. | `main.ts`, auth config, one request (register), one schema (event), tooling, Redis. |
| Architecture | Say what it is, where it lives, and what it talks to. Not line by line.      | SSR, i18n, CI and hooks, notifications, admin.                                      |

## Schedule

**Superseded for eval 1.** The live schedule is in [`STUDY_LOG.md`](./STUDY_LOG.md): a TS primer
first, then pair-tracing of my parts, one mock on Friday. The sessions below remain the source for
reading lists, drills and evaluator questions; the study log references them by number rather than
copying them.

Original plan: six sittings of 2–3 hours plus spare. Each has a reading list, a drill, and the
questions an evaluator would ask. Mocks are short (20 min) and happen in three places so drift is
caught early.

### Session 1 (2.5 h): your parts I — realtime, presence, friends

**Read.** `apps/backend/src/events/events.router.ts` (the subscription procedure),
`apps/backend/src/events/events.service.ts` (where `emit()` happens),
`apps/frontend/src/hooks/use-event-stream.ts`, `apps/backend/src/presence/*`,
`apps/backend/src/friends/*`, `packages/schemas/src/presence.ts`, `packages/schemas/src/friends.ts`.

**Drill.** Organizer edits an event title. Narrate: mutation → service → `emit()` → subscription
→ client hook → TanStack Query cache → repainted list. Then: the backend goes down mid-session.
What does the user see, and which file decides that?

**Evaluator questions.**

- What transport does the subscription use, and what happens on reconnect?
- Presence is in-memory (`presence.service.ts`). What breaks with two backend instances?
- A user has two tabs open and closes one. Are they still online? Which method decides?
- Friend request: which table, which status enum, who can accept?

### Session 2 (2.5 h): your parts II — profile, avatar, infra; Mock 1

**Read.** Profile route and avatar components, `docker-compose.yml`, `caddy/Caddyfile`,
`flake.nix`, `docs/DEVENVIRONMENT.md`. Infra gets 30 min: you already know it.

**Drill.** User uploads an avatar. Where is the image encoded, what size limit applies, and where
does that limit live on the backend (`main.ts`, `express.json({ limit })`)?

**Evaluator questions.**

- Why is the body limit 2 MB and why is it set in `main.ts` rather than in a router?
- Which host ports does Compose expose, and which of them should an evaluator be using?
- What does Caddy proxy where, and what does mkcert give you that Let's Encrypt would give in prod?

**Mock 1 (20 min).** Sessions 1–2 material, open-book.

### Session 3 (2.5 h): backbone I — `main.ts`, auth, one request end to end

**Read.** `apps/backend/src/main.ts`, `apps/backend/src/app.module.ts`,
`apps/backend/src/auth/auth.instance.ts`, `auth/protected.middleware.ts`, `auth/auth.context.ts`,
`apps/backend/src/registrations/*` (router, service, both repositories),
`packages/schemas/src/registrations.ts`, `packages/schemas/src/database.ts` (the `registrations`
table and its partial unique index).

**Drill.** Logged-in user clicks Register. Narrate all seven layers:

1. Button `useMutation` (frontend component)
2. tRPC client, batched HTTP POST with `credentials: 'include'` (`root-provider.tsx`)
3. `registrations.router.ts`: `@Input(createRegistrationSchema)` validates; protected middleware
   puts `userId` in context
4. `RegistrationsService.register` maps repository results to tRPC errors
5. `DrizzleRegistrationsRepository.register`: transaction, `FOR UPDATE`, count, insert
6. Postgres: partial unique index `registrations_event_user_active_idx`
7. Back up the stack: mutation cache toast, query invalidation

**Break it.** In `main.ts`, move `express.json()` above the Better Auth handler and try to log in.
Then move `enableCors` below it and try from the browser. Revert both. In the repository, delete
`.for('update')` and register twice concurrently for the last ticket.

**Evaluator questions.**

- Why is `bodyParser: false` passed to `NestFactory.create`?
- Where is the password hashed and by what? (Better Auth `emailAndPassword`, scrypt by default;
  there is no custom hash in this repo.)
- How does a router know who the caller is?
- Two users click Register on the last ticket at the same instant. Walk through both transactions.
- Why keep canceled registrations instead of deleting the row?

### Session 4 (2.5 h): backbone II — one schema end to end, tooling, Redis; Mock 2

**Read.** `packages/schemas/src/database.ts` (events table), `packages/schemas/src/events.ts`,
`docs/VALIDATION.md`, `apps/backend/src/events/events.router.ts`, `apps/frontend/src/routes/create-event.tsx`,
`vite.config.ts` (`run.tasks`), `docs/TOOLING.md`, `app.module.ts` (`CacheModule`, `ThrottlerModule`).

**Drill.** Add a field `venue` to Event. Name, in order, every file that must change and every
file that regenerates itself. Then say which command does the regeneration and when it runs.

**Break it.** Stop Redis (`docker compose stop redis`) and use the app. Find which requests fail
and why (throttler storage), and which merely lose caching.

**Evaluator questions.**

- One schema definition reaches how many places? Name them.
- What does `vp run check` do, and why does it run codegen first?
- What is in Redis? What is not in Redis that an evaluator might assume is?
- What does `dev:fixtures` swap out, and why can it not create an event?

**Mock 2 (20 min).** Sessions 3–4 material, open-book.

### Session 5 (2 h): architecture-only — SSR, i18n, CI, notifications; audit read-through

**Read.** `apps/frontend/src/routes/__root.tsx`, `apps/frontend/src/lib/auth-session.functions.ts`,
`root-provider.tsx` (`getRequestHeader('cookie')`), `docs/I18N.md`, `apps/frontend/project.inlang/settings.json`,
`.github/workflows/ci.yml`, `docs/COMMIT_HOOKS.md`, `apps/backend/src/notification/*`.

**Evaluator questions.**

- During SSR the frontend server calls the backend. How does the backend know the user?
- Which locales are registered, and where does a message key become a function?
- What runs on every commit, and what runs in CI that does not run on commit?
- Where would an email go in production, and where does it go locally?

**Audit read-through (30 min).** Read the [Compliance audit](#compliance-audit) below and, for each
row, open the file it names so you can point at it when asked.

### Session 6 (1.5 h): Mock 3 and patching

Final mock, 42-style: architecture questions closed-book, file questions open-book, three follow-ups
per question. Spend the rest on whatever it exposed.

### Spare (~1.5 h)

README sections 6 and 7 if the team has not updated them yet (see the audit).

## Your gaps

Diagnostic taken on 2026-09-13. Self-ratings 0–4 (0 never looked, 4 can explain and defend):

| Area                                   | Rating | Session |
| -------------------------------------- | ------ | ------- |
| Bun / Vite+ task graph                 | 2      | 4       |
| Compose, Caddy, HTTPS, nix             | 3      | 2       |
| Drizzle, migrations, shared schemas    | 2      | 4       |
| NestJS modules, DI, `main.ts`          | 1      | 3       |
| tRPC via nestjs-trpc                   | 1      | 3       |
| Better Auth                            | 0      | 3       |
| TanStack Start SSR                     | 0      | 5       |
| TanStack Query / Form                  | 1      | 3, 4    |
| Realtime, presence, Redis              | 2      | 1, 4    |
| Events, listings, registrations domain | 1      | 3       |
| i18n                                   | 0      | 5       |
| CI, hooks, tests                       | 2      | 5       |

Diagnostic misses that shaped the plan: could name 3 of 7 layers of a request; did not know the
`main.ts` ordering rules; did not know SSR forwards the cookie; did not know Redis also backs the
throttler; knew "there is a check" for overbooking but not `FOR UPDATE` or the partial unique index.

## Compliance audit

Checked against the repository on 2026-09-13 (branch `docs-onboarding`). Instant-fail items from
[Subject §3](./SUBJECT.md) first, then claimed modules.

| Requirement                             | Status       | Evidence / what to fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend + backend + database           | ✅ Pass      | `apps/frontend`, `apps/backend`, `postgres` service in `docker-compose.yml`.                                                                                                                                                                                                                                                                                                                                                                                                             |
| Single-command launch                   | ✅ Pass      | `bun deploy` → `vp run repo:deploy` → `docker compose up --build` (`package.json:13`). Needs mkcert certs in `caddy/certs` first; say so.                                                                                                                                                                                                                                                                                                                                                |
| Multi-user without data corruption      | ✅ Pass      | `drizzle-registrations.repository.ts:69` transaction + `FOR UPDATE`; partial unique index `database.ts:134`.                                                                                                                                                                                                                                                                                                                                                                             |
| HTTPS on browser → backend              | ❌ **Fail**  | Caddy serves `https://localhost` and proxies `/api/*` to the backend, but Compose sets `VITE_API_URL=http://localhost:3001` and `BETTER_AUTH_URL=http://localhost:3001`, and `root-provider.tsx:19` uses that URL for browser tRPC calls. The browser talks HTTP straight to port 3001, and `CORS_ORIGINS` defaults to `http://localhost:3000`. Fix: point `VITE_API_URL`/`BETTER_AUTH_URL` at `https://localhost`, add it to `CORS_ORIGINS`, and stop publishing 3000/3001 on the host. |
| Hashed and salted passwords             | ✅ Pass      | Better Auth `emailAndPassword` (`auth.instance.ts:51`); default scrypt with per-user salt. No custom hashing in the repo.                                                                                                                                                                                                                                                                                                                                                                |
| Validation on both sides                | ✅ Pass      | Backend: 18 `@Input(zodSchema)` decorators across routers. Frontend: TanStack Form `validators` in `LoginForm`, `CreateAccountForm`, `ResetPasswordForm`, `ForgotPasswordForm`, event form. Same schemas from `packages/schemas`.                                                                                                                                                                                                                                                        |
| `.env` ignored, `.env.example` present  | ✅ Pass      | `.gitignore:6`, `.env.example` (625 B). **README line 181 still says it is missing** — stale.                                                                                                                                                                                                                                                                                                                                                                                            |
| Privacy Policy and Terms of Service     | ✅ Pass      | `routes/privacy-policy.tsx` (88 lines), `routes/terms-of-service.tsx` (101 lines), linked from `Footer.tsx:132-139`. No placeholder text found.                                                                                                                                                                                                                                                                                                                                          |
| Responsive layout with a CSS framework  | ✅ Pass      | Tailwind; 23 component files use `sm:`/`md:`/`lg:` breakpoints. Check the events list and profile on a phone width before the evaluation.                                                                                                                                                                                                                                                                                                                                                |
| Clear DB schema with relations          | ✅ Pass      | `packages/schemas/src/database.ts`: FKs with `onDelete: 'cascade'`, enums for friendship and registration status, unique indexes.                                                                                                                                                                                                                                                                                                                                                        |
| Zero console errors in Chrome           | ⚠️ Manual    | Cannot be checked statically. Open every route with DevTools and record the result. Commit `eda7b3f` fixed one Base UI error; assume others exist until checked.                                                                                                                                                                                                                                                                                                                         |
| Balanced commit history                 | ⚠️ Check     | Author counts: diwalaku 153, Milan 83, Corin 46, rtorrent 14, Daria 5. Two members are thin; the evaluator may ask about it.                                                                                                                                                                                                                                                                                                                                                             |
| README: roles, tools, features, modules | ❌ **Stale** | Roles and tools are there (`README.md:15-36`). §6 features table is `[INSERT ...]`; §7 says every module is "Not yet implemented"; line 181 claims no `.env.example`. Rewrite before the evaluation.                                                                                                                                                                                                                                                                                     |

Claimed modules (README §7, 15 points) against the code:

| Module                                   | Pts | Status                                                                                                                                 |
| ---------------------------------------- | --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Full framework (NestJS + React/TanStack) | 2   | ✅ Implemented.                                                                                                                        |
| ORM (Drizzle)                            | 1   | ✅ Implemented.                                                                                                                        |
| Notification system across CRUD          | 1   | ⚠️ `notification/` module and mutation-cache toasts exist; verify every CRUD path fires one.                                           |
| Advanced search (filter, sort, paginate) | 1   | ⚠️ Sorting exists (`EventSortDto`); check filtering and pagination before claiming.                                                    |
| Multi-language (3 languages)             | 1   | ❌ `project.inlang/settings.json` registers `["en", "nl"]` only. `messages/es.json` exists (238 lines) but is not a registered locale. |
| Extended multi-browser support           | 1   | ⚠️ Nothing in the repo proves it; needs a manual test matrix.                                                                          |
| WCAG 2.1 AA                              | 2   | ⚠️ Not verifiable statically; run an audit (Lighthouse/axe) and keep the report.                                                       |
| Standard user management + auth          | 2   | ✅ Better Auth with `username` plugin, profile, avatar.                                                                                |
| OAuth 2.0 remote auth                    | 1   | ❌ No `socialProviders` in `auth.instance.ts`. Not implemented.                                                                        |
| 2FA                                      | 1   | ✅ `twoFactor` plugin, `twoFactors` table, `verify-2fa.tsx` route.                                                                     |
| Advanced permissions / roles             | 2   | ⚠️ `admin` plugin, `admin.middleware.ts`, `AdminDashboard.tsx` exist; check what a non-admin can and cannot do.                        |

Honest count today: 7 points solid, 6 points to verify, 2 points missing. Two hard blockers for
the mandatory part: the HTTPS bypass and the stale README.
