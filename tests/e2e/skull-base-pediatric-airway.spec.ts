import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 19: Lateral Skull Base & Pediatric Airway Suite', () => {
  test('Specialty 59: Complex Lateral Skull Base Surgery & Acoustic Neuroma page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/skull-base-surgery`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Complex Lateral Skull Base Surgery & Acoustic Neuroma Resection/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Complex Lateral Skull Base Surgery & Acoustic Neuroma Resection/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('61526').first()).toBeVisible();
    await expect(page.getByText('61530').first()).toBeVisible();
    await expect(page.getByText('61590').first()).toBeVisible();
    await expect(page.getByText('69990').first()).toBeVisible();
    await expect(page.getByText('95940').first()).toBeVisible();
    await expect(page.getByText(/Co-surgeon Modifier -62 matching discrepancies/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 60: Pediatric Airway Reconstruction & Complex Laryngotracheal Stenosis page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-airway`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Pediatric Airway Reconstruction & Complex Laryngotracheal Stenosis/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Airway Reconstruction & Complex Laryngotracheal Stenosis/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('31587').first()).toBeVisible();
    await expect(page.getByText('31590').first()).toBeVisible();
    await expect(page.getByText('31584').first()).toBeVisible();
    await expect(page.getByText('20902').first()).toBeVisible();
    await expect(page.getByText(/Autologous costal cartilage graft harvest \(\+20902\) unbundling rejections/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #64: Skull Base Scrubber audits approach, co-surgeon Mod 62, microscope & neuromonitoring', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/skull-base-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Lateral Skull Base & Acoustic Neuroma Co-Surgeon Scrubber/i);

    // Verify default translabyrinthine approach (61526), +69990, 95940, 20926
    await expect(page.getByText('61526').first()).toBeVisible();
    await expect(page.getByText('+69990').first()).toBeVisible();
    await expect(page.getByText('95940').first()).toBeVisible();
    await expect(page.getByText('20926').first()).toBeVisible();
    await expect(page.getByText(/Total Work RVUs/i).first()).toBeVisible();
    await expect(page.getByText('wRVUs').first()).toBeVisible();

    // Verify initial clean compliant co-surgeon alert
    await expect(page.getByText(/Compliant Dual-Attending Co-Surgery \(Modifier 62\)/i)).toBeVisible();

    // Test selecting mismatched co-surgeon status
    await page.locator('select').first().selectOption('mismatched_codes');
    await expect(page.getByText(/Mismatched Primary Codes on Co-Surgeon Claims/i)).toBeVisible();

    // Revert to compliant
    await page.locator('select').first().selectOption('compliant_matching_62');

    // Test unchecking dedicated neurophysiologist to trigger surgeon IONM prohibition
    await page.getByText(/Billed by independent clinical neurophysiologist/i).click();
    await expect(page.getByText(/Primary Surgeon IONM Billing Prohibition/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'skull_base_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #65: Pediatric Airway Scrubber audits LTR, CTR downcoding, rib harvest & staged bronchoscopy', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-airway-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Laryngotracheal Reconstruction Scrubber/i);

    // Default procedure is single-stage LTR (31587), rib harvest (20902), staged bronchoscopy (31622)
    await expect(page.getByText('31587').first()).toBeVisible();
    await expect(page.getByText('20902').first()).toBeVisible();
    await expect(page.getByText('31622').first()).toBeVisible();
    await expect(page.getByText(/Total Work RVUs/i).first()).toBeVisible();
    await expect(page.getByText('wRVUs').first()).toBeVisible();

    // Switch to Cricotracheal Resection (CTR 31584)
    await page.getByText(/Cricotracheal Resection \(CTR 31584\)/i).click();
    await expect(page.getByText('31584').first()).toBeVisible();

    // Test downcoding simulator
    await page.getByText(/Simulate Payer Downcoding: Downcode CTR/i).click();
    await expect(page.getByText(/Cricotracheal Resection Downcoding Clawback/i).first()).toBeVisible();

    // Revert downcoding
    await page.getByText(/Simulate Payer Downcoding: Downcode CTR/i).click();

    // Test unchecking separate inframammary incision to trigger rib harvest unbundling denial
    await page.getByText(/Separate inframammary incision documented with Modifier 59/i).click();
    await expect(page.getByText(/Rib Cartilage Harvest Unbundling Denial/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_airway_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 65 tools and includes Skull Base and Pediatric Airway scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    // Verify presence of newly added tool cards
    const skullBaseCard = page.getByRole('heading', { name: /Lateral Skull Base & Acoustic Neuroma Co-Surgeon Scrubber/i });
    await expect(skullBaseCard).toBeVisible();

    const airwayCard = page.getByRole('heading', { name: /Pediatric Laryngotracheal Reconstruction \(LTR\) Scrubber/i });
    await expect(airwayCard).toBeVisible();

    // Verify direct links work
    await expect(page.locator('a[href*="/tools/skull-base-scrubber"]').first()).toBeVisible();
    await expect(page.locator('a[href*="/tools/pediatric-airway-scrubber"]').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 60+ specialties and includes Skull Base and Pediatric Airway links', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify specialty card titles
    const skullBaseHeading = page.getByRole('heading', { name: /Complex Lateral Skull Base Surgery & Acoustic Neuroma Resection/i });
    await expect(skullBaseHeading).toBeVisible();

    const airwayHeading = page.getByRole('heading', { name: /Pediatric Airway Reconstruction & Complex Laryngotracheal Stenosis/i });
    await expect(airwayHeading).toBeVisible();

    // Verify dedicated playbook links
    await expect(page.locator('a[href*="/medical-billing/skull-base-surgery"]').first()).toBeVisible();
    await expect(page.locator('a[href*="/medical-billing/pediatric-airway"]').first()).toBeVisible();
  });
});
