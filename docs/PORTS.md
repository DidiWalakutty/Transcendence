# Ports

The following ports are reserved for local development.

Application services run through Vite+ tasks. Infrastructure services are provided by the root Docker Compose stack.

| Port   | Service    | Description                                     |
| ------ | ---------- | ----------------------------------------------- |
| `3000` | Frontend   | Main web application powered by TanStack Start. |
| `3001` | Backend    | NestJS API and tRPC services.                   |
| `5432` | PostgreSQL | Primary relational database.                    |
| `6380` | Redis      | Host port for backend cache and throttling.     |

Redis still listens on port `6379` inside the Compose network. The less common
host port `6380` avoids conflicts with Redis instances already running on a
developer's machine. Set `REDIS_PORT` to override it.

When using the devcontainer, application ports should be forwarded so the same
services are reachable inside and outside the container. The devcontainer joins
the Compose network and reaches PostgreSQL and Redis by service name.
