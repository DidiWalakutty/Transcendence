# Email Notification Subsystem & Sandboxing Manual

This document details the event-driven notification architecture, frontend recovery lifecycles, multi-lingual template compilation layer, and local SMTP sandboxing configuration.

---

## 1. Subsystem Architecture Overview

The notification subsystem isolates email construction and transport from core business logic using an asynchronous event-driven lifecycle. The system is split into three main layers:

<pre>
[Frontend UI Context]               [Trigger Point Context]             [Listener Layer]                [Template & Delivery Layer]
TanStack Router View Viewports ──►  Better Auth / Mod Modules  ──►  NotificationListener  ──►  NotificationService  ──►  MailerService
(Extracts URL params & tokens)      (Emits process events)          (Resolves recipient lang)   (Compiles HTML text)        (Routes to localhost:1025)
</pre>

### Core Workspace Component Paths

The code for this subsystem is concentrated in the following repository directory segments:

- Frontend Router Views: `apps/frontend/src/routes/`
- Event Definitions: `apps/backend/src/events/app-events.ts`
- Event Routing Core: `apps/backend/src/notification/notification.listener.ts`
- Automated Scheduler: `apps/backend/src/notification/notification.scheduler.ts`
- Delivery Engine: `apps/backend/src/notification/notification.service.ts`
- Template Repository: `apps/backend/src/templates/`

---

## 2. Frontend Integration & Client Lifecycle

The frontend interacts with the email recovery infrastructure entirely through the unauthenticated login viewport context:

1. **The Request View (/forgot-password):** The guest user enters an email address. Clicking the submission action invokes `authClient.forgetPassword({ email })` under the hood. Better Auth intercepts this, logs a transaction record to the database `verifications` table, and triggers the backend email sequence.
2. **The Landing View (/reset-password):** The secure URL link delivered to the user's Mailpit mailbox contains a unique query string token parameter (e.g., `?token=uUIOf59o...`). Upon rendering, TanStack Router extracts this token value directly from the URL context layer, staging it invisibly for the final submission payload without exposing raw data streams to client memory vulnerabilities.

---

## 3. File Matrix & Structural Components

Every email layout relies on two separate file components: a `.i18n.ts` file containing a static translation dictionary record, and a matching `.ts` functional component that outputs a compiled HTML string using base structural layout frames.

| Core Template Context   | Translation Records File      | HTML Layout Component File           | Purpose / Trigger Area                                                                    |
| :---------------------- | :---------------------------- | :----------------------------------- | :---------------------------------------------------------------------------------------- |
| **Shared Elements**     | `email.types.ts`              | `email-layout.ts`, `theme.tokens.ts` | Layout shell base grid (`EmailShell`) and CTA button templates (`EmailCta`).              |
| **Welcome**             | `welcome.i18n.ts`             | `welcome.ts`                         | Fired when a user profile is created.                                                     |
| **Ticket Confirmation** | `ticket-confirmation.i18n.ts` | `ticket-confirmation.ts`             | Fired when a user registers for an active event ticket.                                   |
| **Event Modification**  | `event-modification.i18n.ts`  | `event-modification.ts`              | Broadcast to attendees when an event detail changes. Highlight flags trigger red styling. |
| **Event Cancellation**  | `event-cancellation.i18n.ts`  | `event-cancellation.ts`              | Broadcast to attendees when an event is deleted.                                          |
| **Friendly Reminder**   | `friendly-reminder.i18n.ts`   | `friendly-reminder.ts`               | Triggered by an automated scheduler exactly 24 hours prior to an event.                   |
| **Password Reset**      | `password-reset.i18n.ts`      | `password-reset.ts`                  | Time-sensitive recovery link issued by Better Auth (`expiresIn: 900`).                    |

---

## 4. The 6 Email Operational Pipelines & Event Registry

All background operations use the custom `emitAppEvent` engine found in `app-events.ts`, which maps events to the raw Node/Bun `process` listener channels.

The following table maps every verified pipeline, its tracking keys, parameter signatures, and handling methods inside `NotificationListener` or `NotificationScheduler`:

|   #   | Operational Pipeline          | `APP_EVENTS` Variable Key | Event String Token           | Invoking / Handling Method     | Parameter Signature Payload                        |
| :---: | :---------------------------- | :------------------------ | :--------------------------- | :----------------------------- | :------------------------------------------------- |
| **1** | **User Welcome**              | `userCreated`             | `'user.created'`             | `handleUserCreated`            | `user: UserDto`                                    |
| **2** | **Ticket Confirmation**       | `registrationCreated`     | `'registration.created'`     | `handleTicketRegistration`     | `{ userId: string; eventId: string }`              |
| **3** | **Event Modification**        | `eventModified`           | `'event.modified'`           | `handleEventBroadcast`         | `{ event: any; attendees: any[]; oldEvent?: any }` |
| **4** | **Event Cancellation**        | `eventCancelled`          | `'event.cancelled'`          | `handleEventBroadcast`         | `{ event: any; attendees: any[]; oldEvent?: any }` |
| **5** | **24-Hour Friendly Reminder** | _Automated Cron Trigger_  | _Direct Invocation_          | `NotificationScheduler` loop   | Target attendee profile metadata rows              |
| **6** | **Password Recovery**         | `passwordResetRequested`  | `'password.reset.requested'` | `handlePasswordResetRequested` | `{ user: any; url: string }`                       |

