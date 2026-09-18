# Browser Support

What the subject asks, which browsers we support, how the site was tested in
them, and the browser-specific limitations found. This is the evidence for the
_Extended multi-browser support_ minor module.

## 1. Requirements

| Source                      | Requirement                                                                                                          | Weight        |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------- |
| Subject III.2 (general)     | Compatible with the latest stable **Google Chrome**; **no warnings or errors** in the browser console.               | **Mandatory** |
| Subject IV.2 (minor module) | Full compatibility with **2 additional browsers**; test and fix all features; document browser-specific limitations. | 1 point       |

## 2. Supported browsers

Chrome and Edge share one rendering engine (Blink), Firefox has its own (Gecko),
Safari has WebKit. Firefox is the second engine, Edge the second product.

| Browser         | Engine | Role                       | Minimum\* | Version tested | OS  | Date | Result |
| --------------- | ------ | -------------------------- | --------- | -------------- | --- | ---- | ------ |
| Google Chrome   | Blink  | Mandatory                  | 111       |                |     |      |        |
| Mozilla Firefox | Gecko  | Module — browser 1         | 128       |                |     |      |        |
| Microsoft Edge  | Blink  | Module — browser 2         | 111       |                |     |      |        |
| Safari (WebKit) | WebKit | Engine covered by e2e only | 16.4      | Playwright     | —   |      |        |

\* Tailwind CSS v4 needs `@property`, `color-mix()` and cascade layers; older
browsers render unstyled (BS-2). Versions: `chrome://version`, `about:support`,
`edge://version`.

## 3. How to test

1. **Production build only**: `vp run deploy`, then `https://localhost:3000`.
   The dev server ships devtools and logging the evaluator never sees.
2. **Trust the certificate** so no warning page appears: `mkcert` and
   `certutil` on `PATH`, then `bash scripts/generate-certs.sh` and
   `docker compose restart caddy`. Chrome/Edge on Linux and Firefox read NSS
   trust stores; macOS browsers use the Keychain. Restart the browser
   afterwards (Firefox reads its store at startup, BS-5). Without root on a
   school PC, `mkcert` is a single binary for `~/.local/bin`; if `certutil` is
   missing the store cannot be written and you click through the warning once
   per session — the console stays clean anyway since BS-1 (BS-3).
3. **Console open before navigating** (F12 → Console), errors and warnings
   shown. Load the page, run its flow, switch language and theme, reload once.
   Anything red or yellow is a finding, except the browser's own network lines
   for 4xx/5xx responses (BS-6, BS-8, BS-10) — hide them with _Hide network
   requests_.
4. **Two browsers side by side** as two users for online status, chat and
   live event updates.

Seed accounts come from `vp run db:seed`; reset e-mails land in Mailpit at
`http://localhost:8025`.

## 4. Results

Legend: ✅ works · 🤖 passes in the e2e suite on that engine (section 6) ·
⚠️ works with a note (BS-n) · — not checked.

| Area                                                                                                                                  | Chrome | Firefox | Edge | WebKit |
| ------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ---- | ------ |
| Public pages: home, events list (search, filter, sort, pagination), event detail, contact, privacy, terms, 404                        | 🤖     | 🤖      | —    | 🤖     |
| Auth: signup, login (wrong and right password), session after reload, logout, forgot / reset password, 2FA                            | 🤖     | 🤖      | —    | 🤖     |
| Logged in: profile edit, avatar upload, create event (date picker, category combobox, image), my events, register, my tickets, toasts | 🤖     | 🤖      | —    | 🤖     |
| Admin: users and events tables, non-admin refused                                                                                     | 🤖     | 🤖      | —    | 🤖     |
| Real-time: online status, chat between two browsers, live event list                                                                  | 🤖     | 🤖      | —    | 🤖     |
| Cross-cutting: language en/es/nl persists, theme, keyboard and dialogs, fonts, no service worker, certificate accepted                | —      | —       | —    | —      |
| Layout at 375 / 768 / 1280 px, mobile drawer (BS-15)                                                                                  | —      | —       | —    | —      |

### Console cleanliness per page

Every route is opened and reloaded with the console recorded; the run fails on
any warning, error or uncaught exception. Routes: `/`, `/events`,
`/events/$eventId`, `/contact`, `/privacy-policy`, `/terms-of-service`,
`/signup`, `/create-account`, `/login`, `/forgot-password`, `/reset-password`,
`/verify-2fa`, `/profile`, `/create-event`, `/my-events`, `/my-tickets`,
`/admin`, 404 page. Protected routes are checked logged out (the redirect) and,
through the flows, logged in. Last run 2026-09-18: clean in Chromium, Firefox
and WebKit, except the documented network lines (BS-6 on `/login`, BS-8 on the
404 page) and the Firefox note on `/create-event` (BS-14).

## 5. Browser-specific limitations and fixed issues

`BS-n` numbers are referenced from the e2e suite (`allow` patterns) and from
commit messages. **By design** = documented, not fixed.

### Limitations (by design)

