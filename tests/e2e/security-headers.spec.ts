import { test, expect } from '@playwright/test';

/**
 * Security header tests — verify all required security headers are present on every response
 */

const REQUIRED_HEADERS = [
  'strict-transport-security',
  'x-frame-options',
  'x-content-type-options',
  'referrer-policy',
  'content-security-policy',
  'permissions-policy',
] as const;

test.describe('Security Headers', () => {
  test('homepage has all required security headers', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);

    for (const header of REQUIRED_HEADERS) {
      const value = response.headers()[header];
      expect(value, `Missing header: ${header}`).toBeTruthy();
    }
  });

  test('HSTS max-age is at least 1 year', async ({ request }) => {
    const response = await request.get('/');
    const hsts = response.headers()['strict-transport-security'] ?? '';
    const match = hsts.match(/max-age=(\d+)/);
    expect(match).not.toBeNull();
    const maxAge = parseInt(match![1], 10);
    expect(maxAge).toBeGreaterThanOrEqual(31536000); // 1 year
  });

  test('X-Frame-Options is DENY', async ({ request }) => {
    const response = await request.get('/');
    expect(response.headers()['x-frame-options']).toBe('DENY');
  });

  test('CSP includes connect-src for Worker and Cloudflare Insights', async ({ request }) => {
    const response = await request.get('/');
    const csp = response.headers()['content-security-policy'] ?? '';
    expect(csp).toContain('aethera-forms.aetherahealthcare.workers.dev');
    expect(csp).toContain('cloudflareinsights.com');
  });

  test('Worker CORS blocks non-whitelisted origins', async ({ request }) => {
    const response = await request.post(
      'https://aethera-forms.aetherahealthcare.workers.dev/api/submit',
      {
        headers: {
          'Content-Type': 'application/json',
          Origin: 'https://evil.example.com',
        },
        data: { form_type: 'test', name: 'Test', email: 'test@test.com' },
      }
    );
    // Should get a CORS error or non-200 status from evil origin
    const allowOrigin = response.headers()['access-control-allow-origin'] ?? '';
    expect(allowOrigin).not.toBe('https://evil.example.com');
  });
});
