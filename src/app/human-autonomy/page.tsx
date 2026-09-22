import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AutonomyLearningTools from '@/components/ui/AutonomyLearningTools';
import { AUTONOMY_REVIEW_DATE, PAYMENT_REFERENCES, REFERENCE_TOPICS, SOURCES } from '@/data/autonomyReferences';
import { canonicalUrl } from '@/lib/siteConfig';
import { jsonLd } from '@/lib/jsonLd';

export const metadata: Metadata = {
  alternates: { canonical: canonicalUrl('/human-autonomy') },
  title: 'Human Autonomy in Healthcare RCM — Evidence & Review | Aethera Healthcare',
  description: 'Explore human review in healthcare billing with sourced Medicare references, bounded educational calculators, and clear documentation checkpoints.',
};
const FAQS = [
  { q: 'Does human sign-off guarantee compliance or payment?', a: 'No. Human review can identify errors and document decisions, but neither a credential nor a completed checklist guarantees coverage, payment or legal immunity. Review the actual record, applicable rules and payer requirements.' },
  { q: 'Can I use these examples to submit a claim?', a: 'These examples explain selected concepts. They do not validate an encounter, replace current licensed code sets or produce submission-ready claims, appeals or legal attestations. Confirm the service date, setting and payer rules.' },
  { q: 'Are the example costs and results Aethera performance data?', a: 'No. Calculator defaults are hypothetical and editable. This page does not publish measured client outcomes, AI accuracy benchmarks or promised savings.' },
  { q: 'What does the SHA-256 demonstration prove?', a: 'It compares the current example text with a saved digest. It does not authenticate a person, verify clinical accuracy or provide an immutable audit trail. The example stays in your browser unless you download it.' },
];
const STEPS = [
  ['Read the record', 'Identify the service, documented clinical context, site, setting and date. Resolve missing information with the appropriate clinician.'],
  ['Check the applicable rule', 'Use the code-set version, payer policy, coverage guidance and payment period that apply to the encounter.'],
  ['Review the exception', 'Escalate ambiguous documentation, conflicting edits and payer disputes to a qualified reviewer. Record the reason for the decision.'],
  ['Keep the evidence', 'Retain the relevant record, policy version, review notes and changes through the organization’s approved process.'],
];
export default function HumanAutonomyPage() {
  return <div className="min-h-screen bg-[#FAFCFB] text-slate-800">
    <Navbar />
    <main id="main-content">
      <section className="bg-[#0B2545] px-6 py-16 text-white sm:py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-[#88e1d1]">The human review framework</p>
          <h1 className="max-w-4xl text-4xl leading-tight font-bold sm:text-6xl">Better billing decisions<br /><span className="text-[#88e1d1]">start with evidence.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-slate-200">Automation can support a review. People must still assess the record, resolve uncertainty and document the basis for a billing decision.</p>
          <div className="mt-9 flex flex-wrap gap-4"><a href="#learning-tools" className="rounded-lg bg-[#88e1d1] px-5 py-3 font-semibold text-[#0B2545]">Explore the working examples ↓</a><a href="#reference-topics" className="rounded-lg border border-slate-400 px-5 py-3 font-semibold">Read the source-backed guide</a></div>
          <p className="mt-10 text-sm text-slate-300">Content reviewed <time dateTime={AUTONOMY_REVIEW_DATE}>September 22, 2026</time> · U.S. healthcare billing · Educational reference</p>
        </div>
      </section>
      <nav aria-label="On this page" className="border-b border-slate-200 bg-white px-6 py-5"><div className="mx-auto flex max-w-6xl flex-wrap gap-x-7 gap-y-3 text-sm font-semibold text-teal-800">{[['boundary-matrix', 'Review workflow'], ['learning-tools', 'Interactive examples'], ['payment-references', 'Dated payment references'], ['reference-topics', 'Topic guide'], ['faqs', 'Questions']].map(([id, label]) => <a key={id} href={`#${id}`} className="underline-offset-4 hover:underline">{label}</a>)}</div></nav>
      <div className="mx-auto max-w-6xl space-y-20 px-6 py-16">
        <section id="boundary-matrix" className="scroll-mt-28"><p className="text-sm font-semibold uppercase tracking-widest text-teal-800">A repeatable review</p><h2 className="mt-3 text-3xl text-slate-950">Four steps. A documented decision.</h2><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{STEPS.map(([title, description], index) => <article key={title} className="border-t-2 border-teal-700 pt-5"><p className="text-sm font-semibold text-teal-800">0{index + 1}</p><h3 className="mt-3 text-lg font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p></article>)}</div><p className="mt-7 max-w-3xl text-sm leading-relaxed text-slate-600">Human review is a quality-control process. It does not create a legal safe harbor or guarantee reimbursement. Applicable False Claims Act liability depends on the facts and statutory elements. <a href={SOURCES.fca.url} className="text-teal-800 underline">Read 31 U.S.C. § 3729.</a></p></section>
        <section id="learning-tools" className="scroll-mt-28"><p className="text-sm font-semibold uppercase tracking-widest text-teal-800">See the calculation</p><h2 className="mt-3 text-3xl text-slate-950">Small examples, explicit assumptions.</h2><p className="mt-4 mb-8 max-w-3xl leading-relaxed text-slate-600">Change the inputs and inspect the result. These tools explain selected rules and arithmetic; they do not predict payer decisions. Use fictional or aggregate data only.</p><AutonomyLearningTools /></section>
        <section id="payment-references" className="scroll-mt-28"><p className="text-sm font-semibold uppercase tracking-widest text-teal-800">Versioned reference</p><h2 className="mt-3 text-3xl text-slate-950">Match the rate to the service period.</h2><p className="mt-4 mb-6 max-w-3xl leading-relaxed text-slate-600">Selected national base amounts, before applicable adjustments. They are not final claim payments. Fiscal-year 2026 values below end September 30, 2026; use the next year’s official files for later services.</p><div className="relative overflow-x-auto rounded-xl border border-slate-200 bg-white" role="region" aria-label="Payment references table" tabIndex={0}><table className="w-full min-w-[660px] text-left text-sm"><caption className="sr-only">Selected CMS payment references with effective periods and official sources</caption><thead className="bg-slate-100"><tr>{['Reference', 'Base amount', 'Effective period', 'Source'].map(h => <th key={h} scope="col" className="p-4 font-semibold">{h}</th>)}</tr></thead><tbody>{PAYMENT_REFERENCES.map(rate => <tr key={rate.name} className="border-t border-slate-200"><th scope="row" className="p-4 font-medium">{rate.name}</th><td className="p-4 whitespace-nowrap">{rate.value}</td><td className="p-4"><span className="block font-medium">{rate.period}</span><span className="text-xs whitespace-nowrap">{rate.from} to {rate.through}</span></td><td className="p-4"><a className="text-teal-800 underline" href={SOURCES[rate.source].url}>CMS reference<span className="sr-only"> for {rate.name}</span> ↗</a></td></tr>)}</tbody></table></div></section>
        <section id="reference-topics" className="scroll-mt-28"><p className="text-sm font-semibold uppercase tracking-widest text-teal-800">Know what to verify</p><h2 className="mt-3 text-3xl text-slate-950">A source-backed topic guide.</h2><p className="mt-4 mb-8 max-w-3xl text-slate-600">Open a topic for the review checkpoint and its supporting reference. Always check the rule version and payer requirements for the service at issue.</p><div className="space-y-3">{REFERENCE_TOPICS.map(topic => <details key={topic.id} id={topic.id} className="group scroll-mt-28 rounded-xl border border-slate-200 bg-white open:border-teal-700"><summary className="cursor-pointer px-6 py-5 text-lg font-semibold text-slate-950">{topic.title}</summary><div className="space-y-4 px-6 pb-6 text-sm leading-relaxed"><p>{topic.text}</p><p className="rounded-lg bg-slate-100 p-4"><strong>Review checkpoint:</strong> {topic.check}</p><ul className="space-y-2">{topic.sources.map(key => <li key={key}><a href={SOURCES[key].url} className="text-teal-800 underline underline-offset-4">{SOURCES[key].label} ↗</a></li>)}</ul></div></details>)}</div></section>
        <section id="case-studies" className="scroll-mt-28 rounded-2xl bg-slate-100 p-7 sm:p-10"><h2 className="text-2xl text-slate-950">Examples are not client outcomes.</h2><p className="mt-4 max-w-3xl leading-relaxed">The tools on this page use illustrative inputs. Measured claims about accuracy, collected revenue or audit outcomes require a defined population, dates, source data and a documented method. No named patient, clinician or successful appeal is implied.</p></section>
        <section id="faqs" className="scroll-mt-28"><h2 className="mb-7 text-3xl text-slate-950">Common questions</h2><div className="grid gap-8 sm:grid-cols-2">{FAQS.map(faq => <article key={faq.q}><h3 className="text-lg font-semibold">{faq.q}</h3><p className="mt-3 text-sm leading-relaxed text-slate-600">{faq.a}</p></article>)}</div></section>
      </div>
      <section id="sovereign-terminal" className="scroll-mt-28 bg-[#0B2545] px-6 py-16 text-white"><div className="mx-auto max-w-6xl"><h2 className="text-3xl">Build a review process around your practice.</h2><p className="mt-4 max-w-2xl leading-relaxed text-slate-200">Discuss your specialties, documentation workflow and payer requirements with Aethera.</p><Link href="/contact/" className="mt-7 inline-block rounded-lg bg-[#88e1d1] px-5 py-3 font-semibold text-[#0B2545]">Talk with our team →</Link></div></section>
    </main>
    <Footer />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: FAQS.map(faq => ({ '@type': 'Question', name: faq.q, acceptedAnswer: { '@type': 'Answer', text: faq.a } })) }) }} />
  </div>;
}