| ID    | Browsers                   | What                                                                                                                                                                                                                            |
| ----- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BS-2  | all, old versions          | Tailwind v4 floor: Chrome 111, Firefox 128, Safari 16.4. Older browsers render unstyled.                                                                                                                                        |
| BS-3  | Chrome/Edge Linux, Firefox | `mkcert` and `certutil` (`libnss3-tools`) must be on the host to write the NSS trust stores; without them the browser shows its warning page once per session.                                                                  |
| BS-5  | Firefox                    | Reads its trust store at startup; restart it after `generate-certs.sh`.                                                                                                                                                         |
| BS-6  | Chrome, Edge               | A wrong password is answered `401`; the browser logs `POST …/sign-in/email 401` itself. Network log, not application output.                                                                                                    |
| BS-8  | Chrome, Edge, WebKit       | The 404 page is served with status 404, which the browser logs as `Failed to load resource … 404`. Firefox does not print document requests.                                                                                    |
| BS-10 | all                        | better-auth rate limit: 3 sign-in/sign-up/password requests per 10 s per address, 3 resets per minute → `429`, shown in the form's alert and logged by the browser like BS-6.                                                   |
| BS-12 | Firefox                    | Leaving a page mid-download logs `Image corrupt or truncated` / `downloadable font: download failed … status=2152398850` (`NS_BINDING_ABORTED`). Browser decoders, files are valid.                                             |
| BS-14 | Firefox                    | With the category list or calendar open, scrolling logs "scroll-linked positioning effect" once — Floating UI repositions anchored popups on scroll. Performance hint, not an error. Reduced: the calendar closes after a pick. |

### Fixed (branch `test/browser-compatibility` unless noted)

| ID    | Found in                | Bug and fix                                                                                                                                                                                                                                                                                                                                                                |
| ----- | ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BS-1  | Chrome                  | `Failed to register a ServiceWorker … SSL certificate error` on every page when the certificate is not trusted. The unused PWA service worker (`vite-plugin-pwa`, `manifest.json`) was removed. Old installs: DevTools → Application → Service Workers → Unregister once.                                                                                                  |
| BS-7  | Chrome                  | Form submits did `await mutateAsync()` without a catch, so a rejected login/signup/reset/profile save logged `Uncaught (in promise)`. Every such call now ends in `.catch(() => undefined)`; alert and toast unchanged.                                                                                                                                                    |
| BS-9  | all (e2e)               | `/reset-password` without `?token=` failed server rendering with a `500`. `token` is optional and the route redirects to `/forgot-password` when it is missing.                                                                                                                                                                                                            |
| BS-11 | Firefox                 | Firefox aborts in-flight requests on navigation; the route loader's rejection was reported by React's `onCaughtError` as `TypeError: NetworkError`. `apps/frontend/src/client.tsx` silences caught errors once `beforeunload` fired.                                                                                                                                       |
| BS-13 | Firefox (e2e, parallel) | Server-side session lookups lacked `X-Forwarded-For`, so all visitors shared one rate-limit bucket and logins silently did not stick under load. `forwarded-headers.ts` now forwards the address; e2e runs with two workers.                                                                                                                                               |
| BS-15 | all                     | `/` and `/events` were 817 px wide at 375 px (navbar links wrapped, hero cut off, 30 % header column, side-by-side card image); 855 px at 768 px. Fixed on branch `fix/responsive-layout`: menu drawer below `md`, stacked events page below `lg`, image above text in cards, smaller chat widget. Layout work (subject "Responsive layout"), kept apart from this branch. |

BS-4 (Firefox CSS parse warnings for foreign vendor prefixes) was expected but
did not occur in the Firefox pass.

To report a new one: `BS-n`, browsers + versions, route, steps, the exact
console message in a code block, root cause when known.

## 6. Automation

[Playwright](https://playwright.dev/) drives real Chromium, Firefox and WebKit
builds through the site and reads their console. 72 tests (24 per engine),
about two minutes per engine. Last full run 2026-09-18, all passing.

| File                                                        | Checks                                                                                                                                                                                                         |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/console.spec.ts`                                       | Every route above, opened and reloaded; plus leaving `/` before it finished loading (BS-11, BS-12).                                                                                                            |
| `e2e/login.spec.ts`                                         | Wrong password: alert shown, only the BS-6 line in the console (guards BS-7).                                                                                                                                  |
| `e2e/auth.spec.ts`                                          | Signup → session survives reload → logout → login; forgot-password form accepts a request (the reset link is only written to the backend log).                                                                 |
| `e2e/create-event.spec.ts`                                  | Create an event with image, category, date, time, capacity; event page shows it after a reload (BS-14).                                                                                                        |
| `e2e/realtime.spec.ts`                                      | Two users in two different engines: both online, a chat message arrives without reload, both consoles clean.                                                                                                   |
| `e2e/console.ts`, `e2e/accounts.ts`, `playwright.config.ts` | Console recorder and `expectCleanConsole(recorder, allow)` — every `allow` pattern maps to a BS-n; fresh accounts per run (waits out BS-10); one project per engine, `ignoreHTTPSErrors`, two workers (BS-13). |

```bash
vp run test:e2e:install                      # once per machine (~500 MB)
vp run deploy:detached                       # https://localhost:3000
vp run test:e2e                              # all three engines
./node_modules/.bin/playwright test --project chromium --headed
./node_modules/.bin/playwright show-report
E2E_CHANNELS=chrome,msedge vp run test:e2e   # installed Chrome / Edge as extra projects
```

School PCs (no sudo, no WebKit libraries):

```bash
PLAYWRIGHT_BROWSERS_PATH=/goinfre/$USER/ms-playwright vp run test:e2e:install
PLAYWRIGHT_BROWSERS_PATH=/goinfre/$USER/ms-playwright ./node_modules/.bin/playwright test --project chromium --project firefox
```

Not covered by the suite: certificate trust, native pickers, 2FA with a real
authenticator, Safari and Edge as products, my-events / my-tickets / admin
flows, forgot-password end to end.

## 7. Before the defense

- [ ] Chrome, Firefox and Edge installed; versions in section 2.
- [ ] `scripts/generate-certs.sh` run, browsers restarted, lock icon in all three.
- [ ] `vp run deploy` up; seed accounts known to the team.
- [ ] Section 4 filled in from the manual pass; every ⚠️ has a BS entry.
- [ ] README Modules Matrix row _Extended multi-browser support_ links here.
- [ ] Two browsers pre-logged-in as two users for the real-time demo.
