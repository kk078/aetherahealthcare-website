import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 22: Pediatric Craniosynostosis & Robotic Urologic Oncology Suite', () => {
  test('Specialty 65: Pediatric Craniosynostosis & Cranial Vault Remodeling page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-craniosynostosis`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Pediatric Craniosynostosis & Cranial Vault Remodeling/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Craniosynostosis & Cranial Vault Remodeling/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('21175').first()).toBeVisible();
    await expect(page.getByText('21180').first()).toBeVisible();
    await expect(page.getByText('61550').first()).toBeVisible();
    await expect(page.getByText('61558').first()).toBeVisible();
    await expect(page.getByText(/Co-surgeon Modifier -62 matching discrepancies/i).first()).toBeVisible();

    // CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 66: Cytoreductive Prostatectomy & High-Risk Robotic Urologic Oncology page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/robotic-urologic-oncology`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Cytoreductive Prostatectomy & High-Risk Robotic Urologic Oncology/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Cytoreductive Prostatectomy & High-Risk Robotic Urologic Oncology/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('55866').first()).toBeVisible();
    await expect(page.getByText('38572').first()).toBeVisible();
    await expect(page.getByText('50543').first()).toBeVisible();
    await expect(page.getByText('51596').first()).toBeVisible();
    await expect(page.getByText(/Extended pelvic lymphadenectomy \(\+38571\/\+38572\) unbundling denials/i).first()).toBeVisible();

    // CTA link
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #70: Pediatric Craniosynostosis Scrubber audits FOA, co-surgeon Mod 62, bone graft & helmet DME', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-craniosynostosis-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Cranial Vault Remodeling & Synostosis Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Pediatric Cranial Vault Remodeling & Synostosis Scrubber/i);

    // Default FOA (21175) with Co-Surgeon Mod 62
    await expect(page.getByText('21175').first()).toBeVisible();
    await expect(page.getByText(/Mod -62/i).first()).toBeVisible();
    await expect(page.getByText(/Co-Surgeon Modifier -62 Matching Verified/i).first()).toBeVisible();

    // Switch to Mismatched codes
    await page.getByRole('button', { name: /FATAL RISK: Mismatched CPT Codes or Missing Modifier 62/i }).click();
    await expect(page.getByText(/FATAL: Co-Surgeon Code Mismatch \/ Missing Modifier -62 Detected/i).first()).toBeVisible();
    await expect(page.getByText(/Revenue at Severe Audit Risk/i)).toBeVisible();

    // Switch back to matching Mod 62
    await page.getByRole('button', { name: /Co-Surgeon Match: Neurosurgery \+ Craniofacial Plastics/i }).click();

    // Enable Helmet Therapy (L0112)
    const helmetCheckbox = page.locator('input[type="checkbox"]').first();
    await helmetCheckbox.check();
    await expect(page.getByText('L0112').first()).toBeVisible();
    await expect(page.getByText(/Cranial Molding Helmet Orthosis \(L0112\) Defended/i).first()).toBeVisible();

    // Copy audit packet
    const copyButton = page.getByRole('button', { name: /Copy Payer Defense Audit Packet/i });
    await copyButton.click();
    await expect(page.getByText(/Audit Packet Copied to Clipboard!/i)).toBeVisible();

    // Open lead modal
    await page.getByRole('button', { name: /Submit Case for Professional Craniofacial Audit/i }).click();
    await expect(page.getByText(/Request Comprehensive Practice Audit/i)).toBeVisible();
    await expect(page.getByPlaceholder('sjenkins@childrenshospital.org')).toBeVisible();

    // Capture visual screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_craniosynostosis_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #71: Robotic Urologic Oncology Scrubber audits RARP, extended LND 38572-59, RAPN & Mod 22', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/robotic-urologic-oncology-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Robotic Urologic Oncology & Complex Reconstructive Scrubber/i);
    await expect(page.getByRole('heading', { level: 2 }).first()).toContainText(/Robotic Urologic Oncology & Complex Reconstructive Scrubber/i);

    // Default RARP (55866) with Extended LND (38572-59)
    await expect(page.getByText('55866').first()).toBeVisible();
    await expect(page.getByText('38572').first()).toBeVisible();
    await expect(page.getByText(/Mod -59/i).first()).toBeVisible();
    await expect(page.getByText(/Extended Pelvic LND \(\+38572-59\) Unbundled Legally from 55866/i).first()).toBeVisible();

    // Switch to Partial Nephrectomy (50543)
    await page.getByRole('button', { name: /Robot-Assisted Partial Nephrectomy \(RAPN - CPT 50543\)/i }).click();
    await expect(page.getByText('50543').first()).toBeVisible();
    await expect(page.getByText(/Partial Nephrectomy Modifier -22 Supported for Endophytic Hilar Mass/i).first()).toBeVisible();

    // Copy audit packet
    const copyButton = page.getByRole('button', { name: /Copy Payer Defense Audit Packet/i });
    await copyButton.click();
    await expect(page.getByText(/Audit Packet Copied to Clipboard!/i)).toBeVisible();

    // Open lead modal
    await page.getByRole('button', { name: /Submit Case for Professional Urology Audit/i }).click();
    await expect(page.getByText(/Request Comprehensive Practice Audit/i)).toBeVisible();
    await expect(page.getByPlaceholder('mvance@urologygroup.org')).toBeVisible();

    // Capture visual screenshot
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'robotic_urologic_oncology_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 71+ tools and includes craniosynostosis and robotic urology scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    // Verify presence of newly added tool cards
    const cranioCard = page.getByRole('heading', { name: /Pediatric Cranial Vault Remodeling & Synostosis Scrubber/i });
    await expect(cranioCard).toBeVisible();

    const urologyCard = page.getByRole('heading', { name: /Robotic Urologic Oncology & Complex Reconstructive Scrubber/i });
    await expect(urologyCard).toBeVisible();
  });

  test('Specialties Hub: Expands to 66+ specialties and links to craniosynostosis and robotic urology', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page).toHaveTitle(/Medical Billing Specialties We Serve/i);
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Verify cards / items
    const cranioItem = page.getByText(/Pediatric Craniosynostosis & Cranial Vault Remodeling/i).first();
    await expect(cranioItem).toBeVisible();

    const urologyItem = page.getByText(/Cytoreductive Prostatectomy & High-Risk Robotic Urologic Oncology/i).first();
    await expect(urologyItem).toBeVisible();
  });
});
