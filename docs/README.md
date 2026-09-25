# Documentation

This directory contains the project documentation for local development, architecture, tooling, and evaluation requirements.

## Start Here

| Document                        | Purpose                                                                |
| ------------------------------- | ---------------------------------------------------------------------- |
| [Development](./DEVELOPMENT.md) | Local setup, install steps, development commands, and troubleshooting. |
| [Stack](./STACK.md)             | The approved technology stack and architecture principles.             |
| [Subject](./SUBJECT.md)         | The 42 subject summary and evaluation requirements.                    |

## Architecture

| Document                              | Purpose                                                                                                           |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| [API](./API.md)                       | Current tRPC API surface and generated router types.                                                              |
| [Authentication](./AUTHENTICATION.md) | Better Auth wiring, schema, dual user-creation paths, and password reset.                                         |
| [Validation](./VALIDATION.md)         | Shared schema validation flow across frontend, tRPC, backend, and database.                                       |
| [Database](./DATABASE.md)             | PostgreSQL, Drizzle ORM, migrations, and local database commands.                                                 |
| [Environment](./ENVIRONMENT.md)       | Environment variables used by backend, frontend, Drizzle, and Compose.                                            |
| [Internationalization](./I18N.md)     | Inlang Paraglide locales, message files, generated runtime, and switcher.                                         |
| [Email](./EMAIL.md)                   | Zero-config sandboxing infrastructure, local Mailpit port mapping matrix, and production deployment instructions. |
| [Monorepo](./MONOREPO.md)             | Workspace layout and Vite+ task orchestration.                                                                    |
| [Ports](./PORTS.md)                   | Reserved local ports for app and infrastructure services.                                                         |

## Tooling

| Document                            | Purpose                                               |
| ----------------------------------- | ----------------------------------------------------- |
| [Tooling](./TOOLING.md)             | Vite+, Bun, common commands, and generated artifacts. |
| [Commit Hooks](./COMMIT_HOOKS.md)   | Pre-commit checks and how to fix hook failures.       |
| [CI](./CI.md)                       | Continuous integration responsibilities.              |
| [Prerequisites](./PREREQUISITES.md) | Required host tools before running the project.       |

## Testing

| Document                                | Purpose                                                                   |
| --------------------------------------- | ------------------------------------------------------------------------- |
| [Browser Support](./BROWSER_SUPPORT.md) | Browser test plan, feature matrix, console checks, and known limitations. |

## Editor

| Document                      | Purpose                                                       |
| ----------------------------- | ------------------------------------------------------------- |
| [Editor](./EDITOR.md)         | Editor policy and devcontainer expectations.                  |
| [Extensions](./EXTENSIONS.md) | Recommended VS Code extensions installed in the devcontainer. |

## Visuals

| Document                                                  | Purpose                                   |
| --------------------------------------------------------- | ----------------------------------------- |
| [Architecture Diagram](./visuals/architecture.excalidraw) | Editable Excalidraw architecture diagram. |

## Documentation Rules

- Keep the root `README.md` focused on project presentation and 42 evaluation material.
- Put development workflow details in [Development](./DEVELOPMENT.md).
- Put stack decisions in [Stack](./STACK.md).
- Put command and tool details in [Tooling](./TOOLING.md).
- Put database-specific details in [Database](./DATABASE.md).
- Update this index whenever a documentation file is added, removed, or renamed.
