import Link from 'next/link';
import { CheckCircle, AlertCircle, TrendingUp, Shield, DollarSign, FileText, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Psychiatry & Behavioral Health Billing | RCM for Psychiatrists | Aethera Healthcare',
  description: 'Specialized psychiatry and behavioral health billing: medication management, psychotherapy add-ons, collaborative care, telehealth, and mental health parity compliance. 96.1% clean claim rate.',
};

const stats = [
  { value: '96.1%', label: 'Clean Claim Rate' },
  { value: '4.3%', label: 'Average Denial Rate' },
  { value: '22 Days', label: 'Average AR Days' },
  { value: '+340%', label: 'Average Patient Collections Improvement' },
];

const challenges = [
  { icon: <AlertCircle className="h-6 w-6" />, title: 'E&M + Psychotherapy Bundling', description: 'Billing E&M and psychotherapy on the same day requires careful use of add-on codes (90833, 90836, 90838). Most payers require specific time documentation and separate medical decision-making support. Incorrect bundling is the #1 denial reason in psychiatry.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Mental Health Parity Compliance', description: 'MHPAEA requires payers to cover behavioral health at parity with medical benefits. When payers apply more restrictive limits to psychiatric services, there are appeal and legal remedies available. We identify parity violations and escalate appropriately.' },
  { icon: <DollarSign className="h-6 w-6" />, title: 'Prior Auth for Psychiatric Medications', description: 'Prior authorization for newer antipsychotics, LAIs, and branded formulations is among the most time-intensive processes in any specialty. Our prior auth team maintains formulary-specific approval workflows for every major payer.' },
  { icon: <FileText className="h-6 w-6" />, title: 'Telehealth Billing for Behavioral Health', description: 'Post-pandemic telehealth rules for behavioral health remain in flux. Audio-only visit billing, place of service modifiers (95, GT), originating site requirements, and state-specific telehealth mandates all affect how claims are submitted.' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'Patient Collections Strategy', description: 'Behavioral health practices have historically low patient collection rates due to sensitivity around balances. Our approach uses a professional, staged statement series with soft-touch follow-up that collects without damaging the therapeutic relationship.' },
  { icon: <AlertCircle className="h-6 w-6" />, title: 'Group Therapy Billing', description: 'Group psychotherapy (90853) has specific group size requirements, separate session documentation for each participant, and payer-specific approval criteria. Our coders verify compliance for every group therapy submission.' },
];

const cptCodes = [
  { code: '90791', desc: 'Psychiatric diagnostic evaluation', note: 'Use for initial evaluation without medical services (no prescribing)' },
  { code: '90792', desc: 'Psychiatric diagnostic evaluation with medical services', note: 'Use when prescribing occurs during initial evaluation' },
  { code: '90832', desc: 'Psychotherapy, 30 minutes', note: 'Standalone therapy — verify payer minimum time requirements' },
  { code: '90833', desc: 'Psychotherapy add-on, 30 min (with E&M)', note: 'Add-on to E&M — requires documented medical decision-making' },
  { code: '90834', desc: 'Psychotherapy, 45 minutes', note: 'Most common standalone therapy code for individual sessions' },
  { code: '90836', desc: 'Psychotherapy add-on, 45 min (with E&M)', note: 'Add-on requires time documentation for both E&M and therapy' },
  { code: '90837', desc: 'Psychotherapy, 60 minutes', note: 'Less common — must document 53+ minutes of face-to-face therapy' },
  { code: '90838', desc: 'Psychotherapy add-on, 60 min (with E&M)', note: 'Highest-value add-on — requires extensive documentation' },
  { code: '90853', desc: 'Group psychotherapy', note: 'Bill once per patient per session; document group size and each member separately' },
  { code: '90839', desc: 'Psychotherapy for crisis, first 60 minutes', note: 'Requires documentation of acute crisis — not routine therapy' },
  { code: '99214', desc: 'Office visit, established, moderate MDM', note: 'Most common E&M for medication management visits' },
  { code: '99215', desc: 'Office visit, established, high MDM', note: 'Use for complex psychiatric medication management with multiple conditions' },
];

const faqs = [
  { q: 'How do you handle E&M + psychotherapy billing on the same day?', a: 'We apply the correct add-on codes (90833, 90836, 90838) when your provider performs both medication management and psychotherapy in the same visit. We review your session documentation to confirm that both services are independently documented and meet payer requirements before submitting.' },
  { q: 'Our telehealth volume is high. Do you handle audio-only visits?', a: 'Yes. Audio-only behavioral health billing has specific modifiers and place of service rules that vary by payer. We track the current telehealth rules for each of your payers and apply the correct POS codes (02, 10), modifiers (95, GT), and audio-only-specific codes where applicable.' },
  { q: 'We write off a lot of patient balances. Can you improve our patient collections?', a: 'This is one of the most common issues in behavioral health. We implement a professional, staged collection process: first statement with clear balance explanation, follow-up call at 30 days, second statement, final notice. Most practices see 200–400% improvement in patient collections without a single difficult conversation for the clinical staff.' },
  { q: 'How do you handle prior auth for psychiatric medications that require step therapy?', a: 'Our prior auth team maintains step therapy protocols for the top 20 psychiatric medications by payer. We document step therapy failure, submit appeals with clinical notes, and escalate to peer-to-peer reviews when appropriate — all without requiring physician time on phone holds.' },
  { q: 'Do you work with therapists and psychologists in addition to psychiatrists?', a: 'Yes. We bill for all behavioral health provider types: psychiatrists (MDs/DOs), psychologists (PhDs/PsyDs), licensed clinical social workers (LCSWs), licensed professional counselors (LPCs), and marriage and family therapists (MFTs) — each with the correct rendering provider credentials and taxonomy codes.' },
];

