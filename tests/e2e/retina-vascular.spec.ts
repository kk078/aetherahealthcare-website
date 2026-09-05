import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Specialties 41-42 and Tools 46-47: Retina & Vascular Endovascular Suites', () => {
  test('Specialty 41: Ophthalmology & Vitreoretinal Surgery page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/retina-vitreous/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Ophthalmology & Vitreoretinal Surgery/i })
    ).toBeVisible();
    await expect(page.getByText(/Anti-VEGF intravitreal injections/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('67028').first()).toBeVisible();
    await expect(page.getByText('J0178').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Specialty 42: Vascular Surgery & Endovascular Interventions page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/vascular-surgery/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Vascular Surgery & Endovascular Interventions/i })
    ).toBeVisible();
    await expect(page.getByText(/Endovascular aneurysm repair/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('37220–37235').first()).toBeVisible();
    await expect(page.getByText('34701–34716').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Tool #46: Anti-VEGF Intravitreal Injection Scrubber models dosage, wastage, and intervals', async ({ page }) => {
    await page.goto('/tools/retina-injection-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Anti-VEGF Intravitreal Injection & Bilateral Scrubber/i })
    ).toBeVisible();

    // Verify default drug selection (Eylea 2mg)
    await expect(page.getByText('Eylea® (aflibercept) 2 mg').first()).toBeVisible();
    await expect(page.getByText('J0178').first()).toBeVisible();

    // Switch to Lucentis
    const lucentisBtn = page.getByRole('button', { name: /Lucentis/i });
    await lucentisBtn.click();
    await expect(page.getByText('J2778').first()).toBeVisible();

    // Switch to Pre-Filled Syringe (PFS) zero wastage
    const pfsBtn = page.getByRole('button', { name: /Pre-Filled Syringe/i });
    await pfsBtn.click();
    await expect(page.getByText(/Zero Wastage \(Mod JZ\)/i).first()).toBeVisible();

    // Switch to Bilateral laterality
    const bilateralBtn = page.getByRole('button', { name: /Bilateral/i });
    await bilateralBtn.click();
    await expect(page.getByText(/Bilateral & Packaging Coding Rules/i).first()).toBeVisible();

    // Verify ANSI 837P preview
    await expect(page.getByText(/ANSI X12 837P Retina Claim Lines/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:67028/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'retina_injection_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #47: Endovascular & PAD Revascularization Scrubber evaluates vascular hierarchy', async ({ page }) => {
    await page.goto('/tools/pad-revascularization-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Endovascular & PAD Revascularization Scrubber/i })
    ).toBeVisible();

    // Default territory: Femoral / Popliteal
    await expect(page.getByText(/Atherectomy & Stent Placement/i).first()).toBeVisible();
    await expect(page.getByText('CPT 37227').first()).toBeVisible();

    // Switch to Tibial / Peroneal territory
    const tibBtn = page.getByRole('button', { name: /Tibial \/ Peroneal/i });
    await tibBtn.click();
    await expect(page.getByText('CPT 37231').first()).toBeVisible();

    // Toggle additional vessel
    const addlCheckbox = page.getByLabel(/Second \/ Additional Ipsilateral Vessel/i);
    await addlCheckbox.check();
    await expect(page.getByText(/\+37235/i).first()).toBeVisible();

    // Verify NCCI bundling scrubber alert
    await expect(page.getByText(/NCCI Bundling & Modifiers Scrubber/i)).toBeVisible();
    await expect(page.getByText(/Selective Catheter Placement Bundled/i).first()).toBeVisible();

    // Verify ANSI 837P preview
    await expect(page.getByText(/ANSI X12 837P Endovascular Lines/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:37231/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'pad_revascularization_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory: Expands to 47+ tools and search includes Retina and Vascular Scrubbers', async ({ page }) => {
    await page.goto('/tools/');

    // Verify Tools title
    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();

    // Verify tool cards are in directory
    await expect(page.getByText('Anti-VEGF Intravitreal Injection & Bilateral Scrubber').first()).toBeVisible();
    await expect(page.getByText('Endovascular & PAD Revascularization Scrubber').first()).toBeVisible();

    // Search filter test
    const searchInput = page.getByPlaceholder(/Search .* free tools/i);
    await searchInput.fill('Intravitreal');
    await expect(page.getByText('Anti-VEGF Intravitreal Injection & Bilateral Scrubber').first()).toBeVisible();

    await searchInput.fill('Endovascular');
    await expect(page.getByText('Endovascular & PAD Revascularization Scrubber').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 42+ specialties with Retina and Vascular Surgery links', async ({ page }) => {
    await page.goto('/specialties/');

    // Verify hero and chips
    await expect(page.getByRole('heading', { level: 1, name: /Specialty-Specific Billing & Coding Services|Billing built for your specialty/i })).toBeVisible();
    await expect(page.getByText(/\d+\+ specialties/).first()).toBeVisible();

    // Check directory links for both specialties
    const retinaLink = page.locator('a[href*="/medical-billing/retina-vitreous"]').first();
    await expect(retinaLink).toBeVisible();

    const vascularLink = page.locator('a[href*="/medical-billing/vascular-surgery"]').first();
    await expect(vascularLink).toBeVisible();
  });
});
