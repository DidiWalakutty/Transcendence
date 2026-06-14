# Considerations

## Technical Stack

### Core Application Stack

* **Frontend Library:** [React](https://react.dev/)
* **Styling Framework:** [Tailwind CSS](https://tailwindcss.com/)
* **Form & Validation Layer:** [TanStack Form](https://tanstack.com/form) (paired with a schema validator like [Zod](https://zod.dev/) or [Valibot](https://valibot.dev/) for type-safe, dual-layer frontend/backend validation. [tRPC](https://trpc.io/) has validation using zod built in.)
* **Data Fetching & State Management:** [TanStack Query](https://tanstack.com/query) (or [tRPC](https://trpc.io/))
* **Web Framework:** [TanStack Start](https://tanstack.com/start)
* **Web Architecture Toolchain:** [Vite+](https://viteplus.dev/) (Full TypeScript toolchain)
* **Backend Framework:** [NestJS](https://nestjs.com/) (TypeScript-based architecture)
* **Real-Time Communication:** [Socket.IO](https://socket.io/) (WebSockets)

### Database & Caching

* **Database Engine:** [PostgreSQL](https://www.postgresql.org/)
* **Caching & Real-Time Key-Value Store:** [Redis](https://redis.io/)
* **Database Interface / ORM:** [Prisma](https://www.prisma.io/) or [TypeORM](https://typeorm.io/) (or raw SQL, or a mix of both)

### Infrastructure & Operations

* **Runtime & Package Manager:** [Bun](https://bun.sh/), [Vite+](https://viteplus.dev/) (will use bun internally)
* **Monorepo Management:** [Moonrepo](https://moonrepo.dev/), [Vite+](https://viteplus.dev/)
* **Containerization:** [Docker Compose](https://docs.docker.com/compose/) (for isolating and managing application services, PostgreSQL, and Redis)
* **Local Development Environment:** [Development Containers (Devcontainers)](https://containers.dev/) hooked into [Docker Compose](https://docs.docker.com/compose/) to handle rigid system dependencies across local environments
* **HTTPS/SSL Enforcement:** [Let's Encrypt](https://letsencrypt.org/) certificates managed via an edge service or reverse-proxy container (e.g., [Caddy](https://caddyserver.com/) or [Nginx](https://nginx.org/)), or simply using [mkcert](https://github.com/FiloSottile/mkcert) for local certificates.

---

## Alternative Tech Stack Options

Depending on developer learning targets, the following sub-components can be substituted into the core architecture:

### Backend Alternatives

* **Rust:** [Axum](https://github.com/tokio-rs/axum) framework paired with [SQLx](https://github.com/launchbadge/sqlx), [Diesel](https://diesel.rs/), or [SeaORM](https://www.sea-ql.org/SeaORM/).

### API Layer Alternatives

* **tRPC:** Integrating [NestJS](https://nestjs.com/) with [tRPC](https://trpc.io/) to handle automatic, end-to-end type-safe client generation including validation directly between the backend and frontend.
* **OpenAPI / Swagger:** Generating an [OpenAPI](https://www.openapis.org/) specification directly via [NestJS](https://nestjs.com/) discoverability features to compile frontend TypeScript API clients automatically using [Swagger](https://swagger.io/).