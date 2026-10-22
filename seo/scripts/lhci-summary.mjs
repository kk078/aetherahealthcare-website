// Summarise LHCI filesystem output (median/representative run per URL) into JSON + a markdown table.
//   node seo/scripts/lhci-summary.mjs [local|production]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { seoRoot, templateFor } from './lib/common.mjs';

const target = process.argv[2] || 'local';
const dir = join(seoRoot, 'data', 'lhci');
const rows = [];

for (const preset of ['mobile', 'desktop']) {
  const manifestPath = join(dir, `${target}-${preset}`, 'manifest.json');
  if (!existsSync(manifestPath)) continue;
  const assertPath = join(dir, `${target}-${preset}.assert.txt`);
  const assertText = existsSync(assertPath) ? readFileSync(assertPath, 'utf8').replace(/\x1b\[[0-9;]*m/g, '') : '';
  for (const entry of JSON.parse(readFileSync(manifestPath, 'utf8')).filter(item => item.isRepresentativeRun)) {
    const lhr = JSON.parse(readFileSync(entry.jsonPath, 'utf8'));
    const failing = Object.values(lhr.audits)
      .filter(audit => audit.score !== null && audit.score < 0.9 && ['binary', 'numeric'].includes(audit.scoreDisplayMode))
      .filter(audit => ['seo', 'accessibility', 'best-practices'].some(category => lhr.categories[category].auditRefs.some(ref => ref.id === audit.id && ref.weight > 0)))
      .map(audit => audit.id);
    const path = new URL(entry.url).pathname;
    rows.push({
      preset, url: entry.url, path, template: templateFor(path),
      performance: entry.summary.performance, accessibility: entry.summary.accessibility,
      bestPractices: entry.summary['best-practices'], seo: entry.summary.seo,
      lcpMs: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
      cls: Number(lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
      tbtMs: Math.round(lhr.audits['total-blocking-time'].numericValue),
      failingAudits: failing,
      assertionFailed: assertText.includes(entry.url),
    });
  }
}

const score = value => (value == null ? 'n/a' : Math.round(value * 100));
const flag = (value, limit) => (value > limit ? `**${value}**` : `${value}`);
const lines = [
  `| Template | Preset | Perf | A11y | BP | SEO | LCP ms | CLS | TBT ms | Failing SEO/A11y/BP audits |`,
  `|---|---|--:|--:|--:|--:|--:|--:|--:|---|`,
  ...rows.map(row => `| ${row.template} | ${row.preset} | ${score(row.performance)} | ${score(row.accessibility)} | ${score(row.bestPractices)} | ${score(row.seo)} | ${flag(row.lcpMs, 2500)} | ${flag(row.cls, 0.1)} | ${flag(row.tbtMs, 200)} | ${row.failingAudits.join(', ') || '-'} |`),
];
writeFileSync(join(dir, `summary-${target}.json`), JSON.stringify({ target, generatedAt: new Date().toISOString(), rows }, null, 2));
writeFileSync(join(dir, `summary-${target}.md`), lines.join('\n') + '\n');
console.log(lines.join('\n'));
