'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Building,
  FileCheck,
  DollarSign,
  Printer,
} from 'lucide-react';
import { PRIMARY_EXPERT_EMAIL, sendLeadToKiran } from '@/lib/worker';

interface Milestone {
  week: string;
  title: string;
  description: string;
  criticalPayer: string;
  riskNote: string;
}

const MILESTONES: Milestone[] = [
  {
    week: 'Weeks 1–2',
    title: 'CAQH ProView Profile & Primary Source Verification',
    description: 'Create/re-attest CAQH profile. Upload CV, state medical licenses, DEA certificate, state CDS, board certifications, and $1M/$3M malpractice certificate of insurance.',
    criticalPayer: 'Prerequisite for all Commercial & Medicaid Payers',
    riskNote: 'Any gap of >30 days in CV chronology triggers automated CAQH rejection.',
  },
  {
    week: 'Weeks 3–5',
    title: 'Medicare CMS-855I Enrollment via PECOS',
    description: 'Submit electronic Medicare Part B provider enrollment (CMS-855I) and reassign benefits to group NPI (CMS-855R). Establish MAC jurisdiction.',
    criticalPayer: 'CMS / Regional MAC (First Coast, Novitas, Noridian, Palmetto)',
    riskNote: 'Medicare retroactivity is strictly capped at 30 days prior to filing date.',
  },
  {
    week: 'Weeks 6–9',
    title: 'State Medicaid & Managed Care (MCO) Network Applications',
    description: 'File state Medicaid provider enrollment portal applications and submit provider rosters to regional Managed Care plans (Sunshine, Humana Healthy Horizons, Simply, etc.).',
    criticalPayer: 'State Medicaid Agency & Managed Medicaid Plans',
    riskNote: 'Medicaid enrollment can take up to 90 days; non-par claims will be rejected with CARC 24.',
  },
  {
    week: 'Weeks 9–13',
    title: 'Commercial Payer Contracting & Credentialing Committees',
    description: 'Execute provider participation agreements with Blue Cross Blue Shield, Aetna, UnitedHealthcare, Cigna, and Humana. Await monthly credentialing committee approvals.',
    criticalPayer: 'National Commercial PPOs & HMO Networks',
    riskNote: 'Most commercial payers hold credentialing committee meetings only once per month.',
  },
  {
    week: 'Weeks 14–16',
    title: 'Clearinghouse EDI 837, ERA 835 & EFT Enrollment',
    description: 'Submit clearinghouse payer enrollments for electronic claim submission, 835 electronic remittances, and direct EFT bank deposits.',
    criticalPayer: 'Availity / Waystar Clearinghouse & Payer Portals',
    riskNote: 'Claims submitted before EDI approval route to paper checks or clearinghouse hold.',
  },
];

