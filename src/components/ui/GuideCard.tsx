'use client';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import FadeIn from './FadeIn';
import { trackCustomEvent } from '@/lib/gtag';

const routes: Record<string, string> = { familymedicine: 'family-medicine', internalmedicine: 'internal-medicine', hemonc: 'oncology', orthopedic: 'orthopedics', psychiatry: 'behavioral-health' };
export default function GuideCard({ slug, name, focus, index }: { slug: string; name: string; focus: string; index: number }) {
  return <FadeIn delay={(index % 3) * 0.1}><article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
    <FileText className="mb-4 h-8 w-8 text-teal" /><h3 className="text-xl font-bold text-navy">{name}</h3><p className="my-3 flex-1 text-sm text-slate-600">{focus}</p>
    <p className="mb-4 text-xs text-slate-600">Educational overview. Confirm current payer rules before using coding guidance.</p>
    <a href={`/decks/${slug}.pdf`} target="_blank" rel="noopener noreferrer" onClick={() => trackCustomEvent('file_download', { resource: `guide_${slug}`, specialty: name })} className="rounded-xl bg-teal px-4 py-3 text-center font-semibold text-white">View {name} guide (PDF)</a>
    <Link href={slug === 'dental' ? '/services/dental-billing/' : slug === 'pharmacy' ? '/services/pharmacy-billing/' : `/medical-billing/${routes[slug] || slug}/`} className="mt-4 text-sm font-semibold text-teal underline">Explore {name} billing services</Link>
  </article></FadeIn>;
}
