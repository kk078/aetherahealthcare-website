import Link from 'next/link';
import { OFFERS, PRICING_RANGE } from '@/lib/siteConfig';
import OfferInquiry from './OfferInquiry';
export default function CampaignLanding({ title, description, steps, formId, referenceHref, referenceLabel }: { title: string; description: string; steps: string[]; formId: string; referenceHref: string; referenceLabel: string }) {
  return <section className="py-12 sm:py-20"><div className="max-w-6xl mx-auto px-4 sm:px-6 grid gap-10 lg:grid-cols-2 items-start">
    <div className="space-y-6"><p className="text-mint font-semibold">Medical billing · Human review · Clear scope</p><h1 className="text-3xl sm:text-5xl font-bold font-jakarta text-white">{title}</h1><p className="text-slate-300 leading-relaxed">{description}</p>
      <h2 className="text-xl text-white font-bold">What we review</h2><ul className="space-y-3 text-slate-300 list-disc pl-5">{steps.map(step => <li key={step}>{step}</li>)}</ul>
      <div className="rounded-2xl border border-teal/40 bg-teal/10 p-6"><h2 className="font-bold text-white">{OFFERS.pilot.name}</h2><p className="mt-2 text-slate-300">{OFFERS.pilot.scope}. Findings in {OFFERS.pilot.duration} {OFFERS.pilot.start}. Scope and eligibility are confirmed before intake.</p><p className="mt-3 text-sm text-slate-300">Need a smaller first step? Our <Link href="/lp/denial-recovery-sprint/" className="underline text-mint">48-hour denial recovery sprint</Link> reviews 5–10 denied claims after BAA and complete intake. Your practice keeps recovered funds.</p></div>
      <p className="text-sm text-slate-300">Ongoing billing pricing: {PRICING_RANGE} of net collections. Final scope, exclusions and service targets are confirmed in writing. Recovery and payer payment timelines vary.</p>
      <div className="flex flex-wrap gap-4"><Link href={referenceHref} className="text-mint underline">{referenceLabel}</Link><Link href="/schedule/" className="text-mint underline">Schedule a meeting with Kiran</Link></div>
    </div>
    <div id={formId} className="scroll-mt-28 rounded-3xl bg-white p-6 sm:p-8 shadow-xl dark:bg-slate-900"><h2 className="text-xl font-bold text-navy mb-4">Request a scoped review</h2><OfferInquiry /></div>
  </div></section>;
}
