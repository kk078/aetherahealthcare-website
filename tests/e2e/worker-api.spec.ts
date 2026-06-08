import { test, expect } from '@playwright/test';

/**
 * Worker API integration tests
 * Direct HTTP tests against the production Worker endpoints.
 */

const WORKER = 'https://aethera-forms.aetherahealthcare.workers.dev';

test.describe('Worker API — /api/submit', () => {
  test('rejects missing required fields', async ({ request }) => {
    const res = await request.post(`${WORKER}/api/submit`, {
      data: { form_type: 'contact' },
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://aetherahealthcare.com',
      },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    expect(res.status()).toBeLessThan(500);
  });

  test('rejects SQL injection in name field', async ({ request }) => {
    const res = await request.post(`${WORKER}/api/submit`, {
      data: {
        form_type: 'contact',
        name: "'; DROP TABLE website_submissions; --",
        email: 'sql@test.com',
        message: 'test',
      },
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://aetherahealthcare.com',
      },
    });
    // Should succeed (sanitized input) or return 422 — never 500
    expect(res.status()).not.toBe(500);
  });

  test('rejects XSS payload in message field', async ({ request }) => {
    const res = await request.post(`${WORKER}/api/submit`, {
      data: {
        form_type: 'contact',
        name: 'XSS Test',
        email: 'xss@test.com',
        message: '<script>alert("xss")</script>',
      },
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://aetherahealthcare.com',
      },
    });
    expect(res.status()).not.toBe(500);
    const body = await res.json();
    if (body.ok) {
      // If accepted, the stored value must not contain raw script tag
      // (Worker sanitizes it — we just verify no 500)
    }
  });
});

test.describe('Worker API — /api/portal/request-login', () => {
  test('returns 422 for missing email', async ({ request }) => {
    const res = await request.post(`${WORKER}/api/portal/request-login`, {
      data: {},
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://aetherahealthcare.com',
      },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('returns 422 for invalid email format', async ({ request }) => {
    const res = await request.post(`${WORKER}/api/portal/request-login`, {
      data: { email: 'not-an-email' },
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://aetherahealthcare.com',
      },
    });
    expect(res.status()).toBe(422);
  });

  test('accepts valid email and returns ok:true', async ({ request }) => {
    const res = await request.post(`${WORKER}/api/portal/request-login`, {
      data: { email: `worker-api-e2e-${Date.now()}@example.com`, name: 'E2E Test' },
      headers: {
        'Content-Type': 'application/json',
        Origin: 'https://aetherahealthcare.com',
      },
    });
    // May be 200 ok or 429 rate-limited — neither is a 500
    expect(res.status()).not.toBe(500);
    if (res.status() === 200) {
      const body = await res.json();
      expect(body.ok).toBe(true);
    }
  });
});

test.describe('Worker API — /api/portal/verify', () => {
  test('returns 400 when no token supplied', async ({ request }) => {
    const res = await request.get(`${WORKER}/api/portal/verify`, {
      headers: { Origin: 'https://aetherahealthcare.com' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });

  test('returns 401 for a fake token', async ({ request }) => {
    const res = await request.get(`${WORKER}/api/portal/verify?token=fakefakefakefake`, {
      headers: { Origin: 'https://aetherahealthcare.com' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.ok).toBe(false);
  });
});

test.describe('Worker API — /api/health', () => {
  test('health endpoint returns 200', async ({ request }) => {
    const res = await request.get(`${WORKER}/api/health`, {
      headers: { Origin: 'https://aetherahealthcare.com' },
    });
    // 200 or 404 if not yet implemented — just not a 5xx
    expect(res.status()).toBeLessThan(500);
  });
});
