import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeArticle } from '../../src/lib/safeHtml';
import { jsonLd } from '../../src/lib/jsonLd';
import { appealReadiness } from '../../src/lib/rules/denialReadiness';
import { validateUpload } from '../../src/lib/uploadLimits';
import { TOOLS } from '../../src/lib/toolRegistry';
import { ROUTES } from '../../src/lib/routes.generated';
import { mentionsEntity } from '../../src/lib/entityMatch';

test('payer aliases match complete words rather than Medicare substrings', () => {
  assert.equal(mentionsEntity('UHC & Medicare timely filing', 'Medica'), false);
  assert.equal(mentionsEntity('What is UHC?', 'UHC'), true);
  assert.equal(mentionsEntity('clear health alliance', 'al'), false);
  assert.equal(mentionsEntity('Blue Cross Blue Shield', 'Blue Cross'), true);
});

test('generated HTML blocks scripts, handlers and hostile links', () => {
  const html = sanitizeArticle('<script>alert(1)</script><img src=x onerror=alert(1)><a href="javascript:alert(1)">Bad</a><a href="//evil.test">Bad</a><a href="/services/">Safe</a>');
  assert.doesNotMatch(html, /script|onerror|javascript|evil\.test|<img/);
  assert.match(html, /href="\/services\/"/);
  assert.doesNotMatch(sanitizeArticle('<a href="/\\evil.test">Bad</a>'), /href/);
});
test('JSON-LD cannot terminate its script element', () => assert.doesNotMatch(jsonLd({ title: '</script><script>alert(1)</script>' }), /</));
test('readiness reports checklist completion, including empty and complete cases', () => {
  assert.equal(appealReadiness([]), 0); assert.equal(appealReadiness([false, false]), 0);
  assert.equal(appealReadiness([true, false, false, true]), 50); assert.equal(appealReadiness([true, true]), 100);
});
test('upload limits reject invalid, empty and oversized files', () => {
  for (const file of [{ name: 'a.csv', size: 0 }, { name: 'a.exe', size: 100 }, { name: 'a.xlsx', size: 11000000 }]) assert.throws(() => validateUpload(file));
  assert.equal(validateUpload({ name: 'report.CSV', size: 100 }), 'csv');
});
test('every tool has a route and explicit review status', () => {
  assert.equal(new Set(TOOLS.map(t => t.href)).size, TOOLS.length);
  for (const tool of TOOLS) { assert.ok(ROUTES.some(r => r.path === tool.href), tool.href); assert.ok(tool.reviewStatus); if (tool.reviewStatus === 'reviewed') { assert.ok(tool.reviewedAt); assert.ok(tool.reviewer); assert.ok(tool.sourceUrls.length); } }
});
