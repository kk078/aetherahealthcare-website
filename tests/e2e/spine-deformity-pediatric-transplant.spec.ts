import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 17: Complex Spine Deformity & Pediatric Transplant Suite', () => {
  test('Specialty 55: Complex Spine Deformity & Vertebral Column Resection page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/complex-spine-deformity`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Complex Spine Deformity & Vertebral Column Resection/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Complex Spine Deformity & Vertebral Column Resection/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('22206').first()).toBeVisible();
    await expect(page.getByText('22207').first()).toBeVisible();
    await expect(page.getByText('22208').first()).toBeVisible();
    await expect(page.getByText('22844').first()).toBeVisible();
    await expect(page.getByText('22848').first()).toBeVisible();
    await expect(page.getByText(/3-Column osteotomy downcoding clawbacks/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 56: Pediatric Solid Organ Transplant & Intestinal Rehabilitation page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-transplant`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Pediatric Solid Organ Transplant & Intestinal Rehabilitation/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Solid Organ Transplant & Intestinal Rehabilitation/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('44130').first()).toBeVisible();
    await expect(page.getByText('44135').first()).toBeVisible();
    await expect(page.getByText('47135').first()).toBeVisible();
    await expect(page.getByText('44720').first()).toBeVisible();
    await expect(page.getByText(/Organ acquisition cost center vs professional billing disputes/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #60: VCR Spine Scrubber audits 3-column osteotomy, add-on segments & spinopelvic fixation', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/vcr-spine-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Vertebral Column Resection & 3-Column Osteotomy Scrubber/i);

    // Verify default thoracic VCR (22207) and +22208 add-on
    await expect(page.getByText('22207').first()).toBeVisible();
    await expect(page.getByText('+22208').first()).toBeVisible();
    await expect(page.getByText('22844').first()).toBeVisible();
    await expect(page.getByText('+22848').first()).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)? Total wRVUs/i)).toBeVisible();

    // Test downcoding simulator
    await page.getByText(/Simulate Commercial Downcoding to Posterior Column/i).click();
    await expect(page.getByText(/3-Column VCR Downcoded to Posterior Column/i)).toBeVisible();

    // Revert downcoding
    await page.getByText(/Simulate Commercial Downcoding to Posterior Column/i).click();

    // Test unchecking distinct pelvic connectors to trigger NCCI fatal unbundling alert
    await page.getByText(/Modular Offset Connectors & Separate Iliac Tract Documented/i).click();
    await expect(page.getByText(/Spinopelvic Fixation Bundling Rejection/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'vcr_spine_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #61: Pediatric Transplant Scrubber audits STEP enteroplasty, Worksheet D-4 & bench surgery', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-transplant-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Intestinal Rehabilitation & Transplant Scrubber/i);

    // Default procedure is combined liver intestine (44135 + 47135)
    await expect(page.getByText('44135').first()).toBeVisible();
    await expect(page.getByText('47135').first()).toBeVisible();
    await expect(page.getByText('+44720').first()).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)? Total wRVUs/i)).toBeVisible();

    // Test STEP enteroplasty selection
    await page.getByRole('button', { name: /Serial Transverse Enteroplasty \(STEP Procedure\)/i }).click();
    await expect(page.getByText('44130').first()).toBeVisible();
    await expect(page.getByText(/STEP Enteroplasty Medical Necessity Substantiated/i)).toBeVisible();

    // Test investigational denial simulation
    await page.getByText(/Simulate Payer "Investigational \/ Experimental" Exclusion Denial/i).click();
    await expect(page.getByText(/Commercial "Experimental \/ Investigational" Non-Coverage Denial/i)).toBeVisible();

    // Test organ acquisition mode switch to fatal CMS-1500 billing
    await page.getByRole('button', { name: /Billed on CMS-1500 \(Fatal Error\)/i }).click();
    await expect(page.getByText(/Organ Acquisition Cost Allocation Violation/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_transplant_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 61 tools and includes VCR and Pediatric Transplant scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    // Search for VCR Spine
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('Vertebral Column Resection');
    await expect(page.getByRole('heading', { name: /Vertebral Column Resection \(VCR\) & Spine Deformity Scrubber/i })).toBeVisible();

    // Search for Pediatric Transplant
    await searchInput.fill('Pediatric Solid Organ Transplant');
    await expect(page.getByRole('heading', { name: /Pediatric Solid Organ Transplant & Intestinal Rehabilitation Scrubber/i })).toBeVisible();
  });

  test('Specialties Hub: Expands to 56+ specialties with Spine Deformity and Pediatric Transplant links', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Billing built for your specialty/i);
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Check links exist
    const spineLink = page.locator('a[href*="/medical-billing/complex-spine-deformity"]').first();
    await expect(spineLink).toBeVisible();

    const transplantLink = page.locator('a[href*="/medical-billing/pediatric-transplant"]').first();
    await expect(transplantLink).toBeVisible();
  });
});
