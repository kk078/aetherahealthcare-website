import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('Behavioral Health Funnel, Addiction & Gyn Onc Specialties, Critical Care Scrubber & Anesthesia Concurrency Auditor', () => {

  test('Behavioral Health Landing Page (/lp/behavioral-health-billing) renders calculator and intake form', async ({ page }) => {
    await page.goto('/lp/behavioral-health-billing/?utm_source=google&utm_medium=cpc&utm_campaign=behavioral-health-asam&gclid=test_bh_gclid');

    // Verify title and hero elements
    await expect(page.getByRole('heading', { level: 1, name: /Stop Losing Census Revenue to Concurrent Auth Denials/i })).toBeVisible();
    await expect(page.getByText(/Behavioral Health & Substance Use Disorder \(SUD\) Revenue Cycle/i)).toBeVisible();

    // Verify Calculator renders
    await expect(page.getByRole('heading', { level: 2, name: /Behavioral Health Census & Authorization Loss Calculator/i })).toBeVisible();
    await expect(page.getByText(/Annual Denied Bed Revenue/i)).toBeVisible();
    await expect(page.getByText(/Aethera UR Peer Recovery/i)).toBeVisible();

    // Verify Form Fields
    await page.getByPlaceholder('e.g. Hope Horizon Recovery Center').fill('Highland Hope Recovery Center');
    await page.getByPlaceholder('e.g. Michael Harris, LCSW').fill('Marcus Vance, LCSW');
    await page.getByPlaceholder('michael@hopehorizon.org').fill('marcus@highlandhope.org');
    await page.getByPlaceholder('(555) 789-0123').fill('(555) 887-1234');

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/behavioral_health_campaign_landing.png`, fullPage: false });
  });

  test('Addiction Medicine specialty page renders with CPT codes, SUD levels of care and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/addiction-medicine/');

    await expect(page.getByRole('heading', { level: 1, name: /Addiction Medicine & SUD Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/G2086–G2088, G2074–G2080/i).first()).toBeVisible();
    await expect(page.getByText(/Medicare OTP weekly bundle denials/i)).toBeVisible();
    await expect(page.getByText(/How do you bill Medicare Opioid Treatment Program \(OTP\) weekly bundled codes\?/i)).toBeVisible();
  });

  test('Gynecologic Oncology specialty page renders with cytoreductive CPT codes and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/gynecologic-oncology/');

    await expect(page.getByRole('heading', { level: 1, name: /Gynecologic Oncology & Pelvic Surgery Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/58210, 58548, 38571–38572/i).first()).toBeVisible();
    await expect(page.getByText(/Pelvic & para-aortic lymphadenectomy unbundling denials/i)).toBeVisible();
    await expect(page.getByText(/How do you ensure full payment for complex cytoreductive tumor debulking\?/i)).toBeVisible();
  });

  test('Critical Care Scrubber evaluates time thresholds and bedside procedure exclusions', async ({ page }) => {
    await page.goto('/tools/critical-care-scrubber/');

    await expect(page.getByRole('heading', { level: 1, name: /Emergency & Critical Care Time Documentation Scrubber/i })).toBeVisible();

    // Verify initial clean billable verdict
    await expect(page.getByText(/Compliant Critical Care Service/i)).toBeVisible();
    await expect(page.getByText(/CPT 99291 x 1 unit/i).first()).toBeVisible();

    // Click separately billable procedure button to toggle deduction (e.g. Endotracheal Intubation or CVC)
    const cvcButton = page.getByRole('button', { name: /Central Venous Catheter/i });
    await cvcButton.click();

    // Verify deduction updated in verdict summary
    await expect(page.getByText('Procedures', { exact: true })).toBeVisible();

    // Verify Copy button
    const copyButton = page.getByRole('button', { name: /Copy/i }).first();
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/critical_care_scrubber_tool.png`, fullPage: false });
  });

  test('Anesthesia Concurrency Auditor evaluates TEFRA conditions and Modifier AD penalty cap', async ({ page }) => {
    await page.goto('/tools/anesthesia-concurrency-auditor/');

    await expect(page.getByRole('heading', { level: 1, name: /Anesthesia Concurrency & Medical Direction Auditor/i })).toBeVisible();

    // Default is 3 concurrent rooms (Modifier QK - 50% split)
    await expect(page.getByText(/Compliant 1:3 Medical Direction/i)).toBeVisible();
    await expect(page.getByText(/Modifier QK/i).first()).toBeVisible();

    // Uncheck TEFRA condition to trigger Modifier AD penalty
    const tefraCheckbox = page.getByRole('checkbox', { name: /All 7 TEFRA Medical Direction Criteria/i });
    await tefraCheckbox.uncheck();

    // Concurrency drops to Medical Supervision (Modifier AD) capped at 3 base units
    await expect(page.getByText(/MEDICAL DIRECTION BROKEN — Modifier AD Penalty Triggered/i)).toBeVisible();
    await expect(page.getByText(/Modifier AD \(Medical Supervision Only/i).first()).toBeVisible();

    // Verify Copy button
    const copyButton = page.getByRole('button', { name: /Copy/i }).first();
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/anesthesia_concurrency_auditor_tool.png`, fullPage: false });
  });

  test('Tools Hub renders tools and indexes critical care scrubber and anesthesia concurrency auditor', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search \d+ free tools & engines…/i)).toBeVisible();

    // Verify both new tools are present in catalog
    await expect(page.getByRole('heading', { level: 3, name: /Emergency & Critical Care Time Documentation Scrubber/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Anesthesia Concurrency & Medical Direction Auditor/i })).toBeVisible();

    // Test search filter for Critical Care
    const toolSearch = page.getByPlaceholder(/Search \d+ free tools & engines…/i);
    await toolSearch.fill('Critical Care');
    await expect(page.getByRole('heading', { level: 3, name: /Emergency & Critical Care Time Documentation Scrubber/i })).toBeVisible();

    // Test search filter for Anesthesia Concurrency
    await toolSearch.fill('Anesthesia Concurrency');
    await expect(page.getByRole('heading', { level: 3, name: /Anesthesia Concurrency & Medical Direction Auditor/i })).toBeVisible();
  });

});
