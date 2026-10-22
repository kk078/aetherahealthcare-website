// Sitemap + robots + on-page audit from the snapshot: every sitemap URL must return 200 directly,
// be indexable, self-canonical and robots-allowed; key sections must not be blocked. Also flags
// title / description / H1 / thin-content problems so CI has them without SEOnaut.
// Input: seo/data/snapshot.json  Output: seo/data/checks/sitemap-audit.json
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { seoRoot, writeJson } from './lib/common.mjs';

const snapshot = JSON.parse(readFileSync(join(seoRoot, 'data', 'snapshot.json'), 'utf8'));
const strip = url => { try { const parsed = new URL(url); parsed.hash = ''; parsed.search = ''; return parsed.href; } catch { return url; } };
const prodToBase = url => url?.replace('https://aetherahealthcare.com', snapshot.base);
const THIN_WORDS = 300;
const issues = [];
const add = (type, page, detail = '') => issues.push({ type, path: page.path, detail });

for (const page of snapshot.pages) {
  if (page.error) { add('fetch-error', page, page.error); continue; }
  if (page.redirectChain?.length) add('sitemap-redirect', page, `${page.redirectChain.map(hop => hop.status).join(' > ')} -> ${new URL(page.finalUrl).pathname}`);
  if (page.status !== 200) { add('sitemap-non-200', page, String(page.status)); continue; }
  if (!page.robotsAllowed) add('sitemap-blocked-by-robots', page);
  const noindex = /noindex/i.test(`${page.metaRobots ?? ''} ${page.xRobotsTag ?? ''}`);
  if (noindex) add('sitemap-noindex', page, page.metaRobots ?? page.xRobotsTag);
  if (page.title === undefined) continue; // not HTML
  if (!page.canonicals.length) add('canonical-missing', page);
  else if (page.canonicals.length > 1) add('canonical-multiple', page, page.canonicals.join(' | '));
  else if (strip(prodToBase(page.canonicals[0])) !== strip(page.finalUrl)) add('canonical-not-self', page, page.canonicals[0]);
  if (!page.title) add('title-missing', page);
  else if (page.title.length > 60) add('title-too-long', page, `${page.title.length} chars`);
  else if (page.title.length < 20) add('title-too-short', page, `${page.title.length} chars`);
  if (!page.metaDescription) add('description-missing', page);
  else if (page.metaDescription.length > 160) add('description-too-long', page, `${page.metaDescription.length} chars`);
  else if (page.metaDescription.length < 70) add('description-too-short', page, `${page.metaDescription.length} chars`);
  if (!page.h1.length) add('h1-missing', page);
  else if (page.h1.length > 1) add('h1-multiple', page, `${page.h1.length} H1s`);
  if (!noindex && page.wordCount < THIN_WORDS) add('thin-content', page, `${page.wordCount} words`);
}

for (const [field, type] of [['title', 'title-duplicate'], ['metaDescription', 'description-duplicate']]) {
  const groups = new Map();
  for (const page of snapshot.pages.filter(entry => entry[field])) groups.set(page[field], [...(groups.get(page[field]) ?? []), page.path]);
  for (const [value, paths] of groups) if (paths.length > 1) for (const path of paths) issues.push({ type, path, detail: `shared by ${paths.length} pages: "${value.slice(0, 70)}"` });
}

const robots = snapshot.robots;
if (robots.status !== 200) issues.push({ type: 'robots-unreachable', path: '/robots.txt', detail: String(robots.status) });
if (!/^sitemap:/im.test(robots.text)) issues.push({ type: 'robots-no-sitemap', path: '/robots.txt' });
for (const path of robots.keySectionsBlocked) issues.push({ type: 'robots-blocks-key-section', path });
// /api/ (POST-only endpoints) should be disallowed. /portal/ must stay crawlable: it is noindex, and a
// robots Disallow would hide that noindex while site-wide links could still get the bare URL indexed.
for (const { path, disallowed } of robots.excludedPathsDisallowed) {
  if (path === '/api/' && !disallowed) issues.push({ type: 'robots-allows-private-path', path, detail: 'recommend Disallow: /api/ (POST-only endpoints)' });
  if (path === '/portal/' && disallowed) issues.push({ type: 'robots-blocks-noindex-page', path, detail: 'Disallow hides the page noindex; remove it and rely on noindex' });
}
for (const url of snapshot.excludedFromSitemap) issues.push({ type: 'sitemap-lists-excluded-path', path: new URL(url).pathname });

const counts = Object.fromEntries([...new Set(issues.map(issue => issue.type))].sort().map(type => [type, issues.filter(issue => issue.type === type).length]));
await writeJson(join(seoRoot, 'data', 'checks', 'sitemap-audit.json'), { generatedAt: new Date().toISOString(), base: snapshot.base, sitemapCount: snapshot.sitemapCount, counts, issues });
console.log(`sitemap-audit: ${snapshot.sitemapCount} URLs, ${issues.length} issues`);
for (const [type, count] of Object.entries(counts)) console.log(`  ${type}: ${count}`);
