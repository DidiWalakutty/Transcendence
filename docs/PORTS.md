# Ports

The following ports are reserved for local development.

Application services run through Vite+ tasks. Infrastructure services are provided by the root Docker Compose stack.

| Port   | Service    | Description                                                                                              |
| ------ | ---------- | -------------------------------------------------------------------------------------------------------- |
| `3000` | Caddy      | HTTPS entry point of the Docker stack (`3080` redirects here). `HTTPS_PORT` / `HTTP_PORT` override both. |
| `3000` | Frontend   | Vite dev server (`vp run dev`), plain HTTP.                                                              |
| `3001` | Backend    | NestJS API and tRPC services.                                                                            |
| `5432` | PostgreSQL | Primary relational database.                                                                             |
| `6380` | Redis      | Host port for backend cache and throttling.                                                              |

The frontend and backend containers of the Docker stack bind no host ports; the app is
exposed through Caddy only, on `3000` — the same number the Vite dev server uses, so run
either `vp run dev` or the Docker stack, not both at once.

Redis still listens on its standard port `6379` inside the Compose network. The
less common host port `6380` avoids conflicts with Redis instances already
running on a developer's machine. Set `REDIS_PORT` to override it.

When using the devcontainer, application ports should be forwarded so the same
services are reachable inside and outside the container. The devcontainer joins
the Compose network and reaches PostgreSQL and Redis by service name.
