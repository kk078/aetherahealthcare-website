import { test, expect, type APIRequestContext, type APIResponse } from '@playwright/test';

/**
 * Security header tests — verify all required security headers are present on
 * every response.
 *
 * Two caveats about production behavior:
 * - Cloudflare zone-level settings currently override two values declared in
 *   public/_headers — X-Frame-Options (SAMEORIGIN vs DENY) and HSTS max-age
 *   (6 months vs 2 years). Both live values are acceptable, so the assertions
 *   accept either; tightening beyond that requires a Cloudflare dashboard
 *   change, not a code change.
 * - Cloudflare intermittently serves its bot-challenge interstitial to
 *   datacenter IPs (e.g. CI runners). The challenge page has its own headers,
 *   so asserting against it would be meaningless — fetchUnlessChallenged()
 *   retries and the tests skip if the challenge persists.
 */

const REQUIRED_HEADERS = [
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'content-security-policy',
  'permissions-policy',
] as const;

function isChallenge(res: APIResponse): boolean {
  const csp = res.headers()['content-security-policy'] ?? '';
  return res.headers()['cf-mitigated'] === 'challenge' || csp.includes('challenges.cloudflare.com');
}

async function fetchUnlessChallenged(request: APIRequestContext, path: string): Promise<APIResponse | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await request.get(path);
    if (!isChallenge(res)) return res;
  }
  return null;
}

test.describe('Security Headers', () => {
  test('homepage has all required security headers', async ({ request }) => {
    const response = await fetchUnlessChallenged(request, '/');
    test.skip(!response, 'Cloudflare bot challenge intercepted this runner — headers not observable.');
    expect(response!.status()).toBe(200);

    for (const header of REQUIRED_HEADERS) {
      const value = response!.headers()[header];
      expect(value, `Missing header: ${header}`).toBeTruthy();
    }
  });

  test('HSTS max-age is at least 6 months', async ({ request }) => {
    const response = await fetchUnlessChallenged(request, '/');
    test.skip(!response, 'Cloudflare bot challenge intercepted this runner — headers not observable.');
    const hsts = response!.headers()['strict-transport-security'] ?? '';
    const match = hsts.match(/max-age=(\d+)/);
    expect(match).not.toBeNull();
    const maxAge = parseInt(match![1], 10);
    expect(maxAge).toBeGreaterThanOrEqual(15552000); // 6 months
  });

  test('X-Frame-Options denies cross-origin framing', async ({ request }) => {
    const response = await fetchUnlessChallenged(request, '/');
    test.skip(!response, 'Cloudflare bot challenge intercepted this runner — headers not observable.');
    expect(['DENY', 'SAMEORIGIN']).toContain(response!.headers()['x-frame-options']);
  });

  test('CSP allows the CRM API, forms worker, and Cloudflare Insights', async ({ request }) => {
    const response = await fetchUnlessChallenged(request, '/');
    test.skip(!response, 'Cloudflare bot challenge intercepted this runner — headers not observable.');
    const csp = response!.headers()['content-security-policy'] ?? '';
    expect(csp).toContain('aethera-crm-api.aetherahealthcare.workers.dev');
    expect(csp).toContain('aethera-forms.aetherahealthcare.workers.dev');
    expect(csp).toContain('cloudflareinsights.com');
  });
});
