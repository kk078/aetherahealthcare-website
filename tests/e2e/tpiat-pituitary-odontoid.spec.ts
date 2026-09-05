import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 28 Expansion: Pediatric TPIAT Islet Transplant & Endoscopic Skull Base Odontoid', () => {
  test('Specialty 77: Pediatric Total Pancreatectomy with Islet Autotransplantation page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-tpiat-islet-transplant`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Total Pancreatectomy with Islet Autotransplantation|TPIAT/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Total Pancreatectomy with Islet Autotransplantation/i);

    // Verify key CPT codes
    await expect(page.getByText('48155').first()).toBeVisible();
    await expect(page.getByText('48805').first()).toBeVisible();
    await expect(page.getByText('48554').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 78: Endoscopic Transnasal Odontoid & Pituitary Skull Base Resection page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/endoscopic-pituitary-odontoid-resection`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Endoscopic Transnasal Odontoid|Pituitary Skull Base/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Endoscopic Transnasal Odontoid & Pituitary Skull Base Resection/i);

    // Verify key CPT codes
    await expect(page.getByText('61575').first()).toBeVisible();
    await expect(page.getByText('61548').first()).toBeVisible();
    await expect(page.getByText('15730').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #82: Pediatric TPIAT Scrubber audits total pancreatectomy 48155, cGMP isolation 48805 & autotransplant +48554', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-tpiat-islet-transplant-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric TPIAT & Islet Isolation Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric TPIAT & Islet Isolation Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric TPIAT & Islet Isolation Scrubber/i);

    // Verify claim line items display 48155, 48805, 48554, 37202, 99291
    await expect(page.getByText('48155').first()).toBeVisible();
    await expect(page.getByText('48805').first()).toBeVisible();
    await expect(page.getByText('48554').first()).toBeVisible();

    // Switch access route to transhepatic catheter -> maps to 36481
    await page.getByRole('button', { name: /Transhepatic Access \(36481\)/i }).click();
    await expect(page.getByText('36481').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_tpiat_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #83: Endoscopic Skull Base Scrubber audits transnasal odontoid 61575, nasoseptal flap 15730 & navigation +61782', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/endoscopic-pituitary-odontoid-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Endoscopic Skull Base Pituitary & Odontoid Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Endoscopic Skull Base Pituitary & Odontoid Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Endoscopic Skull Base Pituitary & Odontoid Scrubber/i);

    // Verify claim line items display 61575-62, 15730-59, +61782, 62272-59, +69990
    await expect(page.getByText('61575-62').first()).toBeVisible();
    await expect(page.getByText('15730-59').first()).toBeVisible();
    await expect(page.getByText('+61782').first()).toBeVisible();

    // Switch pathology to Pituitary Sellar -> maps to 61548
    await page.getByRole('button', { name: /Pituitary Sellar \(61548\)/i }).click();
    await expect(page.getByText('61548-62').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'endoscopic_pituitary_odontoid_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 83 tools and includes TPIAT and Endoscopic Skull Base scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric TPIAT & Islet Isolation Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/Endoscopic Skull Base Pituitary & Odontoid Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 78+ specialties and links to TPIAT and Endoscopic Skull Base', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify 78+ specialties counter
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Total Pancreatectomy with Islet Autotransplantation \(TPIAT\)/i).first()).toBeVisible();
    await expect(page.getByText(/Endoscopic Transnasal Odontoid & Pituitary Skull Base Resection/i).first()).toBeVisible();
  });
});
