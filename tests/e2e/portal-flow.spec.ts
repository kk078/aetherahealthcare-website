import { test, expect } from '@playwright/test';

/**
 * Provider Portal magic-link flow E2E tests
 * Tests the /gap-analysis page request-login form and verification stub.
 */

test.describe('Provider Portal — Request Login', () => {
  test('renders the portal request-login form', async ({ page }) => {
    await page.goto('/gap-analysis');
    // Either shows the login request form or the portal (if a valid token is in URL)
    await expect(
      page.getByText(/enter your email|request.*access|provider portal|gap analysis/i)
    ).toBeVisible({ timeout: 10_000 });
  });

  test('shows email input and submit button', async ({ page }) => {
    await page.goto('/gap-analysis');
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await expect(emailInput).toBeVisible();
    await expect(page.getByRole('button', { name: /send|request|login|access/i })).toBeVisible();
  });

  test('shows error for invalid email format', async ({ page }) => {
    await page.goto('/gap-analysis');
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('not-an-email');
    await page.getByRole('button', { name: /send|request|login|access/i }).click();
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(validationMessage.length).toBeGreaterThan(0);
  });

  test('submits valid email and shows confirmation message', async ({ page }) => {
    await page.goto('/gap-analysis');
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill(`portal-e2e-${Date.now()}@example.com`);

    const nameInput = page.getByRole('textbox', { name: /name/i });
    if (await nameInput.count() > 0) await nameInput.fill('E2E Test Provider');

    await page.getByRole('button', { name: /send|request|login|access/i }).click();

    await expect(
      page.getByText(/link.*sent|check your email|sent to your email|magic link/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test('invalid token shows error, not portal content', async ({ page }) => {
    await page.goto('/gap-analysis?token=invalid-token-abc123');
    await expect(
      page.getByText(/invalid|expired|not found|try again/i)
    ).toBeVisible({ timeout: 15_000 });
  });
});
