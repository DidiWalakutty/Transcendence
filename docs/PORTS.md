# Ports

The following ports are reserved for local development.

Application services run through Vite+ tasks. Infrastructure services are provided by the root Docker Compose stack.

| Port   | Service    | Description                                                 |
| ------ | ---------- | ----------------------------------------------------------- |
| `3000` | Frontend   | Main web application powered by TanStack Start.             |
| `3001` | Backend    | NestJS API and tRPC services.                               |
| `5432` | PostgreSQL | Primary relational database.                                |
| `6379` | Redis      | Reserved for caching, queues, pub/sub, and real-time state. |

When using the devcontainer, these ports should be forwarded so the same services are reachable inside and outside the container.
