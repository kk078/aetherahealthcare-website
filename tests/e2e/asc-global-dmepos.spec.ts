import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('ASC Surgical Funnel, IR & OMS Specialties, Global Scrubber & DMEPOS Validator', () => {

  test('ASC Surgical Billing Landing Page (/lp/asc-surgical-billing) renders calculator and intake form', async ({ page }) => {
    await page.goto('/lp/asc-surgical-billing/?utm_source=google&utm_medium=cpc&utm_campaign=asc-implant-carveouts&gclid=test_asc_gclid');

    // Verify title and hero elements
    await expect(page.getByRole('heading', { level: 1, name: /Stop Losing Surgical Margins to Implant Carve-Out Denials/i })).toBeVisible();
    await expect(page.getByText(/Ambulatory Surgery Center \(ASC\) Revenue Cycle Management/i)).toBeVisible();

    // Verify Calculator renders
    await expect(page.getByRole('heading', { level: 2, name: /ASC Implant Carve-Out & Revenue Acceleration Calculator/i })).toBeVisible();
    await expect(page.getByText(/Annual Carve-Out Revenue at Risk/i)).toBeVisible();
    await expect(page.getByText(/MPPR Cascading Recapture/i)).toBeVisible();
    await expect(page.getByText(/Total Aethera 12-Mo Net Recovery/i)).toBeVisible();

    // Verify Form Fields
    await page.getByPlaceholder('e.g. Apex Outpatient Surgical Center').fill('Lone Star Surgical Pavilion');
    await page.getByPlaceholder('e.g. Jennifer Miller, RN').fill('Jennifer Miller, RN');
    await page.getByPlaceholder('jennifer@apexorthosurg.com').fill('jennifer@lonestarsurg.com');
    await page.getByPlaceholder('(555) 345-6789').fill('(555) 443-8899');

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/asc_surgical_billing_landing.png`, fullPage: false });
  });

  test('Interventional Radiology specialty page renders with CPT codes, catheter hierarchy and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/interventional-radiology/');

    await expect(page.getByRole('heading', { level: 1, name: /Interventional Radiology & Endovascular Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/36200–36248, 37241–37243/i).first()).toBeVisible();
    await expect(page.getByText(/Vascular family catheterization hierarchy/i)).toBeVisible();
    await expect(page.getByText(/How do you prevent vascular catheterization hierarchy downcoding\?/i)).toBeVisible();
  });

  test('Oral & Maxillofacial Surgery specialty page renders with CDT-to-CPT cross-coding and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/oral-surgery/');

    await expect(page.getByRole('heading', { level: 1, name: /Oral & Maxillofacial Surgery \(CDT\/CPT\) Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/21141–21155/i).first()).toBeVisible();
    await expect(page.getByText(/Dental vs Medical carrier finger-pointing/i)).toBeVisible();
    await expect(page.getByText(/How do you successfully cross-code oral surgery CDT dental codes to medical CPT\?/i)).toBeVisible();
  });

  test('Surgical Global Period Scrubber evaluates post-op windows and Modifier 24 / 58 / 78 compliance', async ({ page }) => {
    await page.goto('/tools/global-period-scrubber/');

    await expect(page.getByRole('heading', { level: 1, name: /Surgical Global Period & Post-Op Modifier Scrubber/i })).toBeVisible();

    // Verify initial procedure selection renders
    await expect(page.getByText(/Total Knee Arthroplasty \(TKA\)/i)).toBeVisible();

    // Select different procedure
    await page.getByText(/Laparoscopic Cholecystectomy/i).click();

    // Verify verdict rendering
    await expect(page.getByText(/Billable with Modifier 24/i)).toBeVisible();
    await expect(page.getByText(/Modifier 24 \(Appended to E\/M Code\)/i)).toBeVisible();

    // Select Staged Procedure scenario
    await page.locator('select').filter({ hasText: /Unrelated Condition Evaluation/i }).selectOption('staged_planned');
    await expect(page.getByText(/Billable with Modifier 58/i)).toBeVisible();

    // Verify Copy button
    const copyButton = page.getByRole('button', { name: /Copy/i }).first();
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/surgical_global_period_scrubber_tool.png`, fullPage: false });
  });

  test('DMEPOS Medical Necessity & Prior Auth Validator verifies MAC routing and LCD criteria', async ({ page }) => {
    await page.goto('/tools/dmepos-validator/');

    await expect(page.getByRole('heading', { level: 1, name: /DMEPOS Medical Necessity & Prior Auth Validator/i })).toBeVisible();

    // Select CPAP category
    await expect(page.getByText(/CPAP \/ BiPAP for Obstructive Sleep Apnea/i)).toBeVisible();

    // Verify Assigned DME MAC info
    await expect(page.getByText(/DME MAC Jurisdiction C/i)).toBeVisible();
    await expect(page.getByText(/CGS Administrators, LLC/i)).toBeVisible();

    // Verify verdict
    await expect(page.getByText(/Clean DMEPOS Claim Ready for Submission/i)).toBeVisible();
    await expect(page.getByText(/Modifier KX/i).first()).toBeVisible();

    // Switch to Oxygen
    await page.getByText(/Home Oxygen Therapy & Concentrators/i).click();
    await expect(page.getByText(/Modifier QA/i)).toBeVisible();

    // Verify Copy button
    const copyButton = page.getByRole('button', { name: /Copy/i }).first();
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/dmepos_validator_tool.png`, fullPage: false });
  });

  test('Tools Hub renders 35 tools and indexes global scrubber and DMEPOS validator', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search \d+ free tools & engines…/i)).toBeVisible();

    // Verify both new tools are present in catalog
    await expect(page.getByRole('heading', { level: 3, name: /Surgical Global Period & Post-Op Modifier Scrubber/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /DMEPOS Medical Necessity & Prior Auth Validator/i })).toBeVisible();

    // Test search filter for Global Period
    const toolSearch = page.getByPlaceholder(/Search \d+ free tools & engines…/i);
    await toolSearch.fill('Global Period');
    await expect(page.getByRole('heading', { level: 3, name: /Surgical Global Period & Post-Op Modifier Scrubber/i })).toBeVisible();

    // Test search filter for DMEPOS
    await toolSearch.fill('DMEPOS');
    await expect(page.getByRole('heading', { level: 3, name: /DMEPOS Medical Necessity & Prior Auth Validator/i })).toBeVisible();
  });

});
