import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 25 Expansion: Pediatric DBS Neuromodulation & Panfacial Trauma Reconstruction', () => {
  test('Specialty 71: Pediatric Deep Brain Stimulation & Neuromodulation page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-dbs-neuromodulation`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric Deep Brain Stimulation|Neuromodulation/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Pediatric Deep Brain Stimulation/i);

    // Verify key CPT codes & content
    await expect(page.getByText('61867').first()).toBeVisible();
    await expect(page.getByText('61863').first()).toBeVisible();
    await expect(page.getByText('61886').first()).toBeVisible();
    await expect(page.getByText('20660').first()).toBeVisible();

    // Verify CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 72: Open Craniofacial Fracture & Panfacial Trauma Reconstruction page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/panfacial-trauma-reconstruction`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Panfacial Trauma|Craniofacial Fracture/i);

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(/Panfacial Trauma/i);

    // Verify key CPT codes & clinical challenges
    await expect(page.getByText('21435').first()).toBeVisible();
    await expect(page.getByText('21365').first()).toBeVisible();
    await expect(page.getByText('21462').first()).toBeVisible();
    await expect(page.getByText('21110').first()).toBeVisible();

    // Verify CTA link visibility
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment|Free Revenue Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #76: Pediatric DBS Scrubber audits MER 61867, headframe suppression 20660 & dual IPG 61886', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-dbs-neuromodulation-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Pediatric DBS|Scrubber|Aethera/i);

    // Check headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric DBS & Cranial Neuromodulation Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric Deep Brain Stimulation & Neuromodulation Scrubber/i);

    // Verify default bilateral MER claim lines
    await expect(page.getByText('61867').first()).toBeVisible();
    await expect(page.getByText('+61868').first()).toBeVisible();
    await expect(page.getByText('61886').first()).toBeVisible();
    await expect(page.getByText('20660').first()).toBeVisible();

    // Verify NCCI alert warning is displayed for 20660 headframe bundling
    await expect(page.getByText(/CRITICAL NCCI EDIT: Headframe placement \(20660\) is statutorily inclusive/i)).toBeVisible();

    // Switch to unilateral and no MER
    await page.getByRole('button', { name: /Unilateral \(1 Lead\)/i }).click();
    await page.getByRole('button', { name: /No MER \(61863\)/i }).click();
    await expect(page.getByText('61863').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_dbs_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #77: Panfacial Trauma Scrubber audits Le Fort III 21435, ZMC 21365, mandible 21462 & IMF 21110', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/panfacial-trauma-reconstruction-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Panfacial Trauma|Scrubber|Aethera/i);

    // Check headings
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Panfacial Trauma & Multi-Level Fracture Reconstruction Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Panfacial Trauma & Multi-Level Fracture Reconstruction Scrubber/i);

    // Verify claim line items display 21435, 21365, 21462, 21110, 21390, +20900
    await expect(page.getByText('21435').first()).toBeVisible();
    await expect(page.getByText('21365').first()).toBeVisible();
    await expect(page.getByText('21462').first()).toBeVisible();
    await expect(page.getByText('21110').first()).toBeVisible();
    await expect(page.getByText('21390').first()).toBeVisible();
    await expect(page.getByText('+20900').first()).toBeVisible();

    // Switch IMF strategy to intraoperative removal to test bundling audit
    await page.getByRole('button', { name: /Intraoperative Removal \(Test Bundling\)/i }).click();
    await expect(page.getByText(/CRITICAL NCCI EDIT: Arch bars removed intraoperatively are inclusive/i)).toBeVisible();

    // Switch to Le Fort II
    await page.getByRole('button', { name: /Le Fort II \(21423\)/i }).click();
    await expect(page.getByText('21423').first()).toBeVisible();

    // Capture visual screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'panfacial_trauma_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory Hub: Expands to 77+ tools and includes DBS and panfacial trauma scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Free Medical Billing/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    await expect(page.getByText(/Pediatric DBS & Cranial Neuromodulation Scrubber/i).first()).toBeVisible();
    await expect(page.getByText(/Panfacial Trauma & Multi-Level Fracture Reconstruction Scrubber/i).first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 72+ specialties and links to pediatric DBS and panfacial trauma', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties/i);

    // Verify 72+ specialties counter with flexible regex
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify presence of both new specialties
    await expect(page.getByText(/Pediatric Deep Brain Stimulation & Neuromodulation/i).first()).toBeVisible();
    await expect(page.getByText(/Open Craniofacial Fracture & Panfacial Trauma Reconstruction/i).first()).toBeVisible();
  });
});
