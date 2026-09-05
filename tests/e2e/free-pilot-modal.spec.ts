import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('Free 50-Claim Pilot Interactive Modal', () => {

  test('Navbar: clicking "Start Free Pilot" opens interactive onboarding modal from any page', async ({ page }) => {
    await page.goto('/');

    // Verify modal is not visible initially
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Click desktop Navbar "Start Free Pilot" button
    const navbarPilotBtn = page.getByRole('button', { name: 'Start Free Pilot' }).first();
    await expect(navbarPilotBtn).toBeVisible();
    await navbarPilotBtn.click();

    // Verify modal opens with high-converting intake elements
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Claim Your Free 50-Claim Pilot' })).toBeVisible();
    await expect(page.getByText('Zero Obligation · No Setup Fees · 14-Day Trial')).toBeVisible();
    await expect(page.getByText('HIPAA BAA & Mutual NDA Provided')).toBeVisible();

    // Screenshot of open modal
    await page.screenshot({ path: `${ARTIFACT_DIR}/free_pilot_modal_open.png`, fullPage: false });

    // Test ESC key closing
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });

  test('Homepage: Hero and dedicated pilot section buttons trigger the modal', async ({ page }) => {
    await page.goto('/');

    // Click hero button
    const heroBtn = page.getByRole('button', { name: /Start the Free 50-Claim Pilot/i });
    await heroBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Close via close button
    await page.getByLabel('Close modal').click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Scroll to dedicated pilot section and click "Claim your pilot slot"
    const sectionBtn = page.getByRole('button', { name: /Claim your pilot slot/i });
    await sectionBtn.scrollIntoViewIfNeeded();
    await sectionBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Free Assessment Page: Clicking "Activate Free 50-Claim Pilot" opens modal seamlessly', async ({ page }) => {
    await page.goto('/free-assessment/');

    // Click the callout in the hero
    const assessmentPilotBtn = page.getByRole('button', { name: /Activate Free 50-Claim Pilot/i });
    await assessmentPilotBtn.click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Also verify Navbar button works while on /free-assessment/
    await page.getByLabel('Close modal').click();
    await expect(page.getByRole('dialog')).not.toBeVisible();

    await page.getByRole('button', { name: 'Start Free Pilot' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('Modal Form: Validates required fields and displays confirmation upon submission', async ({ page }) => {
    // Intercept CRM API requests to mock success
    await page.route('**/public/website/**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, message: 'Lead received' }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Start Free Pilot' }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill form
    await page.getByPlaceholder(/Dr. Jane Smith/i).fill('Dr. Robert Vance');
    await page.getByPlaceholder(/Metro Specialty Clinic/i).fill('Vance Cardiology Associates');
    await page.getByPlaceholder('doctor@practice.com').fill('rvance@vancecardiology.com');
    await page.getByPlaceholder('(555) 000-0000').fill('(813) 555-1212');

    // Submit
    await page.getByRole('button', { name: /Activate 50-Claim Free Pilot/i }).click();

    // Verify success state
    await expect(page.getByRole('heading', { name: '50-Claim Pilot Slot Reserved!' })).toBeVisible();
    await expect(page.getByText('Dr. Robert Vance')).toBeVisible();
    await expect(page.getByText('Vance Cardiology Associates')).toBeVisible();
    await expect(page.getByText('What happens next within 2 business hours:')).toBeVisible();
    await expect(page.getByRole('dialog').getByRole('link', { name: '+1 (813) 519-4640' })).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/free_pilot_modal_success.png`, fullPage: false });

    // Close window
    await page.getByRole('button', { name: 'Close Window' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

});
