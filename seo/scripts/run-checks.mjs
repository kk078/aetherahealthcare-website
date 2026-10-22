// Phase 3 orchestrator: snapshot -> sitemap audit, structured data, internal links; then link check
// and pa11y. Each step runs even if an earlier analysis step fails; exit code is non-zero if any failed.
//   node seo/scripts/run-checks.mjs [--only=step,step]   (SEO_BASE_URL overrides production)
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { seoRoot } from './lib/common.mjs';

const steps = ['site-snapshot', 'sitemap-audit', 'structured-data', 'internal-links', 'link-check', 'a11y'];
const only = process.argv.find(arg => arg.startsWith('--only='))?.slice(7).split(',');
let failed = 0;
const skip = new Set();
for (const step of steps.filter(name => !only || only.includes(name))) {
  if (skip.has(step)) { console.log(`\n== ${step}: skipped (no snapshot)`); continue; }
  const started = Date.now();
  console.log(`\n== ${step}`);
  let result = spawnSync(process.execPath, [join(seoRoot, 'scripts', `${step}.mjs`)], { stdio: 'inherit' });
  // linkinator is occasionally flaky (see link-check.mjs); one retry before reporting failure.
  if (result.status !== 0 && step === 'link-check') {
    console.log('== link-check failed; retrying once');
    result = spawnSync(process.execPath, [join(seoRoot, 'scripts', `${step}.mjs`)], { stdio: 'inherit' });
  }
  console.log(`== ${step}: ${result.status === 0 ? 'ok' : 'FAILED'} in ${Math.round((Date.now() - started) / 1000)}s`);
  if (result.status !== 0) {
    failed += 1;
    if (step === 'site-snapshot') { console.error('snapshot failed; skipping dependent analyses'); ['sitemap-audit', 'structured-data', 'internal-links'].forEach(name => skip.add(name)); }
  }
}
process.exitCode = failed ? 1 : 0;
