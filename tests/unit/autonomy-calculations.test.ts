import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { admissionReview, clfsPhaseInFloor, convertNdc, drugBillingUnits, scenarioCost, sha256, verifyDemoRecord } from '../../src/lib/autonomyCalculations';
import { PAYMENT_REFERENCES, REFERENCE_TOPICS, SAMPLE_CODES, SOURCES } from '../../src/data/autonomyReferences';

// CMS JW/JZ FAQ examples: the rounded administered unit already includes sub-unit waste.
test('325 mg from a 400 mg package at 10 mg/unit reconciles to 33 + 7, not 41', () => {
  assert.deepEqual(drugBillingUnits(325, 400, 10), { administeredUnits: 33, discardedUnits: 7, totalUnits: 40, discardedMg: 75, modifier: 'JW' });
});
test('sub-unit waste is not billed twice and the example uses JZ', () => {
  assert.deepEqual(drugBillingUnits(7, 10, 10), { administeredUnits: 1, discardedUnits: 0, totalUnits: 1, discardedMg: 3, modifier: 'JZ' });
  assert.equal(drugBillingUnits(400, 400, 10).modifier, 'JZ');
});
test('drug calculations conserve opened billing units over varied doses', () => {
  for (const unit of [0.1, 1, 10, 100]) {
    for (let tenth = 1; tenth <= 400; tenth++) {
      const result = drugBillingUnits(tenth * unit / 10, 40 * unit, unit);
      assert.equal(result.totalUnits, 40);
      assert.equal(result.administeredUnits, Math.ceil(tenth / 10));
      assert.ok(result.discardedUnits >= 0);
    }
  }
  assert.equal(drugBillingUnits(0.001, 1e9, 1e9).administeredUnits, 1);
});
test('drug inputs reject overadministration, invalid numbers and unsupported package fractions', () => {
  for (const input of [[401, 400, 10], [0, 400, 10], [-1, 400, 10], [NaN, 400, 10], [1, Infinity, 10], [1, 100, 0], [1, 105, 10], [0.001, 0.001, 1e9]]) assert.throws(() => drugBillingUnits(...input as [number, number, number]));
});
test('NDC formatting respects all three original segment formats', () => {
  assert.equal(convertNdc('1234-5678-90'), '01234-5678-90');
  assert.equal(convertNdc('50242-060-01'), '50242-0060-01');
  assert.equal(convertNdc('50242-061-01'), '50242-0061-01');
  assert.equal(convertNdc('12345-6789-0'), '12345-6789-00');
  for (const value of ['5024206001', '12345-6789-01', '123-45678-90', 'abcde-123-45', '']) assert.throws(() => convertNdc(value));
});
test('no order never produces an affirmative inpatient result', () => {
  for (const nights of [0, 1, 2, 10]) for (const rationale of [true, false]) assert.equal(admissionReview(false, nights, rationale).status, 'Missing admission order');
});
test('inpatient prompts preserve documentation and short-stay uncertainty', () => {
  assert.equal(admissionReview(true, 2, false).status, 'Clinical documentation needed');
  assert.equal(admissionReview(true, 0, true).status, 'Short-stay review needed');
  assert.match(admissionReview(true, 1, true).detail, /not an automatic denial/);
  assert.match(admissionReview(true, 2, true).status, /review required/);
  for (const nights of [-1, 0.5, Infinity, NaN, 366]) assert.throws(() => admissionReview(true, nights, true));
});
test('CLFS uses zero reduction in 2026 and a 15% annual limit for 2027–2029', () => {
  assert.deepEqual(clfsPhaseInFloor(100, 2026), { reduction: 0, floor: 100 });
  for (const year of [2027, 2028, 2029]) assert.deepEqual(clfsPhaseInFloor(100, year), { reduction: 0.15, floor: 85 });
  assert.equal(clfsPhaseInFloor(85, 2028).floor, 72.25);
  for (const args of [[100, 2025], [100, 2030], [NaN, 2026], [-1, 2026], [0, 2026]]) assert.throws(() => clfsPhaseInFloor(...args as [number, number]));
});
test('cost scenario uses only entered assumptions with no hidden vendor improvement', () => {
  assert.deepEqual(scenarioCost(1000, 100, 10, 50, 10), { denied: 100, unrecovered: 5000, rework: 1000, total: 6000 });
  assert.equal(scenarioCost(1000, 100, 10, 100, 10).total, 1000);
  assert.equal(scenarioCost(1000, 100, 0, 0, 10).total, 0);
  assert.equal(scenarioCost(0, 100, 10, 50, 10).total, 0);
  for (const args of [[1.5, 100, 10, 50, 10], [1, 100, 101, 50, 10], [1, 100, 10, -1, 10], [1, Infinity, 10, 50, 10]]) assert.throws(() => scenarioCost(...args as [number, number, number, number, number]));
});
test('browser digest matches published SHA-256 known answer and independent Node implementation', async () => {
  assert.equal(await sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const text = 'DEMO | units: 40 | Δ';
  const digest = createHash('sha256').update(text).digest('hex');
  assert.equal(await sha256(text), digest);
  assert.equal(await verifyDemoRecord(text, digest), true);
  assert.equal(await verifyDemoRecord(text.replace('40', '41'), digest), false);
});
test('published examples distinguish Avastin package strengths and modifier 99', () => {
  assert.match(SAMPLE_CODES.find(c => c.code === '50242-0060-01')!.meaning, /100 mg/);
  assert.match(SAMPLE_CODES.find(c => c.code === '50242-0061-01')!.meaning, /400 mg/);
  assert.match(SAMPLE_CODES.find(c => c.code === '99')!.meaning, /Multiple modifiers/);
});
test('every reference is dated and every topic has an authoritative source and unique anchor', () => {
  assert.equal(new Set(REFERENCE_TOPICS.map(t => t.id)).size, REFERENCE_TOPICS.length);
  for (const rate of PAYMENT_REFERENCES) {
    assert.ok(rate.from <= rate.through);
    assert.equal(rate.from, rate.period === 'FY 2026' ? '2025-10-01' : '2026-01-01');
    assert.equal(rate.through, rate.period === 'FY 2026' ? '2026-09-30' : '2026-12-31');
    assert.ok(SOURCES[rate.source]);
  }
  for (const topic of REFERENCE_TOPICS) assert.ok(topic.sources.length > 0 && topic.sources.every(key => SOURCES[key].url.startsWith('https://')));
});
