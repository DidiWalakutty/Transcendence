# Considerations

## Technical Stack

### Core Application Stack

- **Frontend Library:** React
- **Styling Framework:** Tailwind CSS
- **Form & Validation Layer:** TanStack Form (paired with a schema validator like Zod or Valibot for type-safe, dual-layer frontend/backend validation. tRPC has validation using zod built in.)
- **Data Fetching & State Management:** TanStack Query (or tRPC)'
- **Web Framework**: TanStack Start
- **Web Architecture Toolchain:** Vite+ (Full TypeScript toolchain)
- **Backend Framework:** NestJS (TypeScript-based architecture)
- **Real-Time Communication:** Socket.IO (WebSockets)

### Database & Caching

- **Database Engine:** PostgreSQL
- **Caching & Real-Time Key-Value Store:** Redis
- **Database Interface / ORM:** Prisma or TypeORM (or raw SQL, or a bix of both)

### Infrastructure & Operations

- **Runtime & Package Manager:** Bun, Vite+ (will use bun internally)
- **Monorepo Management:** Moonrepo, Vite+
- **Containerization:** Docker Compose (for isolating and managing application services, PostgreSQL, and Redis)
- **Local Development Environment:** Development Containers (Devcontainers) hooked into Docker Compose to handle rigid system dependencies across local environments
- **HTTPS/SSL Enforcement:** Let's Encrypt certificates managed via an edge service or reverse-proxy container (e.g., Caddy or Nginx), or simply using mkcert for local certificates.

---

## Alternative Tech Stack Options

Depending on developer learning targets, the following sub-components can be substituted into the core architecture:

### Backend Alternatives

- **Rust:** Axum framework paired with SQLx, Diesel, or SeaORM.

### API Layer Alternatives

- **tRPC:** Integrating NestJS with tRPC to handle automatic, end-to-end type-safe client generation including validation directly between the backend and frontend.
- **OpenAPI / Swagger:** Generating an OpenAPI specification directly via NestJS discoverability features to compile frontend TypeScript API clients automatically.

