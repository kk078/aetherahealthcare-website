import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACT_DIR = path.resolve(
  process.env.ARTIFACT_DIR ||
  '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c'
);

test.describe('Specialties 43-44 and Tools 48-49: Spine Arthrodesis & Urogynecology Suites', () => {
  test('Specialty 43: Orthopedic Spine Surgery page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/spine-surgery/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Orthopedic Spine Surgery & Complex Arthrodesis/i })
    ).toBeVisible();
    await expect(page.getByText(/Anterior cervical discectomy & fusion/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('22551').first()).toBeVisible();
    await expect(page.getByText('22633').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Specialty 44: Gynecologic Minimally Invasive Surgery & Urogynecology page renders correctly', async ({ page }) => {
    await page.goto('/medical-billing/urogynecology/');

    // Heading verification
    await expect(
      page.getByRole('heading', { level: 1, name: /Gynecologic Minimally Invasive Surgery & Urogynecology/i })
    ).toBeVisible();
    await expect(page.getByText(/Laparoscopic sacrocolpopexy/i).first()).toBeVisible();

    // Verify key CPT codes
    await expect(page.getByText('57425').first()).toBeVisible();
    await expect(page.getByText('57288').first()).toBeVisible();

    // Verify CTA link
    await expect(page.getByRole('link', { name: /Get a Free Assessment/i }).first()).toBeVisible();
  });

  test('Tool #48: Spine Arthrodesis Scrubber audits NCCI bundling and co-surgery', async ({ page }) => {
    await page.goto('/tools/spine-arthrodesis-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Spine Arthrodesis & Instrumentation Scrubber/i })
    ).toBeVisible();

    // Verify default TLIF selection
    await expect(page.getByText('TLIF / PLIF').first()).toBeVisible();
    await expect(page.getByText('22633').first()).toBeVisible();

    // Default decompression at same level triggers fatal bundling alert
    await expect(page.getByText(/Fatal NCCI Bundling Edit/i).first()).toBeVisible();
    await expect(page.getByText(/Statutorily BUNDLED/i).first()).toBeVisible();

    // Switch decompression to distinct non-fusion level
    const separateLevelRadio = page.getByRole('radio', { name: /Billed at distinct non-fusion level/i });
    await separateLevelRadio.click();
    await expect(page.getByText(/100% NCCI & Modifier -62 Compliant Episode/i)).toBeVisible();

    // Switch approach to ACDF
    const acdfBtn = page.getByRole('button', { name: /ACDF/i });
    await acdfBtn.click();
    await expect(page.getByText('22551').first()).toBeVisible();

    // Switch approach to ALIF and enable co-surgeon
    const alifBtn = page.getByRole('button', { name: /ALIF/i });
    await alifBtn.click();
    await expect(page.getByText('22558').first()).toBeVisible();

    const coSurgeonCheckbox = page.getByLabel(/Two Surgeons \/ Co-Surgeon Case/i);
    await coSurgeonCheckbox.check();
    await expect(page.getByText(/Co-surgeon split \(62.5% Medicare allowable\)/i).first()).toBeVisible();

    // Verify ANSI 837P preview
    await expect(page.getByText(/ANSI X12 837P Electronic Claim Output/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:22558/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'spine_arthrodesis_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tool #49: Urogynecology Scrubber models sacrocolpopexy, sling, and cystoscopy bundling', async ({ page }) => {
    await page.goto('/tools/urogynecology-scrubber/');

    // Verify H1
    await expect(
      page.getByRole('heading', { level: 1, name: /Urogynecology & Pelvic Floor Bundling Scrubber/i })
    ).toBeVisible();

    // Default procedure: Sacrocolpopexy (57425) with concurrent sling (57288)
    await expect(page.getByText('CPT 57425').first()).toBeVisible();
    await expect(page.getByText('57288').first()).toBeVisible();

    // Default routine cystoscopy check triggers fatal bundling alert
    await expect(page.getByText(/Fatal NCCI Bundling Edit: 52000 Bundled/i).first()).toBeVisible();

    // Switch cystoscopy to distinct diagnostic indication
    const diagCytoRadio = page.getByRole('radio', { name: /Distinct diagnostic indication/i });
    await diagCytoRadio.click();
    await expect(page.getByText(/Clean FPMRS Surgical & Diagnostic Episode/i)).toBeVisible();

    // Enable multi-channel urodynamics
    const udsCheckbox = page.getByLabel(/5. In-Office Complex Urodynamics/i);
    await udsCheckbox.check();
    await expect(page.getByText('51729').first()).toBeVisible();
    await expect(page.getByText('+51784').first()).toBeVisible();

    // Verify ANSI 837P preview
    await expect(page.getByText(/ANSI X12 837P Electronic Claim Output/i)).toBeVisible();
    await expect(page.getByText(/SV1\*HC:57425/i).first()).toBeVisible();

    // Capture screenshot artifact
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'urogynecology_scrubber_tool.png'),
      fullPage: false,
    });
  });

  test('Tools Directory: Expands to 49+ tools and search includes Spine and Urogynecology Scrubbers', async ({ page }) => {
    await page.goto('/tools/');

    // Verify tools title
    await expect(page.getByRole('heading', { level: 1, name: /\d+ Free Medical Billing & RCM Tools/i })).toBeVisible();

    // Verify tool cards are in directory
    await expect(page.getByText('Spine Arthrodesis & Multi-Level Instrumentation Scrubber').first()).toBeVisible();
    await expect(page.getByText('Urogynecology & Pelvic Floor Reconstruction Scrubber').first()).toBeVisible();

    // Test search filter for spine
    const searchInput = page.getByPlaceholder(/Search .* free tools/i);
    await searchInput.fill('spine');
    await expect(page.getByText('Spine Arthrodesis & Multi-Level Instrumentation Scrubber').first()).toBeVisible();

    // Test search filter for urogynecology
    await searchInput.fill('urogynecology');
    await expect(page.getByText('Urogynecology & Pelvic Floor Reconstruction Scrubber').first()).toBeVisible();
  });

  test('Specialties Hub: Expands to 44+ specialties with Spine and Urogynecology links', async ({ page }) => {
    await page.goto('/specialties/');

    // Verify hero and chips
    await expect(page.getByRole('heading', { level: 1, name: /Specialty-Specific Billing & Coding Services|Billing built for your specialty/i })).toBeVisible();
    await expect(page.getByText(/\d+\+ specialties/).first()).toBeVisible();

    // Verify both new specialties are present and linked
    await expect(page.getByText('Orthopedic Spine Surgery & Complex Arthrodesis').first()).toBeVisible();
    await expect(page.getByText('Gynecologic Minimally Invasive Surgery & Urogynecology').first()).toBeVisible();

    const spineLink = page.locator('a[href*="/medical-billing/spine-surgery"]').first();
    await expect(spineLink).toBeVisible();

    const uroLink = page.locator('a[href*="/medical-billing/urogynecology"]').first();
    await expect(uroLink).toBeVisible();
  });
});
