import { type Page, expect } from '@playwright/test';
import { settle } from './console';

export interface Account {
  name: string;
  email: string;
  username: string;
  password: string;
}

// Every run creates its own accounts so the suite never depends on seeded
// data and can run repeatedly against the same database.
export function uniqueAccount(label: string): Account {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

  return {
    name: `E2E ${label}`,
    email: `e2e-${label}-${id}@example.com`,
    username: `e2e${label}${id}`.toLowerCase(),
    password: `Pw-${id}-secret`,
  };
}

// Registers `account` through the signup form. Signup needs no e-mail
// verification and signs the new user in, landing on the home page.
export async function signUp(page: Page, account: Account) {
  await page.goto('/signup');
  await settle(page); // controlled inputs; typing before hydration is lost

  await page.locator('input[name="name"]').fill(account.name);
  await page.locator('input[name="email"]').fill(account.email);
  await page.locator('input[name="username"]').fill(account.username);
  await page.locator('input[name="password"]').fill(account.password);
  await page.locator('input[name="confirmPassword"]').fill(account.password);
  await submitAuthForm(page);

  await expect(page).toHaveURL(/\/$/);
  await expectLoggedIn(page);
  await settle(page); // leaving the home page mid-load is a case of its own (BS-12)
}

export async function logIn(page: Page, account: Account) {
  await page.goto('/login');
  await settle(page);

  await page.locator('input[name="email"]').fill(account.email);
  await page.locator('input[name="password"]').fill(account.password);
  await submitAuthForm(page);

  await expectLoggedIn(page);
  await settle(page);
}

// The backend allows three sign-in / sign-up attempts per 10 s from one
// address (BS-10). Parallel tests exceed that, so a "Too many requests" reply
// is waited out and the form submitted again instead of failing the test.
// The browser logs the 429 response itself; allow it with this pattern.
export const rateLimitNetworkLog =
  /Failed to load resource: the server responded with a status of 429/;

const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_ATTEMPTS = 6;

async function submitAuthForm(page: Page) {
  const alert = page.getByRole('alert');

  for (let attempt = 1; attempt <= RATE_LIMIT_ATTEMPTS; attempt++) {
    await page.locator('form button[type="submit"]').click();

    const outcome = await Promise.race([
      expectLoggedIn(page).then(() => 'ok' as const),
      alert.waitFor({ timeout: 10_000 }).then(() => 'alert' as const),
    ]);

    if (outcome === 'ok') return;

    const message = (await alert.textContent()) ?? '';
    if (!/too many requests/i.test(message)) throw new Error(`auth form rejected: ${message}`);
    if (attempt < RATE_LIMIT_ATTEMPTS) await page.waitForTimeout(RATE_LIMIT_WINDOW_MS);
  }

  throw new Error(`still rate limited after ${RATE_LIMIT_ATTEMPTS} attempts`);
}

export async function logOut(page: Page) {
  await page.getByRole('button', { name: 'Open Profile Menu' }).click();
  await page.getByRole('menuitem', { name: 'Logout' }).click();
  await expectLoggedOut(page);
}

export async function expectLoggedIn(page: Page) {
  await expect(page.getByRole('button', { name: 'Open Profile Menu' })).toBeVisible();
}

export async function expectLoggedOut(page: Page) {
  await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
}
