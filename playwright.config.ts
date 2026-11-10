import { defineConfig, devices } from '@playwright/test';
import { env, TEST_ID_ATTRIBUTE } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  globalSetup: './src/setup/global-setup.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // The target is a shared public server: be gentle with it and tolerate a one-off hiccup.
  // A test that passes only on retry is reported as "flaky" in the HTML report.
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 2 : 4,
  timeout: 60_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    toHaveScreenshot: { animations: 'disabled', maxDiffPixelRatio: 0.01 },
  },
  use: {
    baseURL: env.baseURL,
    // Toolshop marks elements with data-test, so getByTestId('email') matches data-test="email"
    testIdAttribute: TEST_ID_ATTRIBUTE,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: env.apiURL },
    },
    // Baselines are rendered on the Linux CI runner, and fonts differ between operating systems,
    // so this project only exists in CI. Locally the visual tests are simply not part of the run.
    ...(process.env.CI
      ? [
          {
            name: 'visual',
            testDir: './tests/visual',
            use: { ...devices['Desktop Chrome'] },
          },
        ]
      : []),
  ],
});
