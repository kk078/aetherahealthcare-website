'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SEO_SPECIALTIES } from '@/lib/seo.data';
export default function CaseStudiesDirectory() {
  const [query, setQuery] = useState('');
  const specialties = useMemo(() => SEO_SPECIALTIES.filter(s => `${s.name} ${s.blurb}`.toLowerCase().includes(query.toLowerCase().trim())), [query]);
  return <div className="space-y-7">
    <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-700">These are specialty workflow references. Verified customer results will be published with a documented baseline, reporting period, source records and permission. No customer identities, testimonials or recovery figures are implied.</p>
    <label className="block font-semibold text-navy">Find your specialty<input type="search" value={query} onChange={e => setQuery(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900" /></label>
    <p role="status" className="text-sm text-slate-600">{specialties.length} specialty workflows found</p>
    <div className="grid gap-5 md:grid-cols-2">{specialties.map(s => <article key={s.slug} className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-xl font-bold text-navy">{s.name}</h2><p className="my-3 text-sm text-slate-600">{s.blurb}</p>
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-700">{s.painPoints.slice(0,3).map(point => <li key={point}>{point}</li>)}</ul>
      <p className="mt-4 text-xs text-slate-600">Confirm current codes, coverage and documentation against your payer and applicable CMS rules.</p>
      <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold"><Link href={`/medical-billing/${s.slug}/`} className="text-teal underline">Explore {s.name} billing</Link><Link href="/schedule/" className="text-teal underline">Discuss your workflow</Link></div>
    </article>)}</div>
    {!specialties.length && <p>No matching specialty. Try another term or contact our team.</p>}
  </div>;
}
