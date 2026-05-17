import Link from 'next/link';
import { CheckCircle, AlertCircle, TrendingUp, Shield, DollarSign, FileText, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Orthopedic Surgery Billing | RCM for Orthopedists | Aethera Healthcare',
  description: 'Specialized orthopedic billing services covering joint replacement, fracture care, arthroscopy, implant capture, and global period management. 96.8% clean claim rate.',
};

const stats = [
  { value: '96.8%', label: 'Clean Claim Rate' },
  { value: '4.1%', label: 'Average Denial Rate' },
  { value: '23 Days', label: 'Average AR Days' },
  { value: '99.2%', label: 'Implant Capture Rate' },
];

const challenges = [
  { icon: <AlertCircle className="h-6 w-6" />, title: 'Global Period Management', description: 'Orthopedic surgery carries 90-day global periods on most procedures. Incorrectly billing subsequent visits, PT orders, or return trips during the global generates audits and recoupments. We track every global period automatically.' },
  { icon: <DollarSign className="h-6 w-6" />, title: 'Implant & Supply Billing', description: 'Invoice-based implant billing — joint replacements, plates, screws, and biologics — requires accurate C-code and L-code submission with supporting invoice documentation. Missed implant charges are permanent revenue loss.' },
  { icon: <FileText className="h-6 w-6" />, title: 'Fracture Care Bundling', description: 'What\'s included in fracture care vs. what can be billed separately differs by payer and code. Initial cast application, manipulation, and follow-up X-rays each have specific bundling rules our coders navigate daily.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Multiple Procedure Reductions', description: 'Modifier 51 reductions on multiple procedures in the same session significantly impact reimbursement. Our billing team sequences procedures strategically to minimize reduction impact within payer rules.' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'Workers\' Compensation Complexity', description: 'Workers\' comp billing requires state-specific fee schedules, lien management, and attorney coordination. Our WC specialists manage these cases separately from commercial billing.' },
  { icon: <AlertCircle className="h-6 w-6" />, title: 'Arthroscopy Bundling Rules', description: 'Arthroscopic procedures have specific bundling edits — certain diagnostic arthroscopy codes bundle into surgical codes at the same joint. Our coders know exactly which combinations are billable and which trigger edits.' },
];

const cptCodes = [
  { code: '27130', desc: 'Total hip arthroplasty', note: 'Include implant invoice; revision codes differ significantly' },
  { code: '27447', desc: 'Total knee arthroplasty', note: 'Most common orthopedic procedure — verify implant and bilateral modifiers' },
  { code: '27486', desc: 'Revision of total knee arthroplasty, 1 component', note: 'Higher RVU than primary — documentation must support revision' },
  { code: '29827', desc: 'Arthroscopy, shoulder, surgical, with rotator cuff repair', note: 'Frequently bundled incorrectly — verify add-ons for biceps and SLAP' },
  { code: '29881', desc: 'Arthroscopy, knee, surgical, with meniscectomy', note: 'Meniscectomy codes vary by medial/lateral and partial/complete' },
  { code: '29882', desc: 'Arthroscopy, knee, surgical, with meniscus repair', note: 'Higher RVU than meniscectomy — requires repair documentation' },
  { code: '20610', desc: 'Aspiration/injection, major joint (knee, hip, shoulder)', note: 'Cannot bill with same-day arthroscopy without modifier' },
  { code: '27370', desc: 'Injection procedure for knee arthrography', note: 'Bill with corresponding radiology code for complete service' },
  { code: '97010', desc: 'Physical medicine, hot/cold pack', note: 'Often bundled — verify payer policy before submitting with E&M' },
  { code: '99213', desc: 'Office visit, established patient, moderate complexity', note: 'Use modifier 24 during global period for unrelated visits' },
  { code: '27650', desc: 'Repair, primary, open or percutaneous, ruptured Achilles tendon', note: 'Confirm whether percutaneous approach changes code selection' },
  { code: '20900', desc: 'Bone graft, any donor area, minor', note: 'Report separately from primary procedure when applicable' },
];

const faqs = [
  { q: 'How do you track 90-day global periods across our entire schedule?', a: 'We build global period tracking directly into your billing workflow. Every procedure with a global period is flagged, and any claim submitted during that window is reviewed for correct modifier assignment (24, 25, 57, 58, 79) before submission.' },
  { q: 'We have high implant volume. How do you ensure we capture every implant charge?', a: 'We require invoice reconciliation as part of our charge capture process. Before a claim is submitted, the implant invoice is matched to the operative report. Our current implant capture rate is 99.2% across all orthopedic clients.' },
  { q: 'How do you handle workers\' compensation billing?', a: 'Our workers\' comp team operates as a separate workflow. We manage state-specific fee schedules (all 50 states), lien filings, attorney correspondence, and independent medical exam (IME) coordination — all as part of your standard service.' },
  { q: 'Do you handle ASC and hospital-based billing separately?', a: 'Yes. We bill ASC facility fees, hospital outpatient facility fees, and professional fees as separate workflows with the appropriate place of service codes, facility-specific modifiers, and implant reporting requirements for each setting.' },
  { q: 'What\'s your experience with bilateral procedures and modifier 50?', a: 'Bilateral modifier rules vary significantly by payer. We maintain a payer-specific bilateral matrix for each of your carriers and apply modifier 50, RT/LT, or the double-line method as required — never guessing when real rules are available.' },
];

