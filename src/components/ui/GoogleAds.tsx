import { safeTrackingId } from '@/lib/trackingConfig';
import Script from 'next/script';
/**
 * Unified Google Tag (gtag.js) for Google Analytics 4 (GA4) and Google Ads.
 * Loaded by AnalyticsGate only after optional analytics consent.
 * Page views are emitted explicitly for client-side navigation.
 *
 * Supports:
 *   - Google Analytics 4: NEXT_PUBLIC_GA_MEASUREMENT_ID (e.g. "G-XXXXXXXXXX")
 *   - Google Ads:         NEXT_PUBLIC_GOOGLE_ADS_ID (defaults to "AW-18295729018")
 *
 * If either or both are present, gtag.js is loaded and configured for both.
 * Conversions are fired via trackConversion() in src/lib/gtag.ts.
 */
export default function GoogleAds() {
  const gaId = safeTrackingId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID || 'G-898JNZJ6LJ');
  const adsId = safeTrackingId(process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18295729018');
  const primaryId = gaId || adsId;

  if (!primaryId) return null;

  return (
    <>
      <Script id="aethera-googleads-2" strategy="afterInteractive" async src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`} />
      <Script id="aethera-googleads-3" strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html:
            `window.dataLayer=window.dataLayer||[];` +
            `function gtag(){dataLayer.push(arguments);}` +
            `gtag('js',new Date());` +
            (gaId ? `gtag('config','${gaId}',{send_page_view:false});` : '') +
            (adsId && adsId !== gaId ? `gtag('config','${adsId}');` : ''),
        }}
      />
    </>
  );
}

