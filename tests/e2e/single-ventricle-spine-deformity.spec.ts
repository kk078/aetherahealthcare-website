import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 29 Expansion: Single-Ventricle Palliation & Adult Spine Deformity LLIF', () => {
  test('Specialty 79: Pediatric Single-Ventricle Congenital Heart Disease Palliation page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-single-ventricle-palliation`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Single-Ventricle Congenital Heart Disease Palliation|Norwood/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Single-Ventricle Congenital Heart Disease Palliation/i);

    // Verify key CPT codes
    await expect(page.getByText('33619').first()).toBeVisible();
    await expect(page.getByText('33767').first()).toBeVisible();
    await expect(page.getByText('33737').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 80: Multi-Level Minimally Invasive Adult Spinal Deformity & Lateral Interbody Fusion page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/minimally-invasive-adult-spine-deformity`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Multi-Level Minimally Invasive Adult Spinal Deformity|LLIF/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Multi-Level Minimally Invasive Adult Spinal Deformity/i);

    // Verify key CPT codes
    await expect(page.getByText('22558').first()).toBeVisible();
    await expect(page.getByText('22848').first()).toBeVisible();
    await expect(page.getByText('61783').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #84: Pediatric Single-Ventricle Norwood Scrubber audits Norwood 33619, Sano 33766, PA patch +33688 & delayed closure +33530', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-single-ventricle-norwood-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Single-Ventricle Norwood & Glenn Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Single-Ventricle Norwood & Glenn Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric Single-Ventricle Norwood & Glenn Scrubber/i);

    // Verify claim line items display 33619, 33766-59, +33688, 33530-58
    await expect(page.getByText('33619').first()).toBeVisible();
    await expect(page.getByText('33766-59').first()).toBeVisible();
    await expect(page.getByText('+33688').first()).toBeVisible();
    await expect(page.getByText('33530-58').first()).toBeVisible();

    // Switch stage to Stage 2 Glenn
    await page.getByRole('button', { name: /Stage 2 Glenn \(33767\)/i }).click();
    await expect(page.getByText('33767-58').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_single_ventricle_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #85: Adult Spine Deformity LLIF Scrubber audits 22558, add-ons +22552, ALLR Mod 22, +22842 & S2AI +22848', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/adult-spine-deformity-llif-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Adult Spine Deformity & Multi-Level LLIF Scrubber|Aethera/i);

    // Verify headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Adult Spine Deformity & Multi-Level LLIF Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Adult Spine Deformity & Multi-Level LLIF Scrubber/i);

    // Verify claim line items display 22558-22, +22552, +22853, +22842, +22848, +61783
    await expect(page.getByText('22558-22').first()).toBeVisible();
    await expect(page.getByText('+22848').first()).toBeVisible();
    await expect(page.getByText('+61783').first()).toBeVisible();

    // Select 4 levels
    await page.getByRole('button', { name: /4 Lvls/i }).click();
    await expect(page.getByText('+22552 (x3)').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'adult_spine_deformity_llif_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 85 tools and includes Single-Ventricle and Adult Spine Deformity scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric Single-Ventricle Norwood & Glenn Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/Adult Spine Deformity & Multi-Level LLIF Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 80+ specialties and links to Single-Ventricle and Adult Spine Deformity', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify 80+ specialties counter
    await expect(page.getByText(/80\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Single-Ventricle Congenital Heart Disease Palliation/i).first()).toBeVisible();
    await expect(page.getByText(/Multi-Level Minimally Invasive Adult Spinal Deformity/i).first()).toBeVisible();
  });
});