export default function OrthopedicBilling() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Orthopedic Billing Specialists</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">
                Orthopedic Billing That Captures Every Dollar
              </h1>
              <p className="text-xl text-cream mb-10">
                Global period tracking, implant invoice reconciliation, fracture care coding, workers' comp — our orthopedic billing team handles the complexity that costs practices tens of thousands annually.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">Get Free Orthopedic Assessment</Link>
                <Link href="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors text-center">Talk to a Specialist</Link>
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
          <SectionHeader label="BILLING CHALLENGES WE SOLVE" title="Why Orthopedic Billing Leaks Revenue" description="These are the six most common orthopedic billing problems — and what we do about each one." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {challenges.map((c, i) => (
              <FadeIn key={i} delay={i * 0.1}><div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full"><div className="text-teal mb-4">{c.icon}</div><h3 className="font-bold text-navy mb-2">{c.title}</h3><p className="text-gray text-sm">{c.description}</p></div></FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">How Aethera Handles Orthopedic Billing</h2>
              <p className="text-gray mb-5">Orthopedic billing has more revenue leakage points than almost any other surgical specialty — missed implant charges, global period violations, and multiple procedure reduction errors compound quickly across a high-volume practice. Our orthopedic billing team is built to close every one of those gaps.</p>
              <p className="text-gray">Every orthopedic client receives a dedicated account team with deep surgical coding experience, a global period tracking system integrated with their PM, and an implant reconciliation process that runs before every claim submission.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                <h3 className="font-bold text-navy mb-4">Our orthopedic billing covers:</h3>
                {['Joint replacement (hip, knee, shoulder, ankle)', 'Arthroscopic procedures (shoulder, knee, hip, wrist)', 'Fracture care — open and closed, with and without manipulation', 'Implant and supply billing with invoice reconciliation', '90-day global period tracking and modifier management', 'Workers\' compensation (all 50 states)', 'ASC facility billing vs. hospital outpatient', 'Physical medicine bundling analysis', 'Spine surgery (anterior, posterior, instrumented fusions)', 'Hand and upper extremity surgery coding', 'Biologics and bone graft documentation', 'Pre-surgical prior authorization tracking'].map((item, i) => (
                  <div key={i} className="flex items-start"><CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" /><p className="text-gray text-sm">{item}</p></div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="PROCEDURE CODES" title="Common Orthopedic CPT Codes We Bill" description="A sample of the orthopedic procedure codes our team handles — each with specialty-specific billing rules." />
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
            <h2 className="text-3xl font-bold text-white font-playfair mb-4">3-Surgeon Orthopedic Practice, Central Florida</h2>
            <p className="text-cream/80 mb-8">High implant volume with inconsistent cost capture and global period violations causing payer audits. AR had reached 52 days and two audit letters arrived in 18 months.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{ label: 'Implant Revenue', before: 'Missed', after: '+$124K/yr' }, { label: 'AR Days', before: '52', after: '28' }, { label: 'Payer Audits', before: '2/yr', after: '0' }, { label: 'Global Violations', before: 'Frequent', after: 'Eliminated' }].map((m, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4 text-center"><p className="text-xs text-gray/60 mb-1">{m.label}</p><p className="text-xs text-gray/40 line-through">{m.before}</p><p className="text-xl font-bold text-mint">{m.after}</p></div>
              ))}
            </div>
            <blockquote className="border-l-4 border-mint pl-5"><p className="text-cream italic">"The implant billing alone paid for Aethera's fees ten times over in the first year. And the audit letters stopped completely."</p></blockquote>
            <div className="mt-6"><Link href="/case-studies" className="text-mint font-semibold hover:text-white transition-colors inline-flex items-center">Read all case studies <ArrowRight className="h-4 w-4 ml-1" /></Link></div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Orthopedic Billing Questions" description="Common questions from orthopedic surgeons and practice managers." />
          <div className="space-y-4 mt-12">
            {faqs.map((faq, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-cream rounded-xl p-6 border border-gray/10"><h3 className="font-bold text-navy mb-2">{faq.q}</h3><p className="text-gray text-sm">{faq.a}</p></div></FadeIn>))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn><h2 className="text-3xl font-bold text-white font-playfair mb-4">Ready to Capture Every Orthopedic Dollar?</h2><p className="text-cream max-w-xl mx-auto mb-8">Start with a free orthopedic billing assessment. We'll identify your implant gaps, global period risks, and denial patterns.</p><Link href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">Get Free Orthopedic Assessment <ArrowRight className="h-4 w-4 ml-2" /></Link></FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
