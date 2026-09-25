import path from 'node:path';
import { expect, expectCleanConsole, settle, test } from './console';
import { rateLimitNetworkLog, signUp, uniqueAccount } from './accounts';

// Firefox notes, once per page, when the page scrolls while an anchored popup
// (category list, calendar) is open and the popup follows its field (BS-14).
// Playwright scrolls options and days into view before clicking them.
const scrollLinkedLog = /scroll-linked positioning effect/;

test('create an event with an image', async ({ page, console: recorder }) => {
  await signUp(page, uniqueAccount('organiser'));

  await page.goto('/create-event');
  await settle(page);

  // Image: the file input is visually hidden but still receives files.
  await page
    .locator('input[type="file"]')
    .setInputFiles(path.join(import.meta.dirname, 'fixtures', 'event.png'));
  await expect(page.locator('img[src^="data:image/"]')).toBeVisible();

  const title = `E2E event ${Date.now()}`;
  await page.locator('input[name="title"]').fill(title);
  await page.locator('textarea[name="description"]').fill('Created by the browser test suite.');

  // Category: a multi-select combobox.
  await page.getByRole('combobox', { name: 'Category' }).click();
  await page.getByRole('option', { name: 'Games' }).click();
  await page.keyboard.press('Escape');

  await page.locator('input[name="location"]').fill('Codam');
  await page.locator('input[name="address"]').fill('Amsterdam');

  // Date: the calendar popover; pick the last enabled day shown.
  await page.locator('#date').click();
  await page
    .getByRole('gridcell')
    .filter({ hasNot: page.locator('[disabled]') })
    .last()
    .click();
  await expect(page.locator('input[name="date"]')).toHaveValue(/\d{4}-\d{2}-\d{2}/);

  await page.locator('input[name="time"]').fill('18:30');
  await page.locator('input[name="capacity"]').fill('25');

  await page.getByRole('button', { name: 'Create event' }).click();

  await expect(page).toHaveURL(/\/events\/[^/]+$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  await expect(page.locator('img[src^="data:image/"]').first()).toBeVisible();

  // The event must also come back after a fresh load.
  await page.reload();
  await settle(page);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);

  expectCleanConsole(recorder, [rateLimitNetworkLog, scrollLinkedLog]);
});
