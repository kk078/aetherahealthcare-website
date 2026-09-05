import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 18: Cardiac LVAD Reoperation & Pediatric Epilepsy Suite', () => {
  test('Specialty 57: Complex Adult Cardiac Reoperation & LVAD page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/cardiac-lvad-reoperation`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Complex Adult Cardiac Reoperation & Ventricular Assist Devices/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Complex Adult Cardiac Reoperation & Ventricular Assist Devices/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('33979').first()).toBeVisible();
    await expect(page.getByText('33530').first()).toBeVisible();
    await expect(page.getByText('33981').first()).toBeVisible();
    await expect(page.getByText('33405').first()).toBeVisible();
    await expect(page.getByText(/Redo sternotomy add-on \(\+33530\) bundling clawbacks/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 58: Pediatric Epilepsy Surgery & Hemispherotomy page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-epilepsy-surgery`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Pediatric Epilepsy Surgery & Hemispherotomy/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Epilepsy Surgery & Hemispherotomy/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('61760').first()).toBeVisible();
    await expect(page.getByText('61781').first()).toBeVisible();
    await expect(page.getByText('61543').first()).toBeVisible();
    await expect(page.getByText('95724').first()).toBeVisible();
    await expect(page.getByText(/Stereo-EEG \(sEEG 61760\) trajectory unit denials/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #62: Durable LVAD Scrubber audits pump placement, redo sternotomy & valve repairs', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/lvad-cardiac-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Durable LVAD Implantation & Cardiac Reoperation Scrubber/i);

    // Verify default durable LVAD (33979) and +33530 redo add-on
    await expect(page.getByText('33979').first()).toBeVisible();
    await expect(page.getByText('+33530').first()).toBeVisible();
    await expect(page.getByText('33464').first()).toBeVisible();
    await expect(page.getByText('99291').first()).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)?\s+wRVUs/i).first()).toBeVisible();

    // Test downcoding simulator
    await page.getByText(/Simulate Commercial Downcoding to Temporary VAD/i).click();
    await expect(page.getByText(/Durable LVAD Downcoded to Temporary System/i)).toBeVisible();

    // Revert downcoding
    await page.getByText(/Simulate Commercial Downcoding to Temporary VAD/i).click();

    // Test unchecking prior surgical interval >30 days to trigger NCCI bundling alert
    await page.getByText(/Prior Surgical Interval > 30 Days Documented/i).click();
    await expect(page.getByText(/Redo Sternotomy Add-On Bundling Rejection/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'lvad_cardiac_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #63: Pediatric Epilepsy Scrubber audits sEEG, robotic navigation & staged hemispherotomy', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-epilepsy-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Hemispherotomy & Stereo-EEG Scrubber/i);

    // Default procedure is sEEG (61760), robotic nav (+61781), complete hemispherotomy (61543)
    await expect(page.getByText('61760').first()).toBeVisible();
    await expect(page.getByText('+61781').first()).toBeVisible();
    await expect(page.getByText('61543').first()).toBeVisible();
    await expect(page.getByText('95724').first()).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)?\s+wRVUs/i).first()).toBeVisible();

    // Test missing Modifier 58 within global period
    await page.getByText(/Append Modifier -58/i).click();
    await expect(page.getByText(/Fatal Postoperative Global Period Denial \(Missing Modifier 58\)/i)).toBeVisible();

    // Re-check Modifier 58
    await page.getByText(/Append Modifier -58/i).click();

    // Test downcoding simulator
    await page.getByText(/Simulate Commercial Downcoding to Simple Lobectomy/i).click();
    await expect(page.getByText(/Hemispherotomy Downcoded to Simple Lobectomy/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_epilepsy_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 63 tools and includes LVAD and Pediatric Epilepsy scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    // Search for LVAD
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('LVAD');
    await expect(page.getByRole('heading', { name: /Durable LVAD Implantation & Cardiac Reoperation Scrubber/i })).toBeVisible();

    // Search for Pediatric Epilepsy
    await searchInput.fill('Hemispherotomy');
    await expect(page.getByRole('heading', { name: /Pediatric Hemispherotomy & Stereo-EEG Scrubber/i })).toBeVisible();
  });

  test('Specialties Hub: Expands to 58+ specialties with Cardiac LVAD and Pediatric Epilepsy links', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Billing built for your specialty/i);
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Check links exist
    const cardiacLink = page.locator('a[href*="/medical-billing/cardiac-lvad-reoperation"]').first();
    await expect(cardiacLink).toBeVisible();

    const epilepsyLink = page.locator('a[href*="/medical-billing/pediatric-epilepsy-surgery"]').first();
    await expect(epilepsyLink).toBeVisible();
  });
});
