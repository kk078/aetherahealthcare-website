'use client';

import React, { useState, useMemo } from 'react';
import {
  Ambulance,
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
  MapPin,
  FileSignature,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface AmbulanceServiceTier {
  id: string;
  hcpcs: string;
  name: string;
  category: 'BLS' | 'ALS' | 'SCT' | 'PI';
  baseRateUrban: number;
  description: string;
}

const SERVICE_TIERS: AmbulanceServiceTier[] = [
  {
    id: 'a0429',
    hcpcs: 'A0429',
    name: 'BLS Emergency (Basic Life Support)',
    category: 'BLS',
    baseRateUrban: 468.5,
    description: 'Immediate response to acute 911 dispatch without invasive ALS interventions.',
  },
  {
    id: 'a0428',
    hcpcs: 'A0428',
    name: 'BLS Non-Emergency',
    category: 'BLS',
    baseRateUrban: 292.8,
    description: 'Scheduled transport of medically stable bed-confined patient requiring BLS care.',
  },
  {
    id: 'a0427',
    hcpcs: 'A0427',
    name: 'ALS1 Emergency (Advanced Life Support, Level 1)',
    category: 'ALS',
    baseRateUrban: 555.9,
    description: 'Advanced assessment, cardiac monitoring, IV initiation, or single ALS medication.',
  },
  {
    id: 'a0426',
    hcpcs: 'A0426',
    name: 'ALS1 Non-Emergency',
    category: 'ALS',
    baseRateUrban: 347.4,
    description: 'Scheduled transport requiring paramedic monitoring, continuous infusions, or airway prep.',
  },
  {
    id: 'a0433',
    hcpcs: 'A0433',
    name: 'ALS2 (Advanced Life Support, Level 2)',
    category: 'ALS',
    baseRateUrban: 804.7,
    description: 'At least 3 distinct IV/IO medications administered OR advanced manual airway procedures.',
  },
  {
    id: 'a0434',
    hcpcs: 'A0434',
    name: 'SCT (Specialty Care Transport)',
    category: 'SCT',
    baseRateUrban: 951.2,
    description: 'Interfacility transport of critically ill patient attended by physician, RN, or CCP.',
  },
  {
    id: 'a0430',
    hcpcs: 'A0430',
    name: 'Paramedic ALS Intercept (PI)',
    category: 'PI',
    baseRateUrban: 439.1,
    description: 'Rural paramedic intercept furnishing ALS services to BLS transport entity.',
  },
];

const MODIFIER_LOCATIONS = [
  { code: 'D', name: 'Diagnostic / Clinic / Free-standing Lab' },
  { code: 'E', name: 'Residential / Domiciliary / Group Home' },
  { code: 'G', name: 'Hospital-based ESRD Facility' },
  { code: 'H', name: 'Hospital / Emergency Department' },
  { code: 'I', name: 'Site of Transfer (Airport, Helipad)' },
  { code: 'J', name: 'Freestanding Dialysis Center (Non-Hospital)' },
  { code: 'N', name: 'Skilled Nursing Facility (SNF)' },
  { code: 'P', name: "Physician's Office" },
  { code: 'R', name: 'Private Residence' },
  { code: 'S', name: 'Scene of Accident / Acute Event' },
  { code: 'X', name: "Intermediate Physician Stop (En Route)" },
];

export default function AmbulanceFeeCalculator() {
  // Transport parameters
  const [selectedTierId, setSelectedTierId] = useState<string>('a0427');
  const [loadedMiles, setLoadedMiles] = useState<number>(14);
  const [geographicZone, setGeographicZone] = useState<'urban' | 'rural' | 'super_rural'>('urban');
  const [originCode, setOriginCode] = useState<string>('S');
  const [destCode, setDestCode] = useState<string>('H');
  const [patientWeightLb, setPatientWeightLb] = useState<number>(185);

  // Medical Necessity Checklist
  const [isBedConfined, setIsBedConfined] = useState<boolean>(true);
  const [hasPcsSigned, setHasPcsSigned] = useState<boolean>(true);
  const [hasValidSignature, setHasValidSignature] = useState<boolean>(true);

  // Lead Form
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);

  // Benchmarks
  const URBAN_MILE_RATE = 8.92;
  const activeTier = SERVICE_TIERS.find((t) => t.id === selectedTierId) || SERVICE_TIERS[2];
  const modifierPair = `${originCode}${destCode}`;

  // Mileage Calculation with CMS Rural Tiering (42 CFR § 414.610)
  const mileageCalculations = useMemo(() => {
    let baseRate = activeTier.baseRateUrban;
    if (geographicZone === 'rural') {
      baseRate *= 1.02; // +2% rural base bump
    } else if (geographicZone === 'super_rural') {
      baseRate *= 1.226; // +22.6% super rural statutory bonus
    }

    let mileageTotal = 0;
    if (geographicZone === 'urban') {
      mileageTotal = loadedMiles * URBAN_MILE_RATE;
    } else {
      // Rural: First 1-17 miles gets +50% rate
      const firstTierMiles = Math.min(loadedMiles, 17);
      const remainingMiles = Math.max(0, loadedMiles - 17);
      const ruralTier1Rate = URBAN_MILE_RATE * 1.5; // +50%
      const ruralTier2Rate = URBAN_MILE_RATE * 1.25; // +25%
      mileageTotal = firstTierMiles * ruralTier1Rate + remainingMiles * ruralTier2Rate;
    }

    const grandTotal = baseRate + mileageTotal;

    return {
      adjustedBase: Math.round(baseRate * 100) / 100,
      mileageTotal: Math.round(mileageTotal * 100) / 100,
      grandTotal: Math.round(grandTotal * 100) / 100,
    };
  }, [activeTier, loadedMiles, geographicZone]);

  // Snf Consolidated Billing Check
  const snfConsolidatedRisk = useMemo(() => {
    if (originCode === 'N' || destCode === 'N') {
      return 'CRITICAL SNF NOTICE: If patient is in a covered Medicare Part A SNF stay, non-emergency diagnostic transports are bundled into SNF PPS. Bill SNF directly or verify emergency or excluded specialty status.';
    }
    return null;
  }, [originCode, destCode]);

  // ANSI X12 837P Professional EDI Simulation (Loop 2400 CR1 & SV1)
  const simulatedEdi = useMemo(() => {
    const lines = [
      'ISA*00*          *00*          *ZZ*AMBULANCE-SUB  *ZZ*MEDICARE-MAC   *260905*1115*^*00501*000000002*0*P*:~',
      'GS*HC*AMBULANCE-SUB*MEDICARE-MAC*20260905*1115*1*X*005010X222A1~',
      'ST*837*0002*005010X222A1~',
      'BHT*0019*00*20260905002*20260905*1115*CH~',
      'NM1*85*2*METRO EMS & AMBULANCE CORP*****XX*1492049182~',
      'CLM*EMS-CLAIM-902*' + mileageCalculations.grandTotal.toFixed(2) + '***11:B:1*Y*A*Y*Y~',
      '// LOOP 2300 / 2400 CR1: AMBULANCE TRANSPORT INFORMATION',
      `CR1*LB*${patientWeightLb}*A*${loadedMiles}***${originCode}*${destCode}~`,
      '// LINE 1: AMBULANCE BASE RATE (HCPCS + ORIGIN/DEST MODIFIER)',
      `LX*1~`,
      `SV1*HC:${activeTier.hcpcs}:${modifierPair}*${mileageCalculations.adjustedBase.toFixed(2)}*UN*1~`,
      `DTP*472*D8*20260905~`,
      '// LINE 2: LOADED GROUND MILEAGE (A0425 + ORIGIN/DEST MODIFIER)',
      `LX*2~`,
      `SV1*HC:A0425:${modifierPair}*${mileageCalculations.mileageTotal.toFixed(2)}*UN*${loadedMiles}~`,
      `DTP*472*D8*20260905~`,
      'SE*14*0002~',
      'GE*1*1~',
      'IEA*1*000000002~',
    ];
    return lines.join('\n');
  }, [mileageCalculations, patientWeightLb, loadedMiles, originCode, destCode, activeTier, modifierPair]);

  const handleCopyEdi = () => {
    navigator.clipboard.writeText(simulatedEdi);
    setCopiedEdi(true);
    setTimeout(() => setCopiedEdi(false), 2500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: contactName,
        email,
        phone,
        practice: companyName,
        service: 'Ambulance & EMS Revenue Cycle Audit',
        notes: `[Tool: Ambulance Fee Calculator] Tier: ${activeTier.hcpcs} (${activeTier.name}) | Miles: ${loadedMiles} (${geographicZone}) | Modifiers: ${modifierPair} | Est Reimbursement: $${mileageCalculations.grandTotal} | Bed Confined: ${isBedConfined} | PCS Valid: ${hasPcsSigned}`,
        source: 'Tool: /tools/ambulance-fee-calculator',
      };

      const ok = await sendLeadToKiran('ambulance_calculator_inquiry', payload);
      if (ok) {
        trackConversion('conversion');
        setSubmitted(true);
      }
    } catch {
      // Graceful fallback
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* Parameter Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: Transport Settings */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <Ambulance className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Medicare Ambulance Fee Schedule (AFS) Engine</h2>
              <p className="text-xs text-slate-400">CMS 42 CFR § 414.610 Ground Mileage &amp; Level of Service</p>
            </div>
          </div>

          {/* Level of Service Tier */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Level of Service (HCPCS Base Code)
            </label>
            <select
              value={selectedTierId}
              onChange={(e) => setSelectedTierId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-teal-500"
            >
              {SERVICE_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.hcpcs} - {tier.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">{activeTier.description}</p>
          </div>

          {/* Mileage & Geographic Zone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                <span>Loaded Ground Miles</span>
                <span className="text-teal-400 font-mono font-bold">{loadedMiles} miles</span>
              </div>
              <input
                type="range"
                min="1"
                max="80"
                step="1"
                value={loadedMiles}
                onChange={(e) => setLoadedMiles(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Loaded statute miles with patient on board (A0425)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Geographic Mileage Tier
              </label>
              <select
                value={geographicZone}
                onChange={(e) => setGeographicZone(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
              >
                <option value="urban">Urban (Standard Mileage Rate $8.92)</option>
                <option value="rural">Rural (+50% Rate on Miles 1–17)</option>
                <option value="super_rural">Super Rural (+22.6% Base Rate Bonus)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">Designated under CMS ZIP Code urban/rural mapping</p>
            </div>
          </div>

          {/* Origin & Destination Modifiers */}
          <div className="pt-2 border-t border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Mandatory Origin &amp; Destination Modifiers
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 text-xs font-mono font-bold border border-teal-800/40">
                Modifier: {modifierPair}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Origin (1st Character)
                </label>
                <select
                  value={originCode}
                  onChange={(e) => setOriginCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  {MODIFIER_LOCATIONS.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.code} - {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Destination (2nd Character)
                </label>
                <select
                  value={destCode}
                  onChange={(e) => setDestCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  {MODIFIER_LOCATIONS.map((loc) => (
                    <option key={loc.code} value={loc.code}>
                      {loc.code} - {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {snfConsolidatedRisk && (
              <div className="p-3 bg-amber-950/70 border border-amber-500/40 text-amber-300 text-xs rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>{snfConsolidatedRisk}</span>
              </div>
            )}
          </div>

          {/* Medical Necessity & Signature Checklist */}
          <div className="pt-2 border-t border-slate-800/80 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Medical Necessity &amp; Statutory Compliance (42 CFR § 424.36)
            </span>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBedConfined}
                  onChange={(e) => setIsBedConfined(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500"
                />
                <span>Bed-Confined Criteria Satisfied (Unable to ambulate, sit in chair, or rise without assistance)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasPcsSigned}
                  onChange={(e) => setHasPcsSigned(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500"
                />
                <span>Physician Certification Statement (PCS) signed within 60 days (for non-emergency trips)</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasValidSignature}
                  onChange={(e) => setHasValidSignature(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-teal-500 focus:ring-teal-500"
                />
                <span>Patient / Authorized Representative Signature or Section 424.36(b) Exception Documented</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Output: Fee Breakdown & Compliance Report */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                AFS Reimbursement Breakdown
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-950 text-teal-300 border border-teal-800/50">
                CMS AFS CY2026
              </span>
            </div>

            {/* Financial Summary */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Base Transport Rate ({activeTier.hcpcs}-{modifierPair}):</span>
                <span className="font-mono font-bold text-white">
                  ${mileageCalculations.adjustedBase.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">Loaded Mileage (A0425 × {loadedMiles} mi):</span>
                <span className="font-mono font-bold text-teal-400">
                  +${mileageCalculations.mileageTotal.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-white">Total Medicare Allowable:</span>
                <span className="text-2xl font-black font-mono text-teal-400">
                  ${mileageCalculations.grandTotal.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>Medicare 80% Payment:</span>
                  <span className="font-mono text-slate-200">
                    ${(mileageCalculations.grandTotal * 0.8).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Patient 20% Coinsurance:</span>
                  <span className="font-mono text-slate-200">
                    ${(mileageCalculations.grandTotal * 0.2).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance Status */}
            <div
              className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2 ${
                !hasValidSignature || (!hasPcsSigned && activeTier.category !== 'BLS' && activeTier.hcpcs === 'A0426')
                  ? 'bg-rose-950/60 border-rose-500/30 text-rose-300'
                  : 'bg-teal-950/60 border-teal-500/30 text-teal-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
                {!hasValidSignature ? (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>Signature Exception Required</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Transport Documentation Valid</span>
                  </>
                )}
              </div>
              <p className="text-slate-300">
                {!hasValidSignature
                  ? 'Missing patient or facility representative signature triggers immediate statutory denial under 42 CFR § 424.36.'
                  : `Modifiers ${modifierPair} properly describe transport from ${
                      MODIFIER_LOCATIONS.find((l) => l.code === originCode)?.name
                    } to ${MODIFIER_LOCATIONS.find((l) => l.code === destCode)?.name}.`}
              </p>
            </div>

            <a
              href="#ems-audit-inquiry"
              className="w-full inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-4 py-3 rounded-lg text-sm transition-all shadow-lg hover:shadow-teal-500/20"
            >
              <span>Request EMS Billing Audit</span>
              <ChevronRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* ANSI X12 837P Professional CR1 Segment Inspector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ANSI X12 837P Loop 2400 CR1 Ambulance Segment</h3>
              <p className="text-xs text-slate-400">Electronic Claim Generator with Origin/Destination Modifiers</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyEdi}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700"
          >
            {copiedEdi ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-400" />
                <span>Copied EDI</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy 837P Segment</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-teal-300/90 overflow-x-auto whitespace-pre leading-relaxed">
          {simulatedEdi}
        </div>
      </div>

      {/* Conversion Inquiry Form */}
      <section id="ems-audit-inquiry" className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-xl font-bold text-white">Request Emergency Medical Transport (EMS) Billing Audit</h3>
          <p className="text-xs text-slate-400 mt-1">
            Discover unbilled loaded miles, overturn medical necessity denials, and streamline repetitive PCS workflows.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 rounded-xl bg-teal-950/80 border border-teal-500/40 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-teal-400 mx-auto" />
            <div className="text-base font-bold text-white">EMS Audit Request Received</div>
            <p className="text-xs text-slate-300">
              Our EMS &amp; Ambulance Billing Director will contact you within 4 business hours to evaluate your run logs and payer remits.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Chief David Miller"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">EMS Agency / Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Metro Emergency Medical Services"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="dmiller@metroems.org"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold py-3 px-6 rounded-lg text-sm transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Agency Profile...</span>
                </>
              ) : (
                <>
                  <span>Submit EMS Audit Request</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
