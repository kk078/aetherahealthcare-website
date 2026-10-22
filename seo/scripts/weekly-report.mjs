// Weekly consolidated SEO report from whatever data is on disk (missing sources are reported, not fatal).
// Writes seo/reports/YYYY-MM-DD.md plus a compact YYYY-MM-DD.json used for next week's deltas.
//   node seo/scripts/weekly-report.mjs [--date=YYYY-MM-DD]
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { seoRoot } from './lib/common.mjs';

const date = process.argv.find(arg => arg.startsWith('--date='))?.slice(7) ?? new Date().toISOString().slice(0, 10);
const reports = join(seoRoot, 'reports');
mkdirSync(reports, { recursive: true });
const load = path => (existsSync(join(seoRoot, path)) ? JSON.parse(readFileSync(join(seoRoot, path), 'utf8')) : null);
const ageDays = data => (data ? Math.round((Date.now() - Date.parse(data.generatedAt ?? data.exportedAt)) / 86_400_000) : null);

const lh = load('data/lhci/summary-production.json') ?? load('data/lhci/summary-local.json');
const sitemap = load('data/checks/sitemap-audit.json');
const schema = load('data/checks/structured-data.json');
const linksInternal = load('data/checks/internal-links.json');
const linkCheck = load('data/checks/link-check.json');
const a11y = load('data/checks/a11y.json');
const seonaut = load('data/seonaut/latest.json');
const gsc = load('data/gsc/latest.json');

const previousFile = readdirSync(reports).filter(name => /^\d{4}-\d{2}-\d{2}\.json$/.test(name) && name < `${date}.json`).sort().pop();
const previous = previousFile ? JSON.parse(readFileSync(join(reports, previousFile), 'utf8')) : null;

// ---- Normalised issue list: { key, source, type, path, impact (1-5), detail }
const IMPACT = {
  'sitemap-non-200': 5, 'fetch-error': 5, 'broken-internal-link': 5, 'sitemap-noindex': 5, 'sitemap-blocked-by-robots': 5, 'robots-blocks-key-section': 5, 'canonical-missing': 4, 'canonical-not-self': 4,
  'sitemap-redirect': 3, 'title-missing': 4, 'description-missing': 3, 'h1-missing': 3, 'title-duplicate': 3, 'description-duplicate': 2, 'orphan-money-page': 4, 'weak-money-page': 3,
  'lighthouse-seo-below-target': 4, 'structured-data-error': 3, 'structured-data-missing-type': 2, 'a11y': 2, 'title-too-long': 1, 'description-too-long': 1, 'title-too-short': 1, 'description-too-short': 1,
  'h1-multiple': 2, 'thin-content': 2, 'broken-external-link': 2, 'canonical-multiple': 4, 'robots-allows-private-path': 2, 'sitemap-lists-excluded-path': 3,
  'seonaut-broken-link': 5, 'seonaut-redirect': 3, 'seonaut-orphan': 3,
};
const issues = [];
const push = (source, type, path, detail = '') => issues.push({ key: `${type}|${path}`, source, type, path, impact: IMPACT[type] ?? 2, detail });
for (const issue of sitemap?.issues ?? []) push('sitemap-audit', issue.type, issue.path, issue.detail);
for (const item of linkCheck?.broken ?? []) push('linkinator', item.internal ? 'broken-internal-link' : 'broken-external-link', item.url, `${item.status} on ${item.parentCount} page(s), e.g. ${item.parents[0] ?? '?'}`);
for (const row of linksInternal?.moneyPages ?? []) if (row.status !== 'ok') push('internal-links', `${row.status}-money-page`, row.path, `${row.contextualInbound} contextual / ${row.navigationOnlyInbound} nav-only inbound`);
for (const entry of schema?.templates ?? []) {
  for (const type of entry.missingRecommendedTypes ?? []) push('structured-data', 'structured-data-missing-type', entry.path, type);
  for (const problem of (entry.problems ?? []).filter(item => item.severity === 'error')) push('structured-data', 'structured-data-error', entry.path, problem.message);
}
for (const page of a11y?.pages ?? []) for (const rule of page.rules) push('pa11y', 'a11y', page.path, `${rule.code} x${rule.count}`);
for (const row of lh?.rows ?? []) if (row.seo < 0.95) push('lighthouse', 'lighthouse-seo-below-target', row.path, `${row.preset} SEO ${Math.round(row.seo * 100)}: ${row.failingAudits.join(', ')}`);
// SEOnaut adds crawl-graph issues the sitemap pass cannot see (orphans, redirect chains, link-level 4xx).
for (const issue of (seonaut?.issues ?? []).filter(item => ['broken-link', 'redirect', 'orphan'].includes(item.category))) {
  push('seonaut', `seonaut-${issue.category}`, new URL(issue.url).pathname, issue.type);
}
const unique = [...new Map(issues.map(issue => [issue.key, issue])).values()];

