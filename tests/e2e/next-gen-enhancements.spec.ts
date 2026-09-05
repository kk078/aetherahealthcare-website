import { test, expect } from '@playwright/test';

test.describe('Next-Gen Healthcare RCM Suite — Extended Enhancements', () => {

  test('New Programmatic Specialty Pages render with deep clinical CPT data and JSON-LD schema', async ({ page }) => {
    const specialties = [
      { slug: 'neurology', title: 'Neurology' },
      { slug: 'pain-management', title: 'Pain Management & Spine' },
      { slug: 'obgyn', title: 'Obstetrics & Gynecology (OB/GYN)' },
      { slug: 'ophthalmology', title: 'Ophthalmology & Optometry' },
      { slug: 'urology', title: 'Urology' },
      { slug: 'radiology', title: 'Radiology & Diagnostic Imaging' },
      { slug: 'physical-therapy', title: 'Physical Therapy & Rehabilitation' },
      { slug: 'oncology', title: 'Medical Oncology & Hematology' },
    ];

    for (const spec of specialties) {
      await page.goto(`/medical-billing/${spec.slug}/`, { waitUntil: 'networkidle' });
      await expect(page.getByRole('heading', { level: 1 })).toContainText(spec.title);
      await expect(page.locator('text=Get a Free Assessment').first()).toBeVisible();
      // Check that breadcrumbs and schema are in the document
      const scriptLd = page.locator('script[type="application/ld+json"]');
      await expect(scriptLd.first()).toBeAttached();
    }
  });

  test('Healthcare RCM Glossary renders 30+ terms, searches, and filters by category', async ({ page }) => {
    await page.goto('/glossary/', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Healthcare RCM & Medical Billing Glossary');

    // Verify initial term cards
    await expect(page.locator('text=837P (EDI 837 Professional)').first()).toBeVisible();
    await expect(page.locator('text=835 ERA (Electronic Remittance Advice)').first()).toBeVisible();

    // Test live search input
    const searchInput = page.getByPlaceholder(/Search RCM acronyms/i);
    await searchInput.fill('NCCI');
    await expect(page.locator('text=NCCI (National Correct Coding Initiative)').first()).toBeVisible();

    // Test category filter pill
    await searchInput.fill('');
    const techBtn = page.getByRole('button', { name: 'Technology & EDI' });
    await techBtn.click();
    await expect(page.locator('text=835 ERA (Electronic Remittance Advice)').first()).toBeVisible();
  });

  test('Supercharged RVU Calculator calculates payments with 1-click CPT and GPCI presets', async ({ page }) => {
    await page.goto('/tools/rvu-calculator/', { waitUntil: 'networkidle' });

    // Check quick presets toolbar
    await expect(page.locator('text=Quick CPT Presets').first()).toBeVisible();

    // Click 99215 preset
    const preset99215 = page.getByRole('button', { name: /99215/i });
    await preset99215.click();

    // Click Manhattan, NY locality preset
    const manhattanBtn = page.getByRole('button', { name: /Manhattan, NY/i });
    await manhattanBtn.click();

    // Check that Commercial Payer Benchmarks section renders calculated rates
    await expect(page.locator('text=Commercial Payer Benchmarks')).toBeVisible();
    await expect(page.locator('text=Standard In-Network (140%):')).toBeVisible();
  });

  test('Clean Claim Scorecard supports Check All, Reset, and deep-tool gap resolution links', async ({ page }) => {
    await page.goto('/tools/clean-claim-scorecard/', { waitUntil: 'networkidle' });

    // Click Check All
    const checkAllBtn = page.getByRole('button', { name: /Check All 14 Controls/i });
    await checkAllBtn.click();

    // Score should reach 100/100 and band label Strong
    await expect(page.locator('text=Strong').first()).toBeVisible();

    // Reset controls
    const resetBtn = page.getByRole('button', { name: /Reset/i });
    await resetBtn.click();
    await expect(page.locator('text=High denial risk').first()).toBeVisible();
  });

  test('AR Days Cost Calculator renders performance benchmark badges and proposal trigger', async ({ page }) => {
    await page.goto('/tools/ar-cost-calculator/', { waitUntil: 'networkidle' });

    // Check benchmark badge
    await expect(page.locator('text=Days in A/R Capital Efficiency Model')).toBeVisible();
    await expect(page.locator('text=Custom Practice Proposal & SLA').first()).toBeVisible();
  });

  test('Denial Code Lookup renders action buttons for appeal generation and claim scrubbing', async ({ page }) => {
    await page.goto('/tools/denial-code-lookup/?code=97', { waitUntil: 'networkidle' });

    // Open card if not already expanded
    const appealBtn = page.locator('a[href*="/tools/appeal-letter-generator"]').first();
    if (!await appealBtn.isVisible()) {
      await page.getByRole('button', { name: /^97 Benefit is included/i }).click();
    }
    await expect(appealBtn).toBeVisible();
  });

});
