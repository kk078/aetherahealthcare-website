import Link from 'next/link';
import { CheckCircle, TrendingUp, Shield, Clock, DollarSign, FileText, AlertCircle, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Cardiology Billing Services | RCM for Cardiologists | Aethera Healthcare',
  description: 'Expert cardiology billing and revenue cycle management. We handle cardiac cath, stress testing, EP studies, remote monitoring, and all cardiology-specific coding complexities. 97.1% clean claim rate.',
};

const stats = [
  { value: '97.1%', label: 'Clean Claim Rate for Cardiology' },
  { value: '3.8%', label: 'Average Denial Rate' },
  { value: '21 Days', label: 'Average AR Days' },
  { value: '22%', label: 'Average Revenue Increase' },
];

const challenges = [
  {
    icon: <AlertCircle className="h-6 w-6" />,
    title: 'Cardiac Cath Modifier Complexity',
    description: 'Professional vs. technical component splitting (modifier 26 and TC), bilateral procedure indicators, and same-day cath lab service bundling rules are among the most denial-prone areas in cardiology. Our coders know these rules cold.',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Stress Test Component Billing',
    description: 'Submitting 93015 (complete stress test) vs. 93016/93017/93018 (supervision/tracing/interpretation components) incorrectly is a top denial trigger. We map your payer contracts to determine the correct billing approach per carrier.',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'EP Study Coding',
    description: 'Electrophysiology study codes carry complex add-on code sequences that must match specific documentation elements. Our electrophysiology coding specialists ensure full code capture with every submission.',
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: 'Remote Monitoring Billing',
    description: '93228, 93229, 93270–93272 remote cardiac monitoring codes require specific documentation intervals and reporting thresholds. We track compliance and submit these codes correctly every cycle.',
  },
  {
    icon: <DollarSign className="h-6 w-6" />,
    title: 'Prior Auth for Cardiac Procedures',
    description: 'Prior authorization requirements for cardiac catheterizations, ablations, and device placements vary widely by payer. Our prior auth team maintains real-time payer policy libraries to prevent avoidable denials.',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Implantable Device Billing',
    description: 'Pacemaker, ICD, and loop recorder billing requires correct device codes, interrogation add-ons, and remote monitoring codes to be submitted together without triggering bundling edits.',
  },
];

const cptCodes = [
  { code: '92920', desc: 'Percutaneous coronary intervention (PCI), single vessel', note: 'Requires documentation of vessel treated and type of intervention' },
  { code: '92928', desc: 'PCI with stent placement, single vessel', note: 'Drug-eluting vs. bare metal stent must be specified' },
  { code: '93000', desc: 'Electrocardiogram with interpretation and report', note: 'Cannot bill 93010 (interpretation only) for same service' },
  { code: '93015', desc: 'Cardiovascular stress test, complete', note: 'Use 93016/17/18 when supervision and interpretation are split' },
  { code: '93224', desc: '24-hour Holter monitoring, recording and analysis', note: 'Requires documentation of duration and findings' },
  { code: '93228', desc: 'External mobile cardiovascular telemetry, review and report', note: 'Monthly reporting cycle — bill per calendar month' },
  { code: '93306', desc: 'Echocardiography, transthoracic, complete', note: 'Must document M-mode, 2D, and Doppler components' },
  { code: '93351', desc: 'Stress echocardiography with contrast', note: 'Requires documentation of medical necessity for contrast' },
  { code: '93600', desc: 'Bundle of His recording', note: 'Add-on codes required for additional mapping and ablation' },
  { code: '93619', desc: 'EP study, comprehensive', note: 'Most complex EP study code — requires full documentation protocol' },
  { code: '93270', desc: 'Patient-activated cardiac event recording, analysis', note: 'Remote monitoring — report monthly, not per transmission' },
  { code: '33206', desc: 'Insertion of permanent pacemaker, atrial', note: 'Device code required; include vendor invoice for implant reporting' },
];

const faqs = [
  { q: 'Do you have coders who specialize specifically in cardiology?', a: 'Yes. Our cardiology billing team includes CPC-certified coders with dedicated cardiology experience. They handle interventional, electrophysiology, imaging, and remote monitoring coding — not just office visits.' },
  { q: 'How do you handle the 26/TC modifier split for our hospital-based cardiologists?', a: 'We maintain a payer-specific modifier matrix for every cardiologist we work with, including which payers accept global billing, which require the split, and which have special professional component rules for hospital-based providers.' },
  { q: 'We do a lot of remote cardiac monitoring. Can you handle the monthly billing cycles?', a: 'Absolutely. Remote cardiac monitoring (93228, 93229, 93270 series) has specific monthly billing cycles and documentation thresholds. We track your patients\' monitoring periods and submit on the correct cycle automatically.' },
  { q: 'What\'s your experience with EP studies and ablation coding?', a: 'Our coders are experienced with the full range of EP study codes including comprehensive studies (93619, 93620), ablation (93653, 93654, 93656), and mapping add-ons. We review procedure reports against billing to ensure every add-on code is captured.' },
  { q: 'How quickly can you start if we\'re switching from another billing company?', a: 'Most cardiology practices are fully transitioned within 4–6 weeks. We manage the entire process including data migration, payer notifications, and parallel processing — so there\'s no gap in claim submissions.' },
];

