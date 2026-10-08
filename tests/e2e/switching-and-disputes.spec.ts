import { test, expect } from './fixtures';

const ARTIFACT_DIR = process.env.PLAYWRIGHT_ARTIFACT_DIR || '/tmp/aethera-e2e';

test.describe('Switching Campaign Funnel, Emergency & Urgent Care Specialties, and 27-Tool Suite', () => {

  test('Campaign page explains scope and offers a short intake', async ({ page }) => {
    await page.goto('/lp/switch-medical-billing/?utm_source=linkedin&utm_medium=paid&utm_campaign=switch-medical-billing&gclid=test_switch_gclid');
    await expect(page.getByRole('heading', { name: 'Request a scoped review' })).toBeVisible();
    await expect(page.getByText('What we review', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Your name *', { exact: true })).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Request Free 50-Claim Pilot' })).toBeVisible();
  });

  test('Emergency Medicine specialty page renders with CPT codes, QPA dispute and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/emergency-medicine/');

    await expect(page.getByRole('heading', { level: 1, name: /Emergency Medicine & Hospitalists Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/99281–99285, 99291–99292/i).first()).toBeVisible();
    await expect(page.getByText(/Payer downcoding of Level 5 ED visits \(99285\)/i)).toBeVisible();
    await expect(page.getByText(/How do you prevent algorithmic downcoding on CPT 99285\?/i)).toBeVisible();
  });

  test('Urgent Care specialty page renders with CPT codes, S9088 add-on and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/urgent-care/');

    await expect(page.getByRole('heading', { level: 1, name: /Urgent Care & Walk-In Clinics Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/S9088, S9083/i).first()).toBeVisible();
    await expect(page.getByText(/Commercial payer non-recognition of urgent care add-on code S9088/i)).toBeVisible();
    await expect(page.getByText(/How do you ensure full payment on urgent care facility code S9088\?/i)).toBeVisible();
  });

  test('Payer Contract Underpayment & Variance Analyzer calculates underpayment leakage & interest penalties', async ({ page }) => {
    await page.goto('/tools/underpayment-analyzer/');

    await expect(page.getByRole('heading', { level: 1, name: /Payer Contract Underpayment & Variance Analyzer/i })).toBeVisible();

    // Verify and click Emergency Department Visit preset button
    const presetBtn = page.getByRole('button', { name: /Emergency Department Visit/i });
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    // Verify Texas 18% statutory prompt-pay interest button
    const txBtn = page.getByRole('button', { name: /TX \(18%\)/i });
    await expect(txBtn).toBeVisible();
    await txBtn.click();
    await expect(page.getByText(/Texas Insurance Code § 1301.103/i).first()).toBeVisible();

    // Verify Dispute Letter section
    await expect(page.getByText(/DEMAND FOR CONTRACTUAL UNDERPAYMENT ADJUSTMENT/i)).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/underpayment_analyzer_tool.png`, fullPage: false });
  });

  test('Payer Dispute & Electronic Appeals Directory filters payers and displays appeal deadlines', async ({ page }) => {
    await page.goto('/tools/payer-dispute-directory/');

    await expect(page.getByRole('heading', { level: 1, name: /Payer Dispute & Electronic Appeals Directory/i })).toBeVisible();

    // Filter by UnitedHealthcare
    const searchInput = page.getByPlaceholder(/Search payer or Payer ID/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('UnitedHealthcare');

    await expect(page.getByRole('heading', { level: 3, name: /UnitedHealthcare \(UHC\)/i })).toBeVisible();
    await expect(page.getByText(/Requires formal Smart Edits review/i)).toBeVisible();

    // Clear and search for Medicare MAC Novitas, then click to select
    await searchInput.fill('Novitas');
    const novitasBtn = page.getByRole('button', { name: /Novitas Solutions/i });
    await expect(novitasBtn).toBeVisible();
    await novitasBtn.click();

    await expect(page.getByRole('heading', { level: 3, name: /Novitas Solutions/i })).toBeVisible();
    await expect(page.getByText(/Must file within 120 days of RA/i)).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/payer_dispute_directory.png`, fullPage: false });
  });

  test('Tools Hub renders 27 tools and indexes new engines', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search \d+ free tools & engines/i)).toBeVisible();

    // Verify both new tools are present
    await expect(page.getByRole('heading', { level: 3, name: /Payer Contract Underpayment & Variance Analyzer/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Payer Dispute & Electronic Appeals Directory/i })).toBeVisible();

    // Test filter search
    const toolSearch = page.getByPlaceholder(/Search \d+ free tools & engines/i);
    await toolSearch.fill('Underpayment');
    await expect(page.getByRole('heading', { level: 3, name: /Payer Contract Underpayment & Variance Analyzer/i })).toBeVisible();
  });

});