export default function CredentialingTimelineEstimator() {
  const [providerType, setProviderType] = useState('Physician (MD / DO)');
  const [practiceState, setPracticeState] = useState('Florida');
  const [hospitalPrivileges, setHospitalPrivileges] = useState('yes');
  const [targetStartDate, setTargetStartDate] = useState('2026-11-01');
  const [monthlyExpectedCollections, setMonthlyExpectedCollections] = useState(65000);

  // Lead dispatch state
  const [practiceName, setPracticeName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Calculations
  const isPhysician = providerType.includes('Physician');
  const hasHosp = hospitalPrivileges === 'yes';

  // Lead time required in days
  let leadTimeDays = 90;
  if (isPhysician && hasHosp) leadTimeDays = 120;
  else if (isPhysician && !hasHosp) leadTimeDays = 90;
  else if (!isPhysician && hasHosp) leadTimeDays = 75;
  else leadTimeDays = 60;

  // Recommended application deadline
  const targetDateObj = new Date(targetStartDate);
  const deadlineDateObj = new Date(targetDateObj.getTime() - leadTimeDays * 24 * 60 * 60 * 1000);
  const recommendedDeadlineStr = deadlineDateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const isUrgent = deadlineDateObj.getTime() < Date.now();

  // Daily revenue at risk if uncredentialed
  const dailyRevenueRisk = Math.round(monthlyExpectedCollections / 21); // 21 clinical working days

  const handleSubmitLead = async () => {
    if (!contactEmail || isSubmitting) return;
    setIsSubmitting(true);

    const payload = {
      practiceName: practiceName || 'Not specified',
      contactEmail,
      providerType,
      practiceState,
      hospitalPrivileges,
      targetStartDate,
      monthlyExpectedCollections,
      leadTimeDays,
      recommendedDeadline: recommendedDeadlineStr,
      dailyRevenueRisk,
      routeTo: PRIMARY_EXPERT_EMAIL,
    };

    await sendLeadToKiran('credentialing_consultation', payload, [
      {
        role: 'user',
        content: `Credentialing Inquiry: ${providerType} in ${practiceState}, Target Start ${targetStartDate}, Est Lead Time ${leadTimeDays} days, Daily Risk $${dailyRevenueRisk.toLocaleString()}`,
      },
    ]);

    setIsSubmitting(false);
    setSubmitSuccess(true);
  };

  return (
    <div className="space-y-8">
      {/* Configuration Box */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray/10 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-teal font-bold text-xs uppercase tracking-wider">
              <CalendarClock className="h-4 w-4" />
              <span>Provider Credentialing &amp; Payer Enrollment</span>
            </div>
            <h2 className="text-xl font-bold text-navy mt-1">Provider Onboarding &amp; Timeline Calculator</h2>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Average National Lead Time: <strong className="text-navy">{leadTimeDays} Days</strong>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Provider Type</label>
            <select
              value={providerType}
              onChange={e => setProviderType(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl text-navy bg-white focus:ring-2 focus:ring-teal focus:outline-none"
            >
              <option>Physician (MD / DO)</option>
              <option>Nurse Practitioner / PA</option>
              <option>Physical / Occupational Therapist</option>
              <option>Behavioral Health (LCSW / PsyD)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Practice State</label>
            <select
              value={practiceState}
              onChange={e => setPracticeState(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl text-navy bg-white focus:ring-2 focus:ring-teal focus:outline-none"
            >
              <option>Florida</option>
              <option>Texas</option>
              <option>California</option>
              <option>New York</option>
              <option>Georgia</option>
              <option>Ohio</option>
              <option>Illinois</option>
              <option>North Carolina</option>
              <option>Pennsylvania</option>
              <option>Other State</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Hospital Privileges?</label>
            <select
              value={hospitalPrivileges}
              onChange={e => setHospitalPrivileges(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl text-navy bg-white focus:ring-2 focus:ring-teal focus:outline-none"
            >
              <option value="yes">Yes (Facility Admitting)</option>
              <option value="no">No (100% Outpatient Office)</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Patient Start Date</label>
            <input
              type="date"
              value={targetStartDate}
              onChange={e => setTargetStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray/25 rounded-xl font-bold text-navy focus:ring-2 focus:ring-teal focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Est. Monthly Collections ($)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                step={5000}
                value={monthlyExpectedCollections}
                onChange={e => setMonthlyExpectedCollections(parseFloat(e.target.value) || 0)}
                className="w-full pl-7 pr-3 py-2 border border-gray/25 rounded-xl font-bold text-navy focus:ring-2 focus:ring-teal focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* TIMELINE DASHBOARD & REVENUE RISK BANNER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Summary Metrics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm space-y-5">
            <div className="border-b border-gray/15 pb-4">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Critical Path Benchmark</span>
              <h3 className="text-xl font-bold text-navy mt-1">Credentialing Lead Time Analysis</h3>
            </div>

            <div className="p-4 rounded-xl bg-cream/50 border border-gray/15 space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Total Lead Time Required:</span>
                <strong className="text-navy text-sm font-bold">{leadTimeDays} Days ({Math.round(leadTimeDays / 7)} Weeks)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Recommended Filing Deadline:</span>
                <strong className={isUrgent ? 'text-red-600 text-sm font-bold' : 'text-teal text-sm font-bold'}>
                  {recommendedDeadlineStr}
                </strong>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray/15">
                <span className="text-slate-600">Daily Revenue at Risk if Delayed:</span>
                <strong className="text-navy text-sm font-extrabold">${dailyRevenueRisk.toLocaleString()} / day</strong>
              </div>
            </div>

            {isUrgent ? (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-red-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>CRITICAL TIMELINE WARNING: Past Recommended Filing Date</span>
                </div>
                <p className="leading-relaxed">
                  Based on standard 60–120 day payer committee cycles in {practiceState}, your provider risks a <strong>billing freeze</strong> if claims are submitted before participation effective dates are issued.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>On Schedule: Sufficient Window for Full Enrollment</span>
                </div>
                <p className="leading-relaxed">
                  Submitting complete CAQH and PECOS packages by {recommendedDeadlineStr} ensures participating status with Medicare, Medicaid, and commercial networks prior to first patient contact.
                </p>
              </div>
            )}
          </div>

          {/* Direct Concierge Lead Dispatch */}
          <div className="bg-navy rounded-2xl p-6 text-white space-y-4 shadow-sm">
            {submitSuccess ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-mint mx-auto" />
                <h4 className="font-bold text-base">Credentialing Concierge Request Received</h4>
                <p className="text-xs text-white/80">
                  Kiran and the senior enrollment team will review your timeline and reach out to <strong>{contactEmail}</strong>.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <span className="text-mint text-xs font-bold uppercase tracking-wider block">Full-Service Delegation</span>
                  <h4 className="text-base font-bold text-white mt-1">Delegate Provider Enrollment to Aethera</h4>
                  <p className="text-xs text-white/70 mt-1">
                    We manage CAQH, Medicare PECOS, state Medicaid, and commercial payer contracts end-to-end with 100% on-time start guarantees.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <input
                    type="text"
                    value={practiceName}
                    onChange={e => setPracticeName(e.target.value)}
                    placeholder="Clinic / Group Practice Name"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="Physician / Administrator Email *"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:bg-white/20"
                  />
                  <button
                    type="button"
                    onClick={handleSubmitLead}
                    disabled={!contactEmail || isSubmitting}
                    className="w-full py-2.5 bg-teal hover:bg-mint hover:text-navy disabled:opacity-40 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? 'Dispatching to Kiran…' : 'Fast-Track Provider Enrollment'} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: 16-Week Phase Roadmap */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-gray/20 shadow-sm space-y-6">
          <div className="border-b border-gray/15 pb-4">
            <h3 className="text-lg font-bold text-navy">16-Week Milestone Execution Roadmap</h3>
            <p className="text-xs text-slate-500 mt-0.5">Chronological breakdown from initial application to electronic claims billing.</p>
          </div>

          <div className="space-y-4">
            {MILESTONES.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-cream/40 border border-gray/15 space-y-2 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-gray/10 pb-1.5">
                  <span className="font-extrabold text-teal text-xs uppercase tracking-wider">{m.week}</span>
                  <span className="font-bold text-navy text-sm">{m.title}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{m.description}</p>
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-1 text-slate-500">
                  <span><strong>Target Entity:</strong> {m.criticalPayer}</span>
                  <span className="text-amber-700 font-semibold">⚠️ {m.riskNote}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