export default function CardiologyBilling() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
                Cardiology Billing Specialists
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">
                Cardiology Billing That Understands Your World
              </h1>
              <p className="text-xl text-cream mb-10">
                From cardiac cath modifiers to EP study add-ons to remote monitoring cycles — our cardiology billing team handles the complexity so you can focus on your patients' hearts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">
                  Get Free Cardiology Assessment
                </Link>
                <Link href="/contact" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-bold py-3 px-8 rounded-full transition-colors text-center">
                  Talk to a Specialist
                </Link>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 bg-white border-b border-gray/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-3xl font-bold text-teal">{s.value}</p>
                <p className="text-gray text-sm mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="WHY CARDIOLOGY BILLING IS COMPLEX"
            title="The Billing Challenges We Solve Daily"
            description="Cardiology has some of the highest coding complexity in medicine. These are the issues we resolve for every cardiology client."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {challenges.map((c, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full">
                  <div className="text-teal mb-4">{c.icon}</div>
                  <h3 className="font-bold text-navy mb-2">{c.title}</h3>
                  <p className="text-gray text-sm">{c.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* How We Handle It */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">
                How Aethera Handles Cardiology Billing
              </h2>
              <p className="text-gray mb-5">
                Cardiology billing requires a team that doesn't treat it like general medicine. Our dedicated cardiology billing specialists maintain real-time knowledge of interventional, electrophysiology, imaging, and remote monitoring coding — and they're supported by a payer-specific rules library that's updated with every policy change.
              </p>
              <p className="text-gray">
                When you partner with Aethera, you're assigned a cardiology-dedicated account team that knows the difference between a 93015 and a 93016/17/18 split, and knows which of your payers requires which approach. That granularity is what drives our 97.1% clean claim rate for cardiology clients.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                <h3 className="font-bold text-navy mb-4">Specifically, we handle:</h3>
                {[
                  'Cardiac catheterization (right and left heart, combined procedures)',
                  'Percutaneous coronary intervention (PCI) with and without stent',
                  'Electrophysiology studies and ablation add-on codes',
                  'Remote cardiac monitoring (93228, 93229, 93270–93272)',
                  'Stress testing (complete vs. component billing by payer)',
                  'Echocardiography (TTE, TEE, stress echo, contrast)',
                  'Pacemaker and ICD insertions, replacements, interrogations',
                  'Loop recorder insertion and remote monitoring',
                  'Cardiac rehabilitation billing (93797, 93798)',
                  'Modifier management (26, TC, 59, 51, bilateral indicators)',
                  'Prior authorization tracking for cardiac procedures',
                  'Medicare Advantage and commercial prior auth workflows',
                ].map((item, i) => (
                  <div key={i} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" />
                    <p className="text-gray text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CPT Codes */}
      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="PROCEDURE CODES" title="Common Cardiology CPT Codes We Bill" description="A sample of the cardiology procedure codes our team handles daily — each with specialty-specific billing rules." />
          <div className="mt-12 overflow-x-auto">
            <table className="w-full bg-white rounded-xl overflow-hidden border border-gray/10">
              <thead>
                <tr className="bg-navy text-white text-sm">
                  <th className="py-3 px-5 text-left font-semibold">CPT Code</th>
                  <th className="py-3 px-5 text-left font-semibold">Description</th>
                  <th className="py-3 px-5 text-left font-semibold hidden md:table-cell">Billing Note</th>
                </tr>
              </thead>
              <tbody>
                {cptCodes.map((row, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-cream' : 'bg-white'}>
                    <td className="py-3 px-5 font-bold text-teal text-sm">{row.code}</td>
                    <td className="py-3 px-5 text-navy text-sm">{row.desc}</td>
                    <td className="py-3 px-5 text-gray text-xs hidden md:table-cell">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Case Study Snapshot */}
      <section className="py-16 md:py-24 bg-navy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Case Study</span>
            <h2 className="text-3xl font-bold text-white font-playfair mb-4">4-Provider Cardiology Group, Central Florida</h2>
            <p className="text-cream/80 mb-8">This group came to Aethera with a 14.2% denial rate — almost entirely from cardiac cath modifier errors and stress test bundling issues. AR had reached 47 days and $40,000/month was being written off without appeal.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Denial Rate', before: '14.2%', after: '3.8%' },
                { label: 'AR Days', before: '47', after: '21' },
                { label: 'Collections', before: 'Baseline', after: '+22%' },
                { label: 'Hours Saved/Wk', before: '—', after: '31 hrs' },
              ].map((m, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray/60 mb-1">{m.label}</p>
                  <p className="text-xs text-gray/40 line-through">{m.before}</p>
                  <p className="text-xl font-bold text-mint">{m.after}</p>
                </div>
              ))}
            </div>
            <blockquote className="border-l-4 border-mint pl-5">
              <p className="text-cream italic">"We were writing off $40,000 a month in denials we assumed were uncollectable. Aethera recovered most of it in the first 60 days."</p>
            </blockquote>
            <div className="mt-6">
              <Link href="/case-studies" className="text-mint font-semibold hover:text-white transition-colors inline-flex items-center">
                Read all case studies <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Cardiology Billing Questions" description="Common questions from cardiologists considering outsourcing their revenue cycle." />
          <div className="space-y-4 mt-12">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="bg-cream rounded-xl p-6 border border-gray/10">
                  <h3 className="font-bold text-navy mb-2">{faq.q}</h3>
                  <p className="text-gray text-sm">{faq.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold text-white font-playfair mb-4">Ready to Maximize Your Cardiology Revenue?</h2>
              <p className="text-cream max-w-xl mx-auto mb-8">Start with a free cardiology billing assessment. We'll audit your denial patterns and show you exactly where revenue is being lost.</p>
              <Link href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">
                Get Free Cardiology Assessment <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
