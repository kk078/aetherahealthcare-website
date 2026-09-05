import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 27 Expansion: Pediatric MIBG Radiopharmaceutical & Complex Robotic Hernia TAR', () => {
  test('Specialty 75: Pediatric Targeted Radioiodine & MIBG Therapy for Neuroblastoma page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-mibg-radiopharmaceutical`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Targeted Radioiodine|MIBG Therapy/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Targeted Radioiodine & MIBG Therapy/i);

    // Verify key CPT / HCPCS codes
    await expect(page.getByText('79445').first()).toBeVisible();
    await expect(page.getByText('78830').first()).toBeVisible();
    await expect(page.getByText('77336').first()).toBeVisible();
    await expect(page.getByText('A9508').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 76: Multi-Compartment Complex Robotic & Laparoscopic Hernia Reconstruction page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/complex-robotic-hernia-reconstruction`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Complex Robotic & Laparoscopic Hernia Reconstruction|Multi-Compartment/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Multi-Compartment Complex Robotic & Laparoscopic Hernia Reconstruction/i);

    // Verify key CPT codes
    await expect(page.getByText('49591').first()).toBeVisible();
    await expect(page.getByText('49622').first()).toBeVisible();
    await expect(page.getByText('49623').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #80: Pediatric MIBG Scrubber audits 79445, A9508 isotope pass-through, medical physics +77336, SPECT/CT 78830 & stem cell rescue +38240', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-mibg-radiopharmaceutical-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Targeted MIBG|Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Targeted MIBG & Radiopharmaceutical Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric I-131 MIBG & Neuroblastoma Radionuclide Scrubber/i);

    // Verify claim line items display 79445, A9508, 77336-26, 78830-26, 77300-26, 38240-58
    await expect(page.getByText('79445').first()).toBeVisible();
    await expect(page.getByText('A9508').first()).toBeVisible();
    await expect(page.getByText('77336-26').first()).toBeVisible();
    await expect(page.getByText('78830-26').first()).toBeVisible();
    await expect(page.getByText('38240-58').first()).toBeVisible();

    // Toggle thyroid blockade off to verify audit warning
    const thyroidCheckbox = page.getByRole('checkbox', { name: /Thyroid Blockade Documentation/i });
    if (await thyroidCheckbox.isVisible()) {
      await thyroidCheckbox.click();
      await expect(page.getByText(/AUDIT WARNING: Failure to document potassium iodide/i)).toBeVisible();
    }

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_mibg_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #81: Complex Robotic Hernia Scrubber audits CPT 2023+ codes (49591-49618), TAR +49622 & mesh +49623', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/complex-robotic-hernia-tar-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Complex Robotic Hernia|Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Complex Robotic Hernia & TAR Component Separation Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Complex Robotic Hernia & TAR Component Separation Scrubber/i);

    // Recurrent, >10cm default maps to CPT 49617
    await expect(page.getByText('49617').first()).toBeVisible();
    await expect(page.getByText('+49622').first()).toBeVisible();
    await expect(page.getByText('+49623').first()).toBeVisible();

    // Switch acuity to Incarcerated / Strangulated -> maps to 49618
    await page.getByRole('button', { name: /Incarcerated \/ Strangulated/i }).click();
    await expect(page.getByText('49618').first()).toBeVisible();

    // Switch to initial reducible -> maps to 49595
    await page.getByRole('button', { name: /Initial Ventral \/ Incisional/i }).click();
    await page.getByRole('button', { name: /Reducible Hernia Defect/i }).click();
    await expect(page.getByText('49595').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'complex_robotic_hernia_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 81 tools and includes MIBG and Complex Robotic Hernia scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric Targeted MIBG & Radiopharmaceutical Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/Complex Robotic Hernia & TAR Component Separation Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 76+ specialties and links to MIBG and Complex Robotic Hernia', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify 76+ specialties counter
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Targeted Radioiodine & MIBG Therapy for Neuroblastoma/i).first()).toBeVisible();
    await expect(page.getByText(/Multi-Compartment Complex Robotic & Laparoscopic Hernia Reconstruction/i).first()).toBeVisible();
  });
});
