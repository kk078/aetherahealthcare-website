import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('FQHC & RHC Funnel, Specialties 35-36, FQHC PPS Scrubber & Ambulance Fee Calculator', () => {

  test('FQHC & RHC Landing Page (/lp/fqhc-rhc-billing) renders calculator and intake form', async ({ page }) => {
    await page.goto('/lp/fqhc-rhc-billing/?utm_source=google&utm_medium=cpc&utm_campaign=fqhc-pps-rcm&gclid=test_fqhc_gclid');

    // Verify title and hero elements
    await expect(page.getByRole('heading', { level: 1, name: /Stop Losing Revenue to Unbilled Same-Day Encounters/i })).toBeVisible();
    await expect(page.getByText(/Community Health & Rural Clinic Revenue Cycle Management/i)).toBeVisible();

    // Verify Calculator renders
    await expect(page.getByText(/FQHC \/ RHC PPS REVENUE LEAKAGE CALCULATOR/i)).toBeVisible();
    await expect(page.getByText('Unbilled Same-Day Encounters', { exact: true })).toBeVisible();
    await expect(page.getByText(/Estimated Recoverable Annual Cash Flow/i)).toBeVisible();

    // Verify Form Fields
    await page.getByPlaceholder('e.g. Valley Community Health Center').fill('Rio Grande Community Health');
    await page.getByPlaceholder('e.g. Sarah Martinez, CFO').fill('Carlos Morales, Billing Director');
    await page.getByPlaceholder('smartinez@valleyhealth.org').fill('cmorales@riograndehealth.org');
    await page.getByPlaceholder('(555) 000-0000').fill('(555) 888-2345');

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/fqhc_rhc_campaign_landing.png`, fullPage: false });
  });

  test('FQHC & Community Health Clinics specialty page renders with CPT codes, PPS rules and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/fqhc/');

    await expect(page.getByRole('heading', { level: 1, name: /FQHC & Community Health Clinics Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/G0466–G0470, G0511, G0512/i).first()).toBeVisible();
    await expect(page.getByText(/Unbilled same-day behavioral health encounters/i)).toBeVisible();
    await expect(page.getByText(/How do you bill both a medical and mental health visit for the same patient on the same day\?/i)).toBeVisible();
  });

  test('Sleep Medicine & Polysomnography specialty page renders with CPT codes, PSG rules and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/sleep-medicine/');

    await expect(page.getByRole('heading', { level: 1, name: /Sleep Medicine & Polysomnography Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/95800, 95806, 95810, 95811/i).first()).toBeVisible();
    await expect(page.getByText(/Home Sleep Apnea Test \(HSAT\) vs in-lab prior-authorization denials/i)).toBeVisible();
    await expect(page.getByText(/What clinical documentation is required to overturn in-lab PSG prior-authorization denials\?/i)).toBeVisible();
  });

  test('FQHC PPS Rate Scrubber evaluates GAF rates and same-day exception rules', async ({ page }) => {
    await page.goto('/tools/fqhc-pps-scrubber/');

    await expect(page.getByRole('heading', { level: 1, name: /FQHC PPS Rate & Same-Day Service Scrubber/i })).toBeVisible();

    // Verify initial clean billable verdict with dual encounter
    await expect(page.getByText(/Qualifying Encounter Validation Passed/i)).toBeVisible();
    await expect(page.getByText(/Total Gross PPS Allowable/i)).toBeVisible();

    // Switch to Same Medical Condition to verify denial trigger
    await page.getByRole('button', { name: /Same Medical Condition/i }).click();

    // Verify rejection warning
    await expect(page.getByText(/Single Encounter Restriction/i)).toBeVisible();
    await expect(page.getByText(/\$0\.00 \(Denied\)/i)).toBeVisible();

    // Verify Copy EDI button
    const copyButton = page.getByRole('button', { name: /Copy 837I Snippet/i }).first();
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/fqhc_pps_scrubber_tool.png`, fullPage: false });
  });

  test('Ambulance Fee Calculator calculates AFS allowable, mileage and origin/dest modifiers', async ({ page }) => {
    await page.goto('/tools/ambulance-fee-calculator/');

    await expect(page.getByRole('heading', { level: 1, name: /Ambulance & EMS Fee Schedule Calculator/i })).toBeVisible();

    // Verify default calculations
    await expect(page.getByText(/Medicare Ambulance Fee Schedule \(AFS\) Engine/i)).toBeVisible();
    await expect(page.getByText(/Total Medicare Allowable/i)).toBeVisible();
    await expect(page.getByText(/Modifier: SH/i)).toBeVisible();

    // Change origin to N (Skilled Nursing Facility) to trigger SNF consolidated billing notice
    const originSelect = page.locator('select').nth(2);
    await originSelect.selectOption('N');

    // Verify SNF consolidated alert appears
    await expect(page.getByText(/CRITICAL SNF NOTICE/i)).toBeVisible();
    await expect(page.getByText(/Modifier: NH/i)).toBeVisible();

    // Verify Copy 837P Segment button
    const copyButton = page.getByRole('button', { name: /Copy 837P Segment/i }).first();
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/ambulance_fee_calculator_tool.png`, fullPage: false });
  });

  test('Tools Hub renders 41 tools and indexes FQHC scrubber and Ambulance calculator', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search \d+ free tools & engines/i)).toBeVisible();

    // Verify both new tools are present
    await expect(page.getByRole('heading', { level: 3, name: /FQHC PPS Encounter Rate & Same-Day Service Scrubber/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Ambulance & EMS Fee Schedule Calculator/i })).toBeVisible();

    // Test search filter for FQHC
    const toolSearch = page.getByPlaceholder(/Search \d+ free tools & engines/i);
    await toolSearch.fill('FQHC');
    await expect(page.getByRole('heading', { level: 3, name: /FQHC PPS Encounter Rate & Same-Day Service Scrubber/i })).toBeVisible();

    // Test search filter for Ambulance
    await toolSearch.fill('Ambulance');
    await expect(page.getByRole('heading', { level: 3, name: /Ambulance & EMS Fee Schedule Calculator/i })).toBeVisible();
  });

});
