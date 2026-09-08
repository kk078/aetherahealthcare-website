import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

test.describe('Consent enforcement', () => {
  test.use({ consent: 'unknown' });
  test('optional scripts wait for acceptance and preferences can be withdrawn', async ({ page }) => {
    const trackers: string[] = [];
    page.on('request', request => { if (/googletagmanager|cloudfront|facebook|licdn|apollo|lfeeder|snitcher/.test(request.url())) trackers.push(request.url()); });
    await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType: 'application/javascript', body: 'window.testGoogleTagLoaded=true;' }));
    await page.goto('/contact/');
    await expect(page.getByRole('button', { name: 'Essential Only', exact: true })).toBeVisible();
    expect(trackers).toEqual([]);
    await page.getByRole('button', { name: 'Essential Only', exact: true }).click();
    await page.getByRole('button', { name: 'Cookie preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Accept Cookies', exact: true }).click();
    await expect.poll(() => trackers.some(url => url.includes('googletagmanager'))).toBe(true);
    await page.getByRole('button', { name: 'Cookie preferences', exact: true }).click();
    await page.getByRole('button', { name: 'Essential Only', exact: true }).click();
    await page.waitForLoadState('domcontentloaded');
    trackers.length = 0;
    await page.reload();
    await expect(page.getByLabel('Full Name')).toBeVisible();
    expect(trackers).toEqual([]);
  });
  test('removes the legacy personal-data vault', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('aethera_leads_vault', 'legacy data'));
    await page.goto('/');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('aethera_leads_vault'))).toBeNull();
  });
});

test('contact form announces errors and accepts a request without optional phone/specialty', async ({ page }) => {
  await page.goto('/contact/');
  const form = page.locator('#contact-panel-message');
  await form.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByLabel('Full Name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByRole('alert').filter({ hasText: 'Name is required' })).toBeVisible();
  await page.getByLabel('Full Name').fill('Test Provider');
  await page.getByLabel('Practice or Organization').fill('Test Practice');
  await page.getByLabel('Email Address', { exact: true }).fill('test@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Please discuss a practice review.');
  const issues = await new AxeBuilder({ page }).include('#contact-panel-message').analyze();
  expect(issues.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
  await form.getByRole('button', { name: 'Send Message', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Message Sent!' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('aethera_leads_vault'))).toBeNull();
});

test('failed lead acknowledgement does not claim success, and retry reuses its ID', async ({ page }) => {
  const ids: string[] = [];
  await page.route('**/api/leads', route => { ids.push(route.request().postDataJSON().submissionId); return route.fulfill({ status: 503, contentType: 'application/json', body: '{"accepted":false}' }); });
  await page.goto('/contact/');
  await page.getByLabel('Full Name').fill('Test Provider');
  await page.getByLabel('Practice or Organization').fill('Test Practice');
  await page.getByLabel('Email Address', { exact: true }).fill('test@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Please discuss a practice review.');
  const submit = page.locator('#contact-panel-message').getByRole('button', { name: 'Send Message', exact: true });
  await submit.click();
  await expect(page.getByRole('alert').filter({ hasText: /couldn’t confirm/ })).toBeVisible();
  await expect(page.getByText('Message Sent!', { exact: true })).toHaveCount(0);
  await submit.click();
  await expect.poll(() => ids.length).toBe(2);
  expect(ids[0]).toBe(ids[1]);
});

test('search opens on demand, traps focus, closes with Escape and restores its trigger', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('button', { name: /search/i }).filter({ visible: true }).first();
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: /Global Search/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('textbox')).toBeFocused();
  for (let i=0;i<6;i++) await page.keyboard.press('Shift+Tab');
  expect(await dialog.evaluate(el => el.contains(document.activeElement))).toBe(true);
  await dialog.getByRole('textbox').fill('anesthesia');
  await expect(dialog.getByText(/Anesthesia/).first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('one overlay at a time and the pilot form is keyboard accessible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Talk to an Expert', exact: true }).click();
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await page.evaluate(() => window.dispatchEvent(new Event('open-free-pilot-modal')));
  await expect(page.getByRole('dialog')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Claim Your Free 50-Claim Pilot' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('assessment rejects oversized files and parses a small CSV locally', async ({ page }) => {
  await page.goto('/free-assessment/');
  const file = page.locator('input[type=file]');
  await file.setInputFiles({ name: 'large.csv', mimeType: 'text/csv', buffer: Buffer.alloc(11*1024*1024) });
  await expect(page.getByText(/File limit: 10 MB/)).toBeVisible();
  await file.setInputFiles({ name: 'sample-aging.csv', mimeType: 'text/csv', buffer: Buffer.from('Payer,0-30,31-60,61-90,91-120,120+\nExample,100,200,300,400,500\n') });
  await expect(page.getByText('sample-aging.csv', { exact: true })).toBeVisible();
  await expect(page.getByText(/Reading report…/)).toHaveCount(0);
  await expect(page.getByText(/No aging columns|Unable to read|Parsing timed out/)).toHaveCount(0);
});

test('homepage content remains visible without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(process.env.BASE_URL || 'http://localhost:3100');
  await expect(page.locator('h1')).toBeVisible();
  const content = page.locator('h1');
  expect(await content.evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  await context.close();
});

test('mobile and desktop render without overflow or framework errors', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tools/');
  await expect(page).toHaveTitle(/Free Medical Billing/);
  await expect(page.locator('h1')).toBeVisible();
  await page.getByLabel('Search tools', { exact: true }).fill('anesthesia');
  await expect(page.getByRole('status')).toContainText('tools found');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  expect(errors).toEqual([]);
  await page.screenshot({ path: `/tmp/aethera-${info.project.name}-tools.png`, fullPage: false });
});
