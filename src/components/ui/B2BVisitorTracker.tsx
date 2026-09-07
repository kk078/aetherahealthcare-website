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
  const rb2bKey = process.env.NEXT_PUBLIC_RB2B_KEY || '';
  const apolloId = process.env.NEXT_PUBLIC_APOLLO_ID || '';
  const leadfeederId = process.env.NEXT_PUBLIC_LEADFEEDER_ID || '';
  const snitcherId = process.env.NEXT_PUBLIC_SNITCHER_ID || '';

  if (!rb2bKey && !apolloId && !leadfeederId && !snitcherId) {
    return null;
  }

  return (
    <>
      {/* RB2B: Person-level LinkedIn profile & business email resolution */}
      {rb2bKey && (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){var reb2b=window.reb2b=window.reb2b||[];if(reb2b.invoked)return;reb2b.invoked=!0;reb2b.methods=["identify","collect"];reb2b.factory=function(method){return function(){var args=Array.prototype.slice.call(arguments);args.unshift(method);reb2b.push(args);return reb2b}};for(var i=0;i<reb2b.methods.length;i++){var key=reb2b.methods[i];reb2b[key]=reb2b.factory(key)}reb2b.load=function(key){var script=document.createElement("script");script.type="text/javascript";script.async=!0;script.src="https://s3-us-west-2.amazonaws.com/b2bjsstore/b/"+key+"/reb2b.js.gz";var first=document.getElementsByTagName("script")[0];first.parentNode.insertBefore(script,first)};reb2b.SNIPPET_VERSION="1.0.1";reb2b.load("${rb2bKey}");}();`,
          }}
        />
      )}

      {/* Apollo.io: Website Visitor Intelligence */}
      {apolloId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `function initApollo(){var n=Math.random().toString(36).substring(7),o=document.createElement("script");o.src="https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache="+n;o.async=!0;o.defer=!0;o.onload=function(){if(window.trackingFunctions){window.trackingFunctions.onLoad({appId:"${apolloId}"})}};document.head.appendChild(o)}initApollo();`,
          }}
        />
      )}

      {/* Leadfeeder (Dealfront): Company IP Deanonymization */}
      {leadfeederId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(ss,ex){window.ldfdr=window.ldfdr||function(){(ldfdr._q=ldfdr._q||[]).push([].slice.call(arguments))};(function(d,s){var fs=d.getElementsByTagName(s)[0];function ce(src){var cs=d.createElement(s);cs.async=1;cs.src=src;setTimeout(function(){fs.parentNode.insertBefore(cs,fs)},1)}ce("https://sc.lfeeder.com/lftracker_v1_"+ss+(ex?"_"+ex:"")+".js")})(document,"script")})("${leadfeederId}");`,
          }}
        />
      )}

      {/* Snitcher: Account Tracking */}
      {snitcherId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(s,n,i,t,c,h){s.SnitcherObject=i;s[i]||(s[i]=function(){(s[i].q=s[i].q||[]).push(arguments)});s[i].l=+new Date;c=n.createElement(t);h=n.getElementsByTagName(t)[0];c.src="https://snitcher.com/site/${snitcherId}.js";c.async=1;h.parentNode.insertBefore(c,h)}(window,document,"snitcher","script");`,
          }}
        />
      )}
    </>
  );
}
