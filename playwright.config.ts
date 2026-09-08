import { defineConfig, devices } from '@playwright/test';

/**
 * Aethera Healthcare — Playwright E2E Configuration
 * Targets production at https://aetherahealthcare.com
 * For local dev: BASE_URL=http://localhost:3100 npx playwright test
 */

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  outputDir: process.env.PLAYWRIGHT_ARTIFACT_DIR || '/tmp/aethera-e2e-results',
  webServer: process.env.BASE_URL ? undefined : { command: 'npm run serve:export', url: 'http://localhost:3100', reuseExistingServer: false, timeout: 30000 },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { outputFolder: '/tmp/aethera-playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: '/tmp/aethera-playwright-report', open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3100',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: process.env.CI ? undefined : '/usr/bin/google-chrome',
        },
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
        launchOptions: {
          executablePath: process.env.CI ? undefined : '/usr/bin/google-chrome',
        },
      },
    },
  ],
});
