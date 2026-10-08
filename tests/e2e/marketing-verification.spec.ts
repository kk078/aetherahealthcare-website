import { test, expect } from './fixtures';
import { CONTACT_EMAIL } from '../../src/lib/business';
import AxeBuilder from '@axe-core/playwright';

test('offer errors remain retryable and the accepted retry clears the delivery warning', async ({ page }) => {
  const payloads: Array<{ submissionId: string; data: Record<string, unknown>; formType: string }> = [];
  await page.route('**/api/leads', route => {
    const payload = route.request().postDataJSON(); payloads.push(payload);
    return route.fulfill({ status: payloads.length === 1 ? 503 : 202, contentType: 'application/json', body: JSON.stringify({ accepted: payloads.length > 1, submissionId: payload.submissionId }) });
  });
  await page.goto('/lp/denial-recovery-sprint/');
  const form = page.locator('#sprint-request');
  await form.getByLabel('Your name *', { exact: true }).fill('Kiran Kumar Pedapudi');
  await form.getByLabel('Practice / organization *', { exact: true }).fill('Aethera Healthcare Solutions');
  await form.getByLabel('Work email *', { exact: true }).fill(CONTACT_EMAIL);
  const a11y = await new AxeBuilder({ page }).include('#sprint-request').analyze();
  expect(a11y.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
  const submit = form.getByRole('button', { name: 'Request Free Denial Recovery Sprint' });
  await submit.click();
  await expect(form.getByRole('alert')).toContainText('could not be saved');
  await expect(form.getByText('Your request has been received')).toHaveCount(0);
  await submit.click();
  await expect(form.getByRole('status')).toContainText('Your request has been received');
  await expect(page.getByText(/couldn’t confirm that your request/)).toHaveCount(0);
  expect(payloads[0].submissionId).toBe(payloads[1].submissionId);
  expect(payloads[1].formType).toBe('denial_recovery_sprint');
  expect(payloads[1].data.ehrSystem).toBe(''); expect(payloads[1].data.specialty).toBe('');
  expect(payloads[1].data.sourcePath).toBe('/lp/denial-recovery-sprint/');
});

test('ROI scenario uses visitor inputs, counts fees and does not claim delivery on failure', async ({ page }) => {
  await page.route('**/api/leads', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.goto('/');
  const scenario = page.locator('div').filter({ has: page.getByRole('heading', { name: 'Your scenario', exact: true }) }).filter({ has: page.getByLabel('Work email', { exact: true }) }).last();
  await expect(page.getByLabel('Monthly net collections', { exact: true })).toHaveValue('');
  await page.getByLabel('Monthly net collections', { exact: true }).fill('100');
  await page.getByLabel('Potential improvement assumption', { exact: true }).fill('0');
  await expect(scenario.getByText('-$60', { exact: true })).toBeVisible();
  await scenario.getByLabel('Work email', { exact: true }).fill(CONTACT_EMAIL);
  await scenario.getByRole('button', { name: 'Request a review of my scenario' }).click();
  await expect(scenario.getByRole('alert')).toContainText('could not be saved');
  await expect(scenario.getByText(/review request was received/)).toHaveCount(0);
  await page.getByLabel('Potential improvement assumption', { exact: true }).fill('101');
  await expect(scenario.getByRole('button')).toBeDisabled();
});

test('denial checklist is available without email, with an honest optional review request', async ({ page }) => {
  await page.goto('/state-of-denials/');
  await page.getByLabel('Your specialty').selectOption('cardiology');
  await expect(page.getByRole('heading', { name: 'Cardiology: denial review checklist' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Print / save this guide as PDF' })).toBeVisible();
  await page.getByLabel('Work email', { exact: true }).fill(CONTACT_EMAIL);
  await page.getByRole('button', { name: 'Request denial review' }).click();
  await expect(page.getByRole('status')).toContainText('review request was received');
});

test('newsletter awaits acknowledgement and records opt-in, rather than showing a false subscription', async ({ page }) => {
  let calls = 0; let consent: unknown;
  await page.route('**/api/leads', route => {
    const payload = route.request().postDataJSON(); consent = payload.data.marketingConsent; calls++;
    return route.fulfill({ status: calls === 1 ? 503 : 202, contentType: 'application/json', body: JSON.stringify({ accepted: calls > 1, submissionId: payload.submissionId }) });
  });
  await page.goto('/blog/');
  await page.getByRole('textbox', { name: 'Email address', exact: true }).fill(CONTACT_EMAIL);
  const submit = page.getByRole('button', { name: 'Request subscription' });
  await submit.click();
  await expect(page.getByText('Your newsletter request was received.')).toHaveCount(0);
  await expect(page.getByRole('alert').filter({ hasText: /could not/ })).toBeVisible();
  await submit.click();
  await expect(page.getByRole('heading', { name: 'Your newsletter request was received.' })).toBeVisible();
  expect(consent).toBe(true);
});

for (const slug of ['asc-surgical-billing', 'behavioral-health-billing', 'enterprise-rcm', 'fqhc-rhc-billing', 'home-health-hospice-billing', 'medicare-advantage-rcm', 'solo-practice-rcm', 'switch-medical-billing', 'denial-recovery-pilot']) {
  test(`/${slug} has clear scope, three required inputs and mobile-safe layout`, async ({ page }) => {
    await page.goto(`/lp/${slug}/`);
    await expect(page.getByRole('heading', { name: 'Request a scoped review' })).toBeVisible();
    expect(await page.locator('input[required]').count()).toBe(3);
    await expect(page.getByText(/Ongoing billing pricing: 3.5–5% of net collections/)).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });
}

test('specialty links lead to their own correct pages and tools expose primary references', async ({ page }) => {
  await page.goto('/specialties/');
  await expect(page.locator('a[href="/medical-billing/endocrinology/"]')).toBeVisible();
  await expect(page.locator('a[href="/medical-billing/general-surgery/"]')).toBeVisible();
  await page.goto('/tools/');
  await expect(page.getByRole('heading', { name: 'Start with a common billing task' })).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search tools' }).fill('denial');
  await expect(page.getByRole('heading', { name: 'Denial Code Lookup' })).toBeVisible();
  await page.goto('/tools/denial-code-lookup/');
  await expect(page.getByRole('complementary', { name: 'Tool methodology and review status' })).toContainText('review required');
  expect(await page.getByRole('complementary', { name: 'Tool methodology and review status' }).getByRole('link').count()).toBeGreaterThan(0);
});

test.describe('Marketing analytics consent', () => {
  test.use({ consent: 'unknown' });
  test('captures campaign source after consent and counts route changes without query data', async ({ page }) => {
    let attribution: Record<string, unknown> | null = null;
    await page.route('**/api/leads', route => { const body = route.request().postDataJSON(); attribution = body.attribution; return route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ accepted: true, submissionId: body.submissionId }) }); });
    await page.route('https://www.googletagmanager.com/**', route => route.fulfill({ contentType: 'application/javascript', body: '' }));
    await page.goto('/pricing/?utm_source=linkedin&utm_campaign=denial-sprint');
    expect(await page.evaluate(() => sessionStorage.getItem('aethera_session_attribution'))).toBeNull();
    await page.getByRole('button', { name: 'Accept Cookies', exact: true }).click();
    await expect.poll(() => page.evaluate(() => {
      const layer = (window as unknown as { dataLayer?: Array<ArrayLike<unknown>> }).dataLayer || [];
      return layer.map(item => Array.from(item)).filter(item => item[0] === 'event' && item[1] === 'page_view').length;
    })).toBeGreaterThan(0);
    await page.locator('a[href="/"]').first().click();
    await expect.poll(() => page.evaluate(() => {
      const layer = (window as unknown as { dataLayer?: Array<ArrayLike<unknown>> }).dataLayer || [];
      return layer.map(item => Array.from(item)).filter(item => item[0] === 'event' && item[1] === 'page_view').length;
    })).toBeGreaterThan(1);
    await page.evaluate(() => window.dispatchEvent(new Event('open-free-pilot-modal')));
    const modal = page.getByRole('dialog');
    await modal.getByLabel('Your name *', { exact: true }).fill('Kiran Kumar Pedapudi');
    await modal.getByLabel('Practice / organization *', { exact: true }).fill('Aethera Healthcare Solutions');
    await modal.getByLabel('Work email *', { exact: true }).fill(CONTACT_EMAIL);
    await modal.getByRole('button', { name: 'Request Free 50-Claim Pilot' }).click();
    await expect(modal.getByRole('status')).toBeVisible();
    expect(attribution).toMatchObject({ utmSource: 'linkedin', utmCampaign: 'denial-sprint', landingPage: '/pricing/' });
    const locations = await page.evaluate(() => ((window as unknown as { dataLayer?: Array<ArrayLike<unknown>> }).dataLayer || []).map(item => Array.from(item)).filter(item => item[1] === 'page_view').map(item => (item[2] as { page_location: string }).page_location));
    expect(locations.every(value => !value.includes('?'))).toBe(true);
  });
});
