import { test, expect } from '@playwright/test';

test.describe('Global Command Palette & Quick Search (Cmd+K)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('opens palette via desktop Navbar search button', async ({ page }) => {
    // Look for desktop or mobile search button
    const searchBtn = page.getByRole('button', { name: /search/i }).first();
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();

    // Dialog should be visible
    const dialog = page.getByRole('dialog', { name: /Global Search/i });
    await expect(dialog).toBeVisible();

    // Input should be focused
    const searchInput = page.getByPlaceholder(/Search 229\+ payers/i);
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeFocused();

    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('opens and closes via keyboard shortcut', async ({ page }) => {
    // Trigger palette via Control+KeyK
    await page.keyboard.press('Control+KeyK');
    const dialog = page.getByRole('dialog', { name: /Global Search/i });
    await expect(dialog).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('searches payers and displays timely filing rules', async ({ page }) => {
    await page.keyboard.press('Control+KeyK');
    const input = page.getByPlaceholder(/Search 229\+ payers/i);
    await input.fill('Aetna');

    // Aetna result item should be present
    const aetnaResult = page.getByText('Aetna', { exact: true }).first();
    await expect(aetnaResult).toBeVisible();

    // Should display Commercial Plan or timely filing info
    await expect(page.getByText(/Payer ID/i).first()).toBeVisible();
  });

  test('searches denial codes and inspects root-cause playbook', async ({ page }) => {
    await page.keyboard.press('Control+KeyK');
    const input = page.getByPlaceholder(/Search 229\+ payers/i);
    await input.fill('16');

    // Should show CARC 16
    const carc16 = page.getByText(/CARC 16/i).first();
    await expect(carc16).toBeVisible();

    // Click Playbook button to open side inspector
    const playbookBtn = page.getByRole('button', { name: 'Playbook' }).first();
    await playbookBtn.click();

    // Inspector should show Root Cause and How AR Rep Resolves It
    await expect(page.getByText(/Root Cause/i)).toBeVisible();
    await expect(page.getByText(/How AR Rep Resolves It/i)).toBeVisible();

    // Click "Open in Denial Code Tool"
    const openInToolBtn = page.getByRole('button', { name: /Open in Denial Code Tool/i });
    await openInToolBtn.click();

    // URL should change to denial code lookup with code param
    await expect(page).toHaveURL(/denial-code-lookup/);
  });

  test('switches category filters and renders tools', async ({ page }) => {
    await page.keyboard.press('Control+KeyK');

    // Click "Free Tools (8)" tab
    const toolsTab = page.getByRole('button', { name: /Free Tools/i });
    await toolsTab.click();

    // Should display tool results like RVU Calculator or Clean Claim Scorecard
    await expect(page.getByText(/Calculator/i).first()).toBeVisible();
  });
});
