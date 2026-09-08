import { safeTrackingId } from '@/lib/trackingConfig';
import Script from 'next/script';
/**
 * Cloudflare Web Analytics beacon.
 *
 * Privacy-first, cookieless page + Web-Vitals analytics. Renders the beacon only
 * when a site token is provided via NEXT_PUBLIC_CF_BEACON_TOKEN (inlined at build
 * time for the static export). With no token set it renders nothing, so this is
 * safe to ship before the token exists.
 *
 * Set NEXT_PUBLIC_CF_BEACON_TOKEN at build time. AnalyticsGate mounts this
 * component only after consent. Disable dashboard automatic injection and
 * zone-level tag injection, which would bypass the consent gate.
 *
 * Get a token: Cloudflare dashboard → Web Analytics → Add a site →
 * aetherahealthcare.com → copy the value from the `data-cf-beacon` snippet.
 */
export default function CloudflareAnalytics() {
  const token = safeTrackingId(process.env.NEXT_PUBLIC_CF_BEACON_TOKEN);
  if (!token) return null;

  return (
    <Script id="aethera-cloudflareanalytics-1" strategy="afterInteractive"
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={`{"token": "${token}"}`}
    />
  );
}
