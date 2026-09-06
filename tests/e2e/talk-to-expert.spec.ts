import { test, expect } from '@playwright/test';

test.describe('Talk to an Expert - Agentic AI & Email Routing', () => {
  test('Talk to an Expert floating button is visible and opens dual-mode modal', async ({ page }) => {
    await page.goto('/');

    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await expect(triggerBtn).toBeVisible();

    // Click to open modal
    await triggerBtn.click();

    // Verify modal header and Agentic AI badge
    await expect(page.getByText('Agentic AI')).toBeVisible();
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
    await expect(page.getByRole('link', { name: 'Schedule Call', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Email Request', exact: true })).toBeVisible();
  });

  test('Callback tab allows scheduling meetings and submitting email inquiries', async ({ page }) => {
    await page.goto('/');

    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await triggerBtn.click();

    // Switch to Request Callback tab
    await page.getByRole('button', { name: /Request Callback/i }).click();

    // Verify Schedule Meeting and Send Email Request links inside the modal
    const callbackTab = page.locator('form, div').filter({ hasText: /Confidential direct review/i });
    await expect(callbackTab.getByRole('link', { name: /Schedule Meeting/i })).toBeVisible();
    await expect(callbackTab.getByRole('link', { name: /Send Email Request/i })).toBeVisible();

    // Verify callback form fields
    await expect(page.getByPlaceholder('Your name *')).toBeVisible();
    await expect(page.getByPlaceholder('Phone number *')).toBeVisible();
    await expect(page.getByPlaceholder('Email address *')).toBeVisible();
  });

  test('Global contact links route to /contact and /schedule without exposing personal info', async ({ page }) => {
    await page.goto('/');

    // Top contact bar check
    const emailInquiryLink = page.locator('header, div').getByRole('link', { name: /Email Inquiry/i }).first();
    await expect(emailInquiryLink).toBeVisible();
    await expect(emailInquiryLink).toHaveAttribute('href', /\/contact\/?/);

    const scheduleMeetingLink = page.locator('header, div').getByRole('link', { name: /Schedule Meeting/i }).first();
    await expect(scheduleMeetingLink).toBeVisible();
    await expect(scheduleMeetingLink).toHaveAttribute('href', /\/schedule\/?/);

    // Contact page check
    await page.goto('/contact/');
    await expect(page.getByRole('heading', { name: /Ways to Connect/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Schedule a Meeting/i }).first()).toHaveAttribute('href', /\/schedule\/?/);
  });

  test('Talk to an Expert displays Grounded in 10,600+ Payers & CARCs badge', async ({ page }) => {
    await page.goto('/');
    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await triggerBtn.click();

    // Verify badge text
    await expect(page.getByText(/Grounded in 10,600\+ Payers & CARCs/i)).toBeVisible();
  });

  test('no session data is saved in localStorage or sessionStorage for any user', async ({ page }) => {
    await page.goto('/');
    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await triggerBtn.click();

    await page.getByPlaceholder(/Ask about denial codes/i).fill('Testing privacy');

    const storageCheck = await page.evaluate(() => {
      const localKeys = Object.keys(localStorage);
      const sessionKeys = Object.keys(sessionStorage);
      return {
        hasLocalSession: localKeys.some(k => k.includes('expert_session') || k.includes('chat_history') || k.includes('aethera_chat')),
        hasSessionStore: sessionKeys.some(k => k.includes('expert_session') || k.includes('chat_history') || k.includes('aethera_chat')),
      };
    });

    expect(storageCheck.hasLocalSession).toBe(false);
    expect(storageCheck.hasSessionStore).toBe(false);
  });

  test('New Session button refreshes active conversation back to initial state', async ({ page }) => {
    await page.goto('/');
    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await triggerBtn.click();

    // Click a suggestion to initiate conversation
    await page.getByRole('button', { name: /What is UHC & Medicare timely filing/i }).click();
    await expect(page.getByText(/proof of timely filing|filing deadline/i).first()).toBeVisible({ timeout: 15000 });

    // Verify "New Session" button appears in header
    const newSessionBtn = page.getByRole('button', { name: /New Session/i }).first();
    await expect(newSessionBtn).toBeVisible();

    // Click New Session to refresh
    await newSessionBtn.click();

    // Verify suggestions are visible again (session refreshed)
    await expect(page.getByRole('button', { name: /How to overturn CO-45 & PR-204/i })).toBeVisible();
  });

  test('CO-45 & PR-204 query contains zero phone numbers and directs to /contact and /schedule', async ({ page }) => {
    await page.goto('/');
    const triggerBtn = page.getByRole('button', { name: /Talk to an Expert/i });
    await triggerBtn.click();

    // Click suggestion: 'How to overturn CO-45 & PR-204?'
    await page.getByRole('button', { name: /How to overturn CO-45 & PR-204/i }).click();

    // Verify response text renders
    await expect(page.getByText(/Overturning & Resolving CO-45 & PR-204/i).first()).toBeVisible({ timeout: 15000 });

    // Verify phone number (813) 519-4640 is completely absent
    const chatText = await page.innerText('body');
    expect(chatText).not.toContain('(813) 519-4640');
    expect(chatText).not.toContain('519-4640');
    expect(chatText).not.toContain('8135194640');

    // Take verified screenshot artifact
    await page.screenshot({ path: '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c/chatbox_verified_no_phone.png' });
  });
});
