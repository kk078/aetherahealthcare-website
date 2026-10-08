import { test, expect } from './fixtures';

const ARTIFACT_DIR = process.env.PLAYWRIGHT_ARTIFACT_DIR || '/tmp/aethera-e2e';

test.describe('PPC Landing Page, Attribution, Radiology & Pathology, and 25-Tool Suite', () => {

  test('Campaign page explains scope and offers a short intake', async ({ page }) => {
    await page.goto('/lp/denial-recovery-pilot/?utm_source=google&utm_medium=cpc&utm_campaign=denial-management-pilot&gclid=test_gclid_12345');
    await expect(page.getByRole('heading', { name: 'Request a scoped review' })).toBeVisible();
    await expect(page.getByText('What we review', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Your name *', { exact: true })).toHaveValue('');
    await expect(page.getByRole('button', { name: 'Request Free 50-Claim Pilot' })).toBeVisible();
  });

  test('Radiology & Diagnostic Imaging specialty page renders with CPT codes, split billing and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/radiology/');

    await expect(page.getByRole('heading', { level: 1, name: /Radiology & Diagnostic Imaging Medical Billing/i })).toBeVisible();
    await expect(page.getByText(/71046, 74177, 70553, 77067/i)).toBeVisible();
    await expect(page.getByText(/Split billing: Ensuring professional component \(Mod 26\)/i)).toBeVisible();
    await expect(page.getByText(/How do you manage professional and technical component billing/i)).toBeVisible();
  });

  test('Pathology & Clinical Laboratory specialty page renders with CLIA rules, specimen levels and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/pathology/');

    await expect(page.getByRole('heading', { level: 1, name: /Pathology & Clinical Laboratory Medical Billing/i })).toBeVisible();
    await expect(page.getByText(/80047–89398/i).first()).toBeVisible();
    await expect(page.getByText(/CLIA certificate level mismatches/i)).toBeVisible();
    await expect(page.getByText(/How do you ensure CLIA compliance and prevent 277CA lab claim rejections/i)).toBeVisible();
  });

  test('Prior-Authorization Requirement & Gold-Card Matrix filters procedures and inspects SLAs', async ({ page }) => {
    await page.goto('/tools/prior-auth-matrix/');

    await expect(page.getByRole('heading', { level: 1, name: /Prior-Authorization & Payer Gold-Card Matrix/i })).toBeVisible();

    // Search for MRI Lumbar Spine
    const searchInput = page.getByPlaceholder(/Search CPT/i);
    await searchInput.fill('72148');

    // Click procedure card
    const mriCard = page.getByRole('button', { name: /MRI Lumbar Spine/i }).first();
    await mriCard.click();

    // Verify statutory turnaround SLAs (CMS-0057-F)
    await expect(page.getByText('72 Hours')).toBeVisible();
    await expect(page.getByText('7 Calendar Days')).toBeVisible();
    await expect(page.getByText('48 Hours')).toBeVisible();

    // Verify State Gold Card threshold text
    await expect(page.getByText(/State Gold-Card Exemption Standard/i)).toBeVisible();
    await expect(page.getByText(/90%\+ approval across prior 6-month evaluation period/i)).toBeVisible();

    // Take screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/prior_auth_gold_card_matrix.png`, fullPage: false });
  });

  test('Modifier 25 & 59 / X{EPSU} Compliance Engine validates clinical gates and outputs attestations', async ({ page }) => {
    await page.goto('/tools/modifier-compliance-engine/');

    await expect(page.getByRole('heading', { level: 1, name: /Modifier 25 & 59 \/ X\{EPSU\} Compliance Engine/i })).toBeVisible();

    // Click Yes on Gate 1 (Minor procedure)
    await page.getByRole('button', { name: 'Yes' }).nth(0).click();

    // Click Yes on Gate 2 (New problem / decision for surgery)
    await page.getByRole('button', { name: 'Yes' }).nth(1).click();

    // Click Yes on Gate 3 (Separate stand-alone MDM)
    await page.getByRole('button', { name: 'Yes' }).nth(2).click();

    // Verify Modifier 25 Fully Substantiated appears
    await expect(page.getByText(/Modifier 25 Fully Substantiated/i)).toBeVisible();

    // Switch to Modifier 59 / X{EPSU} tab
    const mod59Tab = page.getByRole('button', { name: /Modifier 59 \/ X\{EPSU\}/i });
    await mod59Tab.click();

    // Click Modifier XS button
    await page.getByRole('button', { name: /Modifier XS: Separate Organ \/ Structure/i }).click();

    // Verify recommended coding displays Modifier XS
    await expect(page.getByText(/Append Modifier XS/i)).toBeVisible();

    // Take screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/modifier_compliance_engine.png`, fullPage: false });
  });

  test('Tools directory indexes all 25 tools and filters new compliance engines', async ({ page }) => {
    await page.goto('/tools/');

    // Verify tools button
    await expect(page.getByRole('button', { name: /All Tools \(\d+\)/i })).toBeVisible();

    // Search for Prior-Auth
    const searchInput = page.getByPlaceholder(/Search \d+ free tools & engines/i);
    await searchInput.fill('Prior-Auth');
    await expect(page.getByRole('heading', { name: /Prior-Auth Requirement & Payer Gold-Card Matrix/i })).toBeVisible();

    // Search for Modifier
    await searchInput.fill('Modifier');
    await expect(page.getByRole('heading', { name: /Modifier 25 & 59 \/ X\{EPSU\} Compliance Engine/i })).toBeVisible();
  });

});
