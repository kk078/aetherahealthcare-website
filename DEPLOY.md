# Website build and release

The Next.js site exports static pages to `out/`. Cloudflare Pages Functions in `functions/api/` handle lead ingestion, CRM retries, and assistant proxying. CRM and model-provider internals remain separate services.

## Checks

Use Node 22 and `npm ci`.

```sh
npm run check
npm audit --audit-level=high
npm run build
npx wrangler pages functions build functions --outdir /tmp/aethera-functions
npm run test:e2e
npx playwright test tests/e2e/enhancement-regressions.spec.ts --project=mobile-chrome
```

Playwright uses the built export on `http://localhost:3100`. It does not reuse an unrelated server. Page tests mock `/api/leads` and `/api/assistant`. Production API checks require `E2E_PRODUCTION_CHECKS=1`; live form submissions require an additional explicit opt-in. Reports and screenshots are written under `/tmp`.

## Production prerequisites

Set GitHub repository secrets:

- `CLOUDFLARE_API_TOKEN`: permission to edit the Pages project and create/query/migrate D1 databases in this account.
- `CLOUDFLARE_ACCOUNT_ID`.
- `RATE_LIMIT_SECRET`: an independently generated random secret of at least 32 bytes for short-lived IP hashes.
- `LEAD_RETRY_SECRET`: a different random secret of at least 32 bytes; the scheduled retry job authenticates with it.

Use GitHub repository variables for the optional `NEXT_PUBLIC_*` tracking IDs and conversion labels listed in `.env.example`. The verify workflow defines build-time configuration once. Blank optional vendor IDs disable their integration.

`Verify and release website` runs lint (including warnings), typechecking, unit tests, dependency audit, production build, Functions compilation, desktop E2E and focused mobile E2E. Deployment depends on that job and downloads the exact verified static artifact. The old independent deployment workflow and auto-blog deployment path have been removed.

The deploy job runs `scripts/prepare-deploy.mjs`, which creates or finds the `aethera-website-leads` D1 database and puts the two server secrets into the Pages project. It generates `wrangler.jsonc` with the `LEADS_DB` binding and reads the project’s configured production branch instead of assuming `main`. Wrangler applies the SQL migrations and deploys the verified site plus Functions. Provisioning fails before deployment if prerequisites are missing; it does not print credentials.

For a manual release, first run every check above, then run the same prepare/migrate/deploy commands from `.github/workflows/ci.yml`. Do not deploy `out/` without the Functions and D1 binding: the lead endpoint deliberately returns 503 instead of losing or broadcasting personal information.

## Lead operations

The endpoint validates origin, body size, identity fields and a per-IP hourly rate limit. One submission ID produces one durable database record. The browser keeps only an opaque retry ID and hash; it does not persist submitted fields. D1 acknowledgement is independent of CRM availability. Pending requests are retried by the authenticated scheduled job every 15 minutes. The CRM receives `Idempotency-Key` and `submissionId`; verify that the separately maintained CRM honors that key, since transport timeouts can otherwise cause duplicate CRM records under at-least-once delivery.

The retry endpoint returns only counts. Check persistent pending counts and `last_error` via authorized D1 access, never a public lead listing. A lease protects against simultaneous retries. Delivered payloads are deleted after 30 days by the retry job; request-limit hashes expire after two hours. Investigate pending leads promptly and establish CRM retention with the service owner.

Optional Pages runtime settings: `CRM_API_URL` (HTTPS, default existing public website ingest base), `CRM_API_TOKEN` (server-only), `ASSISTANT_URL` (HTTPS, default existing assistant Worker). Configure these in Pages; no model credential belongs in `NEXT_PUBLIC_*`.

Before production rollout, rotate any AI credential previously exposed to browsers; review and retire the old ntfy topics and external form routing. Disable Cloudflare dashboard automatic beacon injection (and any zone-level tag injection) so consent is controlled by this code. These are account settings, not changes a website build can enforce.

## Content review

Auto-blog creates unpublished JSON drafts in `content/drafts/` and opens a draft-content PR. It cannot modify live posts or deploy. A reviewer adds their actual name, review date, primary source URLs and `status: "approved"` after reviewing the content. Run `node scripts/publish-blog-draft.mjs content/drafts/slug.json` to promote it into source; the normal PR/release checks still apply.

`src/lib/toolRegistry.ts` is the shared directory/search and evidence registry. Rule review dates remain empty until a qualified reviewer validates applicability. Do not fill dates or reviewer names simply to remove the educational notice. `npm run routes:generate` updates the sitemap route registry. Campaign pages and the telemetry/portal demonstrations are intentionally excluded from indexing.
