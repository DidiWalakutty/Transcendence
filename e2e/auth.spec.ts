import { expect, expectCleanConsole, settle, test } from './console';
import {
  expectLoggedIn,
  logIn,
  logOut,
  rateLimitNetworkLog,
  signUp,
  uniqueAccount,
} from './accounts';

test('signup, session across reload, logout, login', async ({ page, console: recorder }) => {
  const account = uniqueAccount('auth');

  await signUp(page, account);

  // The session cookie must survive a full reload.
  await page.reload();
  await settle(page);
  await expectLoggedIn(page);

  await logOut(page);

  // The same credentials work through the login form.
  await logIn(page, account);

  expectCleanConsole(recorder, [rateLimitNetworkLog]);
});

test('forgot password accepts a request', async ({ page, console: recorder }) => {
  // The reset link itself is only written to the backend log (see
  // docs/BROWSER_SUPPORT.md), so this checks the browser side of the flow.
  await page.goto('/forgot-password');
  await settle(page);

  await page.locator('input[name="email"]').fill('nobody@example.com');
  await page.locator('form button[type="submit"]').click();

  // Three requests per minute are allowed per address (BS-10); a run across
  // three engines can hit that, which the form must report, not swallow.
  await expect(
    page.getByText(/reset link has been sent/i).or(page.getByRole('alert')),
  ).toBeVisible();

  expectCleanConsole(recorder, [rateLimitNetworkLog]);
});