---

## 5. Internationalisation (i18n) Rules & Fallback Policy

The system enforces a **recipient-centric** translation resolution model. Emails are translated according to the target user's preferred profile setting (`user.preferedLanguage`), completely ignoring the language state of the browser viewport that triggered the action.

### The Parsing Mechanism

Inside `NotificationListener`, the user payload is passed through identity helpers:

1. `resolveUserLocale()` reads the target user's database preference (`en`, `es`, `nl`, `ru`, `ro`), falling back to English (`'en'`) if undefined.
2. `resolveUserDisplayName()` extracts either the full name, username handle, or initials to avoid breaking templates if fields are missing.
3. `pickDictionary()` loads the matching object dictionary array block inside `NotificationService`.

### Translation Standards per Language Code

To prevent partial type definitions from breaking builds, translation dictionaries enforce static constraints across all supported language tags:

- **English (`en`):** The baseline technical reference language.
- **Production Locales (`es`, `nl`, etc.):** Fully realized interface dictionary records, utilizing native user-interaction tones tailored to the application specification.
- **Staged Locales (`ru`, `ro`):** Cloned string layout copies of the English definitions, with an explicit placeholder suffix token appended (e.g., `(RU Placeholder)`) to maintain strict type compilation boundaries across the monorepo spaces while awaiting dictionary localization.

---

## 6. Better Auth Token Lifecycle

The password recovery pipeline relies on Better Auth’s native server engine initialized inside `auth.instance.ts`.

- **Security Lifespan Gate:** The `emailAndPassword` configuration block explicitly restricts the validity of verification tokens by setting `expiresIn: 900` (exactly 15 minutes / 900 seconds).
- **The Validation Window:** The 15-minute countdown tracks the absolute window from clicking "Send Link" on the client interface to clicking "Update Password" on the confirmation landing screen. If the countdown window is crossed prior to final server verification, the token is automatically invalidated by the database.

---

## 7. Local Development Sandboxing (Mailpit Matrix)

The local development stack isolates outbound mail routing entirely within a localized network mesh to prevent accidental real-world email propagation.

### Zero-Config Connection Loop

The NestJS mail module implements an unconfigured `@nestjs-modules/mailer` registration. In this state, the underlying Nodemailer dependency defaults to mapping network output straight to `localhost` on Port `1025` with no username credentials required.

Because the background `docker-compose.yml` service configurations mount a Mailpit container on that exact target address, all outgoing mail streams drop straight into the sandboxed daemon container.

### Local Ports Mapping Structure

When the local application environment boots up, the following ports are mapped on the host machine:

<pre>
[Backend Core Stack] ──► SMTP Port 1025 ──► (Mailpit Container Trap) ──► HTTP Port 8025 ──► [Web Interface Console]
</pre>

- SMTP Mail Receiver (Port `1025`): The container port handler that intercepts raw backend compiler streams.
- Web Management Console (Port `8025`): Accessible locally via **http://localhost:8025**. This dashboard displays the simulated inbox queue, allowing developers and evaluators to inspect responsive HTML card blocks and multi-lingual dictionary outputs.

---

## 8. Production Deployment Instructions

Transitioning the email network from local sandboxing to real-world infrastructure requires zero modification to the system code files. To swap out Mailpit for an official production cloud provider (such as Resend, SendGrid, Amazon SES, or Postmark), update the environment variables:

1. Extend Schema Constraints: Update `apps/backend/src/config/environment.ts` to include explicit Zod string validations for connection credentials:

```typescript
SMTP_HOST: z.string().min(1),
SMTP_PORT: z.coerce.number().int().positive(),
SMTP_SECURE: z.enum(['true', 'false']).transform(v => v === 'true'),
SMTP_USER: z.string().min(1),
SMTP_PASS: z.string().min(1),
```

2. Expose Docker Configuration: Inject those newly defined parameters inside the `backend:` service environment mapping array in the production deployment configuration files.
3. Update Hosting Variables: Supply the live production parameters (e.g., `SMTP_HOST=://resend.com`, `SMTP_PORT=465`, and matching API key tokens) through the cloud infrastructure variables dashboard or project target server parameters.
