import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { blockedFindings } from '../../scripts/release-audit.mjs';
const evidence = JSON.parse(readFileSync('tests/fixtures/release-audit-2026-10-08.json', 'utf8'));
const approvedTime = Date.parse('2026-10-08T00:00:00Z');
test('the approved real dev-only audit chain passes within the limited approval window', () => {
  assert.deepEqual(blockedFindings(evidence.audit, evidence.lock, approvedTime), []);
});
test('the same advisory in a production dependency remains blocking', () => {
  const changed = structuredClone(evidence);
  changed.lock.packages['node_modules/braces'].dev = false;
  assert.ok(blockedFindings(changed.audit, changed.lock, approvedTime).some(([name]) => name === 'braces'));
});
test('the exception expires and cannot exempt a different advisory', () => {
  assert.equal(blockedFindings(evidence.audit, evidence.lock, Date.parse('2026-10-15T00:00:00Z')).length, 5);
  const changed = structuredClone(evidence);
  changed.audit.vulnerabilities.braces.via[0].url = 'https://github.com/advisories/GHSA-wq5f-xc86-pv6w';
  assert.ok(blockedFindings(changed.audit, changed.lock, approvedTime).length > 0);
});
test('unrecognized dependency paths fail closed', () => {
  assert.ok(blockedFindings(evidence.audit, { packages: {} }, approvedTime).length > 0);
});
