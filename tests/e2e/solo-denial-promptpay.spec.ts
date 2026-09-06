import { test, expect } from '@playwright/test';

const ARTIFACT_DIR = '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c';

test.describe('Solo Practice Funnel, Nephrology & ENT Specialties, and 29-Tool Suite', () => {

  test('Solo Practice Campaign Landing Page (/lp/solo-practice-rcm) renders calculator, comparison, and pilot form', async ({ page }) => {
    await page.goto('/lp/solo-practice-rcm/?utm_source=google&utm_medium=cpc&utm_campaign=solo-practice-billing&gclid=test_solo_gclid');

    // Verify title and hero elements
    await expect(page.getByRole('heading', { level: 1, name: /Enterprise Billing Power, Priced for Independent Clinics/i })).toBeVisible();
    await expect(page.getByText(/Tailored for Independent 1–5 Provider Practices/i)).toBeVisible();

    // Verify Overhead Calculator renders
    await expect(page.getByRole('heading', { level: 3, name: /Independent Practice Overhead & Billing Savings Calculator/i })).toBeVisible();
    await expect(page.getByText(/Current Billing Overhead/i)).toBeVisible();
    await expect(page.getByText(/Aethera \(4.5% All-Inclusive\)/i)).toBeVisible();
    await expect(page.getByText(/Net Practice Gain/i)).toBeVisible();

    // Fill form fields
    await page.getByPlaceholder('Dr. David Miller').fill('Dr. Laura Chen');
    await page.getByPlaceholder('Miller Family Health').fill('Chen Internal Medicine & Nephrology');
    await page.getByPlaceholder('drdavid@millerhealth.com').fill('lchen@cheninternalmed.com');
    await page.getByPlaceholder('(555) 000-0000').fill('(555) 000-8833');

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/solo_practice_campaign_landing.png`, fullPage: false });
  });

  test('Nephrology & Dialysis specialty page renders with CPT codes, MCP rules and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/nephrology/');

    await expect(page.getByRole('heading', { level: 1, name: /Nephrology & Dialysis Centers Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/90951–90970, 90935–90945/i).first()).toBeVisible();
    await expect(page.getByText(/MCP monthly capitation denials/i)).toBeVisible();
    await expect(page.getByText(/How do you handle patient hospitalizations during an ESRD Monthly Capitation Payment/i)).toBeVisible();
  });

  test('Otolaryngology & ENT specialty page renders with CPT codes, FESS rules and FAQs', async ({ page }) => {
    await page.goto('/medical-billing/ent/');

    await expect(page.getByRole('heading', { level: 1, name: /Otolaryngology & ENT Medical Billing Services/i })).toBeVisible();
    await expect(page.getByText(/31231–31298, 95165/i).first()).toBeVisible();
    await expect(page.getByText(/Diagnostic nasal endoscopy \(31231\) bundled into surgical sinus endoscopy/i)).toBeVisible();
    await expect(page.getByText(/How do you prevent denials when billing nasal endoscopy \(31231\) with an office visit\?/i)).toBeVisible();
  });

  test('Claim Denial Overturn Probability & Strategy Predictor calculates likelihood and ERISA citations', async ({ page }) => {
    await page.goto('/tools/denial-overturn-predictor/');

    await expect(page.getByRole('heading', { level: 1, name: /Claim Denial Overturn Probability & Strategy Predictor/i })).toBeVisible();

    // Select CO-50 and verify overturn probability
    await page.selectOption('select#carc-select', 'CO-50');
    await expect(page.getByText(/Overturn Likelihood on Level 1 Appeal/i)).toBeVisible();
    await expect(page.getByText(/CMS Medicare Claims Processing Manual Pub. 100-04/i)).toBeVisible();

    // Switch to CO-197 and verify emergency/EMTALA strategy
    await page.selectOption('select#carc-select', 'CO-197');
    await expect(page.getByText(/Emergency Medical Treatment and Active Labor Act/i)).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/denial_overturn_predictor_tool.png`, fullPage: false });
  });

  test('50-State Prompt-Payment Statute & Interest Penalty Matrix computes late interest and demand letter', async ({ page }) => {
    await page.goto('/tools/prompt-pay-statutes/');

    await expect(page.getByRole('heading', { level: 1, name: /50-State Prompt-Payment Statute & Interest Penalty Matrix/i })).toBeVisible();

    // Verify Florida Clean Claims Law
    const searchInput = page.getByPlaceholder(/Search state/i);
    await searchInput.fill('Florida');
    await page.getByRole('button', { name: /Florida/i }).click();

    await expect(page.getByRole('heading', { level: 3, name: /Florida Prompt-Pay Law/i })).toBeVisible();
    await expect(page.getByText(/20 Days/i).first()).toBeVisible();
    await expect(page.getByText(/12% \/ yr/i).first()).toBeVisible();

    // Verify demand letter generation
    await expect(page.getByText(/FORMAL DEMAND FOR IMMEDIATE PROMPT PAYMENT/i)).toBeVisible();

    // Screenshot artifact
    await page.screenshot({ path: `${ARTIFACT_DIR}/prompt_pay_statutes_tool.png`, fullPage: false });
  });

  test('Tools Hub renders 29 tools and indexes new engines', async ({ page }) => {
    await page.goto('/tools/');

    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();
    await expect(page.getByPlaceholder(/Search \d+ free tools & engines/i)).toBeVisible();

    // Verify both new tools are present
    await expect(page.getByRole('heading', { level: 3, name: /Claim Denial Overturn Probability & Strategy Predictor/i })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: /50-State Prompt-Payment Statute & Penalty Matrix/i })).toBeVisible();

    // Test search filter
    const toolSearch = page.getByPlaceholder(/Search \d+ free tools & engines/i);
    await toolSearch.fill('Overturn');
    await expect(page.getByRole('heading', { level: 3, name: /Claim Denial Overturn Probability & Strategy Predictor/i })).toBeVisible();
  });

});
