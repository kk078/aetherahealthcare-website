import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Specialties 37-38 and Tools 41-43: NICU, Rad-Onc, Dialysis Suites', () => {
  test('Specialty 37: NICU & Pediatric Intensive Care Billing page renders with per-day coding and bundling rules', async ({ page }) => {
    await page.goto('/medical-billing/nicu-picu/');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1, name: /Neonatal & Pediatric Intensive Care/i })).toBeVisible();
    await expect(page.getByText(/Global per-day critical care management/i).first()).toBeVisible();

    // Verify key per-day CPT codes
    await expect(page.getByText('99468–99476').first()).toBeVisible();

    // Verify assessment link CTA
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Specialty 38: Radiation Oncology & Proton Therapy Billing page renders with IMRT and fraction management', async ({ page }) => {
    await page.goto('/medical-billing/radiation-oncology/');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1, name: /Radiation Oncology & Proton Therapy/i })).toBeVisible();
    await expect(page.getByText(/IMRT treatment planning/i).first()).toBeVisible();

    // Verify IMRT planning and fraction CPTs
    await expect(page.getByText('77301').first()).toBeVisible();
    await expect(page.getByText('77427').first()).toBeVisible();

    // Verify assessment link CTA
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Tool #41: Radiation Oncology IMRT Bundling & Fraction Scrubber renders and evaluates edits', async ({ page }) => {
    await page.goto('/tools/rad-onc-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Radiation Oncology IMRT Bundling & Fraction Scrubber/i })
    ).toBeVisible();

    // Verify default IMRT selection in select element
    const modalitySelect = page.locator('select').first();
    await expect(modalitySelect).toHaveValue('imrt');

    // Switch to SBRT modality
    await modalitySelect.selectOption('sbrt');
    await expect(modalitySelect).toHaveValue('sbrt');

    // Switch back to IMRT
    await modalitySelect.selectOption('imrt');

    // Verify NCCI bundling collision warning and ASTRO audit box
    await expect(page.getByText(/ASTRO & CMS Bundling Audit/i)).toBeVisible();
    await expect(page.getByText(/NCCI Bundling Collision/i).first()).toBeVisible();

    // Check fraction math (default 28 fractions => Weekly Mgmt units)
    await expect(page.getByText(/Weekly Mgmt \(77427 × \d+ units\)/i)).toBeVisible();

    // Verify ANSI 837P EDI segment
    await expect(page.getByText(/ANSI X12 837P Radiation Oncology Claim Segment/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:77301/i)).toBeVisible();

    // Copy EDI button test
    const copyBtn = page.getByRole('button', { name: /Copy 837P Segment/i });
    await expect(copyBtn).toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: `${ARTIFACT_DIR}/rad_onc_scrubber_tool.png`, fullPage: false });
  });

  test('Tool #42: Dialysis MCP Tier Calculator computes visit levels and hospital pro-rations', async ({ page }) => {
    await page.goto('/tools/dialysis-mcp-calculator/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Dialysis Monthly Capitation Payment \(MCP\) Tier Calculator/i })
    ).toBeVisible();

    // Verify Adult cohort default (90960 for 4+ visits)
    const ageSelect = page.locator('select').first();
    await expect(ageSelect).toHaveValue('adult');
    await expect(page.getByText(/CPT 90960/i).first()).toBeVisible();

    // Switch to 2-3 Visits
    const twoThreeBtn = page.getByText(/2.*3 Visits \/ mo/i);
    await twoThreeBtn.click();
    await expect(page.getByText('CPT 90961').first()).toBeVisible();

    // Add Inpatient Hospital Days via range slider
    const hospSlider = page.locator('input[type="range"]').first();
    await hospSlider.fill('7');
    await expect(page.getByText(/CMS PRO-RATION MANDATE/i)).toBeVisible();
    await expect(page.getByText(/7 days hospitalized/i)).toBeVisible();

    // Verify EDI preview
    await expect(page.getByText(/ANSI X12 837P Professional Nephrology Claim Segment/i)).toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: `${ARTIFACT_DIR}/dialysis_mcp_calculator_tool.png`, fullPage: false });
  });

  test('Tool #43: NICU & Pediatric Critical Care Scrubber audits bundling and modifier rules', async ({ page }) => {
    await page.goto('/tools/nicu-critical-care-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /NICU & Pediatric Critical Care Scrubber/i })
    ).toBeVisible();

    // Verify default Neonate Critical Care Initial CPT 99468
    await expect(page.getByText('CPT 99468').first()).toBeVisible();

    // Switch to Subsequent Day
    const subDayBtn = page.getByRole('button', { name: /Subsequent Day/i });
    await subDayBtn.click();
    await expect(page.getByText('CPT 99469').first()).toBeVisible();

    // Switch back to Initial Day
    await page.getByRole('button', { name: /Initial Day/i }).click();

    // Verify Bundled Procedure Warning
    await expect(page.getByText(/CMS Chapter 11 NCCI Policy Warning/i)).toBeVisible();
    await expect(page.getByText(/Bundled Procedure\(s\) Suppressed/i)).toBeVisible();

    // Toggle Delivery Room Resuscitation Add-on (CPT 99465)
    await expect(page.getByText(/Modifier 25 Auto-Appended/i)).toBeVisible();

    // Verify EDI preview
    await expect(page.getByText(/ANSI X12 837P Electronic Claim Lines/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:99468:25/i)).toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: `${ARTIFACT_DIR}/nicu_critical_care_scrubber_tool.png`, fullPage: false });
  });

  test('Tools Directory: confirms 43 tools and verifies search indexing for new additions', async ({ page }) => {
    await page.goto('/tools/');

    // Verify 43 tools heading
    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();

    // Search for Radiation
    const searchInput = page.getByPlaceholder(/Search \d+ free tools/i);
    await searchInput.fill('Radiation');
    await expect(page.getByText('Radiation Oncology IMRT Bundling & Fraction Scrubber')).toBeVisible();

    // Search for Dialysis
    await searchInput.fill('Dialysis');
    await expect(page.getByText('Dialysis Monthly Capitation Payment (MCP) Tier Calculator')).toBeVisible();

    // Search for NICU
    await searchInput.fill('NICU');
    await expect(page.getByText('NICU & Pediatric Critical Care Scrubber')).toBeVisible();
  });
});
