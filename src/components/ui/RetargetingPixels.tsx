/**
 * B2B retargeting pixels — LinkedIn Insight Tag and Meta (Facebook) Pixel.
 *
 * Rendered once site-wide from the root layout, so the tags appear in the
 * static HTML of every page (emitted as real <script> tags so each network's
 * tag detector can see them). Each network is gated on its own env var and
 * no-ops safely when unset — safe to ship before the IDs exist.
 *
 *   NEXT_PUBLIC_LINKEDIN_PARTNER_ID  — LinkedIn Campaign Manager → Insight Tag
 *   NEXT_PUBLIC_META_PIXEL_ID        — Meta Events Manager → Pixel / dataset ID
 *
 * These IDs are public (they appear in page source on every site that uses
 * them), so it is safe to inline them once known.
 */
export default function RetargetingPixels() {
  const linkedInId = process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '';
  const metaId = process.env.NEXT_PUBLIC_META_PIXEL_ID || '';

  if (!linkedInId && !metaId) return null;

  return (
    <>
      {/* ---- LinkedIn Insight Tag ---- */}
      {linkedInId && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html:
                `_linkedin_partner_id="${linkedInId}";` +
                `window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];` +
                `window._linkedin_data_partner_ids.push(_linkedin_partner_id);` +
                `(function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]}` +
                `var s=document.getElementsByTagName("script")[0];var b=document.createElement("script");` +
                `b.type="text/javascript";b.async=true;` +
                `b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";` +
                `s.parentNode.insertBefore(b,s);})(window.lintrk);`,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://px.ads.linkedin.com/collect/?pid=${linkedInId}&fmt=gif`}
            />
          </noscript>
        </>
      )}

      {/* ---- Meta (Facebook) Pixel ---- */}
      {metaId && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html:
                `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?` +
                `n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;` +
                `n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;` +
                `t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,` +
                `'script','https://connect.facebook.net/en_US/fbevents.js');` +
                `fbq('init','${metaId}');fbq('track','PageView');`,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt=""
              src={`https://www.facebook.com/tr?id=${metaId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}
    </>
  );
}
