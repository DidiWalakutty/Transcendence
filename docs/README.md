# Documentation

This directory contains the project documentation for local development, architecture, tooling, and evaluation requirements.

## Start Here

New to web development? Open the [Beginner's Project Guide](./PROJECT_GUIDE.html) in a browser.
It explains the application, tools, terminology, and request flow with diagrams and examples.
The page works offline and includes links into the source code and the guides below.

[Printable code walkthroughs](./print-lessons/index.html) explain event-stream updates, tRPC
transport, presence tracking and cleanup, and the friends request flow. Each lesson includes
code, examples, questions, and answers, with a layout for printing or saving as PDF.

| Document                                    | Purpose                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| [Development](./DEVELOPMENT.md)             | Local setup, install steps, development commands, and troubleshooting.      |
| [Stack](./STACK.md)                         | The approved technology stack and architecture principles.                  |
| [Architecture Tour](./ARCHITECTURE_TOUR.md) | Start here to learn the codebase: how every layer connects, end to end.     |
| [Learning Path](./LEARNING_PATH.md)         | Seven guided sessions with exercises, from first run to shipping a feature. |
| [Evaluation Prep](./EVAL_PREP.md)           | 15-hour plan to explain the repo at evaluation, plus a compliance audit.    |
| [Subject](./SUBJECT.md)                     | The 42 subject summary and evaluation requirements.                         |

## Architecture

| Document                                    | Purpose                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------- |
| [Architecture Tour](./ARCHITECTURE_TOUR.md) | How the layers connect: layer map, diagrams, and end-to-end request traces. |
| [API](./API.md)                             | Current tRPC API surface and generated router types.                        |
| [Authentication](./AUTHENTICATION.md)       | Better Auth wiring, schema, dual user-creation paths, and password reset.   |
| [Validation](./VALIDATION.md)               | Shared schema validation flow across frontend, tRPC, backend, and database. |
| [Database](./DATABASE.md)                   | PostgreSQL, Drizzle ORM, migrations, and local database commands.           |
| [Environment](./ENVIRONMENT.md)             | Environment variables used by backend, frontend, Drizzle, and Compose.      |
| [Internationalization](./I18N.md)           | Inlang Paraglide locales, message files, generated runtime, and switcher.   |
| [Monorepo](./MONOREPO.md)                   | Workspace layout and Vite+ task orchestration.                              |
| [Ports](./PORTS.md)                         | Reserved local ports for app and infrastructure services.                   |

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
