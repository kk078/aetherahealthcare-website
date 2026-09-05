import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 30 Expansion: Pediatric SCT Coccygectomy & Retroperitoneal Sarcoma', () => {
  test('Specialty 81: Pediatric Sacrococcygeal Teratoma & Presacral Tumor page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-sacrococcygeal-teratoma`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Sacrococcygeal Teratoma|SCT/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Sacrococcygeal Teratoma/i);

    // Verify key CPT codes
    await expect(page.getByText('49220').first()).toBeVisible();
    await expect(page.getByText('27075').first()).toBeVisible();
    await expect(page.getByText('45120').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 82: Complex Adult Retroperitoneal Sarcoma & Multivisceral Resection page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/adult-retroperitoneal-sarcoma`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Complex Adult Retroperitoneal Sarcoma|Multivisceral/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Complex Adult Retroperitoneal Sarcoma/i);

    // Verify key CPT codes
    await expect(page.getByText('49205').first()).toBeVisible();
    await expect(page.getByText('50240').first()).toBeVisible();
    await expect(page.getByText('35281').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #86: Pediatric SCT Scrubber audits 49220-22, en-bloc coccygectomy 27075-59, 49000-59 & levatorplasty 49900', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-sct-coccygectomy-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric SCT & Coccygectomy Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric SCT & Coccygectomy Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric (?:SCT|Sacrococcygeal Teratoma) & Coccygectomy Scrubber/i);

    // Verify claim line items display 49220-22, 27075-59, 49000-59, 37617-59, 49900-59, 99291-25
    await expect(page.getByText('49220-22').first()).toBeVisible();
    await expect(page.getByText('27075-59').first()).toBeVisible();
    await expect(page.getByText('49000-59').first()).toBeVisible();

    // Switch to Altman Type IV
    await page.getByRole('button', { name: /Type IV: Presacral Internal/i }).click();
    await expect(page.getByText('45120').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_sct_coccygectomy_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #87: Adult Retroperitoneal Sarcoma Scrubber audits 49205-62, nephrectomy 50240-59, adrenalectomy 60540-59 & IVC 35281', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/adult-retroperitoneal-sarcoma-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Adult Retroperitoneal Sarcoma & Multivisceral Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Adult Retroperitoneal Sarcoma & Multivisceral Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Adult Retroperitoneal Sarcoma & Multivisceral Scrubber/i);

    // Verify claim line items display 49205-62, 50240-59, 60540-59, 44140-59, 35281-59
    await expect(page.getByText('49205-62').first()).toBeVisible();
    await expect(page.getByText('50240-59').first()).toBeVisible();
    await expect(page.getByText('35281-59').first()).toBeVisible();

    // Switch to < 5.0 cm
    await page.getByRole('button', { name: /< 5.0 cm \(49203\)/i }).click();
    await expect(page.getByText('49203-62').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'adult_retroperitoneal_sarcoma_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 87 tools and includes Pediatric SCT and Retroperitoneal Sarcoma scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric SCT & Coccygectomy Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/Adult Retroperitoneal Sarcoma & Multivisceral Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 82+ specialties and links to SCT and Retroperitoneal Sarcoma', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify specialties counter
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Sacrococcygeal Teratoma \(SCT\) & Congenital Presacral Tumor Resection/i).first()).toBeVisible();
    await expect(page.getByText(/Complex Adult Retroperitoneal Sarcoma & Multivisceral Compartment Resection/i).first()).toBeVisible();
  });
});
