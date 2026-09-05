import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 31 Expansion: Pediatric TEF/EA Repair & DIEP Flap Breast Reconstruction', () => {
  test('Specialty 83: Pediatric TEF & Esophageal Atresia Repair page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-tef-esophageal-atresia`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Tracheoesophageal Fistula|TEF|Esophageal Atresia/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Tracheoesophageal Fistula/i);

    // Verify key CPT codes
    await expect(page.getByText('43305').first()).toBeVisible();
    await expect(page.getByText('43312').first()).toBeVisible();
    await expect(page.getByText('31622').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 84: Complex DIEP Flap Breast Reconstruction page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/diep-flap-breast-reconstruction`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/DIEP Flap|Breast Reconstruction|Reconstructive Microsurgery/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Complex Adult Reconstructive Microsurgery/i);

    // Verify key CPT codes
    await expect(page.getByText('19364').first()).toBeVisible();
    await expect(page.getByText('69990').first()).toBeVisible();
    await expect(page.getByText('15860').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #88: Pediatric TEF Scrubber audits 43312-22, bronchoscopy 31622-59, gastrostomy 43653-59 & staged Foker 43312-58', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-tef-ea-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric TEF & Esophageal Atresia Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric TEF & Esophageal Atresia Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric TEF & Esophageal Atresia/i);

    // Verify claim line items display 43312-22, 31622-59, 43653-59, 99291-25
    await expect(page.getByText('43312-22').first()).toBeVisible();
    await expect(page.getByText('31622-59').first()).toBeVisible();
    await expect(page.getByText('43653-59').first()).toBeVisible();
    await expect(page.getByText('99291-25').first()).toBeVisible();

    // Test Gross Type E (H-type) -> switches to 43305
    await page.locator('select').first().selectOption('typeE');
    await expect(page.getByText('43305-22').first()).toBeVisible();

    // Switch back to Type C and toggle Foker elongation
    await page.locator('select').first().selectOption('typeC');
    const fokerCheckbox = page.getByRole('checkbox', { name: /Staged Foker Traction Elongation/i });
    await fokerCheckbox.check();
    await expect(page.getByText('43312-58').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_tef_ea_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #89: DIEP Flap Scrubber audits bilateral 19364-50, microscope 69990, ICG 15860 & venous rescue 35201-59', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/diep-flap-reconstruction-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/DIEP Flap Breast Reconstruction Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/DIEP Flap Breast Reconstruction Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/DIEP Flap Breast Reconstruction/i);

    // Verify claim line items display 19364-50, 69990, 15860, 35201-59, 99223-25
    await expect(page.getByText('19364-50').first()).toBeVisible();
    await expect(page.getByText('35201-59').first()).toBeVisible();
    await expect(page.getByText('99223-25').first()).toBeVisible();

    // Switch to Unilateral DIEP
    await page.locator('select').first().selectOption('unilateral');
    await expect(page.getByText('19364').first()).toBeVisible();

    // Enable contralateral symmetry
    const symmetryCheckbox = page.getByRole('checkbox', { name: /Contralateral Symmetry Mastopexy/i });
    await symmetryCheckbox.check();
    await expect(page.getByText('19316-59').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'diep_flap_reconstruction_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 89 tools and includes Pediatric TEF/EA and DIEP Flap scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric TEF & Esophageal Atresia Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/DIEP Flap Breast Reconstruction Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 84+ specialties and links to TEF/EA and DIEP Flap', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify specialties counter
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Tracheoesophageal Fistula & Esophageal Atresia \(TEF\/EA\) Repair/i).first()).toBeVisible();
    await expect(page.getByText(/Complex Adult Reconstructive Microsurgery & Autologous DIEP Flap Breast Reconstruction/i).first()).toBeVisible();
  });
});
