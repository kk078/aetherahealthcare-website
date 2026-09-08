'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { TOOLS } from '@/lib/toolRegistry';
export default function ToolsDirectory() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const tools = useMemo(() => TOOLS.filter(t => (category === 'all' || t.category === category) && `${t.name} ${t.desc} ${t.tag}`.toLowerCase().includes(query.toLowerCase().trim())), [query, category]);
  return <section className="space-y-6" aria-label="Free tools directory">
    <div className="grid sm:grid-cols-[1fr_auto] gap-4">
      <div><label htmlFor="tool-search" className="block font-semibold mb-2">Search tools</label><div className="relative"><Search className="absolute left-3 top-3.5 w-5 h-5 text-muted" /><input id="tool-search" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={`Search ${TOOLS.length} free tools & engines…`} className="surface-card w-full border rounded-xl pl-10 pr-4 py-3" /></div></div>
      <div><label htmlFor="tool-category" className="block font-semibold mb-2">Category</label><select id="tool-category" value={category} onChange={e => setCategory(e.target.value)} className="surface-card border rounded-xl p-3"><option value="all">All Tools ({TOOLS.length})</option><option value="scrubbers">Scrubbers</option><option value="calculators">Calculators</option><option value="edi">EDI tools</option><option value="assessments">Assessments & references</option></select></div>
    </div>
    <div className="flex flex-wrap gap-2" aria-label="Tool categories">{['all', 'scrubbers', 'calculators', 'edi', 'assessments'].map(value => <button key={value} aria-pressed={category === value} onClick={() => setCategory(value)} className="surface-card border rounded-full px-4 py-2 text-sm">{value === 'all' ? `All Tools (${TOOLS.length})` : value === 'edi' ? 'EDI tools' : value[0].toUpperCase() + value.slice(1)}</button>)}</div>
    <p role="status" className="text-sm text-muted">{tools.length} tools found</p>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{tools.map(tool => <Link key={tool.href} href={tool.href} prefetch={false} className="surface-card border rounded-2xl p-6 hover:border-teal flex flex-col gap-3"><span className="text-xs text-teal font-semibold">{tool.tag}</span><h3 className="font-bold text-lg">{tool.name}</h3><p className="text-sm text-muted flex-1">{tool.desc}</p><span className="text-sm font-semibold flex gap-2 items-center">Open tool <ArrowRight className="w-4 h-4" /></span></Link>)}</div>
    {!tools.length && <p>No tools match. Try a specialty, denial code, or a broader phrase.</p>}
  </section>;
}
