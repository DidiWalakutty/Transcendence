# Ports

The following ports are reserved for local development and are automatically forwarded by the devcontainer, allowing services to be accessed both inside and outside the container when needed.

| Port | Service | Description |
|------|---------|-------------|
| `3000` | Frontend | Main web application powered by TanStack Start. |
| `3001` | Backend | NestJS API and application services. |
| `5432` | PostgreSQL | Primary relational database. |
| `6379` | Redis | In-memory data store used for caching, queues, and pub/sub. |

All ports are preconfigured and forwarded automatically to streamline local development and debugging workflows.