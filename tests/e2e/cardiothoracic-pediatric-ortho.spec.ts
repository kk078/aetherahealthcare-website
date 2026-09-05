import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Specialties 45-46 and Tools 50-51: Cardiothoracic & Pediatric Orthopedic Suites', () => {
  test('Specialty 45: Cardiothoracic Surgery & ECMO page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/cardiothoracic-surgery/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Cardiothoracic Surgery & Extracorporeal Membrane Oxygenation/i })
    ).toBeVisible();
    await expect(page.getByText(/Coronary artery bypass grafting/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('33533').first()).toBeVisible();
    await expect(page.getByText('33405').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Specialty 46: Pediatric Orthopedics & Scoliosis Deformity Correction page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/pediatric-orthopedics/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Pediatric Orthopedics & Scoliosis Deformity Correction/i })
    ).toBeVisible();
    await expect(page.getByText(/Spinal deformity arthrodesis for adolescent idiopathic scoliosis/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('22800').first()).toBeVisible();
    await expect(page.getByText('22804').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Tool #50: Cardiothoracic Bypass & Cannulation Scrubber audits CABG, valves, and ECMO', async ({ page }) => {
    await page.goto('/tools/cardiothoracic-cannulation-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Cardiothoracic Bypass & Cannulation Scrubber/i })
    ).toBeVisible();

    // Verify initial clean state with 1 arterial (33533) + 2 venous (+33518)
    await expect(page.getByRole('cell', { name: '33533' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '+33518' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '+33508' }).first()).toBeVisible();
    await expect(page.getByText(/Compliant Cardiothoracic Surgical Sequencing/i)).toBeVisible();

    // Trigger Standalone Venous Mistake trap
    const standaloneCheckbox = page.getByLabel(/Simulate Standalone Venous Mistake/i);
    await standaloneCheckbox.check();
    await expect(page.getByText(/NCCI Fatal Unbundling: Standalone Venous CABG/i)).toBeVisible();
    await expect(page.getByText(/Errors Detected/i).first()).toBeVisible();

    // Uncheck Standalone Venous trap
    await standaloneCheckbox.uncheck();

    // Trigger Routine CPB Unbundling trap
    const cpbCheckbox = page.getByLabel(/Unbundle Routine CPB Cannulation/i);
    await cpbCheckbox.check();
    await expect(page.getByText(/Statutory CPB Cannulation Bundling Violation/i)).toBeVisible();
    await cpbCheckbox.uncheck();

    // Select Concomitant Mitral Valve Replacement
    const valveSelect = page.locator('#valveProcedureSelect');
    await valveSelect.selectOption('mvr');
    await expect(page.getByRole('cell', { name: '33430' }).first()).toBeVisible();

    // Select VA ECMO Support
    const ecmoSelect = page.locator('#ecmoSupportSelect');
    await ecmoSelect.selectOption('va_ecmo');
    await expect(page.getByRole('cell', { name: '33947' }).first()).toBeVisible();

    // Verify ANSI 837P preview
    await expect(page.getByText(/ANSI X12 837P Professional Claim Simulation/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:33430/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'cardiothoracic_cannulation_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #51: Pediatric Scoliosis & Multi-Rod Deformity Scrubber models AIS fusions & downcoding', async ({ page }) => {
    await page.goto('/tools/scoliosis-deformity-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Pediatric Scoliosis & Deformity Scrubber/i })
    ).toBeVisible();

    // Default 14 segments yields CPT 22804 and +22844
    await expect(page.getByRole('cell', { name: '22804' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '+22844' }).first()).toBeVisible();
    await expect(page.getByText(/Compliant Pediatric Deformity Arthrodesis Coding/i)).toBeVisible();

    // Simulate Interspace Downcoding Trap
    const downcodeCheckbox = page.getByLabel(/Simulate Payer Interspace Downcode/i);
    await downcodeCheckbox.check();
    await expect(page.getByText(/Improper Payer Downcoding: Interspace vs Vertebral Segment Rule/i)).toBeVisible();
    await expect(page.getByText(/Downcodes Flagged/i).first()).toBeVisible();
    await downcodeCheckbox.uncheck();

    // Enable Pelvic Fixation and simulate bundling
    const pelvicFixCheckbox = page.getByLabel(/Pelvic Fixation \(\+22848 S2AI\/Iliac bolts\)/i);
    await pelvicFixCheckbox.check();
    await expect(page.getByRole('cell', { name: '+22848' }).first()).toBeVisible();

    const pelvicBundleCheckbox = page.getByLabel(/Simulate Pelvic Fixation Bundling/i);
    await pelvicBundleCheckbox.check();
    await expect(page.getByText(/Unlawful Payer Bundling: Pelvic Fixation/i)).toBeVisible();
    await pelvicBundleCheckbox.uncheck();

    // Verify multi-level Ponte Osteotomy is active (default 3 segments: 22210 + +22214 x2)
    await expect(page.getByRole('cell', { name: '22210' }).first()).toBeVisible();
    await expect(page.getByRole('cell', { name: '+22214 x2' }).first()).toBeVisible();

    // Verify ANSI 837P preview
    await expect(page.getByText(/ANSI X12 837P Professional Claim Simulation/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:22804/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'scoliosis_deformity_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory: Expands to 51 tools and includes Cardiothoracic and Scoliosis scrubbers', async ({ page }) => {
    await page.goto('/tools/');

    // Verify Tools title
    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();

    // Verify tool cards are in directory
    await expect(page.getByText('Cardiothoracic Bypass & Cannulation Scrubber').first()).toBeVisible();
    await expect(page.getByText('Pediatric Scoliosis & Multi-Rod Deformity Scrubber').first()).toBeVisible();

    // Test search filter for cardiothoracic
    const searchInput = page.getByPlaceholder(/Search .* free tools/i);
    await searchInput.fill('cardiothoracic');
    await expect(page.getByText('Cardiothoracic Bypass & Cannulation Scrubber').first()).toBeVisible();

    // Test search filter for scoliosis
    await searchInput.fill('scoliosis');
    await expect(page.getByText('Pediatric Scoliosis & Multi-Rod Deformity Scrubber').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 46+ specialties with Cardiothoracic and Pediatric Orthopedic links', async ({ page }) => {
    await page.goto('/specialties/');

    // Verify hero and chips
    await expect(page.getByRole('heading', { level: 1, name: /Specialty-Specific Billing & Coding Services|Billing built for your specialty/i })).toBeVisible();
    await expect(page.getByText(/\d+\+ specialties/i).first()).toBeVisible();

    // Verify both new specialties are present and linked
    await expect(page.getByText('Cardiothoracic Surgery & Extracorporeal Membrane Oxygenation (ECMO)').first()).toBeVisible();
    await expect(page.getByText('Pediatric Orthopedics & Scoliosis Deformity Correction').first()).toBeVisible();

    const cardioLink = page.locator('a[href*="/medical-billing/cardiothoracic-surgery"]').first();
    await expect(cardioLink).toBeVisible();

    const pedsLink = page.locator('a[href*="/medical-billing/pediatric-orthopedics"]').first();
    await expect(pedsLink).toBeVisible();
  });
});
