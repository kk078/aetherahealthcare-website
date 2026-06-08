import Link from 'next/link';
import { CheckCircle, AlertCircle, TrendingUp, Shield, DollarSign, FileText, ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';

export const metadata = {
  title: 'Family Medicine Billing | RCM for Family Physicians | Aethera Healthcare',
  description: 'Complete family medicine billing for preventive care, chronic disease management, annual wellness visits, E&M coding, and care management. 96.5% clean claim rate.',
};

const stats = [
  { value: '96.5%', label: 'Clean Claim Rate' },
  { value: '3.9%', label: 'Average Denial Rate' },
  { value: '20 Days', label: 'Average AR Days' },
  { value: '+18%', label: 'Average Revenue Increase' },
];

const challenges = [
  { icon: <AlertCircle className="h-6 w-6" />, title: 'Preventive vs. Problem-Focused Visits', description: 'When a patient comes in for their annual wellness visit and also has an acute problem addressed, billing splits into a preventive code + a separate E&M with modifier 25. Getting this wrong — in either direction — means either denied claims or revenue left on the table.' },
  { icon: <DollarSign className="h-6 w-6" />, title: 'Chronic Care Management (CCM)', description: 'CCM codes (99490, 99491) represent significant per-patient monthly revenue, but require 20+ minutes of care coordination time, documented consent, and a qualifying chronic condition. Most family medicine practices are eligible but under-billing.' },
  { icon: <FileText className="h-6 w-6" />, title: 'Annual Wellness Visit vs. Physical Exam', description: 'G0438 (initial AWV) and G0439 (subsequent AWV) are Medicare-specific — completely different from a 99385–99397 preventive exam. Submitting the wrong code to Medicare, or billing both in the same year, triggers automatic denial.' },
  { icon: <Shield className="h-6 w-6" />, title: 'Vaccine Administration Billing', description: 'Vaccine administration codes (90460, 90471) must be paired correctly with the vaccine product codes. Administration code selection depends on patient age, whether counseling occurred, and the number of injections. Payer rules vary significantly.' },
  { icon: <TrendingUp className="h-6 w-6" />, title: 'Behavioral Health Integration', description: 'Collaborative care management codes (99492–99494) and psychiatric collaborative care model billing are increasingly used in primary care but require specific care team roles, documented patient enrollment, and monthly tracking.' },
  { icon: <AlertCircle className="h-6 w-6" />, title: 'E&M Level Selection Accuracy', description: 'Family medicine sees more E&M visits than any other specialty. Consistent undercoding — billing 99213 for a 99214-level encounter — costs solo and small group practices $40,000–$120,000 per year. Our coders audit E&M levels continuously.' },
];

const cptCodes = [
  { code: '99202', desc: 'New patient, office visit, straightforward MDM', note: 'Medical decision-making or total time must support the level' },
  { code: '99213', desc: 'Established patient, low complexity MDM', note: 'Most undercoded E&M — verify against documented complexity' },
  { code: '99214', desc: 'Established patient, moderate complexity MDM', note: 'Most appropriate level for chronic disease management visits' },
  { code: '99215', desc: 'Established patient, high complexity MDM', note: 'Multiple diagnoses with prescription drug management' },
  { code: '99381', desc: 'Preventive visit, new patient, infant (under 1 year)', note: 'Age-based code selection — use correct age range' },
  { code: '99395', desc: 'Preventive visit, established patient, age 18–39', note: 'Use modifier 25 when acute problem also addressed' },
  { code: 'G0438', desc: 'Annual Wellness Visit, initial (Medicare)', note: 'Medicare-specific — do not use with non-Medicare patients' },
  { code: 'G0439', desc: 'Annual Wellness Visit, subsequent (Medicare)', note: 'Only once per calendar year; cannot bill same year as G0438' },
  { code: '99490', desc: 'Chronic Care Management, first 20 minutes', note: 'Requires documented consent and 20+ min care coordination monthly' },
  { code: '99491', desc: 'CCM, physician/QHP time, first 30 minutes', note: 'Higher RVU — physician must personally perform the coordination' },
  { code: '90460', desc: 'Immunization admin with counseling, under 18, first injection', note: 'Use with pediatric patients when counseling is documented' },
  { code: 'G0444', desc: 'Depression screening (annually)', note: 'Medicare preventive — must document PHQ-2/PHQ-9 result' },
];

const faqs = [
  { q: 'How do you handle the preventive visit + acute problem situation?', a: 'We bill the preventive visit code (99381–99397 or G0438/G0439) plus a separate E&M code (99202–99215) with modifier 25 when an acute or chronic problem is separately addressed and documented during the same visit. We verify that the documentation independently supports both services before submitting.' },
  { q: 'We have a lot of Medicare patients. Are you familiar with AWV requirements?', a: 'Yes. We differentiate G0438 (initial AWV) from G0439 (subsequent AWV), verify the last AWV date before submission, and confirm the required elements (health risk assessment, personalized prevention plan, advance care planning if applicable) are documented. We also alert providers when G0439 is due for eligible patients.' },
  { q: 'Our patients have multiple chronic conditions. Are we billing CCM codes correctly?', a: 'Most family medicine practices we onboard are either not billing CCM at all, or billing it without adequate documentation. We review your eligible patient roster, confirm consent documentation, and establish a monthly tracking process for care coordination minutes. The average CCM add-on revenue for a 1,500-patient primary care panel is $8,000–$14,000 per month.' },
  { q: 'We do a lot of vaccine administration. How do you handle that billing?', a: 'Vaccine billing requires matching the correct administration code (90460 for pediatric with counseling, 90471 for adult or non-counseling) to the corresponding vaccine product code, then applying the correct add-on for each additional vaccine administered in the same visit. We also track payer-specific VFC (Vaccines for Children) billing rules.' },
  { q: 'How do you know if we\'re undercoding our E&M visits?', a: 'We run an E&M distribution analysis in the first 30 days of your account. If your 99213:99214 ratio is unusually skewed, we flag it and request sample visit notes for coding review. Most family medicine practices we onboard discover they\'ve been undercoding 20–35% of established patient visits.' },
];

export default function FamilyMedicineBilling() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <FadeIn>
              <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">Family Medicine Billing Specialists</span>
              <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-6 leading-tight">Family Medicine Billing That Captures Every Visit</h1>
              <p className="text-xl text-cream mb-10">Preventive visit splits, CCM code eligibility, annual wellness visit rules, E&M level accuracy — our family medicine billing team finds the revenue that generalist billers miss in every high-volume primary care practice.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link prefetch={false} href="/free-assessment" className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors text-center">Get Free Family Medicine Assessment</Link>
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
          <SectionHeader label="BILLING CHALLENGES WE SOLVE" title="Where Family Medicine Revenue Gets Lost" description="Six billing problems specific to primary care — and how our team addresses each one." />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {challenges.map((c, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-white rounded-xl p-6 border border-gray/10 shadow-sm h-full"><div className="text-teal mb-4">{c.icon}</div><h3 className="font-bold text-navy mb-2">{c.title}</h3><p className="text-gray text-sm">{c.description}</p></div></FadeIn>))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <FadeIn>
              <h2 className="text-3xl font-bold text-navy font-playfair mb-5">How Aethera Handles Family Medicine Billing</h2>
              <p className="text-gray mb-5">Family medicine is high-volume, high-complexity billing. You see hundreds of patients a week across preventive care, chronic disease management, acute visits, and care coordination — each with its own coding rules. Generalist billing teams handle the volume but miss the nuance. We don't.</p>
              <p className="text-gray">Our family medicine billing specialists run continuous E&M distribution analysis, track CCM eligibility across your panel, and maintain Medicare preventive coding accuracy for your entire Medicare population. On average, family medicine practices see an 18% revenue increase in year one.</p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="bg-cream rounded-2xl p-7 border border-gray/10 space-y-3">
                <h3 className="font-bold text-navy mb-4">Our family medicine billing covers:</h3>
                {['E&M level accuracy with continuous distribution auditing', 'Preventive visit + acute problem split billing', 'Annual Wellness Visits (G0438, G0439) for Medicare', 'Chronic Care Management (99490, 99491) tracking', 'Transitional Care Management (99495, 99496)', 'Vaccine administration billing (90460, 90471)', 'Behavioral health integration (99492–99494)', 'Depression/anxiety screening (G0444, G0442)', 'Advance care planning (99497, 99498)', 'Tobacco cessation counseling (99406, 99407)', 'HEDIS measure-aligned coding', 'Medicare Annual Wellness Visit documentation support'].map((item, i) => (<div key={i} className="flex items-start"><CheckCircle className="h-4 w-4 text-teal flex-shrink-0 mt-0.5 mr-3" /><p className="text-gray text-sm">{item}</p></div>))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="PROCEDURE CODES" title="Common Family Medicine Codes We Bill" description="Primary care codes our team handles with specialty-specific accuracy — each with payer-specific billing rules." />
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
            <h2 className="text-3xl font-bold text-white font-playfair mb-4">Solo Family Medicine Physician, Tampa, FL</h2>
            <p className="text-cream/80 mb-8">Front desk staff handling billing with a 78% clean claim rate, consistent E&M undercoding, and no denial follow-up. Collections were $200,000/year below potential.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{ label: 'Clean Claim Rate', before: '78%', after: '96.4%' }, { label: 'Denial Rate', before: '16%', after: '4.1%' }, { label: 'Monthly Collections', before: 'Baseline', after: '+$18,200' }, { label: 'Admin Burden', before: 'High', after: 'Minimal' }].map((m, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4 text-center"><p className="text-xs text-gray/60 mb-1">{m.label}</p><p className="text-xs text-gray/40 line-through">{m.before}</p><p className="text-xl font-bold text-mint">{m.after}</p></div>
              ))}
            </div>
            <blockquote className="border-l-4 border-mint pl-5"><p className="text-cream italic">"I was essentially giving away $200,000 a year because my front desk was coding every visit at the same level. I had no idea until Aethera showed me the data."</p></blockquote>
            <div className="mt-6"><Link prefetch={false} href="/case-studies" className="text-mint font-semibold hover:text-white transition-colors inline-flex items-center">Read all case studies <ArrowRight className="h-4 w-4 ml-1" /></Link></div>
          </FadeIn>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="FAQ" title="Family Medicine Billing Questions" description="Common questions from family physicians and primary care practice managers." />
          <div className="space-y-4 mt-12">
            {faqs.map((faq, i) => (<FadeIn key={i} delay={i * 0.1}><div className="bg-cream rounded-xl p-6 border border-gray/10"><h3 className="font-bold text-navy mb-2">{faq.q}</h3><p className="text-gray text-sm">{faq.a}</p></div></FadeIn>))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-navy to-teal rounded-2xl py-14 px-8 text-center">
            <FadeIn><h2 className="text-3xl font-bold text-white font-playfair mb-4">Ready to See What Your Practice Is Actually Worth?</h2><p className="text-cream max-w-xl mx-auto mb-8">Start with a free family medicine billing assessment. We'll run an E&M distribution analysis and show you what's being left on the table.</p><Link prefetch={false} href="/free-assessment" className="inline-flex items-center bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors">Get Free Family Medicine Assessment <ArrowRight className="h-4 w-4 ml-2" /></Link></FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
