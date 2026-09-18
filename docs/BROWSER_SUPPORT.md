# Browser Support

Test plan, results matrix, and known browser-specific limitations for the
42 subject's browser requirements. Fill in the tables as testing happens; this
document is the evidence shown during evaluation.

## Table of Contents

1. [What the subject requires](#1-what-the-subject-requires)
2. [Supported browsers](#2-supported-browsers)
3. [Test environment](#3-test-environment)
4. [Certificate trust per browser](#4-certificate-trust-per-browser)
5. [Console check procedure](#5-console-check-procedure)
6. [Feature matrix](#6-feature-matrix)
7. [Console cleanliness per page](#7-console-cleanliness-per-page)
8. [Known issues and browser-specific limitations](#8-known-issues-and-browser-specific-limitations)
9. [Reporting a browser issue](#9-reporting-a-browser-issue)
10. [Automation](#10-automation)
11. [Evaluation checklist](#11-evaluation-checklist)

---

## 1. What the subject requires

Two separate requirements. Keep them apart in the README and during the defense.

| Source                                                        | Requirement                                                                                                                                                                                                                                                | Weight                                            |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Subject III.2 _General requirements_ (p. 8)                   | "Your website must be compatible with the latest stable version of **Google Chrome**." <br> "**No warnings or errors** should appear in the browser console."                                                                                              | **Mandatory** — failure rejects the project       |
| Subject IV.2 _Minor: Support for additional browsers_ (p. 13) | "Full compatibility with at least **2 additional browsers** (Firefox, Safari, Edge, etc.)." <br> "Test and fix all features in each browser." <br> "**Document any browser-specific limitations**." <br> "Consistent UI/UX across all supported browsers." | **1 point** (listed in the README Modules Matrix) |

The mandatory part is checked live: the evaluator opens Chrome, presses F12, and
expects an empty console on every page. The module is checked on evidence: this
matrix, the fixed issues, and the limitations list below.

---

## 2. Supported browsers

A **rendering engine** is the part of a browser that turns HTML/CSS/JS into
pixels. Chrome, Edge and Chromium share one engine (Blink); Firefox has its own
(Gecko); Safari has its own (WebKit). Testing on a second engine finds more than
testing on a second Blink browser, which is why Firefox is not optional here.

| Browser         | Engine | Role                                  | Minimum version\* | Version tested | Tested on (OS) | Date | Tester | Result |
| --------------- | ------ | ------------------------------------- | ----------------- | -------------- | -------------- | ---- | ------ | ------ |
| Google Chrome   | Blink  | **Mandatory** (subject III.2)         | 111               |                |                |      |        |        |
| Mozilla Firefox | Gecko  | Module — additional browser 1         | 128               |                |                |      |        |        |
| Microsoft Edge  | Blink  | Module — additional browser 2         | 111               |                |                |      |        |        |
| Safari          | WebKit | Optional — only if a Mac is available | 16.4              |                |                |      |        |        |

\* Minimums come from Tailwind CSS v4, which the frontend is built on. It relies
on modern CSS (`@property`, `color-mix()`, cascade layers) that older browsers
cannot parse — pages render unstyled there. This is a documented limitation
(see [BS-2](#bs-2-tailwind-v4-minimum-browser-versions)), not something to fix.

Where to read the version: `chrome://version`, `about:support` (Firefox),
`edge://version`, Safari → _About Safari_.

---

## 3. Test environment

- **Always test the production build**, never `vp run dev`. The dev build ships
  devtools panels and verbose logging that never reach the evaluator. Start the
  stack with:

  ```bash
  vp run deploy
  ```

  and open `https://localhost:3000`.

- **Trust the certificate first** (section 4) so the browser does not show its
  warning page. Clicking through the warning is acceptable for a quick check
  since BS-1 was fixed, but it is not how the evaluator should see the site.

- **Seed accounts** — run `vp run db:seed` and use (fill in once the seed data
  is fixed):

  | Purpose               | Email | Password | Notes                           |
  | --------------------- | ----- | -------- | ------------------------------- |
  | Regular user A        |       |          |                                 |
  | Regular user B        |       |          | For two-browser real-time tests |
  | Admin                 |       |          |                                 |
  | User with 2FA enabled |       |          |                                 |

- **Email flows** (password reset, notification emails) are captured by Mailpit
  at `http://localhost:8025` — no real inbox needed.

- **Two-browser sessions** — for real-time features (online status, chat,
  notifications), log in as user A in one browser and user B in another browser,
  side by side. This also demonstrates the subject's mandatory multi-user
  requirement.

---

## 4. Certificate trust per browser

Caddy serves the mkcert certificate in `caddy/certs`. mkcert certificates are
only trusted by browsers whose trust store contains the mkcert **root CA**, and
that root CA is per machine. A fresh machine (school PC, evaluator's laptop)
does not trust it until `scripts/generate-certs.sh` has been run there.

Browsers do not all read the same trust store:

| Browser                         | Trust store read                                | What `scripts/generate-certs.sh` needs                                                     |
| ------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Chrome / Edge on Linux          | NSS database in `~/.pki/nssdb`                  | `certutil` on `PATH` — see [BS-3](#bs-3-mkcert-and-certutil-must-be-installed-on-the-host) |
| Firefox (any OS)                | Its own NSS database inside the Firefox profile | `certutil` on `PATH`; Firefox must be **restarted** afterwards                             |
| Chrome / Edge / Safari on macOS | System or login Keychain                        | `mkcert -install` with an admin prompt, or `TRUST_STORES=nss` for Firefox only             |

Steps on a school PC (no sudo). `mkcert` and `certutil` must be on `PATH`
first — see [BS-3](#bs-3-mkcert-and-certutil-must-be-installed-on-the-host) for
how to get them without root:

```bash
bash scripts/generate-certs.sh    # writes browser trust stores, regenerates caddy/certs
docker compose restart caddy      # if the stack was already running
```

Then fully quit and restart the browser. Verify by opening
`https://localhost:3000`: the address bar must show a lock with **no** warning
page. If you had to click "Proceed to localhost (unsafe)", the certificate is
not trusted and the console will not be clean.

---

## 5. Console check procedure

The **browser console** is the page's log window: F12 (or Ctrl+Shift+I / Cmd+Opt+I)
→ _Console_ tab. Treat it like `stderr` for the page.

For every page, in every browser:

1. Open the console **before** navigating, so nothing is missed on load.
2. Set the filter to show _Errors_ and _Warnings_ (Chrome: the level dropdown;
   Firefox: the toggle buttons in the console toolbar). Leave _Info_ / _Logs_
   on too the first time — they are not forbidden, but they hint at noise.
3. Load the page, then perform the flow listed in the feature matrix.
4. Switch language (en → es → nl) and theme once on the page.
5. Read the console. Anything red or yellow is a finding: screenshot it, copy
   the exact message, and record it in section 7 and section 8.
6. Reload the page once more (Ctrl+R) and check again — hydration warnings and
   service-worker errors often only show on a second load.

What counts as a finding:

- Any `console.error`, `console.warn`, uncaught exception, unhandled promise
  rejection, failed network request (red in the Network tab that also logs to
  the console), or React warning ("Hydration failed…", "Each child in a list
  should have a unique key…").
- Firefox logs CSS parse warnings for vendor-prefixed rules it does not know
  (e.g. `-webkit-…`). See [BS-4](#bs-4-firefox-css-parse-warnings) for how these
  are handled.

---

## 6. Feature matrix

Legend: ✅ works (checked by hand in the real browser) · 🤖 passes in the e2e
suite (section 10) on that engine; the real browser is still to be confirmed ·
⚠️ works with a note (link the BS-number) · ❌ broken (link the BS-number) ·
— not tested yet.

Rows are grouped by area; routes refer to `apps/frontend/src/routes/`.

### Public pages

| Feature                                                         | Route               | Chrome | Firefox | Edge | Safari |
| --------------------------------------------------------------- | ------------------- | ------ | ------- | ---- | ------ |
| Home: hero, featured events, stats, how-it-works, FAQ accordion | `/`                 | —      | —       | —    | —      |
| Footer links (Privacy, Terms, Contact)                          | all pages           | —      | —       | —    | —      |
| Events list renders                                             | `/events`           | 🤖     | 🤖      | —    | 🤖     |
| Events: text search                                             | `/events`           | —      | —       | —    | —      |
| Events: category filter                                         | `/events`           | —      | —       | —    | —      |
| Events: sort                                                    | `/events`           | —      | —       | —    | —      |
| Events: pagination                                              | `/events`           | —      | —       | —    | —      |
| Event detail page                                               | `/events/$eventId`  | 🤖     | 🤖      | —    | 🤖     |
| Contact page + form validation                                  | `/contact`          | —      | —       | —    | —      |
| Privacy Policy (full content, not placeholder)                  | `/privacy-policy`   | —      | —       | —    | —      |
| Terms of Service (full content, not placeholder)                | `/terms-of-service` | —      | —       | —    | —      |
| 404 page                                                        | `/does-not-exist`   | 🤖     | 🤖      | —    | 🤖     |

### Authentication

| Feature                                                            | Route                          | Chrome    | Firefox | Edge | Safari    |
| ------------------------------------------------------------------ | ------------------------------ | --------- | ------- | ---- | --------- |
| Signup form: validation messages (empty, bad email, weak password) | `/signup`, `/create-account`   | —         | —       | —    | —         |
| Signup: successful account creation                                | `/signup`, `/create-account`   | 🤖        | 🤖      | —    | 🤖        |
| Login: wrong password shows error                                  | `/login`                       | 🤖 (BS-6) | 🤖      | —    | 🤖 (BS-6) |
| Login: success, redirected, navbar shows user menu                 | `/login`                       | 🤖        | 🤖      | —    | 🤖        |
| Session survives page reload (Ctrl+R)                              | any                            | 🤖        | 🤖      | —    | 🤖        |
| Session survives browser restart                                   | any                            | —         | —       | —    | —         |
| Logout                                                             | user menu                      | 🤖        | 🤖      | —    | 🤖        |
| Forgot password: email arrives in Mailpit                          | `/forgot-password`             | —         | —       | —    | —         |
| Reset password via emailed link                                    | `/reset-password`              | —         | —       | —    | —         |
| 2FA setup: QR code renders, secret can be copied                   | `/profile` (TwoFactorSettings) | —         | —       | —    | —         |
| 2FA verify: typing the 6-digit code                                | `/verify-2fa`                  | —         | —       | —    | —         |
| 2FA verify: pasting the 6-digit code                               | `/verify-2fa`                  | —         | —       | —    | —         |
| 2FA disable                                                        | `/profile`                     | —         | —       | —    | —         |

### Logged-in user

| Feature                                                   | Route              | Chrome | Firefox | Edge | Safari |
| --------------------------------------------------------- | ------------------ | ------ | ------- | ---- | ------ |
| Profile page shows user info                              | `/profile`         | —      | —       | —    | —      |
| Edit profile fields                                       | `/profile`         | —      | —       | —    | —      |
| Avatar upload: file picker opens, preview shows           | `/profile`         | —      | —       | —    | —      |
| Avatar upload: rejected file type / too large shows error | `/profile`         | —      | —       | —    | —      |
| Create event: date picker                                 | `/create-event`    | 🤖     | 🤖      | —    | 🤖     |
| Create event: category combobox                           | `/create-event`    | 🤖     | 🤖      | —    | 🤖     |
| Create event: image upload + preview                      | `/create-event`    | 🤖     | 🤖      | —    | 🤖     |
| Create event: validation errors                           | `/create-event`    | —      | —       | —    | —      |
| Create event: success, appears in list                    | `/create-event`    | 🤖     | 🤖      | —    | 🤖     |
| My events: list, edit dialog, delete confirm dialog       | `/my-events`       | —      | —       | —    | —      |
| Register for an event / cancel registration               | `/events/$eventId` | —      | —       | —    | —      |
| My tickets                                                | `/my-tickets`      | —      | —       | —    | —      |
| Toast notifications (create / save / delete)              | any mutation       | —      | —       | —    | —      |

### Admin

| Feature                                   | Route    | Chrome | Firefox | Edge | Safari |
| ----------------------------------------- | -------- | ------ | ------- | ---- | ------ |
| Non-admin is refused                      | `/admin` | 🤖     | 🤖      | —    | 🤖     |
| Users table: search, edit dialog, delete  | `/admin` | —      | —       | —    | —      |
| Events table: search, edit dialog, delete | `/admin` | —      | —       | —    | —      |

### Real-time (two browsers side by side, user A and user B)

| Feature                                                             | Chrome | Firefox | Edge | Safari |
| ------------------------------------------------------------------- | ------ | ------- | ---- | ------ |
| A sees B come online / go offline                                   | 🤖     | 🤖      | —    | —      |
| Chat: A sends, B receives without reload                            | 🤖     | 🤖      | —    | —      |
| Chat: B replies, A receives                                         | —      | —       | —    | —      |
| Notification toast arrives on the other side                        | —      | —       | —    | —      |
| Event created by A appears for B without reload                     | —      | —       | —    | —      |
| Three tabs open in the same browser — all still live                | —      | —       | —    | —      |
| Reconnects after backend restart (`docker compose restart backend`) | —      | —       | —    | —      |

### Cross-cutting (check on every page group above)

| Feature                                                         | Chrome | Firefox | Edge | Safari |
| --------------------------------------------------------------- | ------ | ------- | ---- | ------ |
| Language switcher: en / es / nl, whole page changes             | —      | —       | —    | —      |
| Language persists after reload                                  | —      | —       | —    | —      |
| Dark / light theme toggle, no flash on reload                   | —      | —       | —    | —      |
| Layout at 375 px wide (phone) (BS-15)                           | —      | —       | —    | —      |
| Layout at 768 px wide (tablet)                                  | —      | —       | —    | —      |
| Layout at 1280 px wide (desktop)                                | —      | —       | —    | —      |
| Mobile navigation (sheet / drawer) opens and closes (BS-15)     | —      | —       | —    | —      |
| Keyboard only: Tab order, Enter activates, Esc closes dialogs   | —      | —       | —    | —      |
| Dialog open: background does not scroll, focus stays inside     | —      | —       | —    | —      |
| Fonts (Inter Variable) load, no layout jump                     | —      | —       | —    | —      |
| Custom scrollbars / scroll areas usable                         | —      | —       | —    | —      |
| No service worker registered (DevTools → Application / Storage) | —      | —       | —    | —      |
| Certificate accepted with no warning page                       | —      | —       | —    | —      |

---

## 7. Console cleanliness per page

One row per route, per browser. ✅ = console empty after the page's flow from
section 6, including one reload. Otherwise link the BS-number.

🤖 = checked by the e2e suite (section 10) on 2026-09-18: the route was opened
and reloaded in headless Chromium, Firefox and WebKit, and nothing except the
linked network lines reached the console. ✅ = additionally confirmed by hand in
the real browser. — = not yet checked in that browser.

| Route               | Chrome    | Firefox    | Edge | Safari (WebKit) |
| ------------------- | --------- | ---------- | ---- | --------------- |
| `/`                 | 🤖        | 🤖         | —    | 🤖              |
| `/events`           | 🤖        | 🤖         | —    | 🤖              |
| `/events/$eventId`  | 🤖        | 🤖         | —    | 🤖              |
| `/contact`          | 🤖        | 🤖         | —    | 🤖              |
| `/privacy-policy`   | 🤖        | 🤖         | —    | 🤖              |
| `/terms-of-service` | 🤖        | 🤖         | —    | 🤖              |
| `/signup`           | 🤖        | 🤖         | —    | 🤖              |
| `/create-account`   | 🤖        | 🤖         | —    | 🤖              |
| `/login`            | 🤖 (BS-6) | 🤖         | —    | 🤖 (BS-6)       |
| `/forgot-password`  | 🤖        | 🤖         | —    | 🤖              |
| `/reset-password`   | 🤖        | 🤖         | —    | 🤖              |
| `/verify-2fa`       | 🤖        | 🤖         | —    | 🤖              |
| `/profile`          | 🤖        | 🤖         | —    | 🤖              |
| `/create-event`     | 🤖        | 🤖 (BS-14) | —    | 🤖              |
| `/my-events`        | 🤖        | 🤖         | —    | 🤖              |
| `/my-tickets`       | 🤖        | 🤖         | —    | 🤖              |
| `/admin`            | 🤖        | 🤖         | —    | 🤖              |
| 404 page            | 🤖 (BS-8) | 🤖         | —    | 🤖 (BS-8)       |

The protected routes (`/profile` … `/admin`) are checked both logged out (the
redirect to `/login`) and, through the flows in section 10, logged in.

---

## 8. Known issues and browser-specific limitations

Numbered `BS-n`. Status is one of **Open**, **Fixed** (link the commit/PR), or
**By design** (a limitation we document rather than fix).

### BS-1: Service worker registration fails when the certificate is not trusted

- **Status:** Fixed — the PWA service worker was removed on branch
  `test/browser-compatibility`. To be re-verified in Chrome on the school PC.
- **Browsers:** Chrome (confirmed, 2026-09-18, school PC). Expected in Edge and
  Firefox as well — all browsers refuse to install a service worker from an
  origin whose certificate has errors, even after the user clicks through the
  warning page.
- **Symptom:** on every page load, the console showed

  ```
  Uncaught (in promise) SecurityError: Failed to register a ServiceWorker for
  scope ('https://localhost:3000/') with script ('https://localhost:3000/sw.js'):
  An SSL certificate error occurred when fetching the script.
  ```

  After handling the rejected promise with `.catch(() => {})` the _Uncaught_
  line went away, but Chrome still logged
  `An SSL certificate error occurred when fetching the script.` on its own.
  That line comes from the browser's service-worker machinery, not from our
  JavaScript, so it cannot be silenced from code.

- **Root cause:**
  1. The mkcert root CA is not in the browser's trust store on that machine, so
     the browser treats `https://localhost:3000` as having a certificate error.
     Normal page loads still work once the warning page is clicked through, but
     service workers are held to a stricter rule: the browser never installs
     one from an origin with certificate errors.
  2. The frontend registered a service worker on every page
     (`PwaRegistration` in `apps/frontend/src/routes/__root.tsx`, generated by
     the `vite-plugin-pwa` plugin in `apps/frontend/vite.config.ts`). The PWA
     module is not one we claim, nothing else in the app depended on the
     worker, and it only cached static assets — so it was pure risk for the
     mandatory "no errors in the console" rule.
- **Why it matters:** an evaluator who clicks through the certificate warning
  hits this error on every page, which fails the mandatory rule before any
  feature is looked at.
- **Fix:** the service worker registration, the `vite-plugin-pwa` plugin, the
  dependency and `public/manifest.json` were removed. No script is fetched from
  the origin outside the normal page bundle, so certificate trust now only
  decides whether the browser shows its warning page.
- **After the fix, on a browser that had the old worker installed:** the
  browser keeps a previously registered worker until it is removed. On a
  machine that ran the site before this fix with a trusted certificate, open
  DevTools → Application → Service Workers → _Unregister_ (or _Clear site
  data_) once. Fresh browsers and the school PC (where registration always
  failed) need nothing.

### BS-2: Tailwind v4 minimum browser versions

- **Status:** By design
- **Browsers:** Chrome < 111, Firefox < 128, Safari < 16.4, and any browser
  without `@property` / `color-mix()` / cascade layers.
- **Symptom:** pages render with missing colours, spacing and layout.
- **Root cause:** Tailwind CSS v4 targets these versions as its floor and does
  not ship fallbacks.
- **Decision:** supported browsers are the current stable releases listed in
  section 2. Older versions are out of scope and this is stated in the README.

### BS-3: `mkcert` and `certutil` must be installed on the host

- **Status:** By design (setup limitation)
- **Browsers:** Chrome and Edge on Linux, Firefox on every OS (all read NSS
  trust stores).
- **Symptom:** `bash scripts/generate-certs.sh` either exits with
  `Error: mkcert is required` or prints
  `Warning: "certutil" is not available, so the CA can't be automatically
installed in Firefox and/or Chrome/Chromium!`, and the browser keeps showing
  the certificate warning page. Before BS-1 was fixed this also produced a
  console error on every page.
- **Root cause:** the repository provides no toolchain for these two programs.
  `mkcert` generates the certificate; `certutil` (from `libnss3-tools`) is what
  mkcert uses to write the NSS trust stores that Chrome-on-Linux and Firefox
  read.
- **Without root (school PC):** `mkcert` is a single binary — download the
  Linux release from <https://github.com/FiloSottile/mkcert/releases> into
  `~/.local/bin` and `chmod +x` it. `certutil` normally comes from the
  `libnss3-tools` system package; if it is not already installed and there is
  no sudo, the trust stores cannot be written on that machine. In that case
  click through the warning page once per session — with BS-1 fixed the
  console stays clean.
- **With root / own machine:** `apt install libnss3-tools mkcert` (Debian and
  Ubuntu) or `brew install mkcert nss` (macOS), then run the script.

### BS-4: Firefox CSS parse warnings

- **Status:** Open — to be confirmed during the Firefox pass
- **Browsers:** Firefox
- **Symptom (expected):** the console's _CSS_ category shows warnings such as
  `Unknown property '-webkit-…'` or `Error in parsing value for '…'` coming from
  the generated Tailwind / shadcn stylesheet.
- **Root cause:** Firefox reports every CSS declaration it cannot parse. Vendor
  prefixes for other engines are harmless and ignored by Firefox.
- **Decision (to be taken by the team once confirmed):** either strip the
  offending declarations from the build, or record here that CSS-category parse
  warnings for foreign vendor prefixes are not considered application warnings,
  with a screenshot showing the JS console is clean with the CSS filter off.

### BS-5: Firefox needs a restart after trusting the certificate

- **Status:** By design
- **Browsers:** Firefox
- **Symptom:** after running `scripts/generate-certs.sh`, Firefox still shows
  the certificate warning.
- **Root cause:** Firefox reads its trust store at startup.
- **Workaround:** fully quit Firefox (all windows) and reopen it.

### BS-6: Chrome logs the `401` of a failed login as a console error

- **Status:** By design
- **Browsers:** Chrome (confirmed, 2026-09-18). Edge shares the same DevTools
  and behaves identically; Firefox shows the failed request in the _Network_
  tab and, depending on settings, as an XHR line in the console.
- **Route / feature:** `/login`, "Wrong password shows an error message"
- **Steps:** 1. Open `/login`. 2. Submit a valid e-mail with a wrong password.
- **Symptom:**

  ```text
  POST https://localhost:3000/api/auth/sign-in/email 401 (Unauthorized)
  ```

  followed by `Failed to load resource: the server responded with a status of
401 ()` when the request is expanded.

- **Root cause:** the browser itself logs every HTTP response with a 4xx/5xx
  status in the console. It is not emitted by application code and cannot be
  suppressed from JavaScript. Returning `401` for bad credentials is the
  correct API behaviour (better-auth `signIn.email`).
- **Decision:** this line is a network log, not an application warning or
  error. The console filter _Hide network_ (funnel icon → "Hide network
  requests" in Chrome) removes it; with that filter on, the page must be clean.

### BS-7: Rejected form mutations surfaced as `Uncaught (in promise)`

- **Status:** Fixed on branch `test/browser-compatibility`. To be re-verified in
  Chrome on the school PC.
- **Browsers:** Chrome (confirmed, 2026-09-18, school PC). Same in every
  browser — it is an application bug, not a browser difference.
- **Route / feature:** `/login`, `/create-account`, `/forgot-password`,
  `/reset-password`, `/verify-2fa`, `/profile` (save) and the "Create event"
  form.
- **Steps:** 1. Open `/login`. 2. Submit a wrong password.
- **Symptom:** the error alert rendered correctly, but the console also showed

  ```text
  Uncaught (in promise) Error: Invalid email or password
      at Object.mutationFn (login-DAVXvgRC.js:1:2288)
  ```

- **Root cause:** the form `onSubmit` handlers did `await x.mutateAsync(...)`
  without catching the rejection. TanStack Query's `mutateAsync` rejects on
  error (unlike `mutate`), and the form library discards the returned promise,
  so the rejection became an unhandled one. The error itself was already shown
  twice — through the mutation's `error` state (the red alert) and the global
  toast in `integrations/tanstack-query/root-provider.tsx`.
- **Fix:** every `mutateAsync` call inside a form submit handler now ends with
  `.catch(() => undefined)`; the alert and the toast are unchanged. Verified in
  headless Chromium on `/login`: only the BS-6 network line remains and the
  alert still reads "Invalid email or password".

### BS-8: The 404 page's own request is logged as a console error

- **Status:** By design
- **Browsers:** Chromium and WebKit (Playwright, 2026-09-18). Firefox does not
  print failed document requests in the console.
- **Route / feature:** 404 page
- **Steps:** 1. Open a route that does not exist, e.g. `/nope`.
- **Symptom:**

  ```text
  Failed to load resource: the server responded with a status of 404 ()
  ```

- **Root cause:** the not-found page is served with HTTP status `404`, which is
  the correct status for it. As in BS-6, the browser logs any 4xx/5xx response
  itself; the application prints nothing.
- **Decision:** network log, not an application error. Hidden by the
  _Hide network_ console filter. The e2e suite allows exactly this line on the
  404 route and nothing else.

### BS-9: `/reset-password` without a token answered with a 500

- **Status:** Fixed on branch `test/browser-compatibility`. To be re-verified in
  Chrome on the school PC.
- **Browsers:** all — found by the e2e console suite in Chromium, Firefox and
  WebKit (2026-09-18).
- **Route / feature:** `/reset-password`
- **Steps:** 1. Type `https://localhost:3000/reset-password` in the address bar
  (no `?token=`).
- **Symptom:** blank error page; console showed

  ```text
  Failed to load resource: the server responded with a status of 500 ()
  Error: [ { "expected": "string", "code": "invalid_type", "path": [ "token" ], … } ]
  ```

- **Root cause:** the route declared `token` as a required search parameter.
  With the parameter absent, search validation threw during server rendering
  and the request failed with `500`.
- **Fix:** `token` is now optional in the search schema and the route's
  `beforeLoad` redirects to `/forgot-password` when it is missing, so the user
  can request a new link. Links from the reset e-mail are unchanged.

### BS-10: Auth requests answered with `429 Too Many Requests`

- **Status:** By design
- **Browsers:** all — the limit is enforced by the backend. Found by the e2e
  suite (2026-09-18) when three engines signed up in parallel.
- **Route / feature:** `/login`, `/signup`, `/create-account`,
  `/forgot-password`, `/reset-password`, password / e-mail change on `/profile`.
- **Steps:** 1. Submit the login form four times within 10 seconds from the
  same machine.
- **Symptom:** the form shows "Too many requests"; the console shows the
  browser's own network line

  ```text
  Failed to load resource: the server responded with a status of 429 ()
  ```

- **Root cause:** better-auth rate-limits sign-in, sign-up and password-change
  routes to 3 requests per 10 seconds per client address, and the
  password-reset routes to 3 per minute. This is protection against
  credential guessing, and the correct response for it is `429`.
- **Decision:** as in BS-6 the line is a network log. The form reports the
  refusal in its alert instead of swallowing it. The e2e suite waits out the
  window and submits again when it hits the limit, and allows exactly this
  line.

### BS-11: Firefox logged a caught loader error when leaving a page mid-load

- **Status:** Fixed on branch `test/browser-compatibility`
  (`apps/frontend/src/client.tsx`).
- **Browsers:** Firefox only (confirmed 2026-09-18, Playwright Firefox).
  Chrome and Safari leave the aborted requests pending instead of rejecting
  them.
- **Route / feature:** any route whose loader is still running when the user
  navigates away — easiest on `/`, which loads featured events and stats after
  the HTML arrives.
- **Steps:** 1. Open `/`. 2. Before the event cards appear, type `/events` in
  the address bar and press Enter.
- **Symptom:**

  ```text
  TypeError: NetworkError when attempting to fetch resource.
  ```

  printed as `console.error` on the page being left.

- **Root cause:** Firefox aborts a page's in-flight requests as soon as a full
  navigation starts. The route loader's `fetch` rejects, the route's error
  boundary catches it, and React 19 reports every _caught_ error to the console
  through its default `onCaughtError` handler.
- **Fix:** the frontend now ships its own client entry
  (`apps/frontend/src/client.tsx`) that sets a flag on `beforeunload` and
  passes an `onCaughtError` to `hydrateRoot` which stays silent once the page
  is being left. Errors caught while the page is in use are still reported.
  The e2e test "leaving a page while it is still loading logs nothing" covers
  this in all three engines.

### BS-12: Firefox reports images and fonts interrupted by a navigation

- **Status:** By design
- **Browsers:** Firefox only (confirmed 2026-09-18, Playwright Firefox).
- **Route / feature:** any navigation away from a page that is still
  downloading images or the Inter Variable font.
- **Steps:** as BS-11.
- **Symptom:**

  ```text
  [JavaScript Error: "Image corrupt or truncated." {file: "https://localhost:3000/assets/halfway_image-….png"}]
  downloadable font: download failed (font-family: "Inter Variable" …): status=2152398850
  ```

- **Root cause:** the same abort as BS-11, but reported by Firefox's image and
  font decoders rather than by JavaScript. `2152398850` is
  `NS_BINDING_ABORTED` — "the download was cancelled", which is what a
  navigation does. The files are valid; both load without complaint when the
  page is left alone.
- **Decision:** browser-generated, not emitted by the application, and only
  visible when the user leaves a page before it finishes loading. The e2e
  interrupted-navigation test allows these two lines and nothing else.

### BS-13: Server-side calls to the backend lacked the visitor's address

- **Status:** Fixed on branch `test/browser-compatibility`
  (`apps/frontend/src/lib/forwarded-headers.ts`).
- **Browsers:** all — a backend/frontend bug that browser testing exposed
  (2026-09-18, four Firefox workers in parallel).
- **Route / feature:** every page. Most visible on `/login`: after a correct
  password the user stayed on `/login`, and `/profile` opened as a visitor.
- **Steps:** 1. Have a handful of browsers open pages at the same time (the
  e2e suite with four workers is enough). 2. Log in with a valid password.
- **Symptom:** no console output at all — the login silently did not stick.
  The frontend container logged
  `Could not read the authentication session: Too many requests.`
- **Root cause:** the frontend server renders pages and, to do so, asks the
  backend for the visitor's session (`/api/auth/get-session`) on the visitor's
  behalf. Those calls carried the visitor's cookie but not the visitor's
  address (`X-Forwarded-For`, which Caddy sets on the browser's own requests).
  The backend rate-limits per address; with no address, every visitor's
  session lookups were counted in one shared bucket (100 per 10 seconds).
  Once it filled, the lookup was answered `429`, the frontend treated that as
  "no session", and the protected route redirected to `/login`.
- **Fix:** `getForwardedRequestHeaders()` now forwards both the cookie and
  `X-Forwarded-For` for the session lookup and for server-side tRPC calls, so
  each visitor is limited on their own address, exactly as their browser
  requests are. The e2e runner is capped at two workers because all of them
  do share one address.

### BS-14: Firefox "scroll-linked positioning effect" note on `/create-event`

- **Status:** Reduced on branch `test/browser-compatibility`
  (`EventDatePicker.tsx`); the remainder is by design.
- **Browsers:** Firefox only (confirmed 2026-09-18, Playwright Firefox).
- **Route / feature:** `/create-event` — category combobox and date picker.
- **Steps:** 1. Open the category list or the calendar. 2. Scroll the page
  while it is open.
- **Symptom:** once per page load,

  ```text
  This site appears to use a scroll-linked positioning effect. This may not work well with asynchronous panning; see https://firefox-source-docs.mozilla.org/performance/scroll-linked_effects.html …
  ```

- **Root cause:** both popups are anchored to their field by Floating UI (via
  Base UI), which repositions the popup during the `scroll` event so it stays
  attached to the field. Firefox flags any element whose position is changed
  from a scroll handler, because that pattern can lag behind touchpad
  scrolling. It is a performance hint, not an error, and every anchored popup
  library triggers it.
- **Fix / decision:** the calendar used to stay open after a date was picked,
  so filling in the next fields (which scrolls the page) always raised the
  note. It now closes on selection, and the note only appears if the user
  deliberately scrolls with a popup open. Playwright scrolls options and days
  into view before clicking them, so the create-event test allows this one
  line in Firefox.

### BS-15: Home and `/events` did not fit a 375 px wide screen

- **Status:** Fixed on branch `test/browser-compatibility` (`Navbar.tsx`,
  `Hero.tsx`, `routes/events/index.tsx`, `EventListItem.tsx`,
  `EventFilters.tsx`).
- **Browsers:** all (confirmed 2026-09-18 in Chromium, Firefox and WebKit at
  375 × 667). The layout was the same in every browser, so this was a
  responsive-layout problem (subject "Technical Requirements — Frontend"),
  not a browser difference.
- **Route / feature:** `/` — navbar and hero; `/events` — header, list and
  filters.
- **Steps:** 1. Open `/`. 2. Make the window 375 px wide (or use the device
  toolbar in DevTools). 3. Open `/events`.
- **Symptom:** the navbar links wrapped onto several lines and pushed the
  icons out of the bar; the hero text started 80 px from the left and its two
  buttons were cut off by the section's fixed height. `/events` was 817 px
  wide: the title was squeezed into a 30 % column and each event card kept
  its 160 px image beside the text, so the page scrolled sideways.
- **Root cause:** the components only had desktop classes. Tailwind is
  mobile-first, so a class without a prefix applies to every width; the
  desktop values needed the `md:` prefix and a narrower default underneath.
- **Fix:** below `md` (768 px) the navbar hides the inline links and shows a
  menu button that opens a drawer (`Sheet`) with the same links; the drawer
  closes when a link is followed. The hero uses smaller margins, padding and
  title size, and its buttons wrap. On `/events` the orange column is gone,
  the header sits in its own orange block, the sort and filters stack above
  the list, and each card puts the image above the text with the date in a
  small orange tile. Nothing changes from `md` upwards. No route wider than
  its viewport remains at 375 px (all routes measured with
  `document.documentElement.scrollWidth`).

_Add new entries below as `BS-16`, `BS-17`, … using the template in section 9._

---

## 9. Reporting a browser issue

Copy this block into section 8 (and into a GitHub issue labelled
`browser-support`):

```markdown
### BS-n: <one-line title>

- **Status:** Open
- **Browsers:** <browser + version, OS> — <other browsers checked: ok / same>
- **Route / feature:** <route and the matrix row>
- **Steps:** 1. … 2. … 3. …
- **Symptom:** <what you saw; paste the exact console message in a code block; attach screenshot>
- **Root cause:** <fill in once known>
- **Workaround:** <if any>
- **Proposed fix:** <if known>
```

Always paste the console message verbatim — the wording differs per browser
and is what makes the issue searchable.

---

## 10. Automation

Status: **console checks and core flows automated** with
[Playwright](https://playwright.dev/), a test runner that launches real
Chromium, Firefox and WebKit (Safari's engine) builds, drives them through the
site and reads their console. It repeats the mechanical part of sections 6 and
7 in about two minutes per engine so the manual matrix cannot silently go
stale. Last full run: 2026-09-18, 72 tests (24 per engine), all passing.

### What is covered

| File                       | What it checks                                                                                                                                                                                                                                                                                                       |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `e2e/console.spec.ts`      | Every route of section 7, including `/events/$eventId` (first event listed) and the 404 page. Each route is opened, then reloaded; the test fails on any `console.warn`, `console.error` or uncaught exception. Protected routes are visited logged out. Plus leaving `/` before it finished loading (BS-11, BS-12). |
| `e2e/login.spec.ts`        | Wrong password on `/login`: the error alert appears and nothing except the BS-6 network line reaches the console (guards against BS-7).                                                                                                                                                                              |
| `e2e/auth.spec.ts`         | Signup with a fresh account → session survives a reload → logout → login with the same credentials. Forgot-password form accepts a request (the reset link is only written to the backend log, so the e-mail side is manual).                                                                                        |
| `e2e/create-event.spec.ts` | Logged in, creates an event with an uploaded image, a category from the combobox, a date from the calendar, time and capacity; the event page shows it, also after a reload (BS-14).                                                                                                                                 |
| `e2e/realtime.spec.ts`     | Two users in **two different engines** (the engine under test plus Chromium or Firefox): both show as online, a chat message sent by one appears for the other without a reload and survives a client-side navigation. Both consoles must stay clean.                                                                |
| `e2e/accounts.ts`          | Helpers: `uniqueAccount`, `signUp`, `logIn`, `logOut`. Every run creates its own accounts, so no seed data is needed and the suite can run repeatedly. Waits out the auth rate limit (BS-10) instead of failing on it.                                                                                               |
| `e2e/console.ts`           | The shared fixture: records console output per page, and `expectCleanConsole(recorder, allow)`. Every pattern passed to `allow` must point at a `BS-n` entry in section 8.                                                                                                                                           |
| `playwright.config.ts`     | One _project_ (Playwright's word for "same tests, different browser") per engine: `chromium`, `firefox`, `webkit`. `ignoreHTTPSErrors` is on so the run does not depend on the host trust store. Two workers, because they share one address (BS-13).                                                                |

### Running it

The suite runs against the Compose stack, not the dev server:

```bash
vp run test:e2e:install     # once per machine: downloads the three browsers (~500 MB)
vp run deploy:detached      # build and start https://localhost:3000
vp run test:e2e             # all three engines
./node_modules/.bin/playwright test --project chromium          # one engine
./node_modules/.bin/playwright test --project chromium --headed # watch it
./node_modules/.bin/playwright show-report                      # HTML report of the last run
```

On Linux the browsers may need system libraries:
`./node_modules/.bin/playwright install-deps` (requires `sudo`). If that is not
possible, run `--project chromium --project firefox`; WebKit needs the
libraries. On the school PCs, keep the browser downloads out of the home
directory:

```bash
PLAYWRIGHT_BROWSERS_PATH=/goinfre/$USER/ms-playwright vp run test:e2e:install
PLAYWRIGHT_BROWSERS_PATH=/goinfre/$USER/ms-playwright ./node_modules/.bin/playwright test --project chromium --project firefox
```

The installed Google Chrome and Microsoft Edge can be used as extra projects
when they exist on the machine:

```bash
E2E_CHANNELS=chrome,msedge vp run test:e2e
```

Point the suite at another deployment with `E2E_BASE_URL=https://host:port`.

### What it does not replace

- The manual pass in sections 6 and 7. The evaluator opens real Chrome; the
  Playwright Chromium build is not "latest stable Chrome". Fill the matrices
  from the real browsers.
- Safari and Edge as products. WebKit is Safari's engine, not Safari; Edge only
  runs when installed (`E2E_CHANNELS=msedge`).
- Anything outside the page: certificate trust, the Firefox restart (BS-5),
  rendering differences, native pickers (file dialog, `<input type="time">`),
  2FA with a real authenticator app.

### Still to do

- Register for an event → shows in `/my-tickets`; edit and delete in
  `/my-events`; the admin tables.
- Forgot-password end to end once the reset link is delivered somewhere a test
  can read it (Mailpit's API, `GET http://localhost:8025/api/v1/messages`).
- A CI job in `.github/workflows/ci.yml` (Playwright installs the three engines
  on `ubuntu-latest`; Edge via `playwright install msedge`).

---

## 11. Evaluation checklist

Before the defense:

- [ ] Google Chrome (latest stable), Firefox and Edge installed on the defense
      machine; versions recorded in section 2.
- [ ] `scripts/generate-certs.sh` run on the defense machine, browsers
      restarted, lock icon confirmed in all three.
- [ ] `vp run deploy` stack up; seed accounts from section 3 known to the whole
      team.
- [ ] Section 7 fully ✅ in Chrome (mandatory).
- [ ] Section 6 fully filled in for Firefox and Edge; every ⚠️/❌ has a BS entry.
- [ ] Section 8 has no **Open** entries that affect Chrome's console.
- [ ] README: Modules Matrix row _Extended multi-browser support_ updated with
      status and a link to this document; _Instructions_ mention certificate
      trust; _Features List_ names the tester(s).
- [ ] Two browsers pre-logged-in as user A and user B for the real-time demo.
