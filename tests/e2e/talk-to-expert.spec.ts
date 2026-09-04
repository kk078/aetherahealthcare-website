import { test, expect } from '@playwright/test';

test.describe('Talk to an Expert - Gemini Agentic AI & Email Routing', () => {
  test('Talk to an Expert floating button is visible and opens dual-mode modal', async ({ page }) => {
    await page.goto('/');

    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await expect(triggerBtn).toBeVisible();

    // Click to open modal
    await triggerBtn.click();

    // Verify modal header and Gemini Agentic AI badge
    await expect(page.getByText('Gemini Agentic AI')).toBeVisible();
    await expect(page.getByRole('button', { name: /AI Expert Chat/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Request Callback/i })).toBeVisible();

    // Verify initial greeting
    await expect(page.getByText(/AI Revenue Cycle & Practice Specialist/i)).toBeVisible();

    // Verify suggestion buttons
    await expect(page.getByRole('button', { name: /How to overturn CO-45 & PR-204/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /What is UHC & Medicare timely filing/i })).toBeVisible();
  });

  test('AI Expert Chat responds with grounded RCM intelligence and action cards', async ({ page }) => {
    await page.goto('/');

    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await triggerBtn.click();

    // Click the Medicare timely filing suggestion
    await page.getByRole('button', { name: /What is UHC & Medicare timely filing/i }).click();

    // Wait for the agentic intelligence to render in the chat
    await expect(page.getByText(/proof of timely filing|filing deadline/i).first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Direct Partner Escalation/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Email Kiran/i })).toBeVisible();
  });

  test('Callback tab routes emails directly to kirkmar078@gmail.com', async ({ page }) => {
    await page.goto('/');

    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await triggerBtn.click();

    // Switch to Request Callback tab
    await page.getByRole('button', { name: /Request Callback/i }).click();

    // Verify email link points to kirkmar078@gmail.com
    const emailLink = page.locator('a[href*="mailto:kirkmar078@gmail.com"]');
    await expect(emailLink.first()).toBeVisible();
    await expect(page.getByText('kirkmar078@gmail.com').first()).toBeVisible();

    // Verify callback form fields
    await expect(page.getByPlaceholder('Your name *')).toBeVisible();
    await expect(page.getByPlaceholder('Phone number *')).toBeVisible();
    await expect(page.getByPlaceholder('Email address *')).toBeVisible();
  });

  test('Global contact links route mailto to kirkmar078@gmail.com', async ({ page }) => {
    await page.goto('/');

    // Top contact bar mailto check
    const topBarEmail = page.locator('div').locator('a[href^="mailto:kirkmar078@gmail.com"]').first();
    await expect(topBarEmail).toBeVisible();
    const topBarHref = await topBarEmail.getAttribute('href');
    expect(topBarHref).toContain('kirkmar078@gmail.com');

    // Contact page check
    await page.goto('/contact/');
    const contactEmailLinks = page.locator('a[href^="mailto:kirkmar078@gmail.com"]');
    expect(await contactEmailLinks.count()).toBeGreaterThanOrEqual(1);
  });
});
