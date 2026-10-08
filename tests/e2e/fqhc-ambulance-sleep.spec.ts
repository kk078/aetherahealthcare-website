import { test, expect } from './fixtures';

const ARTIFACT_DIR = process.env.PLAYWRIGHT_ARTIFACT_DIR || '/tmp/aethera-e2e';

test.describe('FQHC & RHC Funnel, Specialties 35-36, FQHC PPS Scrubber & Ambulance Fee Calculator', () => {

  test('Campaign page explains scope and offers a short intake', async ({ page }) => {
    await page.goto('/lp/fqhc-rhc-billing/?utm_source=google&utm_medium=cpc&utm_campaign=fqhc-pps-rcm&gclid=test_fqhc_gclid');
    await expect(page.getByRole('heading', { name: 'Request a scoped review' })).toBeVisible();
    await expect(page.getByText('What we review', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Your name *', { exact: true })).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Request Free 50-Claim Pilot' })).toBeVisible();
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
