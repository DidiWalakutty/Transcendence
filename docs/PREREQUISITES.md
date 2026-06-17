# Prerequisites

This document lists the host tools needed before working on the project.

## Required

| Requirement             | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| Git                     | Required to clone the repository and collaborate through version control. |
| Docker / Docker Desktop | Required to run root Docker Compose services such as PostgreSQL.          |
| Vite+                   | Required for local development outside the devcontainer.                  |

## Vite+

Install Vite+ outside the devcontainer with the commands in [Development](./DEVELOPMENT.md).

You do not need to install Bun manually. Vite+ manages the project runtime and package manager.

## Docker Compose

Infrastructure services are provided by the root `docker-compose.yml` file.

The devcontainer is responsible for tooling and editor consistency only. PostgreSQL and Redis are not provided by the devcontainer itself.

## Devcontainer

Once the devcontainer is available, it should provide the expected tooling and editor setup automatically.

Until then, contributors should use local Vite+ plus Docker / Docker Desktop.
