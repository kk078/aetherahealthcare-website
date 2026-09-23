import { test, expect } from './fixtures';
import AxeBuilder from '@axe-core/playwright';

// Keep software-rendered WebGL contexts sequential even when the rest of the suite runs in parallel.
test.describe.configure({ mode: 'default' });

test('atlas renders real 3D geometry and responds to structure, camera and lesson controls', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/anatomy-atlas/');
  await expect(page).toHaveTitle(/3D Anatomy Atlas/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('The 3D anatomy atlas.');
  await expect(page.getByText(/anatomical structures loaded/)).toBeVisible({ timeout: 60000 });
  await expect(page.locator('[data-testid="anatomy-canvas"] canvas')).toBeVisible();
  await page.getByRole('button', { name: 'Pause rotation', exact: true }).click();
  await page.getByLabel('Body region', { exact: true }).selectOption('thorax');
  await page.getByRole('button', { name: 'heart', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selected: heart' })).toBeVisible();
  await page.getByRole('button', { name: 'Back view', exact: true }).click();
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await page.getByRole('button', { name: 'Front / reset', exact: true }).click();
  await page.getByRole('button', { name: 'Show region again' }).click();
  await page.getByLabel('Visible layer', { exact: true }).selectOption('organs');
  await page.getByLabel('Find a structure', { exact: true }).fill('not-an-organ');
  await expect(page.getByText('No matching structures. Try another region, layer or search.')).toBeVisible();
  await page.getByLabel('Specialty learning path', { exact: true }).selectOption('Obstetrics & gynecology');
  await expect(page.getByRole('heading', { name: '58571', exact: true })).toBeVisible();
  await expect(page.getByText(/Female anatomy is not shown in this model/)).toBeVisible();
  await page.getByLabel('Search these coding examples').fill('nothing');
  await expect(page.getByText('No selected coding examples match this view.', { exact: false })).toBeVisible();
  await page.getByRole('radio', { name: 'The patient’s', exact: true }).check();
  await expect(page.getByText('Correct.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset knowledge check' }).click();
  await expect(page.getByRole('radio', { name: 'The patient’s', exact: true })).not.toBeChecked();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
  const audit = await new AxeBuilder({ page }).include('main').analyze();
  expect(audit.violations).toEqual([]);
});

test('reduced-motion preference keeps the loaded model still until the learner starts it', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/anatomy-atlas/');
  await expect(page.getByText(/anatomical structures loaded/)).toBeVisible({ timeout: 60000 });
  await expect(page.getByRole('button', { name: 'Start rotation', exact: true })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Start rotation', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Pause rotation', exact: true })).toHaveAttribute('aria-pressed', 'true');
});

test('model download failure leaves the educational page usable and offers recovery', async ({ page }) => {
  test.setTimeout(90000);
  await page.route('**/models/anatomy/*.glb', route => route.abort());
  await page.goto('/anatomy-atlas/');
  await expect(page.getByText(/3D view unavailable/)).toBeVisible({ timeout: 30000 });
  await expect(page.getByRole('button', { name: 'Retry 3D view' })).toBeVisible();
  await page.getByLabel('Specialty learning path', { exact: true }).selectOption('Wound care');
  await expect(page.getByRole('heading', { name: '11042', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Sources, model scope & reuse', exact: true })).toBeVisible();
  await page.unroute('**/models/anatomy/*.glb');
  await page.getByRole('button', { name: 'Retry 3D view' }).click();
  await expect(page.getByText(/anatomical structures loaded/)).toBeVisible({ timeout: 60000 });
});


test('devices without WebGL retain the named anatomy and lessons', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof original>) {
      if (String(args[0]).includes('webgl')) return null;
      return original.apply(this, args);
    } as typeof original;
  });
  await page.goto('/anatomy-atlas/');
  await expect(page.getByText(/3D view unavailable/)).toBeVisible();
  await page.getByRole('button', { name: 'heart', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selected: heart' })).toBeVisible();
  await expect(page.getByRole('heading', { name: '93000–93010', exact: true })).toBeVisible();
});

test('guided study and cutaway controls preserve truthful scope and keyboard access', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/anatomy-atlas/');
  await expect(page.getByText(/anatomical structures loaded/)).toBeVisible({ timeout: 60000 });
  await page.getByLabel('Guided regional study', { exact: true }).selectOption('thorax');
  await expect(page.getByText('Step 1 of 4', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Next structure', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Selected: heart', exact: true })).toBeVisible();
  await page.getByText('Layers, transparency & cutaway', { exact: true }).click();
  await page.getByLabel('Show surrounding anatomy', { exact: true }).check();
  await expect(page.getByTestId('atlas-selection-label')).toContainText('in context');
  await page.getByLabel('Bones and discs opacity', { exact: true }).fill('40');
  await page.getByLabel('Surface cutaway', { exact: true }).selectOption('transverse');
  await page.getByLabel('Cutaway position', { exact: true }).fill('35');
  await expect(page.getByRole('note')).toContainText('transverse surface cutaway · 35%');
  await expect(page.getByRole('note')).toContainText('not CT/MRI');
  await page.getByLabel('Show organs', { exact: true }).uncheck();
  await expect(page.getByRole('heading', { name: 'Selected: heart', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'heart', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Reset study view', exact: true }).click();
  await expect(page.getByLabel('Surface cutaway', { exact: true })).toHaveValue('off');
  await expect(page.getByRole('button', { name: 'heart', exact: true })).toBeVisible();
  await page.getByLabel('Guided regional study', { exact: true }).selectOption('pelvis');
  await expect(page.getByText(/The book includes female pelvic anatomy, but the current model does not/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Coding library coverage', exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const audit = await new AxeBuilder({ page }).include('main').analyze();
  expect(audit.violations).toEqual([]);
  expect(errors).toEqual([]);
});