// ---- Metrics for trends
const avg = (rows, field) => (rows?.length ? Math.round((rows.reduce((sum, row) => sum + (row[field] ?? 0), 0) / rows.length) * 100) : null);
const lhBy = preset => lh?.rows.filter(row => row.preset === preset);
const metrics = {
  lighthouseTarget: lh ? (load('data/lhci/summary-production.json') ? 'production' : 'local') : null,
  mobile: lh && { performance: avg(lhBy('mobile'), 'performance'), accessibility: avg(lhBy('mobile'), 'accessibility'), bestPractices: avg(lhBy('mobile'), 'bestPractices'), seo: avg(lhBy('mobile'), 'seo') },
  desktop: lh && { performance: avg(lhBy('desktop'), 'performance'), accessibility: avg(lhBy('desktop'), 'accessibility'), bestPractices: avg(lhBy('desktop'), 'bestPractices'), seo: avg(lhBy('desktop'), 'seo') },
  sitemapUrls: sitemap?.sitemapCount ?? null,
  brokenInternal: linkCheck?.summary.brokenInternal ?? null, brokenExternal: linkCheck?.summary.brokenExternal ?? null,
  pagesWithoutSchema: schema?.summary.pagesWithoutStructuredData ?? null, pagesWithSchemaErrors: schema?.summary.pagesWithErrors ?? null,
  a11yIssues: a11y?.errors ?? null, weakOrOrphanMoneyPages: linksInternal ? linksInternal.summary.weak + linksInternal.summary.orphan : null,
  seonautIssues: seonaut?.issues.length ?? null, totalIssues: unique.length,
};
const ranks = Object.fromEntries((gsc?.tracked ?? []).map(item => [item.keyword, item.position]));

// ---- Markdown
const fmt = value => (value === null || value === undefined ? 'n/a' : String(value));
const delta = (now, before, higherIsBetter = true) => {
  if (now == null || before == null) return '';
  const diff = Number((now - before).toFixed(1));
  if (!diff) return ' (=)';
  return ` (${diff > 0 ? '+' : ''}${diff} ${(diff > 0) === higherIsBetter ? '▲' : '▼'})`;
};
const pm = previous?.metrics;
const out = [];
out.push(`# SEO weekly report — ${date}`, '');
out.push(`Site: https://aetherahealthcare.com · Compared with: ${previousFile ? previousFile.replace('.json', '') : 'no previous report (baseline)'}`, '');
const sources = [['Lighthouse', lh], ['Sitemap/robots audit', sitemap], ['Structured data', schema], ['Internal links', linksInternal], ['Link check', linkCheck], ['pa11y', a11y], ['SEOnaut crawl', seonaut], ['Search Console ranks', gsc]];
out.push('**Data sources:** ' + sources.map(([name, data]) => `${name} ${data ? `✅${ageDays(data) > 8 ? ` (stale: ${ageDays(data)}d)` : ''}` : '— not available'}`).join(' · '), '');

