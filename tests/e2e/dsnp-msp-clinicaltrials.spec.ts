import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('D-SNP & Medicare Advantage Funnel, ID & Allergy Specialties, and 33-Tool Suite', () => {

  test('Medicare Advantage Landing Page (/lp/medicare-advantage-rcm) renders CBO calculator and audit form', async ({ page }) => {
    await page.goto('/lp/medicare-advantage-rcm/?utm_source=google&utm_medium=cpc&utm_campaign=dsnp-crossover-recovery&gclid=test_dsnp_gclid');

    // Verify title and hero elements
    await expect(page.getByRole('heading', { level: 1, name: /Stop D-SNP Crossover Claim Leakage/i })).toBeVisible();
    await expect(page.getByText(/Dual-Eligible \(D-SNP\) & Medicare Advantage RCM Pod/i)).toBeVisible();

    // Verify Calculator renders
    await expect(page.getByRole('heading', { level: 3, name: /Medicare Advantage & D-SNP Revenue Recovery Calculator/i })).toBeVisible();
    await expect(page.getByText(/Current Annual Loss/i)).toBeVisible();
    await expect(page.getByText(/Crossover Recovery/i)).toBeVisible();

    // Fill RFP form fields
    await page.getByPlaceholder('Dr. Elena Ramos').fill('Dr. Raymond Vance');
    await page.getByPlaceholder('Clinic Director / MD').fill('VP of Managed Care');
    await page.getByPlaceholder('Sunrise Senior Care').fill('Suncoast Senior Health Alliance');
    await page.getByPlaceholder('eramos@sunrisecare.org').fill('rvance@suncoastsenior.org');
    await page.getByPlaceholder('(555) 000-0000').fill('(555) 000-7722');

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/dsnp_medicare_advantage_landing.png`, fullPage: false });
  });

  test('Infectious Disease & OPAT specialty page renders with CPT codes, home infusion and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/infectious-disease/');

    await expect(page.getByRole('heading', { level: 1, name: /Infectious Disease & OPAT Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/99205, 99215, 99223/i).first()).toBeVisible();
    await expect(page.getByText(/Inpatient consultation split billing/i)).toBeVisible();
    await expect(page.getByText(/How do you capture proper reimbursement for prolonged complex infectious disease visits\?/i)).toBeVisible();
  });

  test('Allergy & Clinical Immunology specialty page renders with CPT codes, antigen compounding and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/allergy-immunology/');

    await expect(page.getByRole('heading', { level: 1, name: /Allergy, Asthma & Clinical Immunology Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/95004, 95024, 95165/i).first()).toBeVisible();
    await expect(page.getByText(/Antigen compounding \(95165\) unit conversion rejections/i)).toBeVisible();
    await expect(page.getByText(/How do you calculate and bill allergen extract preparation \(95165\) accurately\?/i)).toBeVisible();
  });

  test('Medicare Secondary Payer Determination Engine evaluates ESRD and generates 837P mapping', async ({ page }) => {
    await page.goto('/tools/msp-determination-engine/');

    await expect(page.getByRole('heading', { level: 1, name: /Medicare Secondary Payer \(MSP\) Determination Engine/i })).toBeVisible();

    // Select ESRD scenario
    await page.getByRole('button', { name: /ESRD \/ Dialysis/i }).click();

    // Verify statutory determination output
    await expect(page.getByText(/PRIMARY PAYER:/i)).toBeVisible();
    await expect(page.getByText(/Employer Group Health Plan \(EGHP\)/i).first()).toBeVisible();
    await expect(page.getByText(/MSP Code: 13/i)).toBeVisible();
    await expect(page.getByText(/Loop 2320 SBR05=CI\/EP, SBR09=13/i)).toBeVisible();

    // Verify Copy Summary Button
    const copyButton = page.getByRole('button', { name: /Copy Determination Summary/i });
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/msp_determination_engine_tool.png`, fullPage: false });
  });

  test('Clinical Trial Billing Scrubber validates NCT format and Modifier Q1/Z00.6 rules', async ({ page }) => {
    await page.goto('/tools/clinical-trial-billing/');

    await expect(page.getByRole('heading', { level: 1, name: /Clinical Trial Billing & Coverage Analysis Scrubber/i })).toBeVisible();

    // Verify NCT format validation
    await expect(page.getByText(/Valid NCT#/i)).toBeVisible();

    // Verify split summary
    await expect(page.getByText(/Medicare Part B/i).first()).toBeVisible();
    await expect(page.getByText(/Bill with Modifier Q1/i)).toBeVisible();
    await expect(page.getByText(/ICD-10 Z00.6/i).first()).toBeVisible();

    // Verify Copy Summary Button
    const copyButton = page.getByRole('button', { name: /Copy Scrub Report/i });
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/clinical_trial_scrubber_tool.png`, fullPage: false });
  });

  test('Tools Hub renders tools and indexes new engines', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search \d+ free tools & engines…/i)).toBeVisible();

    // Verify both new tools are present in catalog
    await expect(page.getByRole('heading', { level: 3, name: /Medicare Secondary Payer \(MSP\) Determination Engine/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Clinical Trial Billing & Coverage Analysis Scrubber/i })).toBeVisible();

    // Test search filter for MSP
    const toolSearch = page.getByPlaceholder(/Search \d+ free tools & engines…/i);
    await toolSearch.fill('Secondary Payer');
    await expect(page.getByRole('heading', { level: 3, name: /Medicare Secondary Payer \(MSP\) Determination Engine/i })).toBeVisible();

    // Test search filter for Clinical Trial
    await toolSearch.fill('Clinical Trial');
    await expect(page.getByRole('heading', { level: 3, name: /Clinical Trial Billing & Coverage Analysis Scrubber/i })).toBeVisible();
  });

});
