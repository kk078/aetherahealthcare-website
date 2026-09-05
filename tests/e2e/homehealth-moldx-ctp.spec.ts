import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('Home Health & Hospice Funnel, Specialties 33-34, MolDX Scrubber & CTP Wastage Calculator', () => {

  test('Home Health Landing Page (/lp/home-health-hospice-billing) renders calculator and intake form', async ({ page }) => {
    await page.goto('/lp/home-health-hospice-billing/?utm_source=google&utm_medium=cpc&utm_campaign=home-health-pdgm&gclid=test_hh_gclid');

    // Verify title and hero elements
    await expect(page.getByRole('heading', { level: 1, name: /Stop Losing Revenue to PDGM LUPAs/i })).toBeVisible();
    await expect(page.getByText(/Home Health & Hospice Revenue Cycle Management/i)).toBeVisible();

    // Verify Calculator renders
    await expect(page.getByRole('heading', { level: 2, name: /PDGM LUPA Risk & Hospice Cap Recoupment Calculator/i })).toBeVisible();
    await expect(page.getByText(/Annual Revenue at Risk/i)).toBeVisible();
    await expect(page.getByText(/Aethera Net Recovery/i)).toBeVisible();

    // Verify Form Fields
    await page.getByPlaceholder('e.g. Guardian Home Health & Hospice').fill('Beacon Point Home Health');
    await page.getByPlaceholder('e.g. Sarah Jenkins, RN, BSN').fill('Sarah Jenkins, RN');
    await page.getByPlaceholder('sjenkins@guardianhh.com').fill('sjenkins@beaconpointhh.com');
    await page.getByPlaceholder('(555) 432-8765').fill('(555) 321-9988');

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/home_health_hospice_campaign_landing.png`, fullPage: false });
  });

  test('Home Health & Hospice Care specialty page renders with CPT/HCPCS codes, PDGM rules and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/home-health-hospice/');

    await expect(page.getByRole('heading', { level: 1, name: /Home Health & Hospice Care Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/G0151–G0154, G0299–G0300/i).first()).toBeVisible();
    await expect(page.getByText(/PDGM LUPA threshold payment cuts/i)).toBeVisible();
    await expect(page.getByText(/How do you prevent Low Utilization Payment Adjustments \(LUPAs\) under PDGM\?/i)).toBeVisible();
  });

  test('Wound Care & Hyperbaric Medicine specialty page renders with CPT codes, CTP wastage and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/wound-care/');

    await expect(page.getByRole('heading', { level: 1, name: /Wound Care & Hyperbaric Medicine Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/11042–11047, 97597–97598/i).first()).toBeVisible();
    await expect(page.getByText(/Skin substitute CTP wastage billing rejections/i)).toBeVisible();
    await expect(page.getByText(/How do you ensure full reimbursement for expensive cellular and tissue products \(CTPs\)\?/i)).toBeVisible();
  });

  test('Molecular Diagnostics MolDX Scrubber evaluates DEX Z-Codes and LCD criteria', async ({ page }) => {
    await page.goto('/tools/moldx-zcode-scrubber/');

    await expect(page.getByRole('heading', { level: 1, name: /Molecular Diagnostics MolDX® Z-Code & LCD Scrubber/i })).toBeVisible();

    // Verify initial clean billable verdict
    await expect(page.getByText(/MolDX Claim Fully Defensible/i)).toBeVisible();
    await expect(page.getByText(/BRCA1 & BRCA2 Comprehensive Sequencing/i)).toBeVisible();

    // Uncheck DEX Z-Code checkbox to trigger rejection risk
    const zCodeCheckbox = page.getByRole('checkbox').first();
    await zCodeCheckbox.uncheck();

    // Verify rejection warning
    await expect(page.getByText(/MOLDX REJECTION RISK: Missing DEX Z-Code/i)).toBeVisible();

    // Verify Copy button
    const copyButton = page.getByRole('button', { name: /Copy/i }).first();
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/moldx_zcode_scrubber_tool.png`, fullPage: false });
  });

  test('Skin Substitute & CTP Wastage Calculator evaluates Modifiers JW and JZ dual-line splits', async ({ page }) => {
    await page.goto('/tools/ctp-skin-substitute-calculator/');

    await expect(page.getByRole('heading', { level: 1, name: /Skin Substitute & CTP Wastage Modifier JW \/ JZ Calculator/i })).toBeVisible();

    // Initial state: Apligraf 44 cm² pkg, 14 cm² defect -> dual-line claim
    await expect(page.getByText(/Compliant Dual-Line Split Claim \(Modifier JW Required\)/i)).toBeVisible();
    await expect(page.getByText(/Line 1: Administered Graft/i)).toBeVisible();
    await expect(page.getByText(/Line 2: Discarded Wastage \(JW\)/i)).toBeVisible();

    // Set package size equal to defect size (14 cm²) to test zero-discarded JZ scenario
    const packageInput = page.getByRole('spinbutton').first();
    await packageInput.fill('14');

    // Zero discarded triggers Modifier JZ requirement
    await expect(page.getByText(/Compliant Single-Line Claim \(Modifier JZ Mandated\)/i)).toBeVisible();

    // Verify Copy button
    const copyButton = page.getByRole('button', { name: /Copy/i }).first();
    await expect(copyButton).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/ctp_skin_substitute_calculator_tool.png`, fullPage: false });
  });

  test('Tools Hub renders tools and indexes MolDX scrubber and CTP wastage calculator', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search \d+ free tools & engines/i)).toBeVisible();

    // Verify both new tools are present in catalog
    await expect(page.getByRole('heading', { level: 3, name: /Molecular Diagnostics MolDX® Z-Code & LCD Scrubber/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /Skin Substitute & CTP Wastage Modifier JW \/ JZ Calculator/i })).toBeVisible();

    // Test search filter for MolDX
    const toolSearch = page.getByPlaceholder(/Search \d+ free tools & engines/i);
    await toolSearch.fill('MolDX');
    await expect(page.getByRole('heading', { level: 3, name: /Molecular Diagnostics MolDX® Z-Code & LCD Scrubber/i })).toBeVisible();

    // Test search filter for Skin Substitute
    await toolSearch.fill('Skin Substitute');
    await expect(page.getByRole('heading', { level: 3, name: /Skin Substitute & CTP Wastage Modifier JW \/ JZ Calculator/i })).toBeVisible();
  });

});
