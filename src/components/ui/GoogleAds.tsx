/**
 * Google Ads global site tag (gtag.js). Loads only when
 * NEXT_PUBLIC_GOOGLE_ADS_ID is set (e.g. "AW-1234567890"); renders nothing
 * otherwise, so it's safe to ship before the account/ID exists. Powers Google
 * Ads conversion tracking and remarketing audiences. Conversions are fired via
 * trackConversion() in src/lib/gtag.ts.
 */
export default function GoogleAds() {
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  if (!id) return null;

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${id}`} />
      <script
        dangerouslySetInnerHTML={{
          __html:
            `window.dataLayer=window.dataLayer||[];` +
            `function gtag(){dataLayer.push(arguments);}` +
            `gtag('js',new Date());` +
            `gtag('config','${id}');`,
        }}
      />
    </>
  );
}
