/**
 * Cloudflare Web Analytics beacon.
 *
 * Privacy-first, cookieless page + Web-Vitals analytics. Renders the beacon only
 * when a site token is provided via NEXT_PUBLIC_CF_BEACON_TOKEN (inlined at build
 * time for the static export). With no token set it renders nothing, so this is
 * safe to ship before the token exists.
 *
 * Two ways to turn analytics on:
 *   1. Code path (this component): set NEXT_PUBLIC_CF_BEACON_TOKEN in
 *      .env.production (and Cloudflare Pages env vars), then rebuild/deploy.
 *   2. Dashboard path (no code, no token needed): Cloudflare dashboard →
 *      Analytics & Logs → Web Analytics → enable "Automatic setup" for
 *      aetherahealthcare.com. If you use this path, leave the token unset.
 *
 * Get a token: Cloudflare dashboard → Web Analytics → Add a site →
 * aetherahealthcare.com → copy the value from the `data-cf-beacon` snippet.
 */
export default function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN;
  if (!token) return null;

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
    />
  );
}
