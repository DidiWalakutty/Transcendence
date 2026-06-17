# @repo/frontend

React frontend for `ft_transcendence`, built with TanStack Start, TanStack Router, TanStack Query, tRPC, Tailwind CSS, and Inlang Paraglide.

This app consumes shared schemas and generated tRPC router types from `@repo/schemas`. The root Vite+ task graph should be used for normal development so routes, localization files, and API types are generated before the app starts.

## Start Here

- Project setup and commands: [Development](../../docs/DEVELOPMENT.md)
- Frontend stack: [Stack](../../docs/STACK.md)
- API calls and subscriptions: [API](../../docs/API.md)
- Shared validation flow: [Validation](../../docs/VALIDATION.md)
- Internationalization: [Internationalization](../../docs/I18N.md)
- Environment variables: [Environment](../../docs/ENVIRONMENT.md)
- Tooling and generated files: [Tooling](../../docs/TOOLING.md)
- Local ports: [Ports](../../docs/PORTS.md)

## Important Files

| Path                                                                                                     | Purpose                                                         |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [src/router.tsx](./src/router.tsx)                                                                       | Creates the TanStack Router and wires router/query integration. |
| [src/routes](./src/routes)                                                                               | File-based route source files.                                  |
| [src/routes/index.tsx](./src/routes/index.tsx)                                                           | Current user form and user list example flow.                   |
| [src/integrations/tanstack-query/root-provider.tsx](./src/integrations/tanstack-query/root-provider.tsx) | Creates the Query Client and typed tRPC client.                 |
| [src/integrations/trpc/react.ts](./src/integrations/trpc/react.ts)                                       | Exposes typed tRPC React helpers.                               |
| [src/env.ts](./src/env.ts)                                                                               | Frontend runtime environment schema.                            |
| [messages](./messages)                                                                                   | Source locale message files.                                    |
| [project.inlang](./project.inlang)                                                                       | Inlang project configuration.                                   |

## Common Commands

Run commands from the repository root:

```bash
vp run dev:frontend
vp run test:frontend
vp run check:frontend
vp run build:frontend
```

For the full stack, prefer:

```bash
vp run dev
```

## Generated Files

The frontend has generated files for routes and localization:

```text
src/routeTree.gen.ts
src/@generated/paraglide
```

Regenerate them through the root task graph:

```bash
vp run dev:frontend
```

or directly through the configured repository task:

```bash
vp run -w repo:frontend:generate
```

Generated files should not be edited by hand. See [Tooling](../../docs/TOOLING.md#generated-files).
