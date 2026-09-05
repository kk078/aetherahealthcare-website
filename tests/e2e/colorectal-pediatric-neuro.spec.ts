import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 15: Colorectal Surgery & Pediatric Neuro-Oncology Suite', () => {
  test('Specialty 51: Colorectal Surgery & Complex Pelvic Exenteration page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/colorectal-surgery`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Colorectal Surgery & Complex Pelvic Exenteration/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Colorectal Surgery & Complex Pelvic Exenteration/i);

    // CPT badges & pain points
    await expect(page.getByText('45110').first()).toBeVisible();
    await expect(page.getByText('45126').first()).toBeVisible();
    await expect(page.getByText('44320').first()).toBeVisible();
    await expect(page.getByText(/Pelvic exenteration multi-surgeon unbundling/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 52: Pediatric Neuro-Oncology & Posterior Fossa Surgery page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-neuro-oncology`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Pediatric Neuro-Oncology & Posterior Fossa Surgery/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Neuro-Oncology & Posterior Fossa Surgery/i);

    // CPT badges & pain points
    await expect(page.getByText('61518').first()).toBeVisible();
    await expect(page.getByText('61520').first()).toBeVisible();
    await expect(page.getByText('95940').first()).toBeVisible();
    await expect(page.getByText(/Posterior fossa craniotomy downcoding/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #56: Colorectal Surgery Scrubber audits TME, stoma unbundling & co-surgery', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/colorectal-exenteration-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Colorectal Surgery & Pelvic Exenteration Scrubber/i);

    // Verify default state
    await expect(page.getByText(/TME w\/ colonic J-pouch reservoir to anus/i)).toBeVisible();
    await expect(page.getByText('45119').first()).toBeVisible();
    await expect(page.getByText('44320').first()).toBeVisible();

    // Switch to Pelvic Exenteration (45126)
    await page.getByRole('button', { name: /Pelvic Exenteration \(45126\)/i }).click();
    await expect(page.getByText('45126').first()).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)? Total wRVUs/i)).toBeVisible();

    // Test Co-Surgeon Modifier 62 Compliant
    await page.getByRole('button', { name: /Modifier -62 Compliant/i }).click();
    await expect(page.getByText(/Co-Surgeon Modifier -62 Compliant/i)).toBeVisible();

    // Test Unpaired Note (Fatal audit)
    await page.getByRole('button', { name: /Modifier -62 Unpaired Note/i }).click();
    await expect(page.getByText(/Unpaired Modifier -62 Audit Rejection/i)).toBeVisible();

    // Verify ANSI 837P snippet contains 45126
    const ediBlock = page.locator('pre');
    await expect(ediBlock).toContainText('COLORECTAL_EXENT');
    await expect(ediBlock).toContainText('45126');

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'colorectal_exenteration_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #57: Pediatric Brain Tumor Scrubber audits IONM, EVD & infratentorial downcoding', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-brain-tumor-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Brain Tumor & Intraoperative Monitoring Scrubber/i);

    // Verify default primary infratentorial resection (61518)
    await expect(page.getByText('61518').first()).toBeVisible();
    await expect(page.getByText('+61781').first()).toBeVisible();
    await expect(page.getByText('61107').first()).toBeVisible();

    // Verify IONM default (95941 remote monitoring)
    await expect(page.getByText('95941').first()).toBeVisible();
    await expect(page.getByText(/Continuous IONM Billing Verified/i)).toBeVisible();

    // Test same-incision EVD fatal bundling
    await page.getByRole('button', { name: /EVD via Same Craniotomy \(Test Bundle\)/i }).click();
    await expect(page.getByText(/NCCI Fatal Unbundling: Same-Incision Ventriculostomy/i)).toBeVisible();

    // Switch to compliant separate site EVD
    await page.getByRole('button', { name: /EVD via Separate Burr Hole \(61107-59\)/i }).click();
    await expect(page.getByText(/Pre-Craniotomy EVD Defended \(Modifier 59\)/i)).toBeVisible();

    // Verify ANSI 837 snippet
    const ediBlock = page.locator('pre');
    await expect(ediBlock).toContainText('PEDIATRIC_BRAIN_TUMOR');
    await expect(ediBlock).toContainText('61518');

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_brain_tumor_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 57 tools and includes Colorectal and Pediatric Brain Tumor scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/57 Free Medical Billing & RCM Tools/i);

    // Search for Colorectal
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('Colorectal');
    await expect(page.getByRole('heading', { name: /Colorectal Surgery & Pelvic Exenteration Scrubber/i })).toBeVisible();

    // Search for Brain Tumor
    await searchInput.fill('Brain Tumor');
    await expect(page.getByRole('heading', { name: /Pediatric Brain Tumor & Intraoperative Monitoring Scrubber/i })).toBeVisible();
  });

  test('Specialties Hub: Expands to 52+ specialties with Colorectal and Pediatric Neuro links', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Billing built for your specialty/i);
    await expect(page.getByText(/52\+ specialties/i).first()).toBeVisible();

    // Check links exist
    const colorectalLink = page.locator('a[href*="/medical-billing/colorectal-surgery"]').first();
    await expect(colorectalLink).toBeVisible();

    const neuroLink = page.locator('a[href*="/medical-billing/pediatric-neuro-oncology"]').first();
    await expect(neuroLink).toBeVisible();
  });
});
