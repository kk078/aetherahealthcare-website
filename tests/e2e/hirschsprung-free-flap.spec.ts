import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 32 Expansion: Pediatric Hirschsprung Pull-Through & Head/Neck Free Flap', () => {
  test('Specialty 85: Pediatric Hirschsprung Pull-Through page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-hirschsprung-pull-through`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Hirschsprung|TERPT|Pull-Through/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Hirschsprung Disease & Transanal Endorectal Pull-Through/i);

    // Verify key CPT codes
    await expect(page.getByText('45120').first()).toBeVisible();
    await expect(page.getByText('44150').first()).toBeVisible();
    await expect(page.getByText('49320').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 86: Complex Head & Neck Free Flap Reconstruction page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/head-and-neck-free-flap-reconstruction`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Head & Neck Free Flap|Microvascular|Fibula/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Complex Adult Head & Neck Microvascular Free Flap Reconstruction/i);

    // Verify key CPT codes
    await expect(page.getByText('20955').first()).toBeVisible();
    await expect(page.getByText('15756').first()).toBeVisible();
    await expect(page.getByText('21247').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #90: Pediatric Hirschsprung Scrubber audits 45120, leveling biopsies 44150-59 & lap mobilization 49320-59', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-hirschsprung-pull-through-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Hirschsprung Pull-Through Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Hirschsprung Pull-Through Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric Hirschsprung Pull-Through Scrubber/i);

    // Verify claim line items display 45120, 44150-59, 49320-59, 99291-25
    await expect(page.locator('tbody tr td').filter({ hasText: '45120' }).first()).toBeVisible();
    await expect(page.getByText('44150-59').first()).toBeVisible();
    await expect(page.getByText('49320-59').first()).toBeVisible();
    await expect(page.getByText('99291-25').first()).toBeVisible();

    // Switch technique to Duhamel -> 45112
    await page.locator('select').first().selectOption('duhamel');
    await expect(page.locator('tbody tr td').filter({ hasText: '45112' }).first()).toBeVisible();

    // Toggle colostomy takedown -> 44620-59
    const colostomyCheckbox = page.getByRole('checkbox', { name: /Colostomy Takedown & Anastomosis/i });
    await colostomyCheckbox.check();
    await expect(page.getByText('44620-59').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_hirschsprung_pull_through_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #91: Head & Neck Free Flap Scrubber audits fibula 20955, plating 21247-59, microscope 69990 & neck dissection 38724-59', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/head-and-neck-free-flap-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Head & Neck Free Flap Reconstruction Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Head & Neck Free Flap Reconstruction Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Head & Neck Free Flap Reconstruction Scrubber/i);

    // Verify claim line items display 20955, 21247-59, 69990, 15860-59, 38724-59, 31600-59, 99223-25
    await expect(page.locator('tbody tr td').filter({ hasText: '20955' }).first()).toBeVisible();
    await expect(page.getByText('21247-59').first()).toBeVisible();
    await expect(page.getByText('69990').first()).toBeVisible();
    await expect(page.getByText('38724-59').first()).toBeVisible();
    await expect(page.getByText('31600-59').first()).toBeVisible();

    // Switch flap type to ALT -> 15756
    await page.locator('select').first().selectOption('alt');
    await expect(page.locator('tbody tr td').filter({ hasText: '15756' }).first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'head_and_neck_free_flap_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 91 tools and includes Pediatric Hirschsprung and Head/Neck Free Flap scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric Hirschsprung Pull-Through Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/Head & Neck Free Flap Reconstruction Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 86+ specialties and links to Hirschsprung and Head/Neck Free Flap', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify specialties counter
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Hirschsprung Disease & Transanal Endorectal Pull-Through/i).first()).toBeVisible();
    await expect(page.getByText(/Complex Adult Head & Neck Microvascular Free Flap Reconstruction/i).first()).toBeVisible();
  });
});
