import { type Browser, chromium, firefox } from '@playwright/test';
import { expect, expectCleanConsole, recordConsole, settle, test } from './console';
import { rateLimitNetworkLog, signUp, uniqueAccount } from './accounts';

// Chat between two users in two different browser engines: the engine the
// test runs in, plus the other one.
test('chat message reaches a user in another browser', async ({
  page,
  browserName,
  console: recorder,
}) => {
  const otherType = browserName === 'firefox' ? chromium : firefox;
  const other: Browser = await otherType.launch();
  const otherContext = await other.newContext({ ignoreHTTPSErrors: true });
  const otherPage = await otherContext.newPage();
  const otherRecorder = recordConsole(otherPage);

  try {
    const alice = uniqueAccount('alice');
    const bob = uniqueAccount('bob');
    await Promise.all([signUp(page, alice), signUp(otherPage, bob)]);

    for (const p of [page, otherPage]) {
      await p.getByRole('button', { name: 'Chat', exact: true }).click();
      await expect(p.getByText('online', { exact: true })).toBeVisible();
    }

    const text = `hello from ${browserName} ${Date.now()}`;
    await page.getByPlaceholder('Say something').fill(text);
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(otherPage.getByText(text)).toBeVisible();
    await expect(otherPage.getByText(alice.name)).toBeVisible();
    await expect(page.getByText(text)).toBeVisible();

    // Chat survives client-side navigation on the receiving side.
    await otherPage
      .getByRole('link', { name: /events/i })
      .first()
      .click();
    await settle(otherPage);
    await expect(otherPage.getByText(text)).toBeVisible();

    expectCleanConsole(recorder, [rateLimitNetworkLog]);
    expectCleanConsole(otherRecorder, [rateLimitNetworkLog]);
  } finally {
    await otherContext.close();
    await other.close();
  }
});
