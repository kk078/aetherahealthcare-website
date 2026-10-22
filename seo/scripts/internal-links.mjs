// Internal linking report for money pages (service, specialty, medical-billing specialty pages):
// inbound internal links, split into contextual (in-content) and navigation (header/nav/footer).
// Orphan = no inbound links from any sitemap page; weak = fewer than WEAK contextual inbound links.
// Input: seo/data/snapshot.json  Output: seo/data/checks/internal-links.json
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { seoRoot, writeJson } from './lib/common.mjs';

const WEAK = 3;
const snapshot = JSON.parse(readFileSync(join(seoRoot, 'data', 'snapshot.json'), 'utf8'));
const host = new URL(snapshot.base).host;
const key = href => { const url = new URL(href); return url.host === host ? url.pathname.replace(/\/?$/, '/') : null; };

const inbound = new Map();
for (const page of snapshot.pages) {
  for (const link of page.links ?? []) {
    const target = key(link.href);
    if (!target || target === page.path) continue;
    const entry = inbound.get(target) ?? { contextual: new Set(), navigation: new Set(), anchors: new Map() };
    (link.contextual ? entry.contextual : entry.navigation).add(page.path);
    if (link.text) entry.anchors.set(link.text, (entry.anchors.get(link.text) ?? 0) + 1);
    inbound.set(target, entry);
  }
}

const isMoneyPage = path => /^\/services\/[^/]+\/$/.test(path) || /^\/medical-billing\/[^/]+\/$/.test(path) || path === '/specialties/';
const kind = path => (/-billing\/$/.test(path) || path.startsWith('/medical-billing/') || path === '/specialties/' ? 'specialty' : 'service');
const rows = snapshot.pages.filter(page => isMoneyPage(page.path)).map(page => {
  const entry = inbound.get(page.path);
  const contextual = entry ? entry.contextual.size : 0;
  const navigation = entry ? [...entry.navigation].filter(path => !entry.contextual.has(path)).length : 0;
  return {
    path: page.path, kind: kind(page.path), contextualInbound: contextual, navigationOnlyInbound: navigation,
    totalInbound: contextual + navigation,
    status: contextual + navigation === 0 ? 'orphan' : contextual < WEAK ? 'weak' : 'ok',
    topAnchors: entry ? [...entry.anchors].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([text, count]) => `${text} (${count})`) : [],
    sampleContextualSources: entry ? [...entry.contextual].slice(0, 5) : [],
  };
}).sort((a, b) => a.contextualInbound - b.contextualInbound || a.path.localeCompare(b.path));

// Sitemap-wide orphans (any page with zero inbound links from other sitemap pages).
const orphans = snapshot.pages.filter(page => page.status === 200 && page.path !== '/' && !inbound.has(page.path)).map(page => page.path);

await writeJson(join(seoRoot, 'data', 'checks', 'internal-links.json'), {
  generatedAt: new Date().toISOString(), base: snapshot.base, weakThreshold: WEAK,
  summary: { moneyPages: rows.length, orphan: rows.filter(row => row.status === 'orphan').length, weak: rows.filter(row => row.status === 'weak').length, sitemapOrphans: orphans.length },
  moneyPages: rows, sitemapOrphans: orphans,
});
console.log(`internal-links: ${rows.length} service/specialty pages, ${rows.filter(row => row.status !== 'ok').length} weak/orphan, ${orphans.length} sitemap orphans`);
