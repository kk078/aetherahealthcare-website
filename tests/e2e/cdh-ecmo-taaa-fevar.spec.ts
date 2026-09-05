import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 23: Pediatric CDH ECMO & TAAA FEVAR Suite', () => {
  test('Specialty 67: Pediatric Congenital Diaphragmatic Hernia & ECMO page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-cdh-ecmo`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Pediatric Congenital Diaphragmatic Hernia \(CDH\) & ECMO Surgical Repair/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Congenital Diaphragmatic Hernia \(CDH\) & ECMO Surgical Repair/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('39503').first()).toBeVisible();
    await expect(page.getByText('33946').first()).toBeVisible();
    await expect(page.getByText('49605').first()).toBeVisible();
    await expect(page.getByText('49568').first()).toBeVisible();
    await expect(page.getByText(/Gore-Tex \/ biologic patch reinforcement unbundling denials/i).first()).toBeVisible();

    // CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 68: Thoracoabdominal Aortic Aneurysm (TAAA) Repair & FEVAR page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/taaa-fenestrated-evar`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Thoracoabdominal Aortic Aneurysm \(TAAA\) Repair & Branched\/Fenestrated EVAR/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Thoracoabdominal Aortic Aneurysm \(TAAA\) Repair & Branched\/Fenestrated EVAR/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('33877').first()).toBeVisible();
    await expect(page.getByText('34844').first()).toBeVisible();
    await expect(page.getByText('62272').first()).toBeVisible();
    await expect(page.getByText('37236').first()).toBeVisible();
    await expect(page.getByText(/Visceral vessel branch tier unbundling denials/i).first()).toBeVisible();

    // CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #72: Pediatric CDH & ECMO Repair Scrubber audits patch, VA-ECMO 33946 & staged silo', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-cdh-ecmo-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric CDH & Neonatal ECMO Repair Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric CDH & Neonatal ECMO Repair Scrubber/i);

    // Default: 39503, 49568 (Mod -59), 33946 (Mod -59), 49605 (Mod -58)
    await expect(page.getByText('39503').first()).toBeVisible();
    await expect(page.getByText('49568').first()).toBeVisible();
    await expect(page.getByText('33946').first()).toBeVisible();
    await expect(page.getByText('49605').first()).toBeVisible();

    await expect(page.getByText(/Prosthetic Patch \(\+49568-59\) Unbundled Correctly/i).first()).toBeVisible();
    await expect(page.getByText(/Neonatal VA-ECMO Initiation \(33946-59\) Defended/i).first()).toBeVisible();

    // Copy audit packet
    const copyButton = page.getByRole('button', { name: /Copy Payer Defense Audit Packet/i });
    await copyButton.click();
    await expect(page.getByText(/Audit Packet Copied to Clipboard!/i)).toBeVisible();

    // Open lead modal
    await page.getByRole('button', { name: /Submit Case for Professional CDH Audit/i }).click();
    await expect(page.getByText(/Request Comprehensive Practice Audit/i)).toBeVisible();
    await expect(page.getByPlaceholder('kalvarez@childrenshealth.org')).toBeVisible();

    // Capture visual screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_cdh_ecmo_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #73: Complex FEVAR & TAAA Scrubber audits 4-vessel 34844, CSF drain 62272 & Mod 62', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/taaa-fevar-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Complex FEVAR & TAAA Aortic Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Complex Fenestrated\/Branched EVAR \(FEVAR\) & TAAA Scrubber/i);

    // Default 4-vessel FEVAR (34844) with Co-Surgeon Mod 62
    await expect(page.getByText('34844').first()).toBeVisible();
    await expect(page.getByText(/Mod -62/i).first()).toBeVisible();
    await expect(page.getByText('62272').first()).toBeVisible();
    await expect(page.getByText('37236').first()).toBeVisible();
    await expect(page.getByText(/4-Vessel FEVAR \(34844\) Defended/i).first()).toBeVisible();

    // Switch to Open Crawford Extent I-IV Repair (33877)
    await page.getByRole('button', { name: /Open Crawford Extent I–IV TAAA Repair \(CPT 33877\)/i }).click();
    await expect(page.getByText('33877').first()).toBeVisible();
    await expect(page.getByText(/Open Crawford TAAA Repair \(33877\) Supported/i).first()).toBeVisible();

    // Copy audit packet
    const copyButton = page.getByRole('button', { name: /Copy Payer Defense Audit Packet/i });
    await copyButton.click();
    await expect(page.getByText(/Audit Packet Copied to Clipboard!/i)).toBeVisible();

    // Open lead modal
    await page.getByRole('button', { name: /Submit Case for Professional Aortic Audit/i }).click();
    await expect(page.getByText(/Request Comprehensive Practice Audit/i)).toBeVisible();
    await expect(page.getByPlaceholder('csterling@aorticcenter.org')).toBeVisible();

    // Capture visual screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'taaa_fevar_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 73+ tools and includes CDH and TAAA scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    // Verify presence of newly added tool cards
    const cdhCard = page.getByRole('heading', { name: /Pediatric CDH & Neonatal ECMO Repair Scrubber/i });
    await expect(cdhCard).toBeVisible();

    const taaaCard = page.getByRole('heading', { name: /Complex Fenestrated\/Branched EVAR \(FEVAR\) & TAAA Scrubber/i });
    await expect(taaaCard).toBeVisible();
  });

  test('Specialties Hub: Expands to 68+ specialties and links to CDH and TAAA', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties We Serve/i);
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify cards / items
    const cdhItem = page.getByText(/Pediatric Congenital Diaphragmatic Hernia \(CDH\) & ECMO Surgical Repair/i).first();
    await expect(cdhItem).toBeVisible();

    const taaaItem = page.getByText(/Thoracoabdominal Aortic Aneurysm \(TAAA\) Repair & Branched\/Fenestrated EVAR \(FEVAR\)/i).first();
    await expect(taaaItem).toBeVisible();
  });
});