out.push('## Executive summary — top 5 issues by impact', '');
const groups = new Map();
for (const issue of unique) { const group = groups.get(issue.type) ?? { type: issue.type, impact: issue.impact, source: issue.source, paths: [] }; group.paths.push(issue.path); groups.set(issue.type, group); }
// Severity dominates volume: impact² × log2(pages + 1), so one broken asset outranks 500 long titles.
const rank = group => group.impact ** 2 * Math.log2(group.paths.length + 1);
const top = [...groups.values()].sort((a, b) => rank(b) - rank(a)).slice(0, 5);
out.push('| # | Issue | Impact | Pages | Detected by | Examples |', '|--:|---|--:|--:|---|---|');
top.forEach((group, i) => out.push(`| ${i + 1} | ${group.type} | ${group.impact}/5 | ${group.paths.length} | ${group.source} | ${group.paths.slice(0, 3).map(path => `\`${path}\``).join(', ')} |`));
if (!top.length) out.push('| - | No issues detected | | | | |');
out.push('', 'Full prioritised list with fixes: [seo/FINDINGS.md](../FINDINGS.md).', '');

out.push('## Score trends', '');
out.push(`Lighthouse target: ${fmt(metrics.lighthouseTarget)} (median of 3 runs; averages across ${lh ? new Set(lh.rows.map(row => row.path)).size : 0} template URLs)`, '');
out.push('| Metric | Mobile | Desktop |', '|---|--:|--:|');
for (const [label, field] of [['Performance', 'performance'], ['Accessibility', 'accessibility'], ['Best practices', 'bestPractices'], ['SEO', 'seo']]) {
  out.push(`| ${label} | ${fmt(metrics.mobile?.[field])}${delta(metrics.mobile?.[field], pm?.mobile?.[field])} | ${fmt(metrics.desktop?.[field])}${delta(metrics.desktop?.[field], pm?.desktop?.[field])} |`);
}
out.push('', '| Health metric | This week | Change |', '|---|--:|---|');
for (const [label, field, higherIsBetter] of [['Sitemap URLs', 'sitemapUrls', true], ['Broken internal links', 'brokenInternal', false], ['Broken external links', 'brokenExternal', false], ['Pages without structured data', 'pagesWithoutSchema', false], ['Pages with schema errors', 'pagesWithSchemaErrors', false], ['pa11y issues (templates)', 'a11yIssues', false], ['Weak/orphan service & specialty pages', 'weakOrOrphanMoneyPages', false], ['SEOnaut issues', 'seonautIssues', false], ['Total tracked issues', 'totalIssues', false]]) {
  out.push(`| ${label} | ${fmt(metrics[field])} | ${delta(metrics[field], pm?.[field], higherIsBetter).trim() || '-'} |`);
}
if (lh) {
  out.push('', '<details><summary>Per-template Lighthouse scores</summary>', '');
  out.push(readFileSync(join(seoRoot, 'data', 'lhci', `summary-${metrics.lighthouseTarget}.md`), 'utf8'), '</details>');
}
out.push('');

out.push('## New and fixed issues', '');
if (previous) {
  const before = new Set(previous.issueKeys);
  const now = new Set(unique.map(issue => issue.key));
  const added = unique.filter(issue => !before.has(issue.key));
  const fixed = previous.issueKeys.filter(key => !now.has(key));
  out.push(`**New: ${added.length} · Fixed: ${fixed.length}**`, '');
  if (added.length) { out.push('| New issue | Page | Detail |', '|---|---|---|'); added.slice(0, 25).forEach(issue => out.push(`| ${issue.type} | \`${issue.path}\` | ${issue.detail.replace(/\|/g, '/')} |`)); if (added.length > 25) out.push(`| … ${added.length - 25} more | | |`); out.push(''); }
  if (fixed.length) { out.push('| Fixed issue | Page |', '|---|---|'); fixed.slice(0, 25).forEach(key => { const [type, path] = key.split('|'); out.push(`| ${type} | \`${path}\` |`); }); out.push(''); }
} else out.push('_Baseline week: every issue is new. Deltas start next week._', '');

