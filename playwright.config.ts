import { defineConfig, devices } from '@playwright/test';

// Runs against the Compose stack (`vp run deploy:detached`), not a dev server.
const baseURL = process.env.E2E_BASE_URL ?? 'https://localhost:3000';

// Playwright bundles its own Chromium and Firefox: one build of each engine
// the supported browsers use (Chrome and Edge share Chromium's). The branded
// browsers are only available when installed on the host, so they are opt-in:
//   E2E_CHANNELS=chrome,msedge vp run test:e2e
const channels = (process.env.E2E_CHANNELS ?? '').split(',').filter(Boolean);

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  // Flows wait out the auth rate limit (BS-10), which takes longer than the default.
  timeout: 120_000,
  // Every worker calls the backend from the same address. Its session lookups
  // share one 100-per-10 s bucket (BS-13), which four workers can fill.
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    // The mkcert certificate is not trusted on every machine; the console
    // checks must not depend on the host trust store.
    ignoreHTTPSErrors: true,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    ...(channels.includes('chrome')
      ? [{ name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } }]
      : []),
    ...(channels.includes('msedge')
      ? [{ name: 'msedge', use: { ...devices['Desktop Edge'], channel: 'msedge' } }]
      : []),
  ],
});
