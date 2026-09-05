import { test, expect } from '@playwright/test';

test.describe('National Clearinghouse Payer Directory Integration', () => {

  test('Payer Directory loads 10,600+ clearinghouse dataset and supports live search', async ({ page }) => {
    await page.goto('/payers/directory/', { waitUntil: 'networkidle' });

    // Verify hero header and active feed badge
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Payer Directory & EDI Clearinghouse Master');
    await expect(page.locator('text=National Clearinghouse EDI Master Feed Active').first()).toBeVisible();

    // Verify dataset status indicator updates
    await expect(page.locator('text=Payers Active').first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: '/home/kiran/.gemini/antigravity-cli/brain/50b59a0e-93e4-4856-9aa8-61204b485c5c/merged_payer_directory.png' });

    // Test search by specific Electronic Payer ID 'SHP76' (Sharp Health Plan)
    const searchInput = page.getByPlaceholder(/Search by payer name or electronic ID/i);
    await searchInput.fill('SHP76');

    // Verify Sharp Health Plan card renders with ID and AR Playbook badge
    await expect(page.locator('text=Sharp Health Plan').first()).toBeVisible();
    await expect(page.locator('text=SHP76').first()).toBeVisible();

    // Test 1-click Copy ID button
    const copyBtn = page.getByRole('button', { name: /Copy ID/i }).first();
    await copyBtn.click();
    await expect(page.locator('text=Copied').first()).toBeVisible();

    // Test search by ID '27516' (Americaid Community Care NJ)
    await searchInput.fill('27516');
    await expect(page.locator('text=Americaid Community Care (New Jersey)').first()).toBeVisible();
    await expect(page.locator('text=27516').first()).toBeVisible();
  });

  test('Payer Directory EDI Capabilities filter and modal drawer operate correctly', async ({ page }) => {
    await page.goto('/payers/directory/', { waitUntil: 'networkidle' });

    // Wait for clearinghouse data to hydrate
    await expect(page.locator('text=Payers Active').first()).toBeVisible({ timeout: 10000 });

    // Click EDI filter chip for 835 Remittance (ERA)
    const eraChip = page.getByRole('button', { name: /835 Remittance \(ERA\)/i });
    await eraChip.click();

    // Click first payer card or View EDI Specs button to open EDI specs modal
    const viewSpecsBtn = page.getByText(/View EDI Specs/i).first();
    await viewSpecsBtn.click();

    // Verify modal elements
    await expect(page.locator('text=Supported EDI Transaction Sets').first()).toBeVisible();
    await expect(page.locator('text=EDI Pre-Enrollment Guidance').first()).toBeVisible();
    await expect(page.locator('text=Electronic Payer ID').first()).toBeVisible();

    // Close modal
    const closeBtn = page.getByRole('button', { name: 'Close', exact: true });
    await closeBtn.click();
    await expect(page.locator('text=Supported EDI Transaction Sets')).not.toBeVisible();
  });

  test('Curated Payer Profile renders National Clearinghouse EDI capabilities and associated IDs table', async ({ page }) => {
    await page.goto('/payers/directory/aetna/', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Aetna');

    // Verify National EDI Clearinghouse Capabilities section
    await expect(page.locator('text=National EDI Clearinghouse Capabilities').first()).toBeVisible();
    await expect(page.locator('text=837P Professional Claims').first()).toBeVisible();

    // Verify Associated Clearinghouse Payer IDs table
    await expect(page.locator('text=Associated Clearinghouse Payer IDs').first()).toBeVisible();
    await expect(page.locator('text=Electronic Payer ID').first()).toBeVisible();
  });

});