export default function PsychiatryBilling() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Psychiatry & Behavioral Health Specialists</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">Behavioral Health Billing That Understands the Complexity</h1>
              <p className="text-xl text-cream mb-10">E&M + psychotherapy add-ons, mental health parity, telehealth rules, prior auth for medications, patient collections — our behavioral health billing team resolves the issues that cost psychiatric practices the most.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">Get Free Psychiatry Assessment</Link>
                <Link prefetch={false} href="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors text-center">Talk to a Specialist</Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-10 bg-white border-b border-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (<div key={i}><p className="text-3xl font-bold text-teal">{s.value}</p><p className="text-gray text-sm mt-1">{s.label}</p></div>))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="BILLING CHALLENGES WE SOLVE" title="Why Behavioral Health Billing Is Uniquely Complex" description="Six specific billing challenges that cost psychiatry and behavioral health practices the most — and how we address each." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {challenges.map((c, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full"><div className="text-teal mb-4">{c.icon}</div><h3 className="font-bold text-navy mb-2">{c.title}</h3><p className="text-gray text-sm">{c.description}</p></div></FadeIn>))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">How Aethera Handles Behavioral Health Billing</h2>
              <p className="text-gray mb-5">Behavioral health billing occupies a unique intersection of psychiatric coding complexity, parity law compliance, and patient sensitivity. Our team is trained to handle all three dimensions simultaneously — submitting claims correctly while protecting the therapeutic environment your practice depends on.</p>
              <p className="text-gray">We work with psychiatric practices of all sizes and compositions, from solo psychiatrists to multi-provider behavioral health groups including prescribers, therapists, and social workers all billing under the same TIN.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                <h3 className="font-bold text-navy mb-4">Our behavioral health billing covers:</h3>
                {['E&M + psychotherapy add-on code management (90833, 90836, 90838)', 'Standalone psychotherapy (90832, 90834, 90837)', 'Psychiatric diagnostic evaluations (90791, 90792)', 'Group psychotherapy (90853) documentation compliance', 'Telehealth billing — video and audio-only', 'Collaborative care model codes (99492–99494)', 'Crisis psychotherapy (90839, 90840)', 'Prior auth for psychiatric medications and LAIs', 'Mental health parity appeals', 'Patient statement series and soft-touch collections', 'All behavioral health provider types (MD, PhD, LCSW, LPC, MFT)', 'Substance use disorder billing (H-codes, HCPCS)'].map((item, i) => (<div key={i} className="flex items-start"><CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" /><p className="text-gray text-sm">{item}</p></div>))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="PROCEDURE CODES" title="Common Psychiatry CPT Codes We Bill" description="Behavioral health procedure codes our team handles daily — each with specific documentation and payer rules." />
          <div className="mt-12 overflow-x-auto">
            <table className="w-full bg-white rounded-xl overflow-hidden border border-gray/10">
              <thead><tr className="bg-navy text-white text-sm"><th className="py-3 px-5 text-left font-semibold">CPT Code</th><th className="py-3 px-5 text-left font-semibold">Description</th><th className="py-3 px-5 text-left font-semibold hidden md:table-cell">Billing Note</th></tr></thead>
              <tbody>{cptCodes.map((row, i) => (<tr key={i} className={i % 2 === 0 ? 'bg-cream' : 'bg-white'}><td className="py-3 px-5 font-bold text-teal text-sm">{row.code}</td><td className="py-3 px-5 text-navy text-sm">{row.desc}</td><td className="py-3 px-5 text-gray text-xs hidden md:table-cell">{row.note}</td></tr>))}</tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Case Study</span>
            <h2 className="text-3xl font-bold text-white font-playfair mb-4">8-Provider Behavioral Health Group, Florida</h2>
            <p className="text-cream/80 mb-8">Bundling edits on E&M + therapy claims, 34% prior auth denial rate on new medications, and essentially zero patient collections — balances were being written off entirely.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{ label: 'Bundling Denials', before: 'Frequent', after: 'Eliminated' }, { label: 'Prior Auth Approvals', before: '66%', after: '89%' }, { label: 'Patient Collections', before: 'Baseline', after: '+340%' }, { label: 'Net Revenue', before: 'Baseline', after: '+$31K/mo' }].map((m, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4 text-center"><p className="text-xs text-gray/60 mb-1">{m.label}</p><p className="text-xs text-gray/40 line-through">{m.before}</p><p className="text-xl font-bold text-mint">{m.after}</p></div>
              ))}
            </div>
            <blockquote className="border-l-4 border-mint pl-5"><p className="text-cream italic">"We weren't collecting from patients at all. Aethera built a system that collects professionally without damaging the therapeutic relationship."</p></blockquote>
            <div className="mt-6"><Link prefetch={false} href="/case-studies" className="text-mint font-semibold hover:text-white transition-colors inline-flex items-center">Read all case studies <ArrowRight className="h-4 w-4 ml-1" /></Link></div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Psychiatry Billing Questions" description="Common questions from psychiatrists, psychologists, and behavioral health practice managers." />
          <div className="space-y-4 mt-12">
            {faqs.map((faq, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-cream rounded-xl p-6 border border-gray/10"><h3 className="font-bold text-navy mb-2">{faq.q}</h3><p className="text-gray text-sm">{faq.a}</p></div></FadeIn>))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn><h2 className="text-3xl font-bold text-white font-playfair mb-4">Ready to Maximize Your Behavioral Health Revenue?</h2><p className="text-cream max-w-xl mx-auto mb-8">Start with a free psychiatry billing assessment. We'll audit your E&M + therapy bundling, prior auth denials, and patient collection patterns.</p><Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">Get Free Psychiatry Assessment <ArrowRight className="h-4 w-4 ml-2" /></Link></FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
