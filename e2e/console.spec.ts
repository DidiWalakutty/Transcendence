import { expect, expectCleanConsole, settle, test } from './console';

// BS-8: the browser logs the 404 status of the not-found page's own document
// request. It is a network log, not application output.
const notFoundNetworkLog = /Failed to load resource: the server responded with a status of 404/;

// One entry per row of "Console cleanliness per page" in
// docs/BROWSER_SUPPORT.md. `/events/$eventId` is discovered from `/events`
// below. Protected routes are visited logged out, and `/reset-password`
// without its token; their redirects must be clean as well.
const routes: { path: string; allow?: RegExp[] }[] = [
  { path: '/' },
  { path: '/events' },
  { path: '/contact' },
  { path: '/privacy-policy' },
  { path: '/terms-of-service' },
  { path: '/signup' },
  { path: '/create-account' },
  { path: '/login' },
  { path: '/forgot-password' },
  { path: '/reset-password' },
  { path: '/verify-2fa' },
  { path: '/profile' },
  { path: '/create-event' },
  { path: '/my-events' },
  { path: '/my-tickets' },
  { path: '/admin' },
  { path: '/this-route-does-not-exist', allow: [notFoundNetworkLog] },
];

for (const { path, allow } of routes) {
  test(`${path} loads and reloads without console warnings or errors`, async ({
    page,
    console: recorder,
  }) => {
    await page.goto(path);
    await settle(page);

    await page.reload();
    await settle(page);

    expectCleanConsole(recorder, allow);
  });
}

test('/events/$eventId loads and reloads without console warnings or errors', async ({
  page,
  console: recorder,
}) => {
  await page.goto('/events');
  await settle(page);

  // `count()` reads the DOM once; `getAttribute()` would wait for the link
  // until the test times out when the database has no events.
  const link = page.locator('a[href^="/events/"]').first();
  test.skip((await link.count()) === 0, 'no event listed; run `vp run db:seed` first');

  const href = (await link.getAttribute('href')) as string;

  await page.goto(href);
  await settle(page);

  await page.reload();
  await settle(page);

  await expect(page).toHaveURL(new RegExp(`${href}$`));
  expectCleanConsole(recorder);
});

// Firefox reports an image or font whose download was cut short by a
// navigation as a JavaScript error (BS-12). It comes from the browser, not from
// the page.
const interruptedImageLog = /Image corrupt or truncated/;
const interruptedFontLog = /downloadable font: download failed/;

// Firefox warnings caused by the test harness itself, not by the page: the
// first is raised by Playwright's injected script ("debugger eval code")
// reading layout before the page finished loading; the second because the
// test navigates from one origin to the next without a user gesture.
const harnessLayoutLog = /Layout was forced before the page was fully loaded/;
const harnessBounceTrackerLog = /has been classified as a bounce tracker/;

test('leaving a page while it is still loading logs nothing', async ({
  page,
  console: recorder,
}) => {
  // The home route runs loaders after the HTML arrives; navigate away before
  // they finish (BS-11).
  await page.goto('/', { waitUntil: 'commit' });
  await page.goto('/events');
  await settle(page);

  await expect(page).toHaveURL(/\/events$/);
  expectCleanConsole(recorder, [
    interruptedImageLog,
    interruptedFontLog,
    harnessLayoutLog,
    harnessBounceTrackerLog,
  ]);
});
