// Accessibility check with pa11y-ci (axe + htmlcs runners, WCAG2AA) on the representative template URLs.
// Output: seo/data/checks/a11y.json (pa11y-ci JSON + per-URL summary)
import { spawnSync } from 'node:child_process';
import { closeSync, mkdirSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { baseUrl, config, isExcluded, seoRoot, userAgent, writeJson } from './lib/common.mjs';

const root = baseUrl();
const urls = config.templates.map(({ path }) => root + path).filter(url => !isExcluded(url));
const chromePath = process.env.CHROME_PATH || ['/usr/bin/google-chrome', '/usr/bin/chromium'].find(path => { try { readFileSync(path); return true; } catch { return false; } });
const pa11yConfig = {
  defaults: {
    standard: 'WCAG2AA', runners: ['axe', 'htmlcs'], timeout: 60_000, wait: 1500,
    userAgent, headers: { 'User-Agent': userAgent },
    chromeLaunchConfig: { ...(chromePath && { executablePath: chromePath }), args: ['--no-sandbox', '--disable-dev-shm-usage'] },
    // Third-party consent/chat widgets are out of our control and not part of the template markup.
    hideElements: 'iframe',
  },
  urls,
};
const raw = join(seoRoot, 'data', 'raw');
mkdirSync(raw, { recursive: true });
writeFileSync(join(raw, 'pa11yci.json'), JSON.stringify(pa11yConfig, null, 2));
// pa11y-ci exits 2 when issues exist and calls process.exit() before a large piped stdout is flushed,
// so its JSON goes to a file descriptor rather than a pipe.
const outPath = join(raw, 'pa11y-results.json');
const outFd = openSync(outPath, 'w');
const run = spawnSync(join(seoRoot, 'node_modules', '.bin', 'pa11y-ci'), ['--config', join(raw, 'pa11yci.json'), '--json'], { stdio: ['ignore', outFd, 'pipe'], encoding: 'utf8' });
closeSync(outFd);
if (run.error) throw run.error;
let report;
try { report = JSON.parse(readFileSync(outPath, 'utf8')); } catch { throw new Error(`pa11y-ci produced no JSON (exit ${run.status}):\n${run.stderr}`); }

const pages = Object.entries(report.results).map(([url, items]) => {
  const list = Array.isArray(items) ? items : [];
  const failed = !Array.isArray(items);
  const byCode = new Map();
  for (const item of list) byCode.set(item.code, { code: item.code, message: item.message, runner: item.runner, count: (byCode.get(item.code)?.count ?? 0) + 1, sample: byCode.get(item.code)?.sample ?? item.selector });
  return { path: new URL(url).pathname, issues: list.length, failedToLoad: failed, error: failed ? String(items?.message ?? items) : undefined, rules: [...byCode.values()].sort((a, b) => b.count - a.count) };
});
await writeJson(join(seoRoot, 'data', 'checks', 'a11y.json'), { generatedAt: new Date().toISOString(), base: root, total: report.total, errors: report.errors, pages });
console.log(`a11y: ${pages.length} URLs, ${report.errors} issues`);
for (const page of pages) console.log(`  ${page.path}: ${page.failedToLoad ? 'FAILED TO LOAD ' + page.error : page.issues + ' issues'}`);
