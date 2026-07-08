'use client';

/**
 * Google Ads global site tag (gtag.js). Rendered once site-wide from the root
 * layout, so it appears on every page exactly once. Loads only when
 * NEXT_PUBLIC_GOOGLE_ADS_ID is set (e.g. "AW-1234567890"); renders nothing
 * otherwise, so it's safe to ship before the account/ID exists. Powers Google
 * Ads conversion tracking and remarketing audiences. Conversions are fired via
 * trackConversion() in src/lib/gtag.ts.
 *
 * Uses next/script with the "afterInteractive" strategy — the Next.js-recommended
 * way to load gtag early and reliably (Next injects it high in the document and
 * dedupes it), the App Router equivalent of Google's "paste immediately after
 * the head element" instruction for static sites.
 */
import Script from 'next/script';

export default function GoogleAds() {
  // Defaults to the live Google Ads ID (public — it appears in page source
  // anyway) so the tag ships on every build path; set NEXT_PUBLIC_GOOGLE_ADS_ID
  // to override.
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18295729018';
  if (!id) return null;

  const init =
    'window.dataLayer=window.dataLayer||[];' +
    'function gtag(){dataLayer.push(arguments);}' +
    "gtag('js',new Date());" +
    `gtag('config','${id}');`;

  return (
    <>
      <Script
        id="google-ads-gtag"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
      />
      <Script
        id="google-ads-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: init }}
      />
    </>
  );
}
