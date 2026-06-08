import Link from 'next/link';
import { CheckCircle, AlertCircle, TrendingUp, Shield, DollarSign, FileText, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Dermatology Billing Services | RCM for Dermatologists | Aethera Healthcare',
  description: 'Expert dermatology billing for Mohs surgery, destruction codes, biopsies, and cosmetic vs. reconstructive procedures. 97.4% clean claim rate, 31% average Mohs revenue increase.',
};

const stats = [
  { value: '97.4%', label: 'Clean Claim Rate' },
  { value: '3.6%', label: 'Average Denial Rate' },
  { value: '19 Days', label: 'Average AR Days' },
  { value: '+31%', label: 'Average Mohs Revenue Increase' },
];

const challenges = [
  { icon: <AlertCircle className="h-6 w-6" />, title: 'Mohs Surgery Staging', description: 'Mohs codes (17311–17315) require precise staging documentation including number of stages, number of blocks, tissue mapping, and specimen count. Errors in any element trigger immediate denial or downcoding.' },
  { icon: <DollarSign className="h-6 w-6" />, title: 'Cosmetic vs. Reconstructive', description: 'The distinction between cosmetic (non-covered) and reconstructive (covered) procedures hinges entirely on documentation. Insufficient medical necessity language leads to automatic denials — even for procedures that should be covered.' },
  { icon: <FileText className="h-6 w-6" />, title: 'Destruction Code Specificity', description: 'Destruction codes (17000–17286) require specificity by lesion type (benign, premalignant, malignant), size, and count. Submitting a generic destruction code instead of the correct type-specific code means routine underpayment.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Biopsy Bundling', description: 'Biopsy codes (11100, 11101) are frequently bundled into excision codes when they should be separately billable. The key is procedure timing and independent documentation — our coders catch every separable biopsy.' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'Pathology Coordination', description: 'When dermatologists perform in-office pathology, billing must clearly delineate the surgical and pathology components. Split billing between the treating physician and pathologist requires careful coordination to avoid duplicate submission flags.' },
  { icon: <AlertCircle className="h-6 w-6" />, title: 'Excision Size Accuracy', description: 'Excision codes are size-dependent — millimeter errors in documented lesion or excision margin size shift the code. We verify operative documentation against submitted codes before every claim.' },
];

const cptCodes = [
  { code: '17311', desc: 'Mohs surgery, first stage, up to 5 tissue blocks', note: 'Must document stage count, block count, and tissue map separately' },
  { code: '17312', desc: 'Mohs surgery, each additional stage (up to 5 blocks)', note: 'Add-on code — required for every stage beyond the first' },
  { code: '17313', desc: 'Mohs surgery, first stage, more than 5 tissue blocks', note: 'Use when block count exceeds 5 on the first stage' },
  { code: '17314', desc: 'Mohs surgery, each additional stage (more than 5 blocks)', note: 'Add-on for high-complexity multi-block additional stages' },
  { code: '17000', desc: 'Destruction of premalignant lesion, first lesion', note: 'Must specify premalignant — actinic keratosis most common' },
  { code: '17003', desc: 'Destruction of premalignant lesions, 2nd–14th lesion', note: 'Per-lesion add-on code — count carefully in documentation' },
  { code: '17110', desc: 'Destruction of benign lesions, up to 14', note: 'Specify benign type; cannot bundle with malignant destruction codes' },
  { code: '11100', desc: 'Biopsy of skin, first lesion', note: 'Separately billable when independent of excision — verify timing' },
  { code: '11101', desc: 'Biopsy of skin, each additional lesion', note: 'Add-on to 11100 — document each lesion separately' },
  { code: '11400', desc: 'Excision, benign lesion, trunk/arms/legs, 0.5 cm or less', note: 'Size drives code — measure excised specimen including margins' },
  { code: '11440', desc: 'Excision, benign lesion, face/ears/nose, 0.5 cm or less', note: 'Anatomic location changes the code series' },
  { code: '99214', desc: 'Office visit, established, moderate medical decision making', note: 'Use with modifier 25 when E&M and procedure performed same day' },
];

const faqs = [
  { q: 'Do you have coders who specialize specifically in Mohs surgery billing?', a: 'Yes. We assign Mohs-specialist coders to dermatology accounts with significant Mohs volume. These coders review operative reports against Mohs tissue maps, verify block counts, and apply the correct staging codes for every case.' },
  { q: 'How do you handle the cosmetic vs. reconstructive documentation issue?', a: 'We work with practices to develop payer-specific documentation templates that satisfy medical necessity language requirements for each major carrier. When a claim is at risk of cosmetic denial, we flag it for provider documentation review before submission.' },
  { q: 'We perform biopsies and excisions in the same visit. How do you handle that?', a: 'We evaluate each case on its own merits. When a biopsy is independently documented and the excision is performed at a separate site or session, we bill them separately with appropriate modifiers. When bundling rules apply, we apply them correctly — neither overbilling nor underbilling.' },
  { q: 'Do you handle in-office pathology billing?', a: 'Yes. We manage in-office pathology billing including tissue processing and examination codes (88302–88309). We coordinate professional and technical component billing and ensure no duplicate submission with external pathology labs.' },
  { q: 'How quickly can you improve our Mohs billing accuracy?', a: 'In our experience, Mohs billing corrections take effect within the first 30 days of service. Our onboarding process includes a dedicated Mohs coding review during weeks 1–2 before the first claim submissions go out.' },
];

