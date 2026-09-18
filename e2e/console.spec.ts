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

  const link = page.locator('a[href^="/events/"]').first();
  const href = await link.getAttribute('href');

  test.skip(href === null, 'no event listed; seed the database first');

  await page.goto(href as string);
  await settle(page);

  await page.reload();
  await settle(page);

  await expect(page).toHaveURL(new RegExp(`${href}$`));
  expectCleanConsole(recorder);
});
