import { test, expect } from '@playwright/test';

/**
 * Contact form E2E tests.
 * The form uses react-hook-form (not native validation), so empty submits are
 * asserted via the rendered error messages.
 *
 * The real-submission test POSTs a live lead (Web3Forms email + CRM record), so
 * it only runs when E2E_LIVE_SUBMIT=1 is set — never on routine CI runs.
 */

const TEST_EMAIL = `e2e-test-${Date.now()}@example.com`;

test.describe('Contact Form', () => {
  test('renders all required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Practice or Organization')).toBeVisible();
    await expect(page.getByLabel('Email Address').first()).toBeVisible();
    await expect(page.getByLabel('Phone Number').first()).toBeVisible();
    await expect(page.getByLabel('Medical Specialty').first()).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
    await expect(page.locator('form').getByRole('button', { name: /send|submit/i })).toBeVisible();
  });

  test('shows validation errors when submitted empty', async ({ page }) => {
    await page.goto('/contact');
    await page.locator('form').getByRole('button', { name: /send|submit/i }).click();
    await expect(page.getByText('Name is required')).toBeVisible();
    await expect(page.getByText('Practice is required')).toBeVisible();
    await expect(page.getByText('Message is required')).toBeVisible();
  });

  test('honeypot field is hidden from users', async ({ page }) => {
    await page.goto('/contact');
    const honeypot = page.locator('input[name="hp_field"]').first();
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).not.toBeInViewport();
  });

  test('submits successfully and shows confirmation', async ({ page }) => {
    test.skip(!process.env.E2E_LIVE_SUBMIT, 'Set E2E_LIVE_SUBMIT=1 to run the live-submission test (creates a real lead).');
    await page.goto('/contact');

    await page.getByLabel('Full Name').fill('E2E Test Provider');
    await page.getByLabel('Practice or Organization').fill('E2E Test Practice');
    await page.getByLabel('Email Address').first().fill(TEST_EMAIL);
    await page.getByLabel('Phone Number').first().fill('555-000-0001');
    await page.getByLabel('Medical Specialty').first().selectOption({ index: 1 });
    await page.getByLabel('Message').fill('Automated E2E test submission — please ignore');

    await page.locator('form').getByRole('button', { name: /send|submit/i }).click();

    await expect(
      page.getByText(/thank you|sent|received|success|we.ll be in touch/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});
