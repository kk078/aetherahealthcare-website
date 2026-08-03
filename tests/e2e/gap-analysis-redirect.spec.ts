import { test, expect } from '@playwright/test';

/**
 * /gap-analysis is a client-side redirect to /free-assessment (the A/R Gap
 * Analysis moved there). These tests replace the old portal-flow suite, which
 * covered a magic-link login that no longer exists on the site.
 */

test.describe('Gap Analysis redirect', () => {
  test('redirects /gap-analysis to /free-assessment', async ({ page }) => {
    await page.goto('/gap-analysis');
    await page.waitForURL(/\/free-assessment\/?$/, { timeout: 15_000 });
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/A\/R Analysis|Assessment/i);
  });

  test('free-assessment renders the report form', async ({ page }) => {
    await page.goto('/free-assessment');
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByRole('button', { name: /generate my free report/i })).toBeVisible();
  });
});
