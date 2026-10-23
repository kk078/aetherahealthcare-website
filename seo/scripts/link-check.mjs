// Broken-link check. Internal: linkinator over every sitemap page (links, images, scripts, styles on our
// host). External: outbound <a> links from seo/data/snapshot.json, checked with HEAD (GET fallback),
// a short timeout and at most 2 requests per host, so slow third-party sites cannot stall the run.
// /portal and /api are skipped. Output: seo/data/checks/link-check.json
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LinkChecker } from 'linkinator';
import { baseUrl, fetchSitemapUrls, isExcluded, seoRoot, userAgent, writeJson } from './lib/common.mjs';

const root = baseUrl();
const host = new URL(root).host;
const pages = (await fetchSitemapUrls(root)).filter(url => !isExcluded(url));
// Sites that reject all automated clients; a non-200 from them is "unverifiable", not broken.
const botHostile = /(^|\.)(linkedin\.com|x\.com|twitter\.com|facebook\.com|instagram\.com)$/;

const results = [];
const isInternal = link => { try { return new URL(link).host === host; } catch { return true; } };

// ---- Internal: linkinator, polite (low concurrency), retries on network errors.
const checker = new LinkChecker();
checker.on('link', result => {
  if (result.state === 'SKIPPED') return;
  results.push(result);
  if (results.length % 250 === 0) console.log(`  internal: ${results.length} links checked`);
});
// linkinator occasionally drops its last pending request and its promise never settles; Node then exits
// silently ("unsettled top-level await"). Keep the loop alive and fail loudly instead, so run-checks retries.
const watchdog = setTimeout(() => { console.error('link-check: internal pass did not settle within 20 min'); process.exit(3); }, 20 * 60_000);
await checker.check({
  path: pages, recurse: false, userAgent, retry: false, retryErrors: true, retryErrorsCount: 2, timeout: 20_000,
  concurrency: Number(process.env.LINKCHECK_CONCURRENCY ?? 3),
  linksToSkip: async link => isExcluded(link) || /^(mailto|tel|sms|javascript):/.test(link) || !isInternal(link),
});
clearTimeout(watchdog);
console.log(`  internal: done, ${results.length} links`);

// ---- External: outbound links recorded by the snapshot.
const snapshotPath = join(seoRoot, 'data', 'snapshot.json');
const external = new Map();
if (existsSync(snapshotPath)) {
  for (const page of JSON.parse(readFileSync(snapshotPath, 'utf8')).pages) {
    for (const link of page.links ?? []) {
      if (isInternal(link.href)) continue;
      if (!external.has(link.href)) external.set(link.href, []);
      external.get(link.href).push(new URL(page.url, root).href);
    }
  }
} else console.log('  external: no snapshot.json (run site-snapshot first); skipping external links');

async function probe(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const response = await fetch(url, {
        method, redirect: 'follow', signal: AbortSignal.timeout(10_000),
        // Many payer sites answer 404/406 to requests without normal Accept headers.
        headers: { 'User-Agent': userAgent, Accept: 'text/html,application/xhtml+xml,application/pdf,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9' },
      });
      await response.body?.cancel().catch(() => {});
      if (method === 'HEAD' && response.status >= 400) continue; // confirm every HEAD failure with a GET
      return response.status;
    } catch { if (method === 'GET') return 0; }
  }
  return 0;
}
const perHost = new Map();
const queue = [...external.keys()];
async function worker() {
  while (queue.length) {
    const url = queue.shift();
    const linkHost = new URL(url).host;
    if ((perHost.get(linkHost) ?? 0) >= 2) { queue.push(url); await new Promise(resolve => setTimeout(resolve, 50)); continue; }
    perHost.set(linkHost, (perHost.get(linkHost) ?? 0) + 1);
    const status = await probe(url);
    perHost.set(linkHost, perHost.get(linkHost) - 1);
    const ok = status >= 200 && status < 400;
    for (const parent of external.get(url)) results.push({ url, status, parent, state: ok ? 'OK' : 'BROKEN' });
  }
}
await Promise.all(Array.from({ length: Number(process.env.LINKCHECK_EXTERNAL_CONCURRENCY ?? 8) }, worker));
console.log(`  external: done, ${external.size} unique links`);

// A failing link whose host's home page also fails means the host rejects automated clients (or is down):
// unverifiable, not broken. Payer and state Medicaid sites do this to curl-like fetches.
const hostAnswers = new Map();
for (const linkHost of new Set(results.filter(entry => entry.state === 'BROKEN' && !isInternal(entry.url)).map(entry => new URL(entry.url).host))) {
  const status = await probe(`https://${linkHost}/`);
  hostAnswers.set(linkHost, status >= 200 && status < 400);
}

const broken = [];
const unverifiable = [];
const seen = new Map();
for (const result of results.filter(entry => entry.state === 'BROKEN')) {
  let linkHost;
  try { linkHost = new URL(result.url).host; } catch { linkHost = ''; }
  const item = { url: result.url, status: result.status ?? 0, internal: linkHost === host, parent: result.parent ? new URL(result.parent).pathname : null };
  if (!item.internal && (botHostile.test(linkHost) || [0, 403, 406, 429, 999].includes(item.status) || item.status >= 500 || hostAnswers.get(linkHost) === false)) unverifiable.push(item);
  else {
    const key = item.url;
    if (!seen.has(key)) { seen.set(key, { ...item, parents: [] }); broken.push(seen.get(key)); }
    if (item.parent) seen.get(key).parents.push(item.parent);
  }
}
for (const item of broken) { item.parents = [...new Set(item.parents)]; item.parentCount = item.parents.length; item.parents = item.parents.slice(0, 10); delete item.parent; }

const checked = new Set(results.map(result => result.url)).size;
// status 0 (timeout / refused), 406, 5xx, or a host whose home page also fails: unverifiable, not broken.
await writeJson(join(seoRoot, 'data', 'checks', 'link-check.json'), {
  generatedAt: new Date().toISOString(), base: root, pagesScanned: pages.length, linksChecked: checked,
  summary: { brokenInternal: broken.filter(item => item.internal).length, brokenExternal: broken.filter(item => !item.internal).length, unverifiable: new Set(unverifiable.map(item => item.url)).size },
  broken, unverifiable: [...new Map(unverifiable.map(item => [item.url, item])).values()],
});
console.log(`link-check: ${pages.length} pages, ${checked} unique links, ${broken.length} broken (${broken.filter(item => item.internal).length} internal)`);