export default function DermatologyBilling() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Dermatology Billing Specialists</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">Dermatology Billing That Gets Mohs Right</h1>
              <p className="text-xl text-cream mb-10">Mohs staging codes, destruction specificity, biopsy bundling rules, cosmetic vs. reconstructive documentation — our dermatology billing team handles the nuance that drives a 31% average revenue increase on Mohs alone.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">Get Free Derm Assessment</Link>
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
          <SectionHeader label="BILLING CHALLENGES WE SOLVE" title="Dermatology's Hidden Revenue Leaks" description="These are the six billing issues that cost dermatology practices the most — and what we do about each one." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {challenges.map((c, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full"><div className="text-teal mb-4">{c.icon}</div><h3 className="font-bold text-navy mb-2">{c.title}</h3><p className="text-gray text-sm">{c.description}</p></div></FadeIn>))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">How Aethera Handles Dermatology Billing</h2>
              <p className="text-gray mb-5">Dermatology has a level of coding specificity that trips up generalist billing teams constantly. Mohs staging add-ons, lesion-type destruction codes, excision size thresholds — every element matters, and errors compound across hundreds of claims per month.</p>
              <p className="text-gray">Our dermatology billing team includes Mohs-specialist coders who review tissue maps, operative reports, and pathology documentation before each claim is submitted. Every dermatology client gets a payer-specific rules library maintained quarterly.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                <h3 className="font-bold text-navy mb-4">Our dermatology billing covers:</h3>
                {['Mohs surgery (17311–17315) with block and stage tracking', 'Benign, premalignant, and malignant destruction codes', 'Excision coding by size, location, and lesion type', 'Biopsy (11100, 11101) — separable vs. bundled analysis', 'Cosmetic vs. reconstructive documentation support', 'In-office pathology (88302–88309)', 'Cryotherapy, laser, and phototherapy codes', 'Acne surgery and comedone extraction', 'Patch testing (95044–95052) billing', 'Chemical peel and dermabrasion documentation', 'Modifier 25 management for same-day E&M + procedure', 'Pathology coordination with external labs'].map((item, i) => (<div key={i} className="flex items-start"><CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" /><p className="text-gray text-sm">{item}</p></div>))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="PROCEDURE CODES" title="Common Dermatology CPT Codes We Bill" description="Dermatology-specific codes our team handles daily — each requires specialty knowledge to bill correctly." />
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
            <h2 className="text-3xl font-bold text-white font-playfair mb-4">2-Provider Dermatology Practice, Florida</h2>
            <p className="text-cream/80 mb-8">High Mohs volume with years of miscoding. Reconstructive cases written off for insufficient documentation. Denial rate at 18%.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{ label: 'Denial Rate', before: '18%', after: '4.3%' }, { label: 'Mohs Revenue', before: 'Baseline', after: '+31%' }, { label: 'Reconstructive Claims', before: 'Written off', after: '+$9,800/mo' }, { label: 'AR Days', before: '39', after: '19' }].map((m, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4 text-center"><p className="text-xs text-gray/60 mb-1">{m.label}</p><p className="text-xs text-gray/40 line-through">{m.before}</p><p className="text-xl font-bold text-mint">{m.after}</p></div>
              ))}
            </div>
            <blockquote className="border-l-4 border-mint pl-5"><p className="text-cream italic">"We'd been coding Mohs the same way for seven years and nobody told us it was wrong. Aethera fixed it in 30 days and we haven't had a Mohs denial since."</p></blockquote>
            <div className="mt-6"><Link prefetch={false} href="/case-studies" className="text-mint font-semibold hover:text-white transition-colors inline-flex items-center">Read all case studies <ArrowRight className="h-4 w-4 ml-1" /></Link></div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Dermatology Billing Questions" description="Common questions from dermatologists and practice managers." />
          <div className="space-y-4 mt-12">
            {faqs.map((faq, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-cream rounded-xl p-6 border border-gray/10"><h3 className="font-bold text-navy mb-2">{faq.q}</h3><p className="text-gray text-sm">{faq.a}</p></div></FadeIn>))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn><h2 className="text-3xl font-bold text-white font-playfair mb-4">Ready to Get Your Mohs Billing Right?</h2><p className="text-cream max-w-xl mx-auto mb-8">Start with a free dermatology billing assessment. We'll audit your Mohs coding, destruction specificity, and denial patterns.</p><Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">Get Free Derm Assessment <ArrowRight className="h-4 w-4 ml-2" /></Link></FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
