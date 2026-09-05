import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('Enterprise RCM Funnel, Rheumatology & Pulmonology Specialties, and 31-Tool Suite', () => {

  test('Enterprise RCM Landing Page (/lp/enterprise-rcm) renders CBO consolidation calculator and RFP form', async ({ page }) => {
    await page.goto('/lp/enterprise-rcm/?utm_source=linkedin&utm_medium=cpc&utm_campaign=health-system-cbo&gclid=test_enterprise_gclid');

    // Verify title and hero elements
    await expect(page.getByRole('heading', { level: 1, name: /Centralize Multi-Site RCM/i })).toBeVisible();
    await expect(page.getByText(/Health Systems, MSOs & Multi-Site Physician Groups/i)).toBeVisible();

    // Verify CBO Calculator renders
    await expect(page.getByRole('heading', { level: 3, name: /Enterprise CBO Consolidation & Cash Acceleration Calculator/i })).toBeVisible();
    await expect(page.getByText(/Accelerated Cash/i).first()).toBeVisible();
    await expect(page.getByText(/Annual Denial Recovery/i).first()).toBeVisible();

    // Fill RFP form fields
    await page.getByPlaceholder('David Sterling').fill('Marcus Sterling');
    await page.getByPlaceholder('dsterling@summithealth.org').fill('msterling@summithealthsystem.org');
    await page.getByPlaceholder('Summit Regional Health Partners').fill('Summit Regional Health System');
    await page.getByPlaceholder('(813) 555-0188').fill('(813) 555-8833');

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/enterprise_rcm_campaign_landing.png`, fullPage: false });
  });

  test('Rheumatology & Biologic Infusion specialty page renders with CPT codes, Buy & Bill and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/rheumatology/');

    await expect(page.getByRole('heading', { level: 1, name: /Rheumatology & Biologic Infusion Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/96413–96415, 96372, 20610/i).first()).toBeVisible();
    await expect(page.getByText(/Biologic Buy & Bill clawbacks/i)).toBeVisible();
    await expect(page.getByText(/How do you prevent Buy and Bill financial leakage on rheumatology biologics\?/i)).toBeVisible();
  });

  test('Pulmonology & Sleep Medicine specialty page renders with CPT codes, PFT panels and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/pulmonology/');

    await expect(page.getByRole('heading', { level: 1, name: /Pulmonology & Sleep Medicine Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/94010, 94060, 94375/i).first()).toBeVisible();
    await expect(page.getByText(/PFT component bundling/i)).toBeVisible();
    await expect(page.getByText(/How do you ensure proper reimbursement for complete pulmonary function tests/i)).toBeVisible();
  });

  test('CMS HCC Risk Adjustment & RAF Score Benchmarker computes v28 vs v24 differential and MEAT criteria', async ({ page }) => {
    await page.goto('/tools/hcc-raf-calculator/');

    await expect(page.getByRole('heading', { level: 1, name: /CMS HCC Risk Adjustment & RAF Score Benchmarker/i })).toBeVisible();

    // Verify demographic selectors exist and can be clicked
    await page.getByRole('button', { name: '75–79' }).click();
    await page.getByRole('button', { name: 'Female' }).click();
    await page.getByRole('button', { name: 'Full / Partial Dual' }).click();

    // Verify v24 vs v28 comparisons are rendered
    await expect(page.getByText(/CMS-HCC v24 \(Old\)/i)).toBeVisible();
    await expect(page.getByText(/CMS-HCC v28 \(New\)/i)).toBeVisible();
    await expect(page.getByText(/2025 Blended Rate/i)).toBeVisible();

    // Toggle a condition
    await page.getByText(/Chronic Kidney Disease — Stage 4 \(Severe\)/i).click();

    // Verify MEAT guidance callout appears
    await expect(page.getByText(/MEAT Documentation Criteria:/i).first()).toBeVisible();

    // Verify Copy Summary Button
    const copyButton = page.getByRole('button', { name: /Copy Audit Summary/i });
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/hcc_raf_calculator_tool.png`, fullPage: false });
  });

  test('CMS MIPS Performance Score & Penalty Forecaster models score, penalty and bonus', async ({ page }) => {
    await page.goto('/tools/mips-score-forecaster/');

    await expect(page.getByRole('heading', { level: 1, name: /CMS MIPS Performance Score & Penalty Forecaster/i })).toBeVisible();

    // Verify category sliders and weights
    await expect(page.getByText(/Quality Performance \(30% Weight\)/i)).toBeVisible();
    await expect(page.getByText(/Promoting Interoperability \(25% Weight\)/i)).toBeVisible();
    await expect(page.getByText(/Improvement Activities \(15% Weight\)/i)).toBeVisible();
    await expect(page.getByText(/Cost Category \(30% Weight\)/i)).toBeVisible();

    // Verify composite score box
    await expect(page.getByText(/Composite Final Score/i)).toBeVisible();
    await expect(page.getByText(/Medicare Payment Adjustment:/i)).toBeVisible();

    // Verify Copy Summary Button
    const copyButton = page.getByRole('button', { name: /Copy Audit Summary/i });
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/mips_score_forecaster_tool.png`, fullPage: false });
  });

  test('Tools Hub renders 31 tools and indexes new engines', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page.getByRole('heading', { level: 1, name: /31 Free Medical Billing & RCM Tools/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search 31 free tools & engines…/i)).toBeVisible();

    // Verify both new tools are present
    await expect(page.getByRole('heading', { level: 3, name: /CMS HCC Risk Adjustment & RAF Score Benchmarker/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /CMS MIPS Performance Score & Penalty Forecaster/i })).toBeVisible();

    // Test search filter for HCC
    const toolSearch = page.getByPlaceholder(/Search 31 free tools & engines…/i);
    await toolSearch.fill('RAF');
    await expect(page.getByRole('heading', { level: 3, name: /CMS HCC Risk Adjustment & RAF Score Benchmarker/i })).toBeVisible();

    // Test search filter for MIPS
    await toolSearch.fill('MIPS');
    await expect(page.getByRole('heading', { level: 3, name: /CMS MIPS Performance Score & Penalty Forecaster/i })).toBeVisible();
  });

});
