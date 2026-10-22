// Drive the local SEOnaut instance (infra/seonaut) and export its results.
//   node seo/scripts/seonaut.mjs crawl    # ensure account + project, start a crawl, wait, export
//   node seo/scripts/seonaut.mjs export   # export the latest finished crawl
// Needs seo/.env loaded (the Makefile does it). Exports: seo/data/seonaut/latest.{json,csv}
// plus issues-<date>.csv. Gateway URLs are mapped back to https://aetherahealthcare.com.
import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { config, isExcluded, repoRoot, seoRoot } from './lib/common.mjs';

const GATEWAY = 'http://seo-gateway:8080';
const UI = `http://127.0.0.1:${process.env.SEONAUT_PORT || 9002}`;
const { SEONAUT_EMAIL: email, SEONAUT_PASSWORD: password, SEONAUT_DB_PASSWORD: dbPassword } = process.env;
if (!email || !password || !dbPassword) throw new Error('Load seo/.env first (SEONAUT_EMAIL, SEONAUT_PASSWORD, SEONAUT_DB_PASSWORD)');

// Issue types caused by crawling through the plain-HTTP, rate-limited gateway rather than the site.
const GATEWAY_ARTIFACTS = new Set(['HTTP_SCHEME', 'ERROR_HTTP_SCHEME', 'ERROR_HTTP_LINKS', 'ERROR_HTTP_FORM', 'ERROR_INSECURE_FORM', 'ERROR_SLOW_TTFB', 'ERROR_MISSING_HSTS']);
// Not actionable for this site: hashed framework assets with underscores, media-type/timeout checks on
// redirects and third-party hosts (the crawler has no direct internet route by design).
const isNoise = row => (row.type === 'ERROR_UNDERSCORE_URL' && row.url.includes('/_next/'))
  || (['ERROR_INCORRECT_MEDIA_TYPE', 'ERROR_TIMEOUT', 'ERROR_MISSING_CSP'].includes(row.type) && (row.status_code !== '200' || !row.url.startsWith(config.productionBase)));
// Map SEOnaut issue types to the categories the brief asks for.
const CATEGORY = {
  ERROR_40: 'broken-link', ERROR_50: 'broken-link', ERROR_TIMEOUT: 'broken-link', ERROR_EXTERNAL_LINK_BROKEN: 'broken-link',
  ERROR_30: 'redirect', ERROR_30x: 'redirect', ERROR_REDIRECT_CHAIN: 'redirect', ERROR_REDIRECT_LOOP: 'redirect', ERROR_EXTERNAL_LINK_REDIRECT: 'redirect', ERROR_CANONICAL_REDIRECT: 'redirect',
  ERROR_EMPTY_TITLE: 'title', ERROR_DUPLICATED_TITLE: 'title', ERROR_LONG_TITLE: 'title', ERROR_SHORT_TITLE: 'title', ERROR_MULTIPLE_TITLES: 'title',
  ERROR_EMPTY_DESCRIPTION: 'description', ERROR_DUPLICATED_DESCRIPTION: 'description', ERROR_LONG_DESCRIPTION: 'description', ERROR_SHORT_DESCRIPTION: 'description', ERROR_MULTIPLE_DESCRIPTIONS: 'description',
  ERROR_NO_H1: 'h1', ERROR_NOT_VALID_HEADINGS: 'h1',
  ERROR_ORPHAN: 'orphan',
  ERROR_LITTLE_CONTENT: 'thin', ERROR_DUPLICATED_CONTENT: 'thin',
  ERROR_CANONICAL_MISMATCH: 'canonical', ERROR_CANONICALIZED_NON_CANONICAL: 'canonical', ERROR_CANONICALIZED_NON_INDEXABLE: 'canonical', ERROR_MULTIPLE_CANONICAL_TAGS: 'canonical', ERROR_RELATIVE_CANONICAL_URL: 'canonical', ERROR_CANONICAL_ERROR: 'canonical',
  // SEOnaut's name is misleading: the URL is linked internally but canonicalises elsewhere.
  NON_CANONICAL_IN_SITEMAP: 'canonical',
  ERROR_EXTERNAL_WITHOUT_NOFOLLOW: 'info', ERROR_TOO_MANY_LINKS: 'info', ERROR_DOM_SIZE: 'info',
  ERROR_NO_INDEXABLE: 'indexability', ERROR_BLOCKED: 'indexability', ERROR_NOFOLLOW_INDEXABLE: 'indexability',
  ERROR_IMAGES_NO_ALT: 'images', ERROR_LARGE_IMAGE: 'images', ERROR_IMG_SIZE_ATTR: 'images',
};
const toProd = url => url?.replace(GATEWAY, config.productionBase) ?? url;

