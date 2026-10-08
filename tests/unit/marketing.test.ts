import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marketingMetadata, revenueScenario } from '../../src/lib/marketing';
import { OFFERS, SITE } from '../../src/lib/siteConfig';
import { TOOLS } from '../../src/lib/toolRegistry';
import { POSTS } from '../../src/lib/blogPosts';
import { SEO_SPECIALTIES } from '../../src/lib/seo.data';
test('scenario accounts for fees on projected net collections and allows negative benefit', () => {
  const scenario = revenueScenario(100, 10, 5);
  for (const [actual, expected] of [[scenario.projectedMonthly, 110], [scenario.monthlyGain, 10], [scenario.monthlyFee, 5.5], [scenario.netAnnualGain, 54]]) assert.ok(Math.abs(actual - expected) < 0.000001);
  assert.equal(revenueScenario(100, 0, 5).netAnnualGain, -60);
  for (const args of [[Infinity, 10, 5], [-1, 10, 5], [100, 101, 5], [100, 10, 6], [100, 10, 3]]) assert.throws(() => revenueScenario(...args as [number, number, number]));
});
test('page metadata uses its own URL and one brand suffix', () => {
  const metadata = marketingMetadata('/pricing', 'Pricing | Aethera Healthcare Solutions', 'Scope and pricing');
  assert.deepEqual(metadata.title, { absolute: `Pricing | ${SITE.name}` });
  assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  assert.match(String(metadata.alternates?.canonical), /\/pricing\/$/);
});
test('different offers have explicit scopes and start conditions', () => {
  assert.notEqual(OFFERS.sprint.id, OFFERS.pilot.id);
  assert.match(OFFERS.sprint.scope, /5–10/); assert.equal(OFFERS.sprint.duration, '48 hours');
  assert.match(OFFERS.pilot.scope, /50/); assert.equal(OFFERS.pilot.duration, '14 days');
  for (const offer of Object.values(OFFERS)) assert.match(offer.start, /BAA/);
});
test('all educational tools and articles expose primary references without invented reviewers', () => {
  for (const tool of TOOLS) { assert.ok(tool.sourceUrls.length, tool.href); if (tool.reviewStatus === 'needs-review') assert.equal(tool.reviewer, null); }
  for (const post of POSTS) { assert.ok(post.referenceUrls?.length, post.slug); assert.equal(post.author, 'Aethera Editorial Team'); }
  for (const slug of ['endocrinology', 'general-surgery']) assert.ok(SEO_SPECIALTIES.find(s => s.slug === slug));
});
