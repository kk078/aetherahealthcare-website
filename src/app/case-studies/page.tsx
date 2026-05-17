import Link from 'next/link';
import { TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Client Case Studies | Real Results | Aethera Healthcare Solutions',
  description: 'Real results from healthcare practices that partnered with Aethera. Case studies by specialty showing measurable improvements in collections, denial rates, and AR days.',
};

const caseStudies = [
  {
    specialty: 'Cardiology',
    practice: '4-Provider Cardiology Group',
    location: 'Lakeland, FL',
    tag: 'Cardiology',
    challenge: 'A 4-provider cardiology group came to Aethera with a 14.2% denial rate — driven almost entirely by cardiac catheterization modifier errors and bundling issues on stress testing codes. Their AR had ballooned to 47 days, and a recent billing staff departure left a three-month gap in denial follow-up. An estimated $40,000/month was being written off without appeal.',
    solution: 'Aethera assigned a dedicated cardiology coding team that rebuilt their modifier matrix for the entire 93000-series. We implemented real-time eligibility checks pre-appointment and created a payer-specific rules library covering their top 8 payers. The backlog of unappealed denials was worked through systematically over 60 days.',
    quote: '"We were writing off $40,000 a month in denials we assumed were uncollectable. Aethera recovered most of it in the first 60 days — and then made sure it wouldn\'t happen again."',
    quoteAttrib: 'Practice Administrator, Cardiology Group',
    metrics: [
      { label: 'Denial Rate', before: '14.2%', after: '3.8%', better: true },
      { label: 'AR Days', before: '47 days', after: '21 days', better: true },
      { label: 'Net Collections', before: 'Baseline', after: '+22%', better: true },
      { label: 'Admin Hours Saved', before: '—', after: '31 hrs/wk', better: true },
    ],
  },
  {
    specialty: 'Family Medicine',
    practice: 'Solo Family Medicine Physician',
    location: 'Tampa, FL',
    tag: 'Primary Care',
    challenge: 'A solo family medicine physician had been relying on front desk staff to handle billing alongside scheduling and patient intake. Their clean claim rate was 78% — 17 points below industry standard — and there was no systematic denial follow-up. A coding audit revealed consistent undercoding on complex office visits: 99214s being submitted as 99213s, 99215s as 99214s.',
    solution: 'Aethera took over the complete billing function and ran a 90-day coding audit that identified the undercoding pattern across 8 months of historical claims. We rebuilt the physician\'s E&M documentation templates, educated the provider on MDM-based coding, and implemented a denial tracking dashboard in the provider portal.',
    quote: '"I was essentially giving away $200,000 a year because my front desk was coding every visit at the same level. I had no idea until Aethera showed me the data."',
    quoteAttrib: 'Solo Physician, Family Medicine',
    metrics: [
      { label: 'Clean Claim Rate', before: '78%', after: '96.4%', better: true },
      { label: 'Denial Rate', before: '16%', after: '4.1%', better: true },
      { label: 'Monthly Collections', before: 'Baseline', after: '+$18,200', better: true },
      { label: 'Admin Burden', before: 'High', after: 'Minimal', better: true },
    ],
  },
  {
    specialty: 'Orthopedic Surgery',
    practice: '3-Surgeon Orthopedic Practice',
    location: 'Central Florida',
    tag: 'Orthopedics',
    challenge: 'Three orthopedic surgeons with high implant volume were experiencing significant revenue leakage from two sources: inconsistent implant cost capture (missing invoice-level documentation for implants billed under C-codes and L-codes) and repeated global period violations triggering payer audits. Their AR stood at 52 days, and they had received two payer audit letters in 18 months.',
    solution: 'Aethera built a procedure-specific charge capture checklist that required implant invoice reconciliation before claim submission. A global period tracking module was implemented in their PM system, flagging any claims that risked modifier conflicts. The audit response team handled both pending audit letters, resulting in no recoupment.',
    quote: '"The implant billing alone paid for Aethera\'s fees ten times over in the first year. And the audit letters stopped completely."',
    quoteAttrib: 'Managing Partner, Orthopedic Surgery Group',
    metrics: [
      { label: 'Implant Revenue Captured', before: 'Inconsistent', after: '+$124K/yr', better: true },
      { label: 'AR Days', before: '52 days', after: '28 days', better: true },
      { label: 'Payer Audit Flags', before: '2 per year', after: '0', better: true },
      { label: 'Global Period Violations', before: 'Frequent', after: 'Eliminated', better: true },
    ],
  },
  {
    specialty: 'Dermatology',
    practice: '2-Provider Dermatology Practice',
    location: 'Florida',
    tag: 'Dermatology',
    challenge: 'A two-provider dermatology practice with high Mohs surgery volume had been miscoding Mohs staging procedures for years — submitting single-stage codes without the required block and specimen-count add-ons. Additionally, reconstructive cases were being written off because documentation didn\'t meet medical necessity standards for their top two payers. Their denial rate was 18%.',
    solution: 'Aethera assigned a Mohs-specialist coder who rebuilt the practice\'s procedure coding from the ground up. We created documentation templates specifically designed to satisfy reconstructive necessity criteria for each of their top payers. A payer-specific Mohs rule library was maintained and updated quarterly.',
    quote: '"We\'d been coding Mohs the same way for seven years and nobody told us it was wrong. Aethera fixed it in 30 days and we haven\'t had a Mohs denial since."',
    quoteAttrib: 'Practice Owner, Dermatology',
    metrics: [
      { label: 'Denial Rate', before: '18%', after: '4.3%', better: true },
      { label: 'Mohs Reimbursement', before: 'Baseline', after: '+31%', better: true },
      { label: 'Reconstructive Claims', before: 'Written off', after: '+$9,800/mo', better: true },
      { label: 'AR Days', before: '39 days', after: '19 days', better: true },
    ],
  },
  {
    specialty: 'Psychiatry',
    practice: '8-Provider Behavioral Health Group',
    location: 'Florida',
    tag: 'Behavioral Health',
    challenge: 'An 8-provider behavioral health group was struggling on three fronts: E&M and psychotherapy claims were triggering bundling edits on major payers, prior authorization denials for newer psychiatric medications were running at 34%, and patient collections were functionally nonexistent — balances were either written off or sent to collections with no intermediate step.',
    solution: 'Aethera restructured the group\'s claim submission logic to properly unbundle therapy and medication management per payer policy. A prior auth workflow was built specifically for the psychiatry formulary, with escalation paths for denials. A four-step patient statement series with a soft-touch phone follow-up protocol was implemented for all patient balances over $50.',
    quote: '"We weren\'t collecting from patients at all — we\'d write it off rather than have an uncomfortable conversation. Aethera built a system that collects professionally without damaging the therapeutic relationship."',
    quoteAttrib: 'Clinical Director, Behavioral Health Group',
    metrics: [
      { label: 'Bundling Denials', before: 'Frequent', after: 'Eliminated', better: true },
      { label: 'Prior Auth Approval', before: '66%', after: '89%', better: true },
      { label: 'Patient Collections', before: 'Baseline', after: '+340%', better: true },
      { label: 'Net Revenue', before: 'Baseline', after: '+$31K/mo', better: true },
    ],
  },
  {
    specialty: 'Internal Medicine',
    practice: '12-Provider Internal Medicine Group',
    location: 'Florida',
    tag: 'Group Practice',
    challenge: 'A 12-provider internal medicine group was transitioning from hospital-employed billing to independent billing following an ownership change. They had no existing billing infrastructure, 12 providers who needed credentialing with their new TIN, and a hard go-live date 45 days out. Cash flow continuity was the primary concern.',
    solution: 'Aethera executed a full build-out of the billing infrastructure: credentialing for all 12 providers simultaneously, eClinicalWorks integration configuration, fee schedule loading, and payer enrollment. Claims began processing on day 38 — two days ahead of the hard deadline. A dedicated project manager coordinated across all workstreams.',
    quote: '"Aethera built our entire billing operation from scratch in under 6 weeks. Every provider was credentialed, the system was live, and we didn\'t miss a single payment cycle."',
    quoteAttrib: 'CEO, Internal Medicine Group',
    metrics: [
      { label: 'Days to Go Live', before: '45 day target', after: '38 days', better: true },
      { label: 'Clean Claim Rate (Day 1)', before: '—', after: '95.8%', better: true },
      { label: 'Setup Fees', before: 'Expected', after: '$0', better: true },
      { label: 'Cash Flow Gap', before: 'Major concern', after: 'None', better: true },
    ],
  },
];

