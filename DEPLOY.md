# Aethera Healthcare — Deployment Quick Reference

## Prerequisites

```bash
# Set env vars (or use .env file)
export CLOUDFLARE_API_TOKEN=<token>
export CLOUDFLARE_ACCOUNT_ID=<account_id>
```

---

## 1. Deploy Cloudflare Worker

```bash
cd aethera-worker
npx wrangler@3 deploy               # → production (aethera-forms)
npx wrangler@3 deploy --config wrangler.staging.toml  # → staging
```

**Rollback Worker:**
```bash
npx wrangler@3 rollback
```

**Worker secrets (one-time setup or rotation):**
```bash
npx wrangler@3 secret put ADMIN_API_KEY
npx wrangler@3 secret put RESEND_API_KEY
npx wrangler@3 secret put SENTRY_DSN     # optional
```

---

## 2. Build & Deploy Next.js Site

```bash
# From repo root
npm run build                             # generates ./out/
npx wrangler@3 pages deploy out \
  --project-name aetherahealthcare-website \
  --branch main
```

**Check deployment status:**
```bash
npx wrangler@3 pages deployment list --project-name aetherahealthcare-website
```

---

## 3. D1 Database

```bash
# Query production DB
npx wrangler@3 d1 execute aethera-crm-db \
  --command "SELECT COUNT(*) FROM website_submissions;" --remote

# Apply schema to staging DB
npx wrangler@3 d1 execute aethera-crm-db-staging \
  --file=aethera-worker/schema.sql --remote

# Create staging DB (one-time)
npx wrangler@3 d1 create aethera-crm-db-staging
```

---

## 4. Admin Dashboard (local)

```bash
cd aethera-admin
npm install
node server.js
# → http://localhost:3001
```

---

## 5. Tests

```bash
# Worker unit tests (Vitest)
cd aethera-worker && npm test

# E2E smoke tests (Playwright — production)
npx playwright test tests/e2e/smoke.spec.ts tests/e2e/security-headers.spec.ts

# Full E2E suite
npx playwright test

# Run against local/staging
BASE_URL=http://localhost:3000 npx playwright test
```

---

## 6. GitHub Secrets Required for CI/CD

Add these in GitHub → Settings → Secrets → Actions:

| Secret | Value |
|--------|-------|
| `CLOUDFLARE_API_TOKEN` | From Cloudflare dashboard |
| `CLOUDFLARE_ACCOUNT_ID` | `2c268625d9e6e4c084ff296fcdf5f3bd` |

---

## 7. Live URLs

| Resource | URL |
|----------|-----|
| Production site | https://aetherahealthcare.com |
| Worker | https://aethera-forms.aetherahealthcare.workers.dev |
| Worker health | https://aethera-forms.aetherahealthcare.workers.dev/api/health |
| Admin dashboard | http://localhost:3001 |
| Cloudflare dashboard | https://dash.cloudflare.com |

---

## 8. Deployment Checklist

- [ ] Worker deployed and `/api/health` returns `ok: true`
- [ ] Next.js build succeeds (`npm run build`)
- [ ] Pages deployment live at aetherahealthcare.com
- [ ] Security headers present (`curl -sI https://aetherahealthcare.com | grep -i strict`)
- [ ] Contact form submits successfully (test email)
- [ ] Portal magic link flow works end-to-end
- [ ] Smoke tests pass (`npx playwright test tests/e2e/smoke.spec.ts`)
