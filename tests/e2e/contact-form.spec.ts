import { test, expect } from './fixtures';
import { CONTACT_EMAIL } from '../../src/lib/business';

// Local receipt verification; all delivery is intercepted by the shared fixture.

test.describe('Contact Form', () => {
  test('renders all required fields', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByLabel('Full Name')).toBeVisible();
    await expect(page.getByLabel('Practice or Organization')).toBeVisible();
    await expect(page.getByLabel('Email Address').first()).toBeVisible();
    await expect(page.getByLabel('Phone Number').first()).toBeVisible();
    await expect(page.getByLabel('Medical Specialty').first()).toBeVisible();
    await expect(page.getByLabel('Message', { exact: true })).toBeVisible();
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
    await page.goto('/contact');

    await page.getByLabel('Full Name').fill('Kiran Kumar Pedapudi');
    await page.getByLabel('Practice or Organization').fill('Aethera Healthcare Solutions');
    await page.getByLabel('Email Address').first().fill(CONTACT_EMAIL);
    await page.getByLabel('Message', { exact: true }).fill('Automated E2E test submission — please ignore');

    await page.locator('form').getByRole('button', { name: /send|submit/i }).click();

    await expect(
      page.getByRole('status').filter({hasText:'Message Sent!'})
    ).toBeVisible({ timeout: 15_000 });
  });
});
