import { test, expect } from '@playwright/test';

/**
 * Smoke tests — verify critical pages load and return 200
 */

const criticalPages = [
  { path: '/',                      title: /Aethera/i },
  { path: '/about',                 title: /About/i },
  { path: '/services',              title: /Services/i },
  { path: '/pricing',               title: /Pricing/i },
  { path: '/contact',               title: /Contact/i },
  { path: '/free-assessment',       title: /Assessment/i },
  { path: '/gap-analysis',          title: /Portal|Analysis/i },
  { path: '/integrations',          title: /Integration/i },
  { path: '/payers',                title: /Payer/i },
  { path: '/case-studies',          title: /Case/i },
  { path: '/blog',                  title: /Blog/i },
  { path: '/specialties/cardiology',title: /Cardiology/i },
];

for (const page of criticalPages) {
  test(`${page.path} loads successfully`, async ({ page: pw }) => {
    const response = await pw.goto(page.path);
    expect(response?.status()).toBeLessThan(400);
    await expect(pw).toHaveTitle(page.title);
  });
}
