import { type Page, test as base, expect } from '@playwright/test';

export interface ConsoleRecorder {
  // Every `console.warn`, `console.error` and uncaught exception, in order.
  problems: string[];
  // Everything else (`console.log`, `console.info`, …), kept for debugging.
  other: string[];
}

// Extends the Playwright `page` with a recorder of what the page wrote to the
// console. The subject requires no warnings or errors, so those are collected
// separately from informational output.
export const test = base.extend<{ console: ConsoleRecorder }>({
  console: async ({ page }, use) => {
    const recorder: ConsoleRecorder = { problems: [], other: [] };

    page.on('console', (message) => {
      const line = `console.${message.type()}: ${message.text()}`;

      if (message.type() === 'warning' || message.type() === 'error') {
        recorder.problems.push(line);
      } else {
        recorder.other.push(line);
      }
    });

    page.on('pageerror', (error) => {
      recorder.problems.push(`uncaught: ${error.message}`);
    });

    await use(recorder);
  },
});

export { expect };

// Waits until the page has finished loading and settled. `networkidle` never
// resolves while a long-lived connection (chat, presence) is open, so it is
// bounded and followed by a short grace period for late renders.
export async function settle(page: Page) {
  await page.waitForLoadState('load');
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined);
  await page.waitForTimeout(500);
}

// Asserts that nothing problematic reached the console, except lines matching
// `allow`. Every allowed pattern must correspond to a documented BS-n entry in
// docs/BROWSER_SUPPORT.md.
export function expectCleanConsole(recorder: ConsoleRecorder, allow: RegExp[] = []) {
  const unexpected = recorder.problems.filter(
    (line) => !allow.some((pattern) => pattern.test(line)),
  );

  expect(unexpected, 'console warnings / errors').toEqual([]);
}
