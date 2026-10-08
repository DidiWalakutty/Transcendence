# Eventra

**Eventra** is a full-stack event platform built as part of the 42/Codam curriculum by a four-person development team.

Users can discover and register for events, create and manage events, connect with friends, chat in real time, and manage their profiles. Administrators can manage users and events through a dedicated dashboard.

![Eventra Homepage](apps/frontend/src/assets/Eventra%20Homepage.png)

## My role

**Product Owner & Developer**

As Product Owner, I was responsible for product direction, backlog priorities, acceptance criteria, and validating completed features.

As a developer, I primarily worked on:

* Event catalogue with server-side filtering, sorting, and pagination
* Event cards and event detail pages
* Ticket registration and cancellation
* Landing page and navigation
* Accessibility improvements
* English and Dutch localisation
* Privacy Policy and Terms of Service pages

### A technical problem I solved

We identified a race condition where two users could register for the final available ticket at the same time.

I moved the capacity check into a database transaction and added database constraints to ensure that an event cannot exceed its capacity and that a user cannot hold multiple active tickets for the same event.

---

## Features

* Event catalogue with filtering, sorting, and pagination
* Event creation and management
* Capacity-limited ticket registration
* User profiles and avatars
* Friend requests and live online status
* Real-time chat
* Notifications and e-mail
* TOTP two-factor authentication
* Admin dashboard
* English, Dutch, and Spanish localisation
* WCAG 2.1 AA accessibility considerations
* Server-side rendering
* Docker-based deployment with HTTPS

---

## Technical architecture

```text
                         Browser
                            │
                       HTTPS / Caddy
                            │
              ┌─────────────┴─────────────┐
              │                           │
        React Frontend              NestJS Backend
       TanStack Start                  tRPC
                                          │
                              ┌───────────┼───────────┐
                              │           │           │
                         PostgreSQL     Redis        SSE
```

### Stack

**Frontend:** React 19, TanStack Start, TanStack Router, TanStack Query, TanStack Form, TypeScript, Tailwind CSS, shadcn/ui

**Backend:** NestJS 11, tRPC, Zod, TypeScript

**Database:** PostgreSQL 17, Drizzle ORM

**Infrastructure:** Docker, Docker Compose, Caddy, Redis

**Authentication:** better-auth, TOTP

**Testing:** Vitest, Playwright

---

## Database

The application uses PostgreSQL with Drizzle ORM.

The main data model covers:

* Users and sessions
* Events and organisers
* Event registrations
* Friendships
* Two-factor authentication
* User profiles

Important integrity rules are enforced at the database level using foreign keys, transactions, enums, and partial unique indexes.

For example, active event registrations use a partial unique index on `(event_id, user_id)`, preventing a user from holding multiple active tickets for the same event.

The full schema and database documentation are available in [`docs/DATABASE.md`](./docs/DATABASE.md).

---

## Testing & quality

The project includes:

* Unit tests with **Vitest**
* End-to-end tests with **Playwright**
* Chromium and Firefox testing
* TypeScript type checking
* Linting and formatting
* CI checks through GitHub Actions

---

## Documentation

More detailed documentation is available in the [`docs/`](./docs/) directory:

* [Stack](./docs/STACK.md) — architecture and technology choices
* [Database](./docs/DATABASE.md) — schema and database design
* [Development](./docs/DEVELOPMENT.md) — development workflow
* [Authentication](./docs/AUTHENTICATION.md) — authentication architecture
* [Environment](./docs/ENVIRONMENT.md) — configuration
* [Browser Support](./docs/BROWSER_SUPPORT.md) — browser compatibility
* [Prerequisites](./docs/PREREQUISITES.md) — setup requirements
* [Tooling](./docs/TOOLING.md) — available commands

---

## Running the project

### Prerequisites

* Docker Engine 20.10+
* Docker Compose v2

### Start

```bash
docker compose up --build
```

Then open:

```text
https://localhost:3000
```

The development setup and available commands are documented in [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md).

---

## Team

Eventra was developed as a four-person team as part of the 42/Codam curriculum.

| Role       | Login                    | Responsibilites    |
| ------------- | ------------------------- | ------------------- |
|Product Owner|	diwalaku|	Product vision, backlog priorities, acceptance criteria, validation of finished work.|
|Project Manager|	ccraciun|	Coordination, blockers, milestones and timelines, keeping the team in sync.|
|Technical Lead / Architect|	mde-krui|	Stack decisions, code-quality standards, pull-request reviews, architecture across the three tiers.|


The team used GitHub Projects, feature branches, pull requests, code review, CI, and asynchronous communication.

---

## Original project

This project was created as part of the **42/Codam curriculum**.

Original team members:

* `mde-krui`
* `diwalaku`
* `ccraciun`
* `rtorrent`

This repository is my personal fork of the team project.

---

## AI disclosure

The team used Claude Code for repetitive and review-oriented tasks within the 42 project rules. AI-assisted changes were reviewed, tested, and understood by the team member responsible for merging them.

The core product features and architecture were designed and implemented by the project team.
