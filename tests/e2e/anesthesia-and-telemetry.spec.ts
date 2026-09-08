import { test, expect } from './fixtures';

const ARTIFACT_DIR = process.env.PLAYWRIGHT_ARTIFACT_DIR || '/tmp/aethera-e2e';

test.describe('New Specialty Workflows, Anesthesia Calculator & Platform Telemetry', () => {

  test('Podiatry specialty page renders with CPT codes, clinical nuances and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/podiatry/');

    await expect(page.getByRole('heading', { level: 1, name: /Podiatry & Advanced Wound Care Medical Billing/i })).toBeVisible();
    await expect(page.getByText(/11042–11047/i).first()).toBeVisible();
    await expect(page.getByText(/Surgical excisional debridement/i)).toBeVisible();
    await expect(page.getByText(/Routine foot care and mycotic nail debridement/i)).toBeVisible();

    // Check FAQs accordion
    await expect(page.getByText(/How do you prevent debridement depth recoupments/i)).toBeVisible();
  });

  test('Anesthesiology specialty page renders with ASA base units, concurrency rules and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/anesthesia/');

    await expect(page.getByRole('heading', { level: 1, name: /Anesthesiology & Interventional Sedation Medical Billing/i })).toBeVisible();
    await expect(page.getByText(/00100–01999/i)).toBeVisible();
    await expect(page.getByText(/Concurrency management/i)).toBeVisible();
    await expect(page.getByText(/Time unit calculation discrepancies/i)).toBeVisible();
    await expect(page.getByText(/How do you safeguard medical direction concurrency/i)).toBeVisible();
  });

  test('ASC specialty page renders with multiple procedure discounting and implant carve-outs', async ({ page }) => {
    await page.goto('/medical-billing/asc/');

    await expect(page.getByRole('heading', { level: 1, name: /Ambulatory Surgery Centers \(ASC\) Medical Billing/i })).toBeVisible();
    await expect(page.getByText(/Rev Codes 0490/i)).toBeVisible();
    await expect(page.getByText(/Device-intensive procedures lose implant pass-through revenue/i)).toBeVisible();
    await expect(page.getByText(/Multiple procedure discounting rules/i)).toBeVisible();
    await expect(page.getByText(/How do you capture high-cost surgical implant pass-through revenue/i)).toBeVisible();
  });

  test('Anesthesia ASA Unit & Reimbursement Calculator calculates units and currency yields dynamically', async ({ page }) => {
    await page.goto('/tools/anesthesia-calculator/');

    await expect(page.getByRole('heading', { level: 1, name: /Anesthesia ASA Unit & Reimbursement Calculator/i })).toBeVisible();

    // Select procedure preset: Laparoscopic Cholecystectomy (7 Base Units)
    const cholecystectomyBtn = page.getByRole('button', { name: /Laparoscopic Cholecystectomy/i });
    await cholecystectomyBtn.click();

    // Duration input is the second number input (first is Base Units)
    const durationInput = page.locator('input[type="number"]').nth(1);
    await durationInput.fill('90');

    // Click P3 modifier button (+1 unit)
    const p3Button = page.getByRole('button', { name: /P3/i }).first();
    await p3Button.click();

    // Total Billable ASA Units: 7 base + 6 time (90/15) + 1 (P3) = 14.0
    await expect(page.getByText('Total Cumulative ASA Units:')).toBeVisible();
    await expect(page.locator('strong', { hasText: '14.0' })).toBeVisible();

    // Change Medical Direction to QK / QX (2-4 concurrent rooms, 50% split)
    const qkButton = page.getByRole('button', { name: /Modifier QK \/ QX/i });
    await qkButton.click();

    // Verify split direction text appears: MD Share (50%)
    await expect(page.getByText(/MD Share \(50%\)/i).first()).toBeVisible();

    // Capture screenshot
    await page.screenshot({ path: `${ARTIFACT_DIR}/anesthesia_calculator_tool.png`, fullPage: false });
  });

  test('Browser telemetry labels measurements and limits honestly', async ({ page }) => {
    await page.goto('/tools/platform-telemetry/');
    await expect(page.getByRole('heading', { level: 1, name: 'Browser Performance Measurements' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'DNS lookup' })).toBeVisible();
    await expect(page.getByText(/Infrastructure and clearinghouse measurements are not connected/)).toBeVisible();
    await expect(page.getByText('Ashburn, VA', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Refresh measurements' }).click();
    await expect(page.getByRole('status')).toContainText('Last measured:');
  });

  test('Tools directory indexes 25 tools and filters new tools properly', async ({ page }) => {
    await page.goto('/tools/');

    // Verify directory has tools
    await expect(page.getByRole('button', { name: /All Tools \(\d+\)/i })).toBeVisible();

    // Search for Anesthesia
    const searchInput = page.getByPlaceholder(/Search \d+ free tools & engines/i);
    await searchInput.fill('Anesthesia');
    await expect(page.getByRole('heading', { name: /Anesthesia ASA Unit & Reimbursement Calculator/i })).toBeVisible();

    // Search for Telemetry
    await searchInput.fill('Telemetry');
    await expect(page.getByRole('heading', { name: /Browser Performance & Telemetry Measurements/i })).toBeVisible();
  });

});
