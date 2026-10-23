import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fitTitle, marketingMetadata, revenueScenario, TITLE_MAX } from '../../src/lib/marketing';
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
  assert.deepEqual(metadata.title, { absolute: `Pricing | ${SITE.titleSuffix}` });
  assert.equal(metadata.openGraph?.url, metadata.alternates?.canonical);
  assert.match(String(metadata.alternates?.canonical), /\/pricing\/$/);
});
test('titles keep the brand suffix only when it fits, and prefer a descriptive candidate over the brand', () => {
  assert.equal(fitTitle('Pricing'), `Pricing | ${SITE.titleSuffix}`);
  const long = 'A'.repeat(TITLE_MAX - 2);
  assert.equal(fitTitle(long), long);
  assert.equal(fitTitle(`${long} Services`, long, 'Short'), long);
  assert.equal(fitTitle('B'.repeat(TITLE_MAX + 5), 'B'.repeat(TITLE_MAX + 1)), 'B'.repeat(TITLE_MAX + 1));
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
test('short search titles point at real pages and fit a search result', async () => {
  const { BLOG_SEO_TITLES, PAYER_TITLE_NAMES, SPECIALTY_TITLE_NAMES } = await import('../../src/lib/seoTitles');
  const { getPayer } = await import('../../src/lib/payers');
  for (const [slug, title] of Object.entries(BLOG_SEO_TITLES)) {
    assert.ok(POSTS.find(p => p.slug === slug), slug);
    assert.ok(fitTitle(title).length <= TITLE_MAX, slug);
  }
  for (const [slug, name] of Object.entries(SPECIALTY_TITLE_NAMES)) {
    assert.ok(SEO_SPECIALTIES.find(s => s.slug === slug), slug);
    assert.ok(fitTitle(`${name} Medical Billing Services`, `${name} Medical Billing`, `${name} Billing`).length <= TITLE_MAX, slug);
  }
  for (const [slug, name] of Object.entries(PAYER_TITLE_NAMES)) {
    assert.ok(getPayer(slug), slug);
    assert.ok(fitTitle(`${name} — Payer ID & EDI Reference`, `${name} Payer ID & EDI`, `${name} Payer ID`).length <= TITLE_MAX, slug);
  }
});
