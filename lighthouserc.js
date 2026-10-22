// Lighthouse CI config for aetherahealthcare.com. Tooling lives in seo/ (own lockfile, outside the
// site's release audit); see seo/README.md. Two switches, both env vars:
//   SEO_LH_TARGET = local (default; serves the static export in out/) | production
//   SEO_LH_PRESET = mobile (default) | desktop
/* eslint-disable @typescript-eslint/no-require-imports -- LHCI loads this file as CommonJS */
const path = require('node:path');
const urls = require('./seo/config/urls.json');

const target = process.env.SEO_LH_TARGET === 'production' ? 'production' : 'local';
const preset = process.env.SEO_LH_PRESET === 'desktop' ? 'desktop' : 'mobile';
const base = target === 'production' ? urls.productionBase : urls.localBase;
const excluded = urls.excludePatterns.map(pattern => new RegExp(pattern));

for (const { path: page } of urls.templates) {
  if (excluded.some(pattern => pattern.test(page))) throw new Error(`Excluded path in Lighthouse URL list: ${page}`);
}

// A browser-shaped UA is needed for realistic rendering; the AetheraSEOBot token keeps it identifiable
// so the Cloudflare WAF skip rule (seo/README.md) can match it.
const chrome = 'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0';
const userAgent = preset === 'desktop'
  ? `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ${chrome} Safari/537.36 ${urls.userAgent}`
  : `Mozilla/5.0 (Linux; Android 11; moto g power (2022)) ${chrome} Mobile Safari/537.36 ${urls.userAgent}`;

const warn = minScore => ['warn', { minScore, aggregationMethod: 'median-run' }];
const maxMs = maxNumericValue => ['warn', { maxNumericValue, aggregationMethod: 'median-run' }];

module.exports = {
  ci: {
    collect: {
      url: urls.templates.map(({ path: page }) => base + page),
      numberOfRuns: 3,
      ...(target === 'local' && {
        startServerCommand: 'npm run serve:export',
        startServerReadyPattern: 'Static export at',
      }),
      settings: {
        ...(preset === 'desktop' && { preset: 'desktop' }),
        emulatedUserAgent: userAgent,
        chromeFlags: '--no-sandbox --headless=new',
        skipAudits: ['bf-cache'],
      },
    },
    assert: {
      assertions: {
        'categories:seo': ['error', { minScore: 0.95, aggregationMethod: 'median-run' }],
        'categories:accessibility': warn(0.9),
        'categories:best-practices': warn(0.9),
        'categories:performance': warn(preset === 'mobile' ? 0.85 : 0.9),
        'largest-contentful-paint': maxMs(2500),
        'total-blocking-time': maxMs(200),
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1, aggregationMethod: 'median-run' }],
        'meta-description': 'error',
        canonical: 'error',
        'is-crawlable': 'error',
        'robots-txt': 'error',
        'image-alt': 'error',
      },
    },
    upload: {
      // Default store is local files (CI artifacts / PR comment). Pushing to the self-hosted LHCI
      // server is a second `lhci upload --target=lhci` step; see seo/scripts/lhci.sh.
      target: 'filesystem',
      outputDir: path.join(__dirname, 'seo', 'data', 'lhci', `${target}-${preset}`),
    },
  },
};