function sql(query) {
  const run = spawnSync('docker', ['compose', '--env-file', join(seoRoot, '.env'), '-f', join(repoRoot, 'infra/seonaut/docker-compose.yml'),
    'exec', '-T', '-e', `MYSQL_PWD=${dbPassword}`, 'db', 'mysql', '-useonaut', 'seonaut', '--batch', '--raw', '-e', query], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  if (run.status !== 0) throw new Error(`mysql failed: ${run.stderr}`);
  const [head, ...lines] = run.stdout.trimEnd().split('\n');
  if (!head) return [];
  const cols = head.split('\t');
  return lines.map(line => Object.fromEntries(line.split('\t').map((value, i) => [cols[i], value === 'NULL' ? null : value])));
}

let cookie = '';
async function ui(path, form) {
  const response = await fetch(UI + path, {
    method: form ? 'POST' : 'GET', redirect: 'manual',
    headers: { Cookie: cookie, ...(form && { 'Content-Type': 'application/x-www-form-urlencoded' }) },
    body: form ? new URLSearchParams(form) : undefined,
  });
  const set = response.headers.getSetCookie?.() ?? [];
  if (set.length) cookie = set.map(entry => entry.split(';')[0]).join('; ');
  return response;
}

async function ensureSession() {
  let response = await ui('/signin', { email, password });
  if (response.status === 303 && response.headers.get('location') === '/') return;
  response = await ui('/signup', { email, password });
  if (response.status !== 303) throw new Error(`SEOnaut sign-in/sign-up failed (${response.status})`);
}

async function ensureProject() {
  const find = () => sql(`SELECT id FROM projects WHERE url LIKE '${GATEWAY}%' ORDER BY id LIMIT 1`)[0]?.id;
  if (find()) return Number(find());
  const response = await ui('/project/add', {
    url: `${GATEWAY}/`, ignore_robotstxt: 'false', follow_nofollow: 'false', include_noindex: 'true', crawl_sitemap: 'true',
    allow_subdomains: 'false', check_external_links: 'false', basic_auth: 'false', archive: 'false',
    custom_user_agent: 'true', custom_user_agent_text: config.userAgent,
  });
  if (response.status !== 303 || !find()) throw new Error(`Creating SEOnaut project failed (${response.status})`);
  return Number(find());
}

const latestCrawl = pid => sql(`SELECT id, start, end, issues_end, total_urls FROM crawls WHERE project_id = ${pid} ORDER BY id DESC LIMIT 1`)[0];

async function crawl() {
  await ensureSession();
  const pid = await ensureProject();
  const before = latestCrawl(pid)?.id;
  const response = await ui(`/crawl/start?pid=${pid}`);
  if (!String(response.headers.get('location')).startsWith('/crawl/live')) throw new Error('SEOnaut refused to start the crawl');
  console.log(`seonaut: crawl started for project ${pid}`);
  const started = Date.now();
  for (;;) {
    await new Promise(resolve => setTimeout(resolve, 15_000));
    const current = latestCrawl(pid);
    if (current && current.id !== before && current.issues_end) { console.log(`seonaut: crawl ${current.id} finished, ${current.total_urls} URLs`); return pid; }
    if (Date.now() - started > 3 * 3600_000) throw new Error('crawl did not finish within 3h');
    console.log(`  crawling... ${current?.total_urls ?? 0} URLs`);
  }
}

function exportLatest(pid) {
  pid ??= Number(sql(`SELECT id FROM projects WHERE url LIKE '${GATEWAY}%' ORDER BY id LIMIT 1`)[0]?.id);
  const crawlRow = sql(`SELECT id, start, end, issues_end, total_urls FROM crawls WHERE project_id = ${pid} AND issues_end IS NOT NULL ORDER BY id DESC LIMIT 1`)[0];
  if (!crawlRow) throw new Error('No finished SEOnaut crawl to export');
  const rows = sql(`SELECT t.type, t.priority, p.url, p.status_code, p.redirect_url, p.title, p.description, p.canonical, p.h1, p.words, p.depth, p.noindex, p.in_sitemap
    FROM issues i JOIN issue_types t ON t.id = i.issue_type_id JOIN pagereports p ON p.id = i.pagereport_id WHERE i.crawl_id = ${crawlRow.id}`);
  const issues = rows
    .map(row => ({ ...row, url: toProd(row.url), redirect_url: toProd(row.redirect_url), canonical: toProd(row.canonical) }))
    .filter(row => !GATEWAY_ARTIFACTS.has(row.type) && !isNoise(row) && !isExcluded(row.url))
    .map(row => ({ ...row, category: CATEGORY[row.type] ?? 'other' }));
  const pages = sql(`SELECT url, status_code, redirect_url, noindex, in_sitemap, canonical, depth, words FROM pagereports WHERE crawl_id = ${crawlRow.id} AND crawled = 1`)
    .map(row => ({ ...row, url: toProd(row.url), canonical: toProd(row.canonical), redirect_url: toProd(row.redirect_url) }));
  // Brief requirement: non-canonical or noindex pages that appear in the sitemap.
  const sitemapProblems = pages.filter(page => page.in_sitemap === '1' && (page.noindex === '1' || (page.canonical && page.canonical.replace(/\/$/, '') !== page.url.replace(/\/$/, '')) || page.status_code !== '200'));
  const counts = {};
  for (const issue of issues) counts[issue.type] = (counts[issue.type] ?? 0) + 1;
  const byCategory = {};
  for (const issue of issues) byCategory[issue.category] = (byCategory[issue.category] ?? 0) + 1;

  const dir = join(seoRoot, 'data', 'seonaut');
  mkdirSync(dir, { recursive: true });
  const result = {
    exportedAt: new Date().toISOString(), crawl: { id: Number(crawlRow.id), start: crawlRow.start, end: crawlRow.end, totalUrls: Number(crawlRow.total_urls) },
    filteredGatewayArtifacts: [...GATEWAY_ARTIFACTS], counts, byCategory,
    sitemapProblems: sitemapProblems.map(page => ({ url: page.url, status: page.status_code, noindex: page.noindex === '1', canonical: page.canonical })),
    issues,
  };
  writeFileSync(join(dir, 'latest.json'), JSON.stringify(result, null, 2) + '\n');
  const csvCell = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const columns = ['category', 'type', 'priority', 'url', 'status_code', 'title', 'description', 'h1', 'words', 'depth', 'canonical', 'noindex', 'in_sitemap'];
  const csv = [columns.join(','), ...issues.map(issue => columns.map(column => csvCell(issue[column])).join(','))].join('\n') + '\n';
  writeFileSync(join(dir, 'latest.csv'), csv);
  writeFileSync(join(dir, `issues-${new Date().toISOString().slice(0, 10)}.csv`), csv);
  console.log(`seonaut: exported crawl ${crawlRow.id}: ${crawlRow.total_urls} URLs, ${issues.length} issues (${rows.length - issues.length} gateway artefacts/noise dropped)`);
  for (const [category, count] of Object.entries(byCategory).sort((a, b) => b[1] - a[1])) console.log(`  ${category}: ${count}`);
}

const command = process.argv[2];
if (command === 'crawl') exportLatest(await crawl());
else if (command === 'export') exportLatest();
else { console.error('usage: seonaut.mjs crawl|export'); process.exitCode = 2; }
