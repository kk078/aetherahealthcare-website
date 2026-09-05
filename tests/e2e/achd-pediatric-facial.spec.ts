import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 20: ACHD & Pediatric Facial Reanimation Suite', () => {
  test('Specialty 61: Adult Congenital Heart Disease (ACHD) & Fontan Conversion page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/adult-congenital-heart-disease`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Adult Congenital Heart Disease/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Adult Congenital Heart Disease \(ACHD\) & Fontan Conversion/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('33737').first()).toBeVisible();
    await expect(page.getByText('33530').first()).toBeVisible();
    await expect(page.getByText('33257').first()).toBeVisible();
    await expect(page.getByText('33475').first()).toBeVisible();
    await expect(page.getByText(/Fontan conversion \(33737\) downcoding clawbacks/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 62: Pediatric Complex Facial Reanimation & Free Gracilis Transfer page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-facial-reanimation`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Pediatric Complex Facial Reanimation & Free Gracilis Transfer/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Complex Facial Reanimation & Free Gracilis Transfer/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('15756').first()).toBeVisible();
    await expect(page.getByText('64890').first()).toBeVisible();
    await expect(page.getByText('64864').first()).toBeVisible();
    await expect(page.getByText('69990').first()).toBeVisible();
    await expect(page.getByText(/Sural nerve harvest \(\+64890\/\+64891\) unbundling denials/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #66: ACHD Reoperation Scrubber audits Fontan conversion, redo sternotomy & cryoablation', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/achd-reoperation-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification (Single H1 on page, semantic H2 in component)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Adult Congenital Heart Disease \(ACHD\) & Fontan Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Adult Congenital Heart Disease \(ACHD\) & Fontan Conversion Scrubber/i);

    // Verify default codes: 33737, +33530, +33258, 33475-51, 93581
    await expect(page.getByText('33737').first()).toBeVisible();
    await expect(page.getByText('+33530').first()).toBeVisible();
    await expect(page.getByText('+33258').first()).toBeVisible();
    await expect(page.getByText('33475').first()).toBeVisible();
    await expect(page.getByText('93581').first()).toBeVisible();

    await expect(page.getByText(/Total Work RVUs/i).first()).toBeVisible();
    await expect(page.getByText('wRVUs').first()).toBeVisible();

    // Test unchecking dense adhesions documentation to trigger redo sternotomy clawback risk
    await page.getByText(/Operative report documents prolonged dissection of dense substernal/i).click();
    await expect(page.getByText(/Redo Sternotomy Adhesiolysis Clawback Risk/i).first()).toBeVisible();

    // Recheck adhesion documentation
    await page.getByText(/Operative report documents prolonged dissection of dense substernal/i).click();

    // Test unchecking Modifier -51 on concomitant PVR to trigger missing modifier alert
    await page.getByText(/Append Multiple Procedure Modifier -51 to secondary major cardiac procedure/i).click();
    await expect(page.getByText(/Missing Multiple Procedure Modifier -51 on Concomitant PVR/i).first()).toBeVisible();

    // Recheck Modifier -51
    await page.getByText(/Append Multiple Procedure Modifier -51 to secondary major cardiac procedure/i).click();

    // Verify copy EDI button
    await expect(page.getByText(/Copy 837P EDI/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'achd_reoperation_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #67: Pediatric Facial Reanimation Scrubber audits staged Mod 58, masseteric & free gracilis', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-facial-reanimation-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification (Single H1 on page, semantic H2 in component)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Facial Reanimation & Free Gracilis Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric Facial Reanimation & Free Gracilis Scrubber/i);

    // Default dual-innervation procedure: 15756-58, 64864-51, +69990, 20926-59
    await expect(page.getByText('15756').first()).toBeVisible();
    await expect(page.getByText('64864').first()).toBeVisible();
    await expect(page.getByText('+69990').first()).toBeVisible();
    await expect(page.getByText('20926').first()).toBeVisible();

    await expect(page.getByText(/Total Work RVUs/i).first()).toBeVisible();
    await expect(page.getByText('wRVUs').first()).toBeVisible();

    // Verify initial clean staged Modifier -58 alert
    await expect(page.getByText(/Staged Modifier -58 Protection Validated/i).first()).toBeVisible();

    // Test unchecking Modifier -58 to trigger fatal global surgery rejection
    await page.getByText(/Append Modifier -58 \(Staged Procedure\) to Free Gracilis Flap/i).click();
    await expect(page.getByText(/Missing Staged Modifier -58 on Stage 2 Transfer/i).first()).toBeVisible();

    // Recheck Modifier -58
    await page.getByText(/Append Modifier -58 \(Staged Procedure\) to Free Gracilis Flap/i).click();

    // Switch to Stage 1: Cross-Face Sural Nerve Graft
    await page.getByText(/Stage 1: Cross-Face Sural Nerve Graft \(CFNG\)/i).click();
    await expect(page.getByText('64890').first()).toBeVisible();
    await expect(page.getByText('+64891').first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_facial_reanimation_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 67 tools and includes ACHD and Pediatric Facial Reanimation scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/67 Free Medical Billing & RCM Tools/i);

    // Verify presence of newly added tool cards
    const achdCard = page.getByRole('heading', { name: /Adult Congenital Heart Disease \(ACHD\) & Fontan Conversion Scrubber/i });
    await expect(achdCard).toBeVisible();

    const facialCard = page.getByRole('heading', { name: /Pediatric Facial Reanimation & Free Gracilis Scrubber/i });
    await expect(facialCard).toBeVisible();

    // Verify direct links work
    await expect(page.locator('a[href*="/tools/achd-reoperation-scrubber"]').first()).toBeVisible();
    await expect(page.locator('a[href*="/tools/pediatric-facial-reanimation-scrubber"]').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 62+ specialties and links to ACHD and Pediatric Facial Reanimation', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties We Serve/i);
    await expect(page.getByText('62+ specialties').first()).toBeVisible();

    // Verify cards / items
    const achdItem = page.getByText(/Adult Congenital Heart Disease \(ACHD\) & Fontan Conversion/i).first();
    await expect(achdItem).toBeVisible();

    const facialItem = page.getByText(/Pediatric Complex Facial Reanimation & Free Gracilis Transfer/i).first();
    await expect(facialItem).toBeVisible();

    // Verify links to specialty pages
    await expect(page.locator('a[href*="/medical-billing/adult-congenital-heart-disease"]').first()).toBeVisible();
    await expect(page.locator('a[href*="/medical-billing/pediatric-facial-reanimation"]').first()).toBeVisible();
  });
});
