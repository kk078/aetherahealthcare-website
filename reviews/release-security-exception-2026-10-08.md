Owner-approved release change (8 October 2026): replace CI's `npm audit --audit-level=high` with `node scripts/release-audit.mjs`.

The owner explicitly approved the restricted exception in this session. Automated regression tests verify that production dependencies, different advisories, missing dependency paths and expiry remain blocking. It allows only GHSA-vfj7-8cjw-p6xm in the dev-only braces → micromatch → fast-glob → Next ESLint chain, until 2026-10-15 00:00 UTC. Every affected installed package must be marked dev-only in package-lock.json. All production findings, unrelated advisories, unknown responses and audit failures still block deployment. The default Next ESLint configuration does not configure root-directory glob patterns; the vulnerable glob helper is not called for this project's default root. The package does not enter the static website or Cloudflare Functions bundle.

GitHub lists no patched braces version: https://github.com/advisories/GHSA-vfj7-8cjw-p6xm . Upstream issue is open: https://github.com/micromatch/braces/issues/70 . The published package remains 3.0.3.

Next 16.3.8 and updated dependencies address other available fixes. Sharp is explicitly updated to 0.35.5 rather than downgrading the deployment CLI. The unpatched lint dependency is the only proposed exception; no general audit suppression or --force dependency downgrade is proposed.
