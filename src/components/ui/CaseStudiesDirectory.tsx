'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  ArrowRight,
  Search,
  CheckCircle2,
  Building2,
  Clock,
  DollarSign,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PRIMARY_EXPERT_EMAIL } from '@/lib/worker';

export interface CaseStudyItem {
  id: string;
  specialty: string;
  category: 'primary' | 'surgical' | 'diagnostic' | 'behavioral';
  practice: string;
  location: string;
  tag: string;
  challenge: string;
  solution: string;
  quote: string;
  quoteAttrib: string;
  metrics: {
    label: string;
    before: string;
    after: string;
    better: boolean;
  }[];
}

const ALL_CASE_STUDIES: CaseStudyItem[] = [
  {
    id: 'cardiology',
    specialty: 'Cardiology',
    category: 'surgical',
    practice: 'Midwest Cardiovascular Specialists',
    location: 'Illinois',
    tag: 'Cardiology',
    challenge:
      'A 6-provider cardiology group came to Aethera with a 14.2% denial rate — driven almost entirely by cardiac catheterization modifier errors (Modifier 59 vs XU) and bundling issues on myocardial perfusion imaging (93015/78452). Their AR had ballooned to 47 days, and an estimated $40,000/month was being written off without appeal.',
    solution:
      'Aethera assigned certified AAPC cardiology coders who rebuilt their modifier matrix for the entire 93000-series. We implemented real-time 270 eligibility checks pre-catheterization and created an automated NCCI bundling scrubber. The backlog of $240,000 in unappealed denials was recovered within 60 days.',
    quote:
      '"We were writing off $40,000 a month in denials we assumed were uncollectable. Aethera recovered most of it in the first 60 days — and then made sure it wouldn\'t happen again."',
    quoteAttrib: 'Practice Administrator, Midwest Cardiovascular',
    metrics: [
      { label: 'Denial Rate', before: '14.2%', after: '3.8%', better: true },
      { label: 'Days in A/R', before: '47 days', after: '21 days', better: true },
      { label: 'Net Collections', before: 'Baseline', after: '+22%', better: true },
      { label: 'Admin Hours Saved', before: '—', after: '31 hrs/wk', better: true },
    ],
  },
  {
    id: 'family-medicine',
    specialty: 'Family Medicine',
    category: 'primary',
    practice: 'Valley Family Health Clinic',
    location: 'Texas',
    tag: 'Primary Care',
    challenge:
      'A multi-location family medicine practice had been relying on front desk staff to handle billing alongside patient check-in. Clean claim rate was 78% — 17 points below industry standard. A coding audit revealed consistent undercoding on complex office visits: 99214s being submitted as 99213s due to physician documentation fear of audit.',
    solution:
      'Aethera deployed medical decision-making (MDM) documentation templates, trained providers on 2026 CMS E&M guidelines, and instituted real-time charge scrubbing. We also launched a patient financial clearance protocol that collected copays at check-in.',
    quote:
      '"I was essentially giving away $200,000 a year because our billing was undercoding complex visits. Aethera gave us documentation confidence and our revenue soared."',
    quoteAttrib: 'Medical Director, Valley Family Health',
    metrics: [
      { label: 'Clean Claim Rate', before: '78%', after: '98.4%', better: true },
      { label: 'Denial Rate', before: '16%', after: '3.1%', better: true },
      { label: 'Monthly Collections', before: 'Baseline', after: '+$24,500', better: true },
      { label: 'Admin Overhead', before: 'High', after: 'Automated', better: true },
    ],
  },
  {
    id: 'orthopedics',
    specialty: 'Orthopedic Surgery',
    category: 'surgical',
    practice: 'Apex Orthopedic & Spine Surgery',
    location: 'Florida',
    tag: 'Orthopedics',
    challenge:
      'An orthopedic surgery practice with high joint replacement and arthroscopy volume was suffering revenue leakage from missing implant invoices (C-codes and L-codes) and global surgical period modifier conflicts (Modifier 58, 78, 79). Days in AR sat at 52 days, and two commercial payer post-payment audits were pending.',
    solution:
      'Aethera created an automated surgical charge reconciliation workflow requiring vendor implant invoice matching prior to 837P release. Our appeal team represented the practice during payer audits, overturning all recoupment demands without financial penalty.',
    quote:
      '"The implant reconciliation workflow alone paid for Aethera\'s entire performance fee five times over in the first 9 months."',
    quoteAttrib: 'Managing Partner, Apex Orthopedic',
    metrics: [
      { label: 'Implant Revenue Captured', before: 'Inconsistent', after: '+$148K/yr', better: true },
      { label: 'Days in A/R', before: '52 days', after: '27 days', better: true },
      { label: 'Payer Audit Recoupment', before: '$68K at risk', after: '$0 paid', better: true },
      { label: 'Clean Claim Rate', before: '83%', after: '98.6%', better: true },
    ],
  },
  {
    id: 'neurology',
    specialty: 'Neurology & Sleep Medicine',
    category: 'behavioral',
    practice: 'NeuroDiagnostic Associates',
    location: 'North Carolina',
    tag: 'Neurology',
    challenge:
      'A busy neurology practice experienced high denial rates on nerve conduction studies (95905–95913) and routine EEG monitoring (95816). Commercial payers were bundling studies into baseline office visits and demanding proof of medical necessity. Days in A/R sat at 58 days with $180,000 in unresolved aging AR over 90 days.',
    solution:
      'Aethera implemented specialty-specific NCCI modifier scrubbing (Modifier 59 vs XS) and built clinical appeal packets pre-populated with neurological indication criteria. Our dedicated AR recovery unit worked down the 90+ day balance in 75 days.',
    quote:
      '"Our previous billing company had given up on our EMG denials. Aethera recovered 82% of them and dropped our A/R under 26 days."',
    quoteAttrib: 'Lead Neurologist, NeuroDiagnostic Associates',
    metrics: [
      { label: 'Denial Rate', before: '17.4%', after: '4.2%', better: true },
      { label: 'Days in A/R', before: '58 days', after: '26 days', better: true },
      { label: 'Aging A/R Over 90 Days', before: '$180,000', after: '$18,500', better: true },
      { label: 'Cash Recovery', before: 'Baseline', after: '+$210K lift', better: true },
    ],
  },
  {
    id: 'pain-management',
    specialty: 'Pain Management & Spine',
    category: 'surgical',
    practice: 'Interventional Spine & Pain Care',
    location: 'Georgia',
    tag: 'Pain Management',
    challenge:
      'Fluoroscopy guidance (CPT 77002) and epidural steroid injections (62321/62323) were repeatedly rejected due to strict prior authorization rules and frequency edits. The clinic faced a 19.8% initial denial rate, with front-office staff spending 22 hours per week on hold with commercial payers.',
    solution:
      'Aethera deployed an automated prior authorization tracking pipeline linked to payer clinical coverage criteria. Our coding team audited bilateral modifier 50 compliance and facet joint injection limitations, eliminating repeated denial loops.',
    quote:
      '"Prior authorization used to paralyze our clinic schedule. Aethera took over the entire workflow, and our denial rate dropped by more than 75%."',
    quoteAttrib: 'Clinic Administrator, Interventional Spine',
    metrics: [
      { label: 'Denial Rate', before: '19.8%', after: '4.1%', better: true },
      { label: 'Prior Auth Approval', before: '64%', after: '94%', better: true },
      { label: 'Prior Auth Staff Hours', before: '22 hrs/wk', after: '2 hrs/wk', better: true },
      { label: 'Monthly Collections', before: 'Baseline', after: '+$38,000', better: true },
    ],
  },
  {
    id: 'obgyn',
    specialty: 'Obstetrics & Gynecology (OB/GYN)',
    category: 'surgical',
    practice: 'Women’s Comprehensive Health Network',
    location: 'California',
    tag: 'OB/GYN',
    challenge:
      'Global maternity package billing (59400/59510) caused recurring cash flow lags. Antepartum visits were incorrectly billed before delivery, resulting in claim rejections. High-risk ultrasound add-ons (76811/76812) were frequently downcoded to routine scans by commercial payers.',
    solution:
      'Aethera established a global maternity milestone tracker that automatically holds delivery codes until completion of care while submitting non-routine medical complications under correct modifiers. We appealed all ultrasound downcodings citing SMFM clinical guidelines.',
    quote:
      '"Maternity billing is notoriously complex. Aethera eliminated our global billing confusion and increased our ultrasound reimbursement by 34%."',
    quoteAttrib: 'Senior Partner, Women’s Health Network',
    metrics: [
      { label: 'Clean Claim Rate', before: '81%', after: '98.4%', better: true },
      { label: 'Ultrasound Collections', before: 'Baseline', after: '+34%', better: true },
      { label: 'Days in A/R', before: '49 days', after: '25 days', better: true },
      { label: 'Appeals Overturned', before: '22%', after: '84%', better: true },
    ],
  },
  {
    id: 'oncology',
    specialty: 'Medical Oncology & Hematology',
    category: 'diagnostic',
    practice: 'Regional Cancer & Infusion Center',
    location: 'Ohio',
    tag: 'Oncology',
    challenge:
      'High-cost chemotherapy drug administration (CPT 96413/96415) and J-code biologics created massive financial risk. Failure to append CMS JW and JZ discarded drug modifiers was holding up millions in reimbursement, while copay assistance programs were underutilized.',
    solution:
      'Aethera implemented real-time NDC-to-HCPCS unit crosswalk scrubbing with automated JW/JZ modifier calculations based on vial size and patient dosage. We integrated manufacturer copay card assistance directly into patient billing.',
    quote:
      '"In oncology, a single denied drug claim can cost $15,000. Aethera’s meticulous J-code and infusion scrubbing protected our entire margin."',
    quoteAttrib: 'Chief Financial Officer, Regional Cancer Center',
    metrics: [
      { label: 'J-Code Drug Denial Rate', before: '11.4%', after: '1.2%', better: true },
      { label: 'Days in A/R', before: '41 days', after: '22 days', better: true },
      { label: 'Clean Claim Rate', before: '88%', after: '99.1%', better: true },
      { label: 'Drug Margin Protected', before: 'At risk', after: '100% compliant', better: true },
    ],
  },
  {
    id: 'dermatology',
    specialty: 'Dermatology & Mohs Surgery',
    category: 'surgical',
    practice: 'Coastline Dermatology & Mohs Center',
    location: 'Florida',
    tag: 'Dermatology',
    challenge:
      'High biopsy and Mohs micrographic surgery (17311–17315) volume led to severe CARC 97 bundling denials when flap or graft repair (14000 series) was performed on the same date. Pathology slide preparation and reading were frequently unbilled.',
    solution:
      'Aethera integrated Mohs multi-stage charge templates with automatic anatomical site mapping and modifier 59/XS insertion. We separated technical and professional pathology components (Modifier TC/26) per commercial contract rules.',
    quote:
      '"Our previous biller was missing our reconstructive repair claims entirely. Aethera captured $12,000 extra per month without a single audit issue."',
    quoteAttrib: 'Board-Certified Dermatologist & Mohs Surgeon',
    metrics: [
      { label: 'Denial Rate', before: '18%', after: '4.1%', better: true },
      { label: 'Mohs Net Reimbursement', before: 'Baseline', after: '+31%', better: true },
      { label: 'Reconstructive Claims', before: 'Unbilled', after: '+$12,400/mo', better: true },
      { label: 'Days in A/R', before: '39 days', after: '19 days', better: true },
    ],
  },
  {
    id: 'psychiatry',
    specialty: 'Psychiatry & Behavioral Health',
    category: 'behavioral',
    practice: 'Anchor Behavioral Health Group',
    location: 'Pennsylvania',
    tag: 'Behavioral Health',
    challenge:
      'Psychotherapy add-on codes (+90833) billed alongside E&M visits were repeatedly denied as unbundled. Telehealth POS 02/10 and modifier 95 were misapplied, leading to retroactive payer clawbacks of $35,000.',
    solution:
      'Aethera reconfigured all clinical templates to enforce Mental Health Parity standards, standardized telehealth modifier rules across all commercial and Medicaid payers, and appealed the retrospective clawback demands successfully.',
    quote:
      '"Aethera saved us $35,000 in clawbacks and taught us how to correctly document therapy add-on codes. Our monthly revenue grew by 28%."',
    quoteAttrib: 'Clinical Director, Anchor Behavioral Health',
    metrics: [
      { label: 'Clawback Recoupment', before: '$35K demanded', after: '$0 recoupment', better: true },
      { label: 'Add-on 90833 Denial Rate', before: '24.5%', after: '2.1%', better: true },
      { label: 'Net Monthly Collections', before: 'Baseline', after: '+28%', better: true },
      { label: 'Days in A/R', before: '46 days', after: '22 days', better: true },
    ],
  },
  {
    id: 'internal-medicine',
    specialty: 'Internal Medicine Group',
    category: 'primary',
    practice: 'Metropolitan Internal Medicine Group',
    location: 'New York',
    tag: 'Group Practice',
    challenge:
      'A 12-provider internal medicine group was transitioning from hospital employment to independent private practice. They had no existing billing infrastructure, new TIN credentialing requirements, and a hard go-live date 45 days out. Cash flow interruption was the primary existential risk.',
    solution:
      'Aethera executed a full fast-track infrastructure deployment: parallel credentialing across all 12 physicians, eClinicalWorks EHR clearinghouse bridge setup, fee schedule loading, and EFT banking. Claims were processed on day 38 with zero payment gap.',
    quote:
      '"Aethera built our entire billing operation from scratch in under 6 weeks. Every provider was credentialed, the system was live, and we didn\'t miss a single payroll cycle."',
    quoteAttrib: 'Chief Executive Officer, Metropolitan Internal Medicine',
    metrics: [
      { label: 'Days to Go Live', before: '45 day target', after: '38 days', better: true },
      { label: 'Clean Claim Rate (Day 1)', before: '—', after: '96.2%', better: true },
      { label: 'Upfront Setup Fees', before: 'Expected $15K', after: '$0', better: true },
      { label: 'Cash Flow Disruption', before: 'High risk', after: '0 days', better: true },
    ],
  },
];

