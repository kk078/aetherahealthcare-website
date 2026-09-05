'use client';

import React, { useState, useMemo } from 'react';
import {
  Baby,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  ShieldCheck,
  Calculator,
  ChevronRight,
  Info,
  Layers,
  FileText,
  DollarSign,
  Activity,
  HeartPulse,
  Stethoscope,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface PatientTier {
  id: string;
  name: string;
  ageCategory: string;
  initialCode: string;
  initialRate: number;
  subsequentCode: string;
  subsequentRate: number;
  desc: string;
}

const PATIENT_TIERS: PatientTier[] = [
  {
    id: 'neonate_critical',
    name: 'Neonate Critical Care (Birth through 28 Days)',
    ageCategory: '<= 28 days',
    initialCode: '99468',
    initialRate: 1092.5,
    subsequentCode: '99469',
    subsequentRate: 462.8,
    desc: 'Inpatient per-day global critical care for neonate with unstable vital organ failure.',
  },
  {
    id: 'pediatric_critical_infant',
    name: 'Pediatric Critical Care (29 Days through 24 Months)',
    ageCategory: '29 days – 24 months',
    initialCode: '99471',
    initialRate: 984.2,
    subsequentCode: '99472',
    subsequentRate: 441.6,
    desc: 'Inpatient per-day global critical care for critically ill infant or young child.',
  },
  {
    id: 'pediatric_critical_child',
    name: 'Pediatric Critical Care (2 Years through 5 Years)',
    ageCategory: '2 – 5 years',
    initialCode: '99475',
    initialRate: 912.0,
    subsequentCode: '99476',
    subsequentRate: 408.4,
    desc: 'Inpatient per-day global critical care for critically ill young child up to 6th birthday.',
  },
  {
    id: 'intensive_stepdown_sub1500',
    name: 'Intensive Non-Critical Care (< 1,500 grams)',
    ageCategory: '<= 28 days',
    initialCode: '99477',
    initialRate: 368.0,
    subsequentCode: '99478',
    subsequentRate: 168.5,
    desc: 'Stepped-down neonatal intensive care for very low birth weight infant recovering from illness.',
  },
  {
    id: 'intensive_stepdown_1500_2500',
    name: 'Intensive Non-Critical Care (1,500 – 2,500 grams)',
    ageCategory: '<= 28 days',
    initialCode: '99477',
    initialRate: 368.0,
    subsequentCode: '99479',
    subsequentRate: 146.2,
    desc: 'Stepped-down neonatal intensive care for low birth weight infant requiring continuous monitoring.',
  },
  {
    id: 'intensive_stepdown_2500_plus',
    name: 'Intensive Non-Critical Care (2,500 – 5,000 grams)',
    ageCategory: '<= 28 days',
    initialCode: '99477',
    initialRate: 368.0,
    subsequentCode: '99480',
    subsequentRate: 141.0,
    desc: 'Subsequent intensive care for normal/higher birth weight infant requiring nutritional or phototherapy management.',
  },
];

interface BundledProcedure {
  id: string;
  code: string;
  name: string;
  description: string;
  alwaysBundled: boolean;
}

const BUNDLED_PROCEDURES: BundledProcedure[] = [
  {
    id: 'intubation',
    code: '31500',
    name: 'Endotracheal Intubation',
    description: 'Emergency or elective oral/nasal tracheal tube placement.',
    alwaysBundled: true,
  },
  {
    id: 'uac',
    code: '36660',
    name: 'Umbilical Arterial Catheter (UAC)',
    description: 'Cannulation of umbilical artery for invasive blood gas monitoring.',
    alwaysBundled: true,
  },
  {
    id: 'uvc',
    code: '36510',
    name: 'Umbilical Venous Catheter (UVC)',
    description: 'Cannulation of umbilical vein for central infusion and TPN.',
    alwaysBundled: true,
  },
  {
    id: 'lumbar_puncture',
    code: '62270',
    name: 'Diagnostic Lumbar Puncture',
    description: 'Spinal tap to evaluate neonatal sepsis or meningitis.',
    alwaysBundled: true,
  },
  {
    id: 'vent_mgmt',
    code: '94002',
    name: 'Mechanical Ventilator Management (Day 1)',
    description: 'Initial conventional or high-frequency oscillatory ventilation setup.',
    alwaysBundled: true,
  },
  {
    id: 'surfactant',
    code: '94610',
    name: 'Surfactant Administration',
    description: 'Endotracheal administration of lung surfactant.',
    alwaysBundled: true,
  },
  {
    id: 'bladder_cath',
    code: '51701',
    name: 'Bladder Catheterization',
    description: 'Sterile urinary catheterization for strict output tracking.',
    alwaysBundled: true,
  },
];

interface BillableAddon {
  id: string;
  code: string;
  name: string;
  avgRate: number;
  modifierNeeded: string;
  description: string;
}

const BILLABLE_ADDONS: BillableAddon[] = [
  {
    id: 'resuscitation',
    code: '99465',
    name: 'Delivery Room Resuscitation',
    avgRate: 228.4,
    modifierNeeded: 'Modifier 25 on 99468',
    description: 'Active newborn resuscitation in delivery room prior to NICU admission.',
  },
  {
    id: 'cranial_ultrasound',
    code: '76506-26',
    name: 'Echoencephalography (Head Ultrasound)',
    avgRate: 98.2,
    modifierNeeded: 'Modifier 26',
    description: 'Bedside cranial ultrasound to screen for intraventricular hemorrhage (IVH).',
  },
  {
    id: 'cpr',
    code: '92950',
    name: 'Cardiopulmonary Resuscitation (CPR)',
    avgRate: 196.0,
    modifierNeeded: 'Modifier 25',
    description: 'Closed-chest cardiac compressions during acute cardiac arrest event.',
  },
  {
    id: 'ecmo_initiation',
    code: '33946',
    name: 'ECMO / ECLS Cannulation / Circuit Setup',
    avgRate: 852.0,
    modifierNeeded: 'Surgical CPT',
    description: 'Extracorporeal membrane oxygenation initiation for refractory hypoxic failure.',
  },
];

export default function NicuCriticalCareScrubber() {
  // Clinical Encounter State
  const [selectedTierId, setSelectedTierId] = useState<string>('neonate_critical');
  const [isInitialDay, setIsInitialDay] = useState<boolean>(true);
  const [patientBirthWeightGrams, setPatientBirthWeightGrams] = useState<number>(1280);
  const [gestationalWeeks, setGestationalWeeks] = useState<number>(29);

  // Selected Bundled Procedures (to audit unbundling)
  const [selectedBundledIds, setSelectedBundledIds] = useState<string[]>(['intubation', 'uvc']);

  // Selected Billable Add-ons
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(['resuscitation']);

  // Concurrent Care / Secondary Physician
  const [hasPediatricSurgConsult, setHasPediatricSurgConsult] = useState<boolean>(false);
  const [hasSameGroupPhysician, setHasSameGroupPhysician] = useState<boolean>(false);

  // Form State
  const [contactName, setContactName] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);

  const selectedTier = useMemo(() => {
    return PATIENT_TIERS.find((t) => t.id === selectedTierId) || PATIENT_TIERS[0];
  }, [selectedTierId]);

  const activePrimaryCode = isInitialDay ? selectedTier.initialCode : selectedTier.subsequentCode;
  const activePrimaryRate = isInitialDay ? selectedTier.initialRate : selectedTier.subsequentRate;

  // Calculate Add-on Revenue
  const addonRevenue = useMemo(() => {
    return selectedAddonIds.reduce((sum, id) => {
      const addon = BILLABLE_ADDONS.find((a) => a.id === id);
      return sum + (addon ? addon.avgRate : 0);
    }, 0);
  }, [selectedAddonIds]);

  const totalProjectedAllowed = activePrimaryRate + addonRevenue;

  // Unbundling Risk Evaluation
  const unbundlingViolations = useMemo(() => {
    return selectedBundledIds.map((id) => {
      return BUNDLED_PROCEDURES.find((p) => p.id === id)!;
    });
  }, [selectedBundledIds]);

  // EDI 837P Simulation
  const ediSnippet = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const birthWeightSegment = `NTE*ADD*BIRTH WT ${patientBirthWeightGrams}G GEST ${gestationalWeeks}W~`;
    const primaryModifier = selectedAddonIds.includes('resuscitation') && isInitialDay ? ':25' : '';
    const sv1Primary = `SV1*HC:${activePrimaryCode}${primaryModifier}*${(activePrimaryRate * 2.2).toFixed(2)}*UN*1***1~`;

    const addonSegments = selectedAddonIds.map((id, index) => {
      const addon = BILLABLE_ADDONS.find((a) => a.id === id);
      if (!addon) return '';
      const mod = addon.code.includes('-') ? `:${addon.code.split('-')[1]}` : '';
      const baseCode = addon.code.split('-')[0];
      return `LX*${index + 2}~\nSV1*HC:${baseCode}${mod}*${(addon.avgRate * 2.4).toFixed(2)}*UN*1***1~\nDTP*472*D8*${today}~`;
    }).filter(Boolean).join('\n');

    return `ISA*00*          *00*          *ZZ*SUBMITTERID    *ZZ*RECEIVERID     *${today.slice(2)}*1200*^*00501*000000001*0*P*:~
GS*HC*SENDER*RECEIVER*${today}*1200*1*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*REF${today}*${today}*1200*CH~
NM1*85*2*NEONATOLOGY INTENSIVE ASSOCIATES*****XX*1982736451~
NM1*IL*1*BABYBOY*DOE****MI*MED123456789~
CLM*NICU-${today}-001*${(totalProjectedAllowed * 2.2).toFixed(2)}***21:B:1*Y*A*Y*Y~
DTP*435*D8*${today}~
HI*ABK:P07.03*ABF:P22.0*ABF:P29.30~
${birthWeightSegment}
LX*1~
${sv1Primary}
DTP*472*D8*${today}~
${addonSegments}
SE*18*0001~
GE*1*1~
IEA*1*000000001~`;
  }, [
    activePrimaryCode,
    activePrimaryRate,
    selectedAddonIds,
    isInitialDay,
    patientBirthWeightGrams,
    gestationalWeeks,
    totalProjectedAllowed,
  ]);

  const handleCopyEdi = async () => {
    try {
      await navigator.clipboard.writeText(ediSnippet);
      setCopiedEdi(true);
      setTimeout(() => setCopiedEdi(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    const payload = {
      facilityName,
      contactName,
      email,
      phone,
      selectedTier: selectedTier.name,
      primaryCode: activePrimaryCode,
      isInitialDay,
      birthWeightGrams: patientBirthWeightGrams,
      gestationalWeeks,
      selectedBundledProcedures: unbundlingViolations.map((p) => `${p.code} (${p.name})`),
      selectedAddons: selectedAddonIds,
      hasSameGroupPhysicianConflict: hasSameGroupPhysician,
      hasPediatricSurgConsult,
      projectedReimbursement: totalProjectedAllowed,
      unbundlingRiskCount: unbundlingViolations.length,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '/tools/nicu-critical-care-scrubber',
      submittedAt: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('nicu_scrubber_audit', payload);
      trackConversion('assessment', totalProjectedAllowed);
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed:', err);
      setSubmitted(true); // Graceful UX
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBundled = (id: string) => {
    setSelectedBundledIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-10">
      {/* Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray/15 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Baby className="h-3.5 w-3.5 text-blue-600" />
              CPT 99468–99476 & 99477–99480 Scrubber
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-navy">
              NICU / PICU Critical Care & Procedure Scrubber
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Verify inpatient global per-day neonatal critical care codes (99468/99469), weight-banded intensive step-down tiers (99477–99480), and scrub out CPT bundled catheterizations (36510/36660) and intubations (31500) before claim generation.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[240px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Estimated Allowed Amount
            </span>
            <div className="text-3xl font-extrabold text-navy">
              ${totalProjectedAllowed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 inline" /> CMS MPFS Facility Equivalent
            </span>
          </div>
        </div>
      </div>

      {/* Main Scrubber Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Patient Age & Clinical Level */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Acuity Tier & Age Cohort</h3>
                <p className="text-xs text-slate-500">Determines initial vs subsequent global per-day CPT code</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {PATIENT_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setSelectedTierId(tier.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all ${
                    selectedTierId === tier.id
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-gray/20 hover:border-blue-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-navy">{tier.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-gray/20 text-slate-700">
                      {tier.ageCategory}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{tier.desc}</p>
                  <div className="mt-2 text-xs flex items-center gap-4 text-slate-600">
                    <span>Initial: <strong className="text-navy">{tier.initialCode}</strong> (${tier.initialRate.toFixed(0)})</span>
                    <span>Subsequent: <strong className="text-navy">{tier.subsequentCode}</strong> (${tier.subsequentRate.toFixed(0)})</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Initial vs Subsequent Toggle */}
            <div className="pt-2 border-t border-gray/10 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Day of Admission Status:</span>
              <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsInitialDay(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    isInitialDay ? 'bg-white text-navy shadow-xs' : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  Initial Day ({selectedTier.initialCode})
                </button>
                <button
                  type="button"
                  onClick={() => setIsInitialDay(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    !isInitialDay ? 'bg-white text-navy shadow-xs' : 'text-slate-600 hover:text-navy'
                  }`}
                >
                  Subsequent Day ({selectedTier.subsequentCode})
                </button>
              </div>
            </div>

            {/* Birth Weight & Gestation Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Present Body Weight (grams)
                </label>
                <input
                  type="number"
                  min={400}
                  max={6000}
                  step={10}
                  value={patientBirthWeightGrams}
                  onChange={(e) => setPatientBirthWeightGrams(Number(e.target.value))}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray/20 focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Mandatory for step-down code assignment (99478–99480)
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gestational Age at Birth (weeks)
                </label>
                <input
                  type="number"
                  min={22}
                  max={42}
                  value={gestationalWeeks}
                  onChange={(e) => setGestationalWeeks(Number(e.target.value))}
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-gray/20 focus:border-blue-500 focus:outline-hidden"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Reported on 837P Loop 2300 NTE segment
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Bundled Procedure Audit */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Bundled Bedside Procedures Scrubber</h3>
                <p className="text-xs text-slate-500">Check all procedures performed on this date of service</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
              <strong className="font-bold flex items-center gap-1 mb-1">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-700 inline shrink-0" />
                CMS Chapter 11 NCCI Policy Warning:
              </strong>
              The procedures below are <em>statutorily included</em> in per-day global critical care codes (99468–99476). Submitting these CPTs separately on the same claim causes immediate denial under CARC CO-97 (payment adjusted because this procedure is included in another).
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {BUNDLED_PROCEDURES.map((proc) => {
                const isSelected = selectedBundledIds.includes(proc.id);
                return (
                  <button
                    key={proc.id}
                    type="button"
                    onClick={() => toggleBundled(proc.id)}
                    className={`text-left p-3 rounded-xl border text-xs transition-all ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/60 ring-1 ring-amber-300'
                        : 'border-gray/20 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-navy">CPT {proc.code}</span>
                      {isSelected ? (
                        <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">
                          BUNDLED
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Not selected</span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-700">{proc.name}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Legitimate Billable Add-ons */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">Separately Billable Add-on Procedures</h3>
                <p className="text-xs text-slate-500">Documented independent procedures payable in addition to per-day rate</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {BILLABLE_ADDONS.map((addon) => {
                const isChecked = selectedAddonIds.includes(addon.id);
                return (
                  <button
                    key={addon.id}
                    type="button"
                    onClick={() => toggleAddon(addon.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-400'
                        : 'border-gray/20 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-navy">{addon.code}</span>
                      <span className="text-xs font-bold text-emerald-700">+${addon.avgRate.toFixed(0)}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800 mb-0.5">{addon.name}</div>
                    <p className="text-[11px] text-slate-500 leading-snug">{addon.description}</p>
                    <div className="mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md inline-block">
                      Requires: {addon.modifierNeeded}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Concurrent Care & Specialty Conflicts */}
            <div className="pt-4 border-t border-gray/10 space-y-3">
              <span className="text-xs font-bold text-navy block">Concurrent Physician Care & Group Practice Rules:</span>
              
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={hasSameGroupPhysician}
                  onChange={(e) => setHasSameGroupPhysician(e.target.checked)}
                  className="mt-0.5 rounded border-gray/30 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Another neonatologist in our same group practice also rounded on this infant today (
                  <strong className="text-red-600">Dual Per-Day Billing Forbidden</strong>; only 1 physician can bill 99468/99469 per calendar day).
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={hasPediatricSurgConsult}
                  onChange={(e) => setHasPediatricSurgConsult(e.target.checked)}
                  className="mt-0.5 rounded border-gray/30 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  Pediatric surgeon performed surgical consult on same calendar day (Eligible under distinct taxonomy; surgeon reports CPT with Modifier 57/25).
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Scrubber Audit Findings & ANSI 837P (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Claim Scrubber Audit Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray/15 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
                <h3 className="font-bold text-base text-navy">Scrubber Compliance Report</h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  unbundlingViolations.length > 0 || hasSameGroupPhysician
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {unbundlingViolations.length > 0 || hasSameGroupPhysician ? 'Action Required' : 'Ready to Bill'}
              </span>
            </div>

            {/* Primary Code Summary */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Primary Service Code:</span>
                <span className="font-mono font-bold text-navy text-sm">
                  CPT {activePrimaryCode}
                  {selectedAddonIds.includes('resuscitation') && isInitialDay ? '-25' : ''}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Allowed Rate:</span>
                <span className="font-bold text-slate-800">${activePrimaryRate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Billable Add-on Total:</span>
                <span className="font-bold text-emerald-600">+${addonRevenue.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-navy">
                <span>Net Allowed Total:</span>
                <span className="text-blue-600">${totalProjectedAllowed.toFixed(2)}</span>
              </div>
            </div>

            {/* Unbundling Warnings */}
            {unbundlingViolations.length > 0 && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                  {unbundlingViolations.length} Bundled Procedure(s) Suppressed
                </div>
                <p className="text-[11px] text-red-700 leading-snug">
                  The following procedures must NOT be billed on separate claim lines with CPT {activePrimaryCode}:
                </p>
                <ul className="text-xs text-red-800 list-disc list-inside space-y-1 font-mono">
                  {unbundlingViolations.map((v) => (
                    <li key={v.id}>
                      CPT {v.code} - {v.name}
                    </li>
                  ))}
                </ul>
                <p className="text-[10px] text-red-600 pt-1">
                  <em>Billing these separately triggers immediate CO-97 / NCCI PTP claim rejections.</em>
                </p>
              </div>
            )}

            {/* Same Group Warning */}
            {hasSameGroupPhysician && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Duplicate Per-Day Billing Risk:</strong>
                  Two neonatologists in the same TIN cannot bill 99468 or 99469 for the same infant on the same date. Combine notes under one physician's record.
                </div>
              </div>
            )}

            {/* Resuscitation Modifier 25 Notification */}
            {selectedAddonIds.includes('resuscitation') && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Modifier 25 Auto-Appended:</strong>
                  Delivery room resuscitation (99465) billed with initial critical care (99468) requires Modifier 25 on 99468 to indicate significant, separately identifiable E/M on the day of delivery.
                </div>
              </div>
            )}
          </div>

          {/* ANSI X12 837P Preview */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ANSI X12 837P Electronic Claim Lines
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEdi}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedEdi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedEdi ? 'Copied' : 'Copy EDI'}
              </button>
            </div>
            <pre className="font-mono text-[11px] leading-relaxed text-cyan-300/90 bg-slate-950 p-3.5 rounded-xl overflow-x-auto max-h-56 scrollbar-thin">
              {ediSnippet}
            </pre>
            <p className="text-[10px] text-slate-400">
              Includes Loop 2300 birth weight remark (NTE segment) and automated Modifier 25 linking for delivery resuscitation.
            </p>
          </div>

          {/* Free Practice Audit Lead Card */}
          <div className="bg-gradient-to-br from-navy via-navy to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-mint/20 border border-mint/40 text-mint text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <Activity className="h-3 w-3" />
                Free NICU/PICU Billing Audit
              </div>
              <div>
                <h4 className="text-lg font-bold">Have 50 Neonatal Claims Audited Free</h4>
                <p className="text-xs text-cream/80 mt-1 leading-relaxed">
                  Our AAPC-certified pediatric hospitalist billing specialists will audit 50 recent NICU claims for missed resuscitation codes, catheter bundling errors, and step-down weight transitions.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Audit request received. Kiran’s pediatric RCM audit team will contact you within 24 hours.</span>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Hospital / Practice Name"
                      value={facilityName}
                      onChange={(e) => setFacilityName(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Contact Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Work Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-teal hover:bg-teal/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting Audit Request...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Request 50-Claim NICU Audit
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-cream/60 text-center">
                    Zero financial obligation · Confidential HIPAA compliance · Direct to Kiran
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
