/**
 * Google Ads global site tag (gtag.js). Rendered once site-wide from the root
 * layout, so it appears in the static HTML of every page — Google's standard
 * "paste on every page" tag, emitted as real <script> tags in the page source
 * (so Google's tag detector and any crawler can see it).
 *
 * Defaults to the live Google Ads ID (public — it appears in page source
 * anyway) so the tag ships on every build path; set NEXT_PUBLIC_GOOGLE_ADS_ID
 * to override. Conversions are fired via trackConversion() in src/lib/gtag.ts.
 */
export default function GoogleAds() {
  const id = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18295729018';
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
