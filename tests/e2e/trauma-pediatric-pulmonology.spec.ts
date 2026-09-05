import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Specialties 47-48 and Tools 52-53: Trauma Surgery & Pediatric Pulmonology Suites', () => {
  test('Specialty 47: Surgical Critical Care & Trauma Surgery page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/trauma-critical-care/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Surgical Critical Care & Trauma Surgery/i })
    ).toBeVisible();
    await expect(page.getByText(/Damage control laparotomy/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('49000').first()).toBeVisible();
    await expect(page.getByText('49002').first()).toBeVisible();
    await expect(page.getByText('99291').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Specialty 48: Pediatric Allergy, Pulmonology & Cystic Fibrosis page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/pediatric-pulmonology/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Pediatric Allergy, Pulmonology & Cystic Fibrosis/i })
    ).toBeVisible();
    await expect(page.getByText(/Pediatric spirometry and plethysmography/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('94060').first()).toBeVisible();
    await expect(page.getByText('82435').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Tool #52: Trauma & Open Abdomen Damage Control Scrubber audits staged laparotomy, bedside lines & time carve-outs', async ({ page }) => {
    await page.goto('/tools/trauma-damage-control-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Trauma & Open Abdomen Damage Control Scrubber/i })
    ).toBeVisible();

    // Verify initial clean state with CPT 49000, 49002 with Modifier -58, and bedside lines
    await expect(page.getByRole('cell', { name: '49000' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '49002' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '-58' }).first()).toBeVisible();
    await expect(page.getByText(/Compliant Trauma & Damage Control/i).first()).toBeVisible();

    // Switch modifier to "none" to trigger fatal global bundling denial
    const stagedModSelect = page.locator('#stagedModifierSelect');
    await stagedModSelect.selectOption('none');
    await expect(page.getByText(/Fatal Global Surgical Period Denial/i)).toBeVisible();
    await expect(page.getByText(/Errors Flagged/i).first()).toBeVisible();

    // Switch to Modifier -78 to see 30% reduction warning
    await stagedModSelect.selectOption('mod_78');
    await expect(page.getByText(/Modifier -78 Applied to Planned Staged Damage Control Return/i)).toBeVisible();

    // Return to Modifier -58
    await stagedModSelect.selectOption('mod_58');
    await expect(page.getByText(/Compliant Trauma & Damage Control/i).first()).toBeVisible();

    // Trigger Critical Care Time Double-Counting audit trap
    const doubleDipCheckbox = page.locator('#failCarveOutCheck');
    await doubleDipCheckbox.check();
    await expect(page.getByText(/Critical Care Time Carve-Out Audit Violation/i)).toBeVisible();
    await doubleDipCheckbox.uncheck();

    // Select Both Laparotomy + Thoracotomy
    const initProcSelect = page.locator('#initialProcedureSelect');
    await initProcSelect.selectOption('both');
    await expect(page.getByRole('cell', { name: '32110' }).first()).toBeVisible();

    // Verify ANSI 837P simulation
    await expect(page.getByText(/ANSI X12 837P Professional Claim Simulation/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:49000/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'trauma_damage_control_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #53: Pediatric Pulmonology & CFTR Estimator audits spirometry unbundling & CFTR prior auth', async ({ page }) => {
    await page.goto('/tools/pediatric-pulmonary-estimator/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Pediatric Pulmonology, Allergy & CFTR Estimator/i })
    ).toBeVisible();

    // Verify initial clean state with 94060, sweat chloride 82435, and aerosol 94640
    await expect(page.getByRole('cell', { name: '94060' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '82435' }).first()).toBeVisible();
    await expect(page.getByText(/Compliant Pediatric Pulmonary/i).first()).toBeVisible();

    // Trigger 94010 unbundling trap
    const unbundleCheckbox = page.getByLabel(/Simulate 94010 Unbundling/i);
    await unbundleCheckbox.check();
    await expect(page.getByText(/NCCI Fatal PFT Unbundling/i)).toBeVisible();
    await expect(page.getByText(/Errors Flagged/i).first()).toBeVisible();
    await unbundleCheckbox.uncheck();

    // Verify CFTR therapy prior-auth section
    await expect(page.getByText(/Annual CFTR Therapy Value/i)).toBeVisible();
    await expect(page.locator('div').filter({ hasText: /^Annual CFTR Therapy Value/ }).locator('.text-2xl')).toHaveText('$336k/yr');

    // Trigger missing genetics prior-auth denial trap
    const missingGeneticsCheckbox = page.locator('#missingGeneticsCheck');
    await missingGeneticsCheckbox.check();
    await expect(page.getByText(/CFTR Modulator Prior Authorization Denied/i)).toBeVisible();
    await missingGeneticsCheckbox.uncheck();

    // Select Plethysmography
    const pftSelect = page.locator('#pftEvalTypeSelect');
    await pftSelect.selectOption('plethysmography_full');
    await expect(page.getByRole('cell', { name: '94726' }).first()).toBeVisible();

    // Verify ANSI 837P simulation
    await expect(page.getByText(/ANSI X12 837P Professional Claim Simulation/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:94726/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pediatric_pulmonary_estimator_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory: Expands to 53 tools and includes Trauma and Pediatric Pulmonology scrubbers', async ({ page }) => {
    await page.goto('/tools/');

    // Verify 53 Tools title
    await expect(page.getByRole('heading', { level: 1, name: /53 Free Medical Billing & RCM Tools/i })).toBeVisible();

    // Verify tool cards are in directory
    await expect(page.getByText('Trauma & Open Abdomen Damage Control Scrubber').first()).toBeVisible();
    await expect(page.getByText('Pediatric Pulmonology, Allergy & CFTR Estimator').first()).toBeVisible();

    // Test search filter for trauma
    const searchInput = page.getByPlaceholder(/Search .* free tools/i);
    await searchInput.fill('trauma');
    await expect(page.getByText('Trauma & Open Abdomen Damage Control Scrubber').first()).toBeVisible();

    // Test search filter for pulmonary
    await searchInput.fill('pulmonary');
    await expect(page.getByText('Pediatric Pulmonology, Allergy & CFTR Estimator').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 48+ specialties with Trauma and Pediatric Pulmonology links', async ({ page }) => {
    await page.goto('/specialties/');

    // Verify hero and chips
    await expect(page.getByRole('heading', { level: 1, name: /Specialty-Specific Billing & Coding Services|Billing built for your specialty/i })).toBeVisible();
    await expect(page.getByText('48+ specialties').first()).toBeVisible();

    // Verify both new specialties are present and linked
    await expect(page.getByText('Surgical Critical Care & Trauma Surgery').first()).toBeVisible();
    await expect(page.getByText('Pediatric Allergy, Pulmonology & Cystic Fibrosis').first()).toBeVisible();

    const traumaLink = page.locator('a[href*="/medical-billing/trauma-critical-care"]').first();
    await expect(traumaLink).toBeVisible();

    const pedsPulmLink = page.locator('a[href*="/medical-billing/pediatric-pulmonology"]').first();
    await expect(pedsPulmLink).toBeVisible();
  });
});
