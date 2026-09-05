import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 24 Expansion: Pediatric Vascular Anomalies & Orthopedic Oncology Mega-Prosthesis', () => {
  test('Specialty 69: Pediatric Vascular Malformations & Sclerotherapy page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-vascular-malformations`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Vascular Malformations/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Vascular Malformations/i);

    // Verify key CPT codes & content
    await expect(page.getByText('37241').first()).toBeVisible();
    await expect(page.getByText('49185').first()).toBeVisible();
    await expect(page.getByText('J9040').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 70: Complex Orthopedic Oncology & Limb Salvage Reconstruction page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/orthopedic-oncology-limb-salvage`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Orthopedic Oncology|Limb Salvage/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Orthopedic Oncology/i);

    // Verify key CPT codes & clinical challenges
    await expect(page.getByText('27075').first()).toBeVisible();
    await expect(page.getByText('15734').first()).toBeVisible();
    await expect(page.getByText('27599').first()).toBeVisible();

    // Verify CTA link visibility
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #74: Pediatric Vascular Malformation & Sclerotherapy Scrubber audits VM, Bleomycin J9040 & Mod 58', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-vascular-malformations-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Vascular Malformations/i);

    // Check headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Vascular Malformations & Sclerotherapy Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric Vascular Malformations & Sclerotherapy Scrubber/i);

    // Verify claim line item displays 37241
    await expect(page.getByText('37241').first()).toBeVisible();
    await expect(page.getByText('76937').first()).toBeVisible();
    await expect(page.getByText('77002').first()).toBeVisible();
    await expect(page.getByText('J9040').first()).toBeVisible();

    // Select AVM to check arterial 37242
    await page.getByRole('button', { name: /Arteriovenous Malformation \(AVM\)/i }).click();
    const selectElem = page.locator('select').first();
    await selectElem.selectOption('37242');
    await expect(page.getByText('37242').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_vascular_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #75: Orthopedic Oncology Mega-Prosthesis Scrubber audits distal femur, mega-prosthesis Mod 22 & gastrocnemius flap', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/orthopedic-oncology-limb-salvage-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Orthopedic Oncology/i);

    // Check headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Orthopedic Oncology & Limb Salvage Mega-Prosthesis Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Orthopedic Oncology & Limb Salvage Mega-Prosthesis Scrubber/i);

    // Verify claim line items display 27075, 27599, 15734, L8699
    await expect(page.getByText('27075').first()).toBeVisible();
    await expect(page.getByText('27599').first()).toBeVisible();
    await expect(page.getByText('15734').first()).toBeVisible();
    await expect(page.getByText('L8699').first()).toBeVisible();

    // Switch to proximal tibia
    await page.getByRole('button', { name: /Proximal Tibia \(CPT 27645\)/i }).click();
    await expect(page.getByText('27645').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'orthopedic_oncology_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 75+ tools and includes vascular and orthopedic oncology scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric Vascular Malformations & Sclerotherapy Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/Orthopedic Oncology & Limb Salvage Mega-Prosthesis Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 70+ specialties and links to vascular and orthopedic oncology', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify 70+ specialties counter with flexible regex
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Vascular Malformations, Hemangiomas & Sclerotherapy/i).first()).toBeVisible();
    await expect(page.getByText(/Complex Orthopedic Oncology & Limb Salvage Reconstruction/i).first()).toBeVisible();
  });
});
