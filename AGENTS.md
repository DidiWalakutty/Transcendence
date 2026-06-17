# AGENTS.md

## Primary Directive

This repository is a 42 `ft_transcendence` project. AI assistants may help with
documentation maintenance only. Do not write, refactor, generate, format, or
delete application code in any way.

The 42 subject allows AI assistance for repetitive work, but the team must fully
understand, test, and be able to explain anything produced with AI. Because of
that rule, agents in this repository must keep their output traceable to the
current codebase and existing documentation. Do not invent implemented features,
modules, commands, architecture, team responsibilities, or evaluation claims.

## Allowed Work

Agents may:

- Read any repository file to understand the current implementation.
- Explain how the current codebase works, including architecture, control flow,
  APIs, data models, tooling, and framework usage.
- Help team members learn from the current code by answering questions,
  walking through files, and pointing to relevant implementation examples.
- Provide tutorials, examples, pseudocode, command explanations, or learning
  notes in conversation or documentation, as long as they are clearly guidance
  and do not modify repository code.
- Update documentation so it accurately describes the current codebase.
- Fix documentation spelling, structure, links, tables, and outdated prose.
- Add documentation files when they describe existing behavior or required
  evaluation material.
- Summarize implementation details discovered from source files, without
  changing those source files.

Documentation files include:

- `AGENTS.md`
- `README.md`
- `docs/**/*.md`
- Documentation-only diagrams or assets under `docs/`, when they do not require
  code generation or application behavior changes.

## Forbidden Work

Agents must not modify any non-documentation file. This includes, but is not
limited to:

- Application source code in `apps/**/src/**` or `packages/**/src/**`.
- Tests, specs, fixtures, generated routers, schemas, migrations, or seed data.
- Configuration files such as `package.json`, `tsconfig.json`, `vite.config.ts`,
  `docker-compose.yml`, Drizzle config, Nest config, TanStack config, or Vite+
  config.
- Lockfiles such as `bun.lock`.
- Environment files, secrets, `.env*`, certificates, or credential material.
- GitHub workflow files, hooks, editor settings, or devcontainer settings.
- Generated files, build output, caches, or dependency directories.

Do not run commands that write to non-documentation files. Avoid formatters,
generators, package manager installs, migration tools, codegen, or autofix
commands.

If a requested task requires code, configuration, dependency, migration, test,
or generated-file changes, stop and explain that this repository's agent policy
allows documentation changes only.

## Current Codebase Facts

Use these facts as the starting point for documentation, then verify against the
repository before editing:

- Package manager/runtime: Bun.
- Monorepo orchestration: Vite+.
- Frontend: React with TanStack Start, TanStack Router, TanStack Query, Tailwind
  CSS, and Inlang Paraglide messages.
- Backend: NestJS with tRPC integration.
- Database layer: PostgreSQL with Drizzle ORM migrations and shared schemas.
- Infrastructure: Docker Compose is present for local services.
- Shared packages live under `packages/`; apps live under `apps/frontend` and
  `apps/backend`.

If source files and documentation disagree, treat source files as the source of
truth and update only the documentation.

## 42 Subject Rules To Preserve In Documentation

When documenting project scope, keep these subject constraints visible and
accurate:

- The repository must describe a web application with frontend, backend, and
  database tiers.
- The project must be containerized and runnable through a single documented
  command.
- Authentication, validation, HTTPS, secrets handling, and database schema
  expectations must not be claimed complete unless the current code supports
  them.
- The root `README.md` must remain in English and include the mandatory 42
  presentation material, team information, setup instructions, module matrix,
  contribution breakdown, resources, and AI usage disclosure.
- AI usage disclosure must be honest: describe where AI assisted, how humans
  reviewed the work, and avoid claiming AI wrote code that the team cannot
  explain.

## Documentation Editing Rules

- Before changing docs, inspect the relevant implementation files and existing
  docs.
- Prefer precise statements over aspirational ones. Use "planned", "pending",
  or "not yet implemented" when a feature is not present.
- Keep placeholders only when the team has not provided the missing information.
- Do not document module points as validated unless the matching behavior exists
  in the codebase.
- Preserve existing project terminology and file layout.
- Use Markdown links that point to existing files.
- Keep changes narrow and easy to review.

## Verification

For documentation-only changes, prefer read-only checks:

- `git diff -- AGENTS.md README.md docs`
- `rg` searches to confirm documented names, commands, and paths exist.
- Markdown preview or linting only if it is already configured and does not
  rewrite files.

Do not run `bun run fmt:fix`, code generators, migrations, or any command that
can rewrite source/configuration files under this policy.
