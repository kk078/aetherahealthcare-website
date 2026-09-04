import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('Next-Gen Healthcare RCM Suite & Tools', () => {

  test('Portal: Interactive Provider Portal Sandbox renders KPIs, AR aging, claims and payer scorecards', async ({ page }) => {
    await page.goto('/portal/');
    const sandbox = page.locator('#live-portal-sandbox');
    await sandbox.scrollIntoViewIfNeeded();
    await expect(sandbox).toBeVisible();

    await expect(page.getByText('portal.aetherahealthcare.com')).toBeVisible();
    await expect(page.getByText(/Live Client Sandbox/i)).toBeVisible();
    await expect(page.getByText('98.6%')).toBeVisible();
    await expect(page.getByText('Days in AR').first()).toBeVisible();
    await expect(page.getByText('Accounts Receivable (A/R) Aging Bucket Breakdown')).toBeVisible();

    await sandbox.screenshot({ path: `${ARTIFACT_DIR}/portal_sandbox_kpi.png` });

    // Switch tab to Denials
    await page.getByRole('button', { name: /Denial Resolution Center/i }).click();
    await expect(page.getByText('Active Denial Appeal & Recovery Feed')).toBeVisible();
    await sandbox.screenshot({ path: `${ARTIFACT_DIR}/portal_denials_stream.png` });
  });

  test('Tools: CMS NCCI Claim Scrubber validates code pairs and modifiers', async ({ page }) => {
    await page.goto('/tools/ncci-claim-scrubber/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('CMS NCCI Claim Scrubber');
    await expect(page.getByText('2026 CMS NCCI PTP Edit Database')).toBeVisible();

    // Verify audit result
    await expect(page.getByText(/Modifier Permitted to Bypass Bundling/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Copy Documentation Checklist/i })).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/ncci_claim_scrubber.png`, fullPage: false });
  });

  test('Tools: CPT Fee Schedule Benchmarker calculates underpayments and benchmarks', async ({ page }) => {
    await page.goto('/tools/fee-schedule-benchmarker/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('CPT Fee Schedule & Reimbursement Gap Benchmarker');
    await expect(page.getByText(/Estimated Annual Commercial Underpayment Gap/i)).toBeVisible();
    await expect(page.getByRole('columnheader', { name: '2026 Medicare Allowable' })).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/fee_schedule_benchmarker.png`, fullPage: false });
  });

  test('Tools: 835 ERA Decoder parses EDI segments into financial flow', async ({ page }) => {
    await page.goto('/tools/era-835-decoder/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('835 Electronic Remittance Advice (ERA) Decoder');
    await expect(page.getByText(/Claim Settlement Breakdown/i)).toBeVisible();
    await expect(page.getByText(/Total Billed Charge/i)).toBeVisible();
    await expect(page.getByText(/Payer Paid/i).first()).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/era_835_decoder.png`, fullPage: false });
  });

  test('Tools: Medical Denial Appeal Letter Generator outputs ERISA statutory appeal', async ({ page }) => {
    await page.goto('/tools/appeal-letter-generator/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('Medical Denial Appeal Letter Generator');
    await expect(page.getByText('Healthcare Denial Appeal Library')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Print PDF' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy Text' })).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/appeal_letter_generator.png`, fullPage: false });
  });

  test('Tools: Multi-Payer Timely Filing Matrix filters commercial and Medicaid limits', async ({ page }) => {
    await page.goto('/tools/timely-filing-matrix/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('Multi-Payer Timely Filing');
    await expect(page.getByText('Medicare Part B (Fee-for-Service)')).toBeVisible();

    // Filter by Medicaid
    await page.getByRole('button', { name: /Medicaid/i }).click();
    await expect(page.getByText('California Medi-Cal')).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/timely_filing_matrix.png`, fullPage: false });
  });

  test('Tools: Custom Practice Proposal & SLA Wizard steps through workflow', async ({ page }) => {
    await page.goto('/tools/practice-proposal-wizard/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toContainText('Practice Proposal & SLA Wizard');
    await expect(page.getByText('What is your primary medical specialty?')).toBeVisible();

    // Click Next
    await page.getByRole('button', { name: /Continue to Financials/i }).click();
    await expect(page.getByText('What is your primary EHR / Practice Management platform?')).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/practice_proposal_wizard.png`, fullPage: false });
  });

  test('Theme: Clinical Low-Glare Mode toggles and persists', async ({ page }) => {
    await page.goto('/');
    
    // Check initial state
    const htmlEl = page.locator('html');
    await expect(htmlEl).not.toHaveClass(/dark/);

    // Toggle dark mode via desktop theme toggle button
    const themeBtn = page.getByRole('button', { name: /Switch to Clinical Low-Glare Mode/i }).first();
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();

    // Verify dark class applied to html
    await expect(htmlEl).toHaveClass(/dark/);
    await page.screenshot({ path: `${ARTIFACT_DIR}/clinical_dark_mode_home.png`, fullPage: false });

    // Visit portal in dark mode
    await page.goto('/portal/');
    await expect(htmlEl).toHaveClass(/dark/);
    await page.screenshot({ path: `${ARTIFACT_DIR}/clinical_dark_mode_portal.png`, fullPage: false });
  });
});
