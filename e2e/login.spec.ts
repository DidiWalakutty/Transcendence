import { expect, expectCleanConsole, settle, test } from './console';

// BS-6: the browser itself logs the failed response of a bad login. It is a
// network log, not application output. Repeated attempts are rate limited by
// the backend and answered with 429 instead of 401.
const failedLoginNetworkLog =
  /Failed to load resource: the server responded with a status of (401|429)/;

test('wrong password shows the error and leaves the console clean', async ({
  page,
  console: recorder,
}) => {
  await page.goto('/login');
  // The inputs are controlled by React; typing before hydration is lost.
  await settle(page);

  await page.locator('input[name="email"]').fill('nobody@example.com');
  await page.locator('input[name="password"]').fill('definitely-wrong-1');
  await page.locator('form button[type="submit"]').click();

  await expect(page.getByRole('alert')).toContainText(
    /invalid email or password|too many requests/i,
  );

  // BS-7: the rejected mutation must not surface as an uncaught promise.
  expectCleanConsole(recorder, [failedLoginNetworkLog]);
});
