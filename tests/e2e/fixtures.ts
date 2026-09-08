import { test as base, expect } from '@playwright/test';
export * from '@playwright/test';
export const test = base.extend<{ consent: 'declined' | 'unknown' }>({
  consent: ['declined', { option: true }],
  page: async ({ page, consent }, provide) => {
    await page.addInitScript(choice => { if (choice === 'declined') localStorage.setItem('aethera-consent-v2', JSON.stringify({ version: 2, choice, expiresAt: Date.now()+86400000 })); }, consent);
    // All page tests stay off real delivery services. Dedicated tests override this route.
    await page.route('**/api/leads', route => route.fulfill({ status: 202, contentType: 'application/json', body: JSON.stringify({ accepted: true, submissionId: route.request().postDataJSON().submissionId }) }));
    await page.route('**/api/assistant', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
    await provide(page);
  },
});
export { expect };
