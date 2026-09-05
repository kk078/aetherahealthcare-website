import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Specialties 39-40 and Tools 44-45: Cardiac EP & Plastic Reconstructive Suites', () => {
  test('Specialty 39: Cardiac Electrophysiology & Catheter Ablation page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/cardiac-electrophysiology/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Cardiac Electrophysiology & Catheter Ablation/i })
    ).toBeVisible();
    await expect(page.getByText(/Comprehensive catheter ablation/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('93656').first()).toBeVisible();
    await expect(page.getByText('93613').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Specialty 40: Plastic & Reconstructive Surgery page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/plastic-reconstructive-surgery/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Plastic & Reconstructive Surgery/i })
    ).toBeVisible();
    await expect(page.getByText(/Schnur sliding scale/i).first()).toBeVisible();

    // Verify key CPT codes and WHCRA
    await expect(page.getByText('19318').first()).toBeVisible();
    await expect(page.getByText('15823').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Tool #44: Cardiac Electrophysiology Scrubber evaluates ablation bundling and telemetry cadence', async ({ page }) => {
    await page.goto('/tools/cardiac-ep-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Cardiac Electrophysiology & Ablation Scrubber/i })
    ).toBeVisible();

    // Verify primary ablation options
    await expect(page.getByText('CPT 93656').first()).toBeVisible();
    await expect(page.getByText('Atrial Fibrillation Pulmonary Vein Isolation (PVI)')).toBeVisible();

    // Verify billable add-ons
    await expect(page.getByText('CPT 93613').first()).toBeVisible();
    await expect(page.getByText('3D Electroanatomical Mapping').first()).toBeVisible();

    // Verify diagnostic unbundling warning
    await expect(page.getByText(/Diagnostic EP Study Unbundling Auditor/i)).toBeVisible();
    await expect(page.getByText(/CMS Chapter 11 NCCI Policy Rule/i)).toBeVisible();

    // Verify ANSI X12 837P preview
    await expect(page.getByText(/ANSI X12 837P EP Lab Claim Lines/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:93656/i)).toBeVisible();

    // Test device telemetry cadence selector
    const loopRecorderBtn = page.getByRole('button', { name: /Loop Recorder/i });
    await loopRecorderBtn.click();
    await expect(page.getByText(/CPT 93298/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'cardiac_ep_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #45: Reconstructive vs Cosmetic Prior-Auth Scrubber models Schnur scale and WHCRA mandates', async ({ page }) => {
    await page.goto('/tools/reconstructive-prior-auth-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Reconstructive vs\. Cosmetic Prior-Authorization Scrubber/i })
    ).toBeVisible();

    // Test Default Tab: Breast Reduction (Schnur Scale)
    await expect(page.getByText(/Schnur Sliding Scale Calculator/i)).toBeVisible();
    await expect(page.getByText(/Calculated Body Surface Area/i)).toBeVisible();
    await expect(page.getByText(/Schnur 22nd Percentile Minimum Grams/i)).toBeVisible();

    // Switch to Blepharoplasty tab
    const blephTab = page.getByRole('button', { name: /Blepharoplasty/i });
    await blephTab.click();
    await expect(page.getByText(/Margin Reflex Distance 1 \(MRD-1\)/i).first()).toBeVisible();
    await expect(page.getByText(/Superior Visual Field Deficit/i).first()).toBeVisible();

    // Switch to WHCRA Breast Recon tab
    const whcraTab = page.getByRole('button', { name: /WHCRA Breast Recon/i });
    await whcraTab.click();
    await expect(page.getByText(/Women's Health and Cancer Rights Act/i).first()).toBeVisible();
    await expect(page.getByText(/WHCRA Mandated/i).first()).toBeVisible();

    // Verify medical necessity dossier snippet
    await expect(page.getByText(/Medical Necessity Letter Dossier/i).first()).toBeVisible();
    await expect(page.getByText(/MANDATORY STATUTORY COVERAGE UNDER FEDERAL WHCRA/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'reconstructive_prior_auth_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory: Expands to 45 tools and search includes EP and Reconstructive Scrubbers', async ({ page }) => {
    await page.goto('/tools/');

    // Verify 45 Tools title and badges
    await expect(page.getByRole('heading', { level: 1, name: /45 Free Medical Billing & RCM Tools/i })).toBeVisible();

    // Verify new tool cards are in directory
    await expect(page.getByText('Cardiac Electrophysiology & Catheter Ablation Scrubber').first()).toBeVisible();
    await expect(page.getByText('Reconstructive vs Cosmetic Prior-Authorization Scrubber').first()).toBeVisible();

    // Test Search input filtering
    const searchInput = page.getByPlaceholder(/Search all \d+ tools/i);
    await searchInput.fill('Electrophysiology');
    await expect(page.getByText('Cardiac Electrophysiology & Catheter Ablation Scrubber').first()).toBeVisible();

    await searchInput.fill('Schnur');
    await expect(page.getByText('Reconstructive vs Cosmetic Prior-Authorization Scrubber').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 40+ specialties with Cardiac EP and Plastic Surgery links', async ({ page }) => {
    await page.goto('/specialties/');

    // Verify hero and chips
    await expect(page.getByRole('heading', { level: 1, name: /Specialty-Specific Billing & Coding Services/i })).toBeVisible();
    await expect(page.getByText('40+ specialties').first()).toBeVisible();

    // Check directory links for both specialties
    const epLink = page.locator('a[href="/medical-billing/cardiac-electrophysiology"]').first();
    await expect(epLink).toBeVisible();

    const plasticsLink = page.locator('a[href="/medical-billing/plastic-reconstructive-surgery"]').first();
    await expect(plasticsLink).toBeVisible();
  });
});
