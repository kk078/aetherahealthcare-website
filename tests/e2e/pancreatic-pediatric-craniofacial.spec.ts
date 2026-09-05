import { test, expect } from '@playwright/test';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Cycle 16: Complex Pancreatic Surgery & Pediatric Craniofacial Suite', () => {
  test('Specialty 53: Complex Pancreatic Surgery & Whipple Resection page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pancreatic-surgery`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Complex Pancreatic Surgery & Whipple Resection/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Complex Pancreatic Surgery & Whipple Resection/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('48150').first()).toBeVisible();
    await expect(page.getByText('48153').first()).toBeVisible();
    await expect(page.getByText('35221').first()).toBeVisible();
    await expect(page.getByText('38747').first()).toBeVisible();
    await expect(page.getByText('44010').first()).toBeVisible();
    await expect(page.getByText(/Pylorus-preserving vs classic Whipple downcoding/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Specialty 54: Pediatric Craniofacial & Cleft Palate Surgery page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/medical-billing/pediatric-craniofacial`);
    await page.waitForLoadState('domcontentloaded');

    // Title and headings
    await expect(page).toHaveTitle(/Pediatric Craniofacial & Cleft Palate Surgery/i);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Craniofacial & Cleft Palate Surgery/i);

    // CPT badges & key clinical concepts
    await expect(page.getByText('42200').first()).toBeVisible();
    await expect(page.getByText('42210').first()).toBeVisible();
    await expect(page.getByText('21141').first()).toBeVisible();
    await expect(page.getByText('21175').first()).toBeVisible();
    await expect(page.getByText(/Congenital cosmetic exclusion denials/i)).toBeVisible();

    // CTA links
    const assessmentLink = page.getByRole('link', { name: /Free Practice Assessment|Free Assessment/i }).first();
    await expect(assessmentLink).toBeVisible();
  });

  test('Tool #58: Whipple Procedure Scrubber audits resection, vascular reconstruction & jejunostomy', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/whipple-resection-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification (Page has h1, component has h2)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Whipple Procedure & Pancreatic Resection Scrubber/i);

    // Verify default classic Whipple (48150)
    await expect(page.getByText('48150').first()).toBeVisible();
    await expect(page.getByText('+35221').first()).toBeVisible();
    await expect(page.getByText('44010').first()).toBeVisible();
    await expect(page.getByText('+38747').first()).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)? Total wRVUs/i)).toBeVisible();

    // Test simulate antrectomy downcoding
    await page.getByText(/Simulate Payer Antrectomy Downcoding Audit/i).click();
    await expect(page.getByText(/Pylorus-Preserving Downcode Clawback/i)).toBeVisible();

    // Uncheck separate stoma tract to trigger fatal feeding tube unbundling
    await page.getByText(/Separate Abdominal Counter-Incision Documented/i).click();
    await expect(page.getByText(/NCCI Fatal Unbundling: Feeding Jejunostomy/i)).toBeVisible();

    // Test Co-Surgeon compliant mode
    await page.getByRole('button', { name: /Mod -62 Compliant/i }).click();
    await expect(page.getByText(/Co-Surgeon Modifier -62 Validated/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'whipple_resection_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #59: Pediatric Craniofacial Scrubber audits bone graft inclusivity, Mod 58 & cosmetic defense', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/pediatric-craniofacial-scrubber`);
    await page.waitForLoadState('domcontentloaded');

    // Heading verification
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Pediatric Craniofacial & Cleft Palate Staging Scrubber/i);

    // Verify default CPT 42210
    await expect(page.getByText('42210').first()).toBeVisible();
    await expect(page.getByText(/\d+(\.\d+)? Total wRVUs/i)).toBeVisible();

    // Test illegal bone graft harvest unbundling
    await page.getByText(/Attempt Separate Billing of Donor Harvest/i).click();
    await expect(page.getByText(/Illegal Bone Graft Harvest Unbundling/i).first()).toBeVisible();

    // Test unchecking Modifier 58 within global period
    await page.getByText(/Append Modifier -58/i).click();
    await expect(page.getByText(/Fatal Postoperative Period Denial: Missing Modifier 58/i)).toBeVisible();

    // Re-check Modifier 58
    await page.getByText(/Append Modifier -58/i).click();
    await expect(page.getByText(/Modifier 58 Defended: Staged Cleft Protocol/i)).toBeVisible();

    // Test simulate cosmetic exclusion denial
    await page.getByText(/Simulate Commercial Cosmetic Denial Trigger/i).click();
    await expect(page.getByText(/Commercial Payer "Cosmetic Surgery" Exclusion Risk/i)).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_craniofacial_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Directory Hub: Expands to 59 tools and includes Whipple and Craniofacial scrubbers', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/\d+\s+Free Medical Billing & RCM Tools/i);

    // Search for Whipple
    const searchInput = page.getByRole('searchbox');
    await searchInput.fill('Whipple');
    await expect(page.getByRole('heading', { name: /Whipple Procedure & Pancreatic Resection Scrubber/i })).toBeVisible();

    // Search for Craniofacial
    await searchInput.fill('Craniofacial');
    await expect(page.getByRole('heading', { name: /Pediatric Craniofacial & Cleft Palate Scrubber/i })).toBeVisible();
  });

  test('Specialties Hub: Expands to 54+ specialties with Pancreatic and Craniofacial links', async ({ page }) => {
    await page.goto(`${BASE_URL}/specialties`);
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Billing built for your specialty/i);
    await expect(page.getByText(/\d+\+\s+specialties/i).first()).toBeVisible();

    // Check links exist
    const pancreaticLink = page.locator('a[href*="/medical-billing/pancreatic-surgery"]').first();
    await expect(pancreaticLink).toBeVisible();

    const craniofacialLink = page.locator('a[href*="/medical-billing/pediatric-craniofacial"]').first();
    await expect(craniofacialLink).toBeVisible();
  });
});
