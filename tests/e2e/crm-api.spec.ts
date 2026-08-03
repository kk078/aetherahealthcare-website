import { test, expect } from '@playwright/test';

/**
 * CRM ingest + forms-worker availability tests (read-only).
 *
 * Every site form posts to the CRM API (src/lib/worker.ts); the legacy forms
 * worker still serves the AI assistant. These tests intentionally never POST —
 * they verify the hosts are alive and that CORS preflight would let browser
 * form submissions succeed, without creating junk leads on every CI run.
 */

const CRM_CONTACT = 'https://aethera-crm-api.aetherahealthcare.workers.dev/api/v1/public/website/contact';
const FORMS_WORKER = 'https://aethera-forms.aetherahealthcare.workers.dev';
const SITE_ORIGIN = 'https://aetherahealthcare.com';

test.describe('Forms worker', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const res = await request.get(`${FORMS_WORKER}/api/health`);
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });
});

test.describe('CRM ingest API', () => {
  test('router is alive (GET on POST-only route returns structured 4xx, not 5xx)', async ({ request }) => {
    // The worker can cold-start slowly; retry transient 5xx/network blips so a
    // single hiccup doesn't fail CI. A persistent 5xx still fails.
    let status = 0;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        status = (await request.get(CRM_CONTACT, { timeout: 20_000 })).status();
      } catch {
        status = 0;
      }
      if (status >= 400 && status < 500) break;
    }
    expect(status).toBeGreaterThanOrEqual(400);
    expect(status).toBeLessThan(500);
  });

  test('CORS preflight allows POST from the site origin', async ({ request }) => {
    const res = await request.fetch(CRM_CONTACT, {
      method: 'OPTIONS',
      headers: {
        Origin: SITE_ORIGIN,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type',
      },
    });
    expect(res.status()).toBeLessThan(400);
    const allowOrigin = res.headers()['access-control-allow-origin'] ?? '';
    expect([SITE_ORIGIN, '*']).toContain(allowOrigin);
  });

  test('CORS preflight does not echo arbitrary origins', async ({ request }) => {
    const res = await request.fetch(CRM_CONTACT, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://evil.example.com',
        'Access-Control-Request-Method': 'POST',
      },
    });
    const allowOrigin = res.headers()['access-control-allow-origin'] ?? '';
    expect(allowOrigin).not.toBe('https://evil.example.com');
  });
});