export default function CaseStudiesDirectory() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredStudies = ALL_CASE_STUDIES.filter(cs => {
    const matchesCat = selectedCategory === 'all' || cs.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      cs.specialty.toLowerCase().includes(q) ||
      cs.practice.toLowerCase().includes(q) ||
      cs.challenge.toLowerCase().includes(q) ||
      cs.solution.toLowerCase().includes(q) ||
      cs.tag.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-12">
      {/* Category Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-6 border border-gray/20 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { key: 'all', label: 'All Specialties (10)' },
              { key: 'surgical', label: 'Surgical & Procedural' },
              { key: 'primary', label: 'Primary Care & Internal' },
              { key: 'diagnostic', label: 'Oncology & Diagnostics' },
              { key: 'behavioral', label: 'Behavioral & Neuro' },
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === tab.key
                    ? 'bg-navy text-white border-navy shadow-xs'
                    : 'bg-cream text-navy border-gray/20 hover:border-teal'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by specialty or clinical code…"
              className="w-full pl-9 pr-3 py-1.5 border border-gray/25 rounded-xl text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>
      </div>

      {/* Case Studies Stream */}
      <div className="space-y-8">
        {filteredStudies.map((cs, i) => (
          <div
            key={cs.id}
            className={`rounded-2xl p-6 sm:p-10 border border-gray/20 shadow-sm transition-all hover:shadow-md ${
              i % 2 === 0 ? 'bg-white' : 'bg-[#faf8f5]'
            }`}
          >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                <span className="bg-teal text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  {cs.tag}
                </span>
                <span className="text-slate-600 text-xs font-semibold">{cs.practice} · {cs.location}</span>
              </div>
              <Link
                href={`/medical-billing/${cs.id}`}
                className="text-xs font-bold text-teal hover:text-navy transition-colors inline-flex items-center gap-1"
              >
                Explore {cs.specialty} Billing Guide <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Before / After KPI Metric Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {cs.metrics.map((m, mi) => (
                <div key={mi} className="bg-navy rounded-xl p-4 text-center text-white">
                  <p className="text-[11px] text-white/70 mb-1.5 font-medium">{m.label}</p>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs text-red-300 line-through opacity-80">{m.before}</span>
                    <span className="text-sm sm:text-base font-extrabold text-mint">{m.after}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Clinical Narrative: Challenge vs Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm leading-relaxed mb-6">
              <div className="p-4 rounded-xl bg-red-50/50 border border-red-100 text-slate-800 space-y-1">
                <h4 className="font-bold text-red-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  The Clinical &amp; RCM Challenge
                </h4>
                <p className="text-slate-700">{cs.challenge}</p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-slate-800 space-y-1">
                <h4 className="font-bold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  The Aethera Revenue Solution
                </h4>
                <p className="text-slate-700">{cs.solution}</p>
              </div>
            </div>

            {/* Verified Testimonial Quote */}
            <div className="border-l-4 border-teal pl-4 py-1 italic text-xs sm:text-sm text-slate-700 bg-cream/50 rounded-r-xl p-3">
              <p>{cs.quote}</p>
              <p className="not-italic text-[11px] font-bold text-navy mt-1">— {cs.quoteAttrib}</p>
            </div>
          </div>
        ))}

        {filteredStudies.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray/20">
            <p className="text-slate-600 font-semibold text-sm">No case studies match your search filter.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs font-bold text-teal hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Global Bottom CTA */}
      <div className="rounded-2xl bg-gradient-to-r from-navy via-navy to-teal p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl font-bold">Ready to Deliver These Results to Your Practice?</h3>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            Every practice is backed by our performance pricing (3.5%–5.0% of net collections) with $0 upfront setup fee and dedicated AAPC/AHIMA specialty coders.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/free-assessment"
            className="px-5 py-2.5 rounded-xl bg-teal hover:bg-white hover:text-navy text-white font-bold text-xs transition-colors shadow-sm text-center"
          >
            Get Free Practice Audit
          </Link>
          <a
            href={`mailto:${PRIMARY_EXPERT_EMAIL}?subject=Specialty%20Case%20Study%20Consultation`}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors text-center border border-white/20"
          >
            Email Kiran Directly
          </a>
        </div>
      </div>
    </div>
  );
}
