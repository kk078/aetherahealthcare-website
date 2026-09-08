'use client';
import { useEffect, useState } from 'react';
import { RefreshCw, Copy } from 'lucide-react';

type Timings = { ttfb: number | null; dns: number | null; dom: number | null };
const EMPTY: Timings = { ttfb: null, dns: null, dom: null };
export function navigationTimings(nav?: PerformanceNavigationTiming): Timings {
  if (!nav) return EMPTY;
  const measured = (end: number, start: number) => Number.isFinite(end - start) && end >= start ? Math.round(end - start) : null;
  return {
    ttfb: nav.responseStart > 0 ? measured(nav.responseStart, nav.requestStart) : null,
    dns: measured(nav.domainLookupEnd, nav.domainLookupStart),
    dom: nav.domContentLoadedEventEnd > 0 ? measured(nav.domContentLoadedEventEnd, nav.startTime) : null,
  };
}
export default function PlatformTelemetryDashboard() {
  const [timings, setTimings] = useState<Timings>(EMPTY);
  const [measuredAt, setMeasuredAt] = useState('Not measured');
  const [copyStatus, setCopyStatus] = useState('');
  function measure() {
    setTimings(navigationTimings(performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined));
    setMeasuredAt(new Date().toLocaleTimeString());
  }
  useEffect(() => {
    if (document.readyState === 'complete') {
      const timer = setTimeout(measure, 0);
      return () => clearTimeout(timer);
    }
    window.addEventListener('load', measure, { once: true });
    return () => window.removeEventListener('load', measure);
  }, []);
  const values = [['Time to first byte', timings.ttfb], ['DNS lookup', timings.dns], ['DOM ready', timings.dom]] as const;
  return <section className="surface-card border rounded-3xl p-6 sm:p-8 space-y-6" aria-label="Browser performance measurements">
    <div><h2 className="text-2xl font-bold">Your browser’s page-load timings</h2><p className="text-muted mt-2">Measured with the Navigation Timing API for this page load. A cached DNS lookup can take 0 ms. These values do not measure clearinghouse connections, uptime, claim processing, or Core Web Vitals.</p></div>
    <div className="grid gap-4 sm:grid-cols-3">{values.map(([label, value]) => <div key={label} className="rounded-xl border p-4"><h3 className="text-sm text-muted">{label}</h3><p className="text-2xl font-bold mt-2">{value === null ? 'Unavailable' : `${value} ms`}</p></div>)}</div>
    <p className="text-sm text-muted">Infrastructure and clearinghouse measurements are not connected to this website. Request documented service targets during your consultation.</p>
    <div className="flex flex-wrap gap-3">
      <button onClick={measure} className="flex items-center gap-2 bg-teal text-white rounded-lg px-4 py-3"><RefreshCw className="h-4 w-4" /> Refresh measurements</button>
      <button onClick={async () => { try { await navigator.clipboard.writeText(`Browser navigation timings (${measuredAt})\n${values.map(([label, value]) => `${label}: ${value === null ? 'Unavailable' : `${value} ms`}`).join('\n')}\nOnly this browser page load is measured.`); setCopyStatus('Report copied'); } catch { setCopyStatus('Copy unavailable. You can select the measurements above.'); } }} className="flex items-center gap-2 border rounded-lg px-4 py-3"><Copy className="h-4 w-4" /> Copy report</button>
    </div>
    <p role="status" className="text-sm">{copyStatus || `Last measured: ${measuredAt}`}</p>
  </section>;
}
