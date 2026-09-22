import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

test.beforeEach(async ({ page }) => { await page.goto('/human-autonomy/'); });

test('sourced page has a unique outline, usable references and accessible desktop/mobile layout', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await expect(page).toHaveTitle(/Human Autonomy.*Evidence/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Better billing decisions/);
  await expect(page.getByRole('heading', { name: 'Drug billing-unit reconciliation' })).toBeVisible();
  const ids = await page.locator('[id]').evaluateAll(elements => elements.map(el => el.id));
  expect(ids.filter((id, index) => ids.indexOf(id) !== index)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.locator('#drug-340b-auditor summary').click();
  await expect(page.locator('#drug-340b-auditor')).toContainText('fee-for-service, not Medicaid managed-care');
  await expect(page.locator('#drug-340b-auditor a')).toHaveAttribute('href', /hrsa.gov/);
  const issues = await new AxeBuilder({ page }).include('main').analyze();
  expect(issues.violations).toEqual([]);
  expect(errors).toEqual([]);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: `/tmp/aethera-autonomy-${info.project.name}.png`, fullPage: true });
});

test('drug units reconcile and invalid or blank inputs never retain a successful answer', async ({ page }) => {
  const tool = page.locator('#drug-waste-engine');
  await expect(tool).toContainText('Administered: 33 units · Discarded: 7 units · Total: 40 units');
  await page.getByLabel('Administered (mg)', { exact: true }).fill('401');
  await expect(tool).toContainText('cannot exceed');
  await expect(tool).not.toContainText('Total: 40');
  await page.getByLabel('Administered (mg)', { exact: true }).fill('');
  await expect(tool).toContainText('must be between');
  await page.getByLabel('Opened supply (mg)', { exact: true }).fill('10');
  await page.getByLabel('Administered (mg)', { exact: true }).fill('7');
  await expect(tool).toContainText('Administered: 1 units · Discarded: 0 units · Total: 1 units');
  await expect(tool).toContainText('Modifier example: JZ');
});

test('NDC conversion and selected examples preserve correct package strengths', async ({ page }) => {
  await page.getByLabel('Original hyphenated NDC').fill('50242-060-01');
  await expect(page.locator('#code-anatomy')).toContainText('50242-0060-01');
  await page.getByLabel('Original hyphenated NDC').fill('5024206001');
  await expect(page.locator('#code-anatomy')).toContainText('original package segments');
  await page.getByLabel('Search selected examples').fill('50242-0060');
  await expect(page.locator('#code-explorer')).toContainText('1 of 7 examples');
  await expect(page.locator('#code-explorer li')).toContainText('100 mg / 4 mL');
  await page.getByLabel('Search selected examples').fill('no-such-code');
  await expect(page.locator('#code-explorer')).toContainText('No example matches');
});

test('admission checks respond to the current order, rationale and midpoint inputs', async ({ page }) => {
  const tool = page.locator('#two-midnight-arbiter');
  await expect(tool).toContainText('Missing admission order');
  await page.getByLabel('Valid practitioner admission order is present').check();
  await expect(tool).toContainText('Clinical documentation needed');
  await page.getByLabel('Clinical rationale is documented').check();
  await expect(tool).toContainText('Short-stay review needed');
  await page.getByLabel('Expected hospital midnights').fill('2');
  await expect(tool).toContainText('Benchmark inputs present — review required');
  await page.getByLabel('Valid practitioner admission order is present').uncheck();
  await expect(tool).toContainText('Missing admission order');
});

test('CLFS floor and cost scenario use only the selected values', async ({ page }) => {
  await expect(page.locator('#clfs-pama-arbiter')).toContainText('Illustrative floor: $100.0000');
  await page.getByLabel('Payment year', { exact: true }).selectOption('2027');
  await expect(page.locator('#clfs-pama-arbiter')).toContainText('Illustrative floor: $85.0000');
  await page.getByLabel('Prior-year payment rate ($)').fill('85');
  await page.getByLabel('Payment year', { exact: true }).selectOption('2028');
  await expect(page.locator('#clfs-pama-arbiter')).toContainText('Illustrative floor: $72.2500');
  await expect(page.locator('#specialty-clawback-calculator')).toContainText('Illustrative annual cost: $6,000.00');
  await page.getByLabel('Recovery of denied dollars (%)').fill('100');
  await expect(page.locator('#specialty-clawback-calculator')).toContainText('Illustrative annual cost: $1,000.00');
  await page.getByLabel('Initial denials (%)').fill('101');
  await expect(page.locator('#specialty-clawback-calculator')).toContainText('must be between 0 and 100');
});

test('real hash detects changed data and the download preserves the failed verification', async ({ page }) => {
  const tool = page.locator('#cryptographic-audit-ledger');
  const original = 'DEMO | units: 40';
  await page.getByLabel('Demonstration text').fill(original);
  await tool.getByRole('button', { name: 'Create digest', exact: true }).click();
  await expect(tool.getByLabel('Saved SHA-256 digest')).toHaveText(createHash('sha256').update(original).digest('hex'));
  await tool.getByRole('button', { name: 'Verify text', exact: true }).click();
  await expect(tool).toContainText('Match: the example matches');
  await page.getByLabel('Demonstration text').fill('DEMO | units: 41');
  await expect(tool).not.toContainText('Match: the example matches');
  await tool.getByRole('button', { name: 'Verify text', exact: true }).click();
  await expect(tool).toContainText('Mismatch: the example changed');
  const downloaded = page.waitForEvent('download');
  await tool.getByRole('button', { name: 'Download JSON example' }).click();
  const download = await downloaded;
  const json = JSON.parse(await readFile((await download.path())!, 'utf8'));
  expect(json.matches).toBe(false);
  expect(json.payload).toBe('DEMO | units: 41');
  expect(json.savedDigest).toBe(createHash('sha256').update(original).digest('hex'));
  expect(json.purpose).toContain('not a legal attestation');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});


test('payment reference labels stay inside their scroll region on narrow screens', async ({ page }) => {
  for (const width of [320, 390, 393]) {
    await page.setViewportSize({ width, height: 844 });
    await page.evaluate(() => document.fonts.ready);
    const table = page.getByRole('region', { name: 'Payment references table' });
    await table.scrollIntoViewIfNeeded();
    await table.evaluate(el => { el.scrollLeft = el.scrollWidth; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await table.evaluate(el => { el.scrollLeft = 0; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});
