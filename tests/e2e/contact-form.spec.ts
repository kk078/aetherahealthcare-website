import { test, expect } from '@playwright/test';

/**
 * Contact form E2E tests
 * Uses a throwaway test email so no real leads are polluted.
 */

const TEST_EMAIL = `e2e-test-${Date.now()}@example.com`;

test.describe('Contact Form', () => {
  test('renders all required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send|submit/i })).toBeVisible();
  });

  test('shows validation error when submitted empty', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: /send|submit/i }).click();
    // HTML5 required or custom validation should fire
    const nameField = page.getByLabel(/name/i);
    const validationMessage = await nameField.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage.length).toBeGreaterThan(0);
  });

  test('honeypot field is hidden from users', async ({ page }) => {
    await page.goto('/contact');
    const honeypot = page.locator('input[name="website"], input[name="_gotcha"], input[name="bot_field"]').first();
    if (await honeypot.count() > 0) {
      await expect(honeypot).not.toBeVisible();
    }
  });

  test('submits successfully and shows confirmation', async ({ page }) => {
    await page.goto('/contact');

    await page.getByLabel(/name/i).fill('E2E Test Provider');
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    // Fill phone if present
    const phone = page.getByLabel(/phone/i);
    if (await phone.count() > 0) await phone.fill('555-000-0001');
    await page.getByLabel(/message/i).fill('Automated E2E test submission — please ignore');

    await page.getByRole('button', { name: /send|submit/i }).click();

    // Should see a success state — text varies but look for positive signal
    await expect(
      page.getByText(/thank you|sent|received|success|we.ll be in touch/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});
