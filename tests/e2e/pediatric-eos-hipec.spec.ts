import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 21: Pediatric EOS & HIPEC Surgical Oncology Suite', () => {
  test('Specialty 63: Pediatric Early-Onset Scoliosis (EOS) & Growing Rods page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-spine-eos`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Complex Pediatric Spine Surgery & Early-Onset Scoliosis/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Complex Pediatric Spine Surgery & Early-Onset Scoliosis/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('22842').first()).toBeVisible();
    await expect(page.getByText('22848').first()).toBeVisible();
    await expect(page.getByText('22849').first()).toBeVisible();
    await expect(page.getByText('99214').first()).toBeVisible();
    await expect(page.getByText(/Staged surgical growing rod lengthening/i).first()).toBeVisible();

    // CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 64: Cytoreductive Surgery & HIPEC Chemoperfusion page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/hipec-surgical-oncology`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Cytoreductive Surgery & Hyperthermic Intraperitoneal Chemotherapy/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Cytoreductive Surgery & Hyperthermic Intraperitoneal Chemotherapy/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('49205').first()).toBeVisible();
    await expect(page.getByText('96560').first()).toBeVisible();
    await expect(page.getByText('44140').first()).toBeVisible();
    await expect(page.getByText('38100').first()).toBeVisible();
    await expect(page.getByText(/Chemotherapy perfusion administration \(\+96560\) payer denial/i).first()).toBeVisible();

    // CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #68: Pediatric EOS Scrubber audits MCGR, VEPTR, staged Mod 58 & clinic visits', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-eos-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification (Single H1 on page, semantic H2 in component)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Early-Onset Scoliosis & Growing Rod Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric Early-Onset Scoliosis \(EOS\) & Growing Rod Scrubber/i);

    // Default primary MCGR: 22842, +22848, 95940
    await expect(page.getByText('22842').first()).toBeVisible();
    await expect(page.getByText('+22848').first()).toBeVisible();
    await expect(page.getByText('95940').first()).toBeVisible();

    await expect(page.getByText(/Total Work RVUs/i).first()).toBeVisible();
    await expect(page.getByText('wRVUs').first()).toBeVisible();

    // Verify initial clean MCGR alert
    await expect(page.getByText(/MCGR Implantation \(22842\) Segment Tier Verified/i).first()).toBeVisible();

    // Switch to Staged Surgical Rod Lengthening (22849)
    await page.getByText(/Staged Surgical Rod Lengthening \/ Exchange \(CPT 22849-58\)/i).click();
    await expect(page.getByText('22849').first()).toBeVisible();
    await expect(page.getByText(/Staged Surgical Distraction \(\+22849-58\) Validated/i).first()).toBeVisible();

    // Test unchecking Modifier -58 to trigger fatal global surgery bundling
    await page.getByText(/Append Modifier -58 \(Staged Procedure\) to Surgical Lengthening/i).click();
    await expect(page.getByText(/Missing Staged Modifier -58 on Growing Rod Distraction/i).first()).toBeVisible();

    // Recheck Modifier -58
    await page.getByText(/Append Modifier -58 \(Staged Procedure\) to Surgical Lengthening/i).click();

    // Switch to Outpatient Non-Invasive MCGR Distraction Clinic
    await page.getByText(/Outpatient Non-Invasive MCGR Distraction Clinic/i).click();
    await expect(page.getByText('99214').first()).toBeVisible();
    await expect(page.getByText('72082').first()).toBeVisible();
    await expect(page.getByText(/Outpatient MCGR Distraction Clinic Coding Compliant/i).first()).toBeVisible();

    // Verify Copy EDI button
    await expect(page.getByText(/Copy 837P EDI/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_eos_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #69: HIPEC Scrubber audits peritonectomy, chemoperfusion 96560, Mod 62 & critical care', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/hipec-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification (Single H1 on page, semantic H2 in component)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Cytoreductive Surgery & HIPEC Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Cytoreductive Surgery & HIPEC Perfusion Scrubber/i);

    // Default procedure: 49205-62, 96560, 44140-51, 38100, 99291-24
    await expect(page.getByText('49205').first()).toBeVisible();
    await expect(page.getByText('96560').first()).toBeVisible();
    await expect(page.getByText('44140').first()).toBeVisible();
    await expect(page.getByText('38100').first()).toBeVisible();
    await expect(page.getByText('99291').first()).toBeVisible();

    await expect(page.getByText(/Total Work RVUs/i).first()).toBeVisible();
    await expect(page.getByText('wRVUs').first()).toBeVisible();

    // Verify initial clean HIPEC perfusion alert
    await expect(page.getByText(/HIPEC Chemoperfusion \(\+96560-59\) Validated/i).first()).toBeVisible();

    // Test unchecking HIPEC perfusion telemetry to trigger experimental bundling denial
    await page.getByText(/Document catheter placement, temperature telemetry/i).click();
    await expect(page.getByText(/HIPEC Perfusion Experimental Bundling Denial Risk/i).first()).toBeVisible();

    // Recheck HIPEC telemetry
    await page.getByText(/Document catheter placement, temperature telemetry/i).click();

    // Test unchecking Modifier -24 on critical care to trigger fatal global rejection
    await page.getByText(/Append Modifier -24 to critical care visit to bypass surgical global/i).click();
    await expect(page.getByText(/Missing Modifier -24 on Post-HIPEC ICU Care/i).first()).toBeVisible();

    // Recheck Modifier -24
    await page.getByText(/Append Modifier -24 to critical care visit to bypass surgical global/i).click();

    // Verify Copy EDI button
    await expect(page.getByText(/Copy 837P EDI/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'hipec_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 69 tools and includes EOS and HIPEC scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/69 Free Medical Billing & RCM Tools/i);

    // Verify presence of newly added tool cards
    const eosCard = page.getByRole('heading', { name: /Pediatric Early-Onset Scoliosis \(EOS\) & Growing Rod Scrubber/i });
    await expect(eosCard).toBeVisible();

    const hipecCard = page.getByRole('heading', { name: /Cytoreductive Surgery & HIPEC Perfusion Scrubber/i });
    await expect(hipecCard).toBeVisible();

    // Verify direct links work
    await expect(page.locator('a[href*="/tools/pediatric-eos-scrubber"]').first()).toBeVisible();
    await expect(page.locator('a[href*="/tools/hipec-scrubber"]').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 64+ specialties and links to EOS and HIPEC', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties We Serve/i);
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify cards / items
    const eosItem = page.getByText(/Complex Pediatric Spine Surgery & Early-Onset Scoliosis \(EOS\)/i).first();
    await expect(eosItem).toBeVisible();

    const hipecItem = page.getByText(/Cytoreductive Surgery & Hyperthermic Intraperitoneal Chemotherapy \(HIPEC\)/i).first();
    await expect(hipecItem).toBeVisible();

    // Verify links to specialty pages
    await expect(page.locator('a[href*="/medical-billing/pediatric-spine-eos"]').first()).toBeVisible();
    await expect(page.locator('a[href*="/medical-billing/hipec-surgical-oncology"]').first()).toBeVisible();
  });
});