out.push('## Broken links', '');
const brokenRows = (linkCheck?.broken ?? []).sort((a, b) => b.internal - a.internal || b.parentCount - a.parentCount);
if (!linkCheck) out.push('_Link check not run._');
else if (!brokenRows.length) out.push('No broken links found.');
else { out.push('| Link | Status | Type | Linked from (pages) | Example source |', '|---|--:|---|--:|---|'); brokenRows.slice(0, 30).forEach(item => out.push(`| ${item.url} | ${item.status} | ${item.internal ? 'internal' : 'external'} | ${item.parentCount} | \`${item.parents[0] ?? ''}\` |`)); }
if (linkCheck?.summary.unverifiable) out.push('', `${linkCheck.summary.unverifiable} external links could not be verified (sites that block bots, e.g. LinkedIn); not counted as broken.`);
out.push('');

out.push('## Schema coverage', '');
if (schema) {
  out.push(`${schema.summary.pagesChecked} sitemap pages checked against schema.org ${schema.schemaOrgRelease}: **${schema.summary.pagesWithoutStructuredData} without JSON-LD**, ${schema.summary.pagesWithErrors} with errors, Organization on ${schema.summary.pagesWithOrganization}, BreadcrumbList on ${schema.summary.pagesWithBreadcrumbs}.`, '');
  out.push('| Template | Types found | Missing (recommended) | Errors |', '|---|---|---|--:|');
  for (const entry of schema.templates) out.push(`| ${entry.template} | ${entry.types?.join(', ') || '—'} | ${entry.missingRecommendedTypes?.join(', ') || '—'} | ${(entry.problems ?? []).filter(item => item.severity === 'error').length} |`);
  out.push('', '| Section | Pages | With JSON-LD | With errors |', '|---|--:|--:|--:|');
  for (const [name, row] of Object.entries(schema.bySection).sort((a, b) => b[1].pages - a[1].pages)) out.push(`| \`${name}\` | ${row.pages} | ${row.withJsonLd} | ${row.withErrors} |`);
} else out.push('_Structured-data check not run._');
out.push('');

out.push('## Rank changes (Google Search Console, US)', '');
if (gsc) {
  const before = previous?.ranks ?? {};
  out.push(`Average position ${gsc.range.startDate} → ${gsc.range.endDate}. Lower is better; "—" = no impressions.`, '');
  out.push('| Keyword | Cluster | Position | Change | Clicks | Impressions | Ranking page |', '|---|---|--:|---|--:|--:|---|');
  const rows = [...gsc.tracked].sort((a, b) => (a.position ?? 999) - (b.position ?? 999));
  for (const row of rows) out.push(`| ${row.keyword} | ${row.cluster} | ${row.position ?? '—'} | ${delta(row.position, before[row.keyword], false).trim() || '-'} | ${row.clicks} | ${row.impressions} | ${row.rankingPage ? `\`${row.rankingPage}\`` : '—'} |`);
} else out.push('_Search Console not connected yet (free; see seo/README.md#rank-tracking). No paid SERP API is used._');
out.push('');

if (seonaut) {
  out.push('## Full-site crawl (SEOnaut)', '');
  out.push(`Crawl ${seonaut.crawl.id} finished ${seonaut.crawl.end}: ${seonaut.crawl.totalUrls} URLs, ${seonaut.issues.length} issues after removing gateway artefacts.`, '');
  out.push('| Category | Issues |', '|---|--:|');
  for (const [category, count] of Object.entries(seonaut.byCategory).sort((a, b) => b[1] - a[1])) out.push(`| ${category} | ${count} |`);
  if (seonaut.sitemapProblems.length) out.push('', `Sitemap URLs that are noindex, non-canonical or non-200: ${seonaut.sitemapProblems.length}`);
  out.push('');
}

writeFileSync(join(reports, `${date}.md`), out.join('\n'));
writeFileSync(join(reports, `${date}.json`), JSON.stringify({ date, metrics, ranks, issueKeys: unique.map(issue => issue.key).sort() }, null, 1) + '\n');
console.log(`weekly-report: wrote seo/reports/${date}.md (${unique.length} issues, ${top.length} in summary)`);