export default function CaseStudies() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6">
              Real Practices. Measurable Results.
            </h1>
          </FadeIn>
          <FadeIn delay={0.2}>
            <p className="text-xl text-cream max-w-3xl mx-auto mb-10">
              These are the stories of practices that decided their revenue deserved better. Every number below is real.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="flex flex-wrap justify-center gap-6">
              {[
                { value: '22%', label: 'Avg. Revenue Increase' },
                { value: '73%', label: 'Avg. Denial Rate Reduction' },
                { value: '18 Days', label: 'Avg. AR Days Saved' },
              ].map((s, i) => (
                <div key={i} className="bg-white/15 border border-white/30 rounded-xl px-8 py-4 text-center">
                  <p className="text-3xl font-bold text-mint font-playfair">{s.value}</p>
                  <p className="text-cream text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Case Studies */}
      {caseStudies.map((cs, i) => (
        <section key={i} className={`py-16 md:py-20 ${i % 2 === 0 ? 'bg-white' : 'bg-cream'}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              {/* Header */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="bg-teal text-white px-4 py-1.5 rounded-full text-sm font-bold">{cs.tag}</span>
                <span className="text-gray text-sm">{cs.practice} · {cs.location}</span>
              </div>

              {/* Before/After Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {cs.metrics.map((m, mi) => (
                  <div key={mi} className="bg-navy rounded-xl p-4 text-center">
                    <p className="text-xs text-gray/70 mb-2">{m.label}</p>
                    <div className="flex items-center justify-center gap-2">
                      <div className="text-center">
                        <p className="text-xs text-gray/60 line-through">{m.before}</p>
                        <p className="text-lg font-bold text-mint">{m.after}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-sm font-bold text-teal uppercase tracking-widest mb-2">The Challenge</h3>
                  <p className="text-gray text-sm leading-relaxed">{cs.challenge}</p>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-teal uppercase tracking-widest mb-2">The Solution</h3>
                  <p className="text-gray text-sm leading-relaxed">{cs.solution}</p>
                </div>
              </div>

              {/* Quote */}
              <blockquote className="border-l-4 border-teal pl-6 py-2">
                <p className="text-navy italic text-lg leading-relaxed mb-2">{cs.quote}</p>
                <footer className="text-sm text-gray font-semibold">— {cs.quoteAttrib}</footer>
              </blockquote>
            </FadeIn>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <TrendingUp className="h-12 w-12 text-mint mx-auto mb-5" />
            <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-4">
              Ready to Be Our Next Success Story?
            </h2>
            <p className="text-cream text-lg max-w-2xl mx-auto mb-8">
              Start with a free revenue cycle assessment. We'll show you exactly what your practice could be collecting.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">
                Get Free Assessment <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link href="/contact" className="inline-flex items-center bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors">
                Talk to Our Team
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
