// Free rank data: Google Search Console Search Analytics API (US, web search, last 28 days, data
// lags ~2-3 days) for the keywords in seo/config/keywords.csv plus the top site queries.
// Auth: a Google Cloud service account added as a (restricted) user on the Search Console property.
//   SEARCH_CONSOLE_CLIENT_EMAIL, SEARCH_CONSOLE_PRIVATE_KEY, GSC_SITE_URL (default sc-domain:aetherahealthcare.com)
// Output: seo/data/gsc/latest.json and seo/data/gsc/<date>.json (history for week-over-week deltas)
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { seoRoot, writeJson } from './lib/common.mjs';

const email = process.env.SEARCH_CONSOLE_CLIENT_EMAIL;
const key = process.env.SEARCH_CONSOLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const site = process.env.GSC_SITE_URL || 'sc-domain:aetherahealthcare.com';
if (!email || !key) { console.log('gsc-export: SEARCH_CONSOLE_CLIENT_EMAIL / SEARCH_CONSOLE_PRIVATE_KEY not set; skipping'); process.exit(0); }

const b64 = value => Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
const jwt = `${unsigned}.${createSign('RSA-SHA256').update(unsigned).sign(key, 'base64url')}`;
const tokenResponse = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }) });
if (!tokenResponse.ok) throw new Error(`GSC token error ${tokenResponse.status}: ${await tokenResponse.text()}`);
const { access_token: token } = await tokenResponse.json();

const day = offset => new Date(Date.now() - offset * 86_400_000).toISOString().slice(0, 10);
const range = { startDate: day(30), endDate: day(3) };
async function query(body) {
  const response = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...range, searchType: 'web', dimensionFilterGroups: [{ filters: [{ dimension: 'country', operator: 'equals', expression: 'usa' }] }], ...body }),
  });
  if (!response.ok) throw new Error(`GSC query error ${response.status}: ${await response.text()}`);
  return (await response.json()).rows ?? [];
}

const keywords = readFileSync(join(seoRoot, 'config', 'keywords.csv'), 'utf8').trim().split('\n').slice(1).map(line => {
  const [keyword, cluster, intent, targetPage] = line.split(',');
  return { keyword, cluster, intent, targetPage };
});
const topQueries = await query({ dimensions: ['query'], rowLimit: 1000 });
const byQuery = new Map(topQueries.map(row => [row.keys[0].toLowerCase(), row]));
const queryPages = await query({ dimensions: ['query', 'page'], rowLimit: 5000 });

const tracked = keywords.map(entry => {
  const row = byQuery.get(entry.keyword.toLowerCase());
  const pages = queryPages.filter(item => item.keys[0].toLowerCase() === entry.keyword.toLowerCase()).sort((a, b) => b.impressions - a.impressions);
  return {
    ...entry,
    position: row ? Number(row.position.toFixed(1)) : null, clicks: row?.clicks ?? 0, impressions: row?.impressions ?? 0,
    rankingPage: pages[0] ? new URL(pages[0].keys[1]).pathname : null,
  };
});
const result = {
  exportedAt: new Date().toISOString(), site, range, country: 'US',
  tracked, topQueries: topQueries.slice(0, 50).map(row => ({ query: row.keys[0], clicks: row.clicks, impressions: row.impressions, ctr: Number(row.ctr.toFixed(4)), position: Number(row.position.toFixed(1)) })),
};
await writeJson(join(seoRoot, 'data', 'gsc', 'latest.json'), result);
await writeJson(join(seoRoot, 'data', 'gsc', `${day(0)}.json`), result);
console.log(`gsc-export: ${tracked.filter(item => item.position).length}/${tracked.length} tracked keywords have impressions; ${topQueries.length} queries total`);
