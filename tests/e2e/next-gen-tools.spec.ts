import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('Next-Gen Compliance, EDI & Practice Intelligence Suite', () => {

  test('Tools: Good Faith Estimate (GFE) Generator computes itemized costs and applies clinical presets', async ({ page }) => {
    await page.goto('/tools/good-faith-estimate-generator/');
    const h1 = page.getByRole('heading', { level: 1, name: /Good Faith Estimate \(GFE\) Generator/i });
    await expect(h1).toBeVisible();
    await expect(page.getByText('CMS No Surprises Act (45 CFR § 149.610) Compliance')).toBeVisible();

    // Verify initial calculation
    await expect(page.getByText('Total Good Faith Estimate:')).toBeVisible();

    // Switch preset to Knee Arthroscopy
    await page.getByRole('button', { name: 'Knee Arthroscopy' }).click();
    await expect(page.locator('td', { hasText: '29881' })).toBeVisible();
    await expect(page.getByText('MANDATORY STATUTORY NOTICE UNDER THE NO SURPRISES ACT')).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/gfe_generator_tool.png`, fullPage: false });
  });

  test('Tools: Patient Liability & Out-of-Pocket Estimator computes deductibles and copays', async ({ page }) => {
    await page.goto('/tools/patient-liability-estimator/');
    const h1 = page.getByRole('heading', { level: 1, name: /Patient Out-of-Pocket Liability Estimator/i });
    await expect(h1).toBeVisible();
    await expect(page.getByText('Front-Desk POS Financial Clearance')).toBeVisible();

    // Verify liability breakdown
    await expect(page.getByRole('heading', { level: 3, name: /Reimbursement & Liability Split/i })).toBeVisible();
    await expect(page.getByText(/Total Upfront Patient Responsibility/i)).toBeVisible();
    await expect(page.getByText('POINT OF SERVICE RECEIPT')).toBeVisible();

    // Switch clinical preset to 70553 (MRI)
    await page.getByRole('button', { name: '70553' }).click();
    await expect(page.locator('span.font-mono', { hasText: '70553' })).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/patient_liability_tool.png`, fullPage: false });
  });

  test('Tools: ANSI X12 270/271 Real-Time Eligibility Validator decodes EB segments', async ({ page }) => {
    await page.goto('/tools/edi-270-271-validator/');
    const h1 = page.getByRole('heading', { level: 1, name: /ANSI X12 270\/271 Eligibility Validator/i });
    await expect(h1).toBeVisible();
    await expect(page.getByText('ANSI X12 270/271 Real-Time Parser')).toBeVisible();

    // Verify parser results for active commercial sample
    await expect(page.getByText('Active In-Network Coverage')).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Patient Financial Responsibility Grid/i })).toBeVisible();

    // Switch to Terminated Coverage sample
    await page.getByRole('button', { name: /Medicare Part B \/ Commercial Terminated/i }).click();
    await expect(page.getByText('Inactive / Terminated Coverage (CARC CO-27)')).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/edi_270_271_validator.png`, fullPage: false });
  });

  test('Tools: ANSI X12 837 Claim File Syntax Scrubber identifies billing errors and predicts 277CA response', async ({ page }) => {
    await page.goto('/tools/edi-837-scrubber/');
    const h1 = page.getByRole('heading', { level: 1, name: /ANSI X12 837 Claim File Syntax Scrubber/i });
    await expect(h1).toBeVisible();
    await expect(page.getByText('ANSI X12 837P / 837I Diagnostic Engine')).toBeVisible();

    // Verify initial clean claim sample
    await expect(page.getByText('98.7% Clean Claim: Formatted for 277CA Acceptance')).toBeVisible();
    await expect(page.getByText(/Loop 2010AA: Billing NPI verified against NPPES/i)).toBeVisible();

    // Switch to Rejected 837P sample
    await page.getByRole('button', { name: /Rejected 837P/i }).click();
    await expect(page.getByText('Clearinghouse Rejection: Fatal Syntax Omission')).toBeVisible();
    await expect(page.getByText(/Loop 2010AA \(Billing Provider\)/i)).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/edi_837_scrubber.png`, fullPage: false });
  });

  test('Tools: MGMA Practice Health Index & Scorecard computes performance benchmarks', async ({ page }) => {
    await page.goto('/tools/practice-benchmark-scorecard/');
    const h1 = page.getByRole('heading', { level: 1, name: /Practice Health Index & Specialty Benchmark Scorecard/i });
    await expect(h1).toBeVisible();
    await expect(page.getByText('Composite Evaluation')).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Practice Health Index/i })).toBeVisible();

    // Verify benchmark metrics and cash lift
    await expect(page.getByRole('heading', { level: 3, name: /Estimated Annual Cash Lift/i })).toBeVisible();

    // Change specialty in dropdown
    await page.locator('main select').selectOption('Family Medicine');
    await expect(page.getByText('MGMA Top Decile for Family Medicine:')).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/practice_benchmark_scorecard.png`, fullPage: false });
  });

  test('Tools: Provider Credentialing & Payer Enrollment Timeline Estimator displays milestone roadmap', async ({ page }) => {
    await page.goto('/tools/credentialing-timeline-estimator/');
    const h1 = page.getByRole('heading', { level: 1, name: /Provider Credentialing Timeline Estimator/i });
    await expect(h1).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Credentialing Lead Time Analysis/i })).toBeVisible();

    // Verify phase milestones roadmap
    await expect(page.getByRole('heading', { level: 3, name: /16-Week Milestone Execution Roadmap/i })).toBeVisible();
    await expect(page.getByText('CAQH ProView Profile & Primary Source Verification')).toBeVisible();

    // Change provider type dropdown
    await page.locator('main select').first().selectOption('Nurse Practitioner / PA');

    await page.screenshot({ path: `${ARTIFACT_DIR}/credentialing_timeline_estimator.png`, fullPage: false });
  });

  test('Case Studies Hub: displays 10 specialty case studies with interactive filtering and search', async ({ page }) => {
    await page.goto('/case-studies/');
    const h1 = page.getByRole('heading', { level: 1, name: /Real practices\. Measurable results\./i });
    await expect(h1).toBeVisible();
    await expect(page.getByText(/All Specialties \(10\)/i)).toBeVisible();

    // Check presence of initial case studies
    await expect(page.getByText('Midwest Cardiovascular Specialists · Illinois')).toBeVisible();

    // Test search filter
    const searchInput = page.getByPlaceholder('Filter by specialty or clinical code…');
    await searchInput.fill('NeuroDiagnostic');
    await expect(page.getByText('NeuroDiagnostic Associates · North Carolina')).toBeVisible();
    await expect(page.getByText('Midwest Cardiovascular Specialists · Illinois')).not.toBeVisible();

    // Clear search and test category filter
    await searchInput.clear();
    await page.getByRole('button', { name: /Surgical & Procedural/i }).click();
    await expect(page.getByText('Apex Orthopedic & Spine Surgery · Florida')).toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/case_studies_hub.png`, fullPage: false });
  });

  test('Tools Hub: showcases all 21 tools with Provider Portal Sandbox banner and category filtering', async ({ page }) => {
    await page.goto('/tools/');
    const h1 = page.getByRole('heading', { level: 1, name: /21 Free Medical Billing & RCM Tools/i });
    await expect(h1).toBeVisible();
    await expect(page.getByText(/All Tools \(21\)/i)).toBeVisible();

    // Verify featured sandbox banner
    await expect(page.getByText(/Featured Interactive Simulation/i)).toBeVisible();
    await expect(page.getByRole('link', { name: /Launch Live Portal Sandbox/i })).toBeVisible();

    // Verify new tools are listed
    await expect(page.getByText('No Surprises Act GFE Generator')).toBeVisible();
    await expect(page.getByText('Patient Out-of-Pocket Liability Estimator')).toBeVisible();
    await expect(page.getByText('ANSI X12 270/271 Eligibility Validator')).toBeVisible();
    await expect(page.getByText('ANSI X12 837 Claim File Scrubber')).toBeVisible();
    await expect(page.getByText('MGMA Practice Health Index & Scorecard')).toBeVisible();
    await expect(page.getByText('Provider Credentialing Timeline Estimator')).toBeVisible();

    // Filter by EDI & Interoperability
    await page.getByRole('button', { name: /EDI & Interoperability/i }).click();
    await expect(page.getByText('ANSI X12 270/271 Eligibility Validator')).toBeVisible();
    await expect(page.getByText('No Surprises Act GFE Generator')).not.toBeVisible();

    await page.screenshot({ path: `${ARTIFACT_DIR}/tools_hub_showcase.png`, fullPage: false });
  });

});
