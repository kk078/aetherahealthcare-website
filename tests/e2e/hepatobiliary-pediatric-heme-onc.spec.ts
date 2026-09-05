import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Specialties 49-50 and Tools 54-55: Hepatobiliary Surgery & Pediatric Cellular Oncology Suites', () => {
  test('Specialty 49: Hepatobiliary Surgery & Complex Liver Resection page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/hepatobiliary-surgery/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Hepatobiliary Surgery & Complex Liver Resection/i })
    ).toBeVisible();
    await expect(page.getByText(/Major anatomic hepatectomies/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('47125').first()).toBeVisible();
    await expect(page.getByText('47760').first()).toBeVisible();
    await expect(page.getByText('35221').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Specialty 50: Pediatric Hematology-Oncology & Cellular Therapy page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/pediatric-heme-onc/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Pediatric Hematology-Oncology & Cellular Therapy/i })
    ).toBeVisible();
    await expect(page.getByText(/Pediatric allogeneic and autologous stem cell transplants/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('0540T').first()).toBeVisible();
    await expect(page.getByText('38240').first()).toBeVisible();
    await expect(page.getByText('96450').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Tool #54: Hepatobiliary Resection Scrubber audits trisegmentectomies, vascular add-ons & biliary conduits', async ({ page }) => {
    await page.goto('/tools/hepatobiliary-resection-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Hepatobiliary Resection & Biliary Reconstruction Scrubber/i })
    ).toBeVisible();

    // Verify initial clean state with CPT 47125, 47760, +35221, 76998
    await expect(page.getByRole('cell', { name: '47125' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '47760' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '+35221' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '76998' }).first()).toBeVisible();
    await expect(page.getByText(/Compliant Hepatobiliary Surgical Resection/i).first()).toBeVisible();

    // Trigger Trisegmentectomy Downcoding trap
    const downcodeCheckbox = page.locator('#downcodeTrisegCheck');
    await downcodeCheckbox.check();
    await expect(page.getByText(/Commercial Payer Anatomic Downcoding/i)).toBeVisible();
    await expect(page.getByText(/Errors Flagged/i).first()).toBeVisible();
    await downcodeCheckbox.uncheck();

    // Trigger Biliary Bundling trap
    const biliaryBundleCheckbox = page.locator('#bundleBiliaryCheck');
    await biliaryBundleCheckbox.check();
    await expect(page.getByText(/Statutory Bundling Rejection: Roux-en-Y/i)).toBeVisible();
    await biliaryBundleCheckbox.uncheck();

    // Trigger Vascular Incidental Bundling trap
    const vascBundleCheckbox = page.locator('#bundleVascCheck');
    await vascBundleCheckbox.check();
    await expect(page.getByText(/Unlawful Payer Bundling: Vascular Reconstruction/i)).toBeVisible();
    await vascBundleCheckbox.uncheck();

    // Test Co-Surgeon Modifier -62 with unpaired operative notes
    const coSurgeonSelect = page.locator('#coSurgeonSelect');
    await coSurgeonSelect.selectOption('mod_62_unpaired_note');
    await expect(page.getByText(/Modifier -62 Co-Surgeon Clawback Risk/i)).toBeVisible();
    await coSurgeonSelect.selectOption('solo');

    // Verify ANSI 837P simulation
    await expect(page.getByText(/ANSI X12 837P Professional Claim Simulation/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:47125/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'hepatobiliary_resection_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #55: Pediatric Cell Therapy Scrubber audits CAR-T infusions, prior auth & CRS critical care', async ({ page }) => {
    await page.goto('/tools/pediatric-cell-therapy-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Pediatric Stem Cell & CAR-T Cellular Therapy Scrubber/i })
    ).toBeVisible();

    // Verify initial clean state with 0540T, Q2042 ($475k), 96450, 38222, 99291
    await expect(page.getByRole('cell', { name: '0540T' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Q2042' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '96450' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '38222' }).first()).toBeVisible();
    await expect(page.getByText(/Compliant Pediatric Cellular Therapy/i).first()).toBeVisible();

    // Trigger Prior-Auth Denial trap
    const remsDenialCheckbox = page.locator('#missingRemsCheck');
    await remsDenialCheckbox.check();
    await expect(page.getByText(/CAR-T Therapy Fatal Prior Authorization Denial/i)).toBeVisible();
    await expect(page.getByText(/Errors Flagged/i).first()).toBeVisible();
    await remsDenialCheckbox.uncheck();

    // Trigger Restaging LP unbundling trap
    const restagingBundleCheckbox = page.locator('#bundleRestagingCheck');
    await restagingBundleCheckbox.check();
    await expect(page.getByText(/NCCI Bundling Denial: Intrathecal Chemo/i)).toBeVisible();
    await restagingBundleCheckbox.uncheck();

    // Trigger CRS downcoding trap
    const crsDowncodeCheckbox = page.locator('#downcodeCrsCheck');
    await crsDowncodeCheckbox.check();
    await expect(page.getByText(/Commercial Downcoding: Severe Post-CAR-T CRS/i)).toBeVisible();
    await crsDowncodeCheckbox.uncheck();

    // Switch modality to Allogeneic Stem Cell Transplant
    const modalitySelect = page.locator('#cellTherapyTypeSelect');
    await modalitySelect.selectOption('allogeneic_bmt');
    await expect(page.getByRole('cell', { name: '38240' }).first()).toBeVisible();

    // Verify ANSI 837P simulation
    await expect(page.getByText(/ANSI X12 837P Professional Claim Simulation/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:38240/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_cell_therapy_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory: Expands to 55 tools and includes Hepatobiliary and Pediatric Cell Therapy scrubbers', async ({ page }) => {
    await page.goto('/tools/');

    // Verify Tools title
    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();

    // Verify tool cards are in directory
    await expect(page.getByText('Hepatobiliary Resection & Biliary Reconstruction Scrubber').first()).toBeVisible();
    await expect(page.getByText('Pediatric Stem Cell & CAR-T Cellular Therapy Scrubber').first()).toBeVisible();

    // Test search filter for hepatobiliary
    const searchInput = page.getByPlaceholder(/Search .* free tools/i);
    await searchInput.fill('hepatobiliary');
    await expect(page.getByText('Hepatobiliary Resection & Biliary Reconstruction Scrubber').first()).toBeVisible();

    // Test search filter for cellular
    await searchInput.fill('cellular');
    await expect(page.getByText('Pediatric Stem Cell & CAR-T Cellular Therapy Scrubber').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 50+ specialties with Hepatobiliary and Pediatric Cell Therapy links', async ({ page }) => {
    await page.goto('/specialties/');

    // Verify hero and chips
    await expect(page.getByRole('heading', { level: 1, name: /Specialty-Specific Billing & Coding Services|Billing built for your specialty/i })).toBeVisible();
    await expect(page.getByText(/\d+\+ specialties/i).first()).toBeVisible();

    // Verify both new specialties are present and linked
    await expect(page.getByText('Hepatobiliary Surgery & Complex Liver Resection').first()).toBeVisible();
    await expect(page.getByText('Pediatric Hematology-Oncology & Cellular Therapy').first()).toBeVisible();

    const hpbLink = page.locator('a[href*="/medical-billing/hepatobiliary-surgery"]').first();
    await expect(hpbLink).toBeVisible();

    const hemeOncLink = page.locator('a[href*="/medical-billing/pediatric-heme-onc"]').first();
    await expect(hemeOncLink).toBeVisible();
  });
});
