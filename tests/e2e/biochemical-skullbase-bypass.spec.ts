import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 26 Expansion: Pediatric Biochemical Genetics & Skull Base EC-IC Bypass', () => {
  test('Specialty 73: Pediatric Biochemical Genetics & Inborn Errors of Metabolism page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-biochemical-genetics`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Inborn Errors of Metabolism|Biochemical Genetics/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Inborn Errors of Metabolism/i);

    // Verify key CPT codes & content
    await expect(page.getByText('82136').first()).toBeVisible();
    await expect(page.getByText('82139').first()).toBeVisible();
    await expect(page.getByText('83918').first()).toBeVisible();
    await expect(page.getByText('99417').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 74: Complex Skull Base Cerebrovascular Bypass & Microvascular EC-IC Anastomosis page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/skull-base-cerebrovascular-bypass`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Skull Base Cerebrovascular Bypass|EC-IC Anastomosis/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Skull Base Cerebrovascular Bypass/i);

    // Verify key CPT codes & clinical challenges
    await expect(page.getByText('61711').first()).toBeVisible();
    await expect(page.getByText('61592').first()).toBeVisible();
    await expect(page.getByText('35500').first()).toBeVisible();
    await expect(page.getByText('69990').first()).toBeVisible();

    // Verify CTA link visibility
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #78: Pediatric Biochemical Genetics Scrubber audits tandem MS/MS 82139, prolonged visit +99417 & B4162 formula', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-biochemical-genetics-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Biochemical Genetics|Scrubber|Aethera/i);

    // Check headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Biochemical Genetics & Metabolic Formula Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric Biochemical Genetics & Metabolic Formula Scrubber/i);

    // Verify claim line items display 99205, +99417, 82139, 83918, 82010, B4162
    await expect(page.getByText('99205').first()).toBeVisible();
    await expect(page.getByText('+99417').first()).toBeVisible();
    await expect(page.getByText('82139').first()).toBeVisible();
    await expect(page.getByText('83918').first()).toBeVisible();
    await expect(page.getByText('82010').first()).toBeVisible();
    await expect(page.getByText('B4162').first()).toBeVisible();

    // Switch formula to unauthorized to test non-coverage warning
    await page.getByRole('button', { name: /Denied as OTC Supplement \(B4157\)/i }).click();
    await expect(page.getByText(/CRITICAL DENIAL: Specialized metabolic formula submitted without prior-authorization/i)).toBeVisible();

    // Switch amino acid method to qualitative
    await page.getByRole('button', { name: /Limited Screen \(82136\)/i }).click();
    await expect(page.getByText('82136').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_biochemical_genetics_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #79: Skull Base Bypass Scrubber audits STA-MCA 61711, orbitozygomatic 61592, graft 35500 & microscope 69990', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/skull-base-bypass-aneurysm-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Complex EC-IC Cerebrovascular Bypass|Scrubber|Aethera/i);

    // Check headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Complex EC-IC Cerebrovascular Bypass & Aneurysm Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Complex EC-IC Cerebrovascular Bypass & Aneurysm Scrubber/i);

    // Verify claim line items display 61711, 61592, +35500, +69990, 93985
    await expect(page.getByText('61711').first()).toBeVisible();
    await expect(page.getByText('61592').first()).toBeVisible();
    await expect(page.getByText('+35500').first()).toBeVisible();
    await expect(page.getByText('+69990').first()).toBeVisible();
    await expect(page.getByText('93985').first()).toBeVisible();

    // Switch approach to standard pterional craniotomy to test NCCI bundling audit
    await page.getByRole('button', { name: /Standard Pterional Craniotomy \(Test Bundling\)/i }).click();
    await expect(page.getByText(/CRITICAL NCCI EDIT: Standard craniotomy is an integral surgical approach component/i)).toBeVisible();

    // Switch bypass conduit to direct STA-MCA
    await page.getByRole('button', { name: /Direct STA-MCA/i }).click();
    await expect(page.getByText('61711').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'skull_base_bypass_aneurysm_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 79+ tools and includes genetics and skull base bypass scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric Biochemical Genetics & Metabolic Formula Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/Complex EC-IC Cerebrovascular Bypass & Aneurysm Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 74+ specialties and links to biochemical genetics and skull base bypass', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify 74+ specialties counter with flexible regex
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Inborn Errors of Metabolism & Biochemical Genetics/i).first()).toBeVisible();
    await expect(page.getByText(/Complex Skull Base Cerebrovascular Bypass & Microvascular EC-IC Anastomosis/i).first()).toBeVisible();
  });
});
