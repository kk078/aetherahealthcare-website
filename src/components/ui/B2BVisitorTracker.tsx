import { safeTrackingId } from '@/lib/trackingConfig';
import Script from 'next/script';
/**
 * B2B Visitor Deanonymization & Identity Resolution Tracker.
 *
 * Supports:
 *   - RB2B (Retention.com): Person-level US visitor deanonymization
 *     (identifies individual LinkedIn profile & business email)
 *   - Apollo.io: Company & contact visitor intelligence
 *   - Leadfeeder (Dealfront): Account-level visitor tracking
 *   - Snitcher: Account-level visitor tracking
 *
 * Each integration is gated on its corresponding public environment variable
 * and safely no-ops with zero runtime overhead if unset.
 */
export default function B2BVisitorTracker() {
  const rb2bKey = safeTrackingId(process.env.NEXT_PUBLIC_RB2B_KEY || '');
  const apolloId = safeTrackingId(process.env.NEXT_PUBLIC_APOLLO_ID || '');
  const leadfeederId = safeTrackingId(process.env.NEXT_PUBLIC_LEADFEEDER_ID || '');
  const snitcherId = safeTrackingId(process.env.NEXT_PUBLIC_SNITCHER_ID || '');

  if (!rb2bKey && !apolloId && !leadfeederId && !snitcherId) {
    return null;
  }

  return (
    <>
      {rb2bKey && <Script id="aethera-rb2b" strategy="afterInteractive" src={`https://ddwl4m2hdecbv.cloudfront.net/b/${encodeURIComponent(rb2bKey)}/${encodeURIComponent(rb2bKey)}.js.gz`} />}

      {/* Apollo.io: Website Visitor Intelligence */}
      {apolloId && (
        <Script id="aethera-b2bvisitortracker-1" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n;o.async=!0;o.defer=!0;o.onload=function(){if(window.trackingFunctions){window.trackingFunctions.onLoad({appId:"${apolloId}"})}};document.head.appendChild(o)}initApollo();`,
          }}
        />
      )}

      {/* Leadfeeder (Dealfront): Company IP Deanonymization */}
      {leadfeederId && (
        <Script id="aethera-b2bvisitortracker-2" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(ss,ex){window.ldfdr=window.ldfdr||function(){(ldfdr._q=ldfdr._q||[]).push([].slice.call(arguments))};(function(d,s){var fs=d.getElementsByTagName(s)[0];function ce(src){var cs=d.createElement(s);cs.async=1;cs.src=src;setTimeout(function(){fs.parentNode.insertBefore(cs,fs)},1)}ce("https://sc.lfeeder.com/lftracker_v1_"+ss+(ex?"_"+ex:"")+".js")})(document,"script")})("${leadfeederId}");`,
          }}
        />
      )}

      {/* Snitcher: Account Tracking */}
      {snitcherId && (
        <Script id="aethera-b2bvisitortracker-3" strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(s,n,i,t,c,h){s.SnitcherObject=i;s[i]||(s[i]=function(){(s[i].q=s[i].q||[]).push(arguments)});s[i].l=+new Date;c=n.createElement(t);h=n.getElementsByTagName(t)[0];c.src="https://snitcher.com/site/${snitcherId}.js";c.async=1;h.parentNode.insertBefore(c,h)}(window,document,"snitcher","script");`,
          }}
        />
      )}
    </>
  );
}
