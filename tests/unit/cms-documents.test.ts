import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchCmsDocument } from '../../src/server/cmsDocuments';
import { onRequest } from '../../functions/api/cms-document';
import type { LeadEnv } from '../../src/server/leads';

test('CMS reader serves only a verified PDF and does not forward visitor credentials', async () => {
  const response = await fetchCmsDocument('ncci-2026', (async (url, init) => {
    assert.equal(url, 'https://www.cms.gov/files/document/2026-ncci-medicare-policy-manual-all-chapters.pdf');
    assert.equal(init?.redirect, 'manual');
    const headers = new Headers(init?.headers);
    assert.equal(headers.has('Cookie'), false); assert.equal(headers.has('Authorization'), false);
    return new Response('%PDF-1.7\nfixture', { headers: { 'Content-Type': 'application/pdf' } });
  }) as typeof fetch);
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '%PDF-1.7\nfixture');
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
  assert.ok(response.headers.get('Content-Security-Policy')?.includes('sandbox'));
});

test('CMS denial, HTML, redirects and mislabeled content never become a trusted PDF', async () => {
  for (const upstream of [
    new Response('denied', { status: 403 }),
    new Response('<script>untrusted</script>', { headers: { 'Content-Type': 'text/html' } }),
    new Response(null, { status: 302, headers: { Location: 'http://127.0.0.1/' } }),
    new Response('<html>not a PDF</html>', { headers: { 'Content-Type': 'application/pdf' } }),
    new Response('%PDF-test', { headers: { 'Content-Type': 'application/pdf', 'Content-Length': String(30 * 1024 * 1024) } }),
  ]) {
    const response = await fetchCmsDocument('ncci-2026', (async () => upstream) as typeof fetch);
    assert.equal(response.status, 502);
    assert.equal(response.headers.get('Content-Type'), 'text/html; charset=utf-8');
    assert.ok(!(await response.text()).includes('<script>'));
  }
});

test('CMS endpoint rejects arbitrary targets, duplicate IDs and mutation methods before any upstream request', async () => {
  for (const query of ['?url=https://example.com', '?id=unknown', '?id=ncci-2026&id=jw-jz', '?id=ncci-2026&url=https://example.com']) {
    assert.equal((await onRequest({ request: new Request('https://aetherahealthcare.com/api/cms-document' + query), env: {} as LeadEnv })).status, 404);
  }
  assert.equal((await onRequest({ request: new Request('https://aetherahealthcare.com/api/cms-document?id=ncci-2026', { method: 'POST' }), env: {} as LeadEnv })).status, 405);
  assert.equal((await onRequest({ request: new Request('https://aetherahealthcare.com/api/cms-document?id=ncci-2026'), env: {} as LeadEnv })).status, 429);
});
