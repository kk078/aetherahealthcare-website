'use client';

import React, { useState, useMemo } from 'react';
import {
  Scissors,
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
  TrendingDown,
  Info,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

interface CtpProductPreset {
  id: string;
  name: string;
  qCode: string;
  defaultPackageSqCm: number;
  ratePerSqCm: number;
  manufacturer: string;
  unitDescription: string;
}

const CTP_PRODUCTS: CtpProductPreset[] = [
  {
    id: 'apligraf',
    name: 'Apligraf® Living Bilayered Skin Construct',
    qCode: 'Q4101',
    defaultPackageSqCm: 44,
    ratePerSqCm: 42,
    manufacturer: 'Organogenesis',
    unitDescription: '44 cm² circular graft disk',
  },
  {
    id: 'dermagraft',
    name: 'Dermagraft® Human Fibroblast-Derived Dermis',
    qCode: 'Q4106',
    defaultPackageSqCm: 37.5,
    ratePerSqCm: 44,
    manufacturer: 'Organogenesis',
    unitDescription: '37.5 cm² cryopreserved sheet',
  },
  {
    id: 'epifix',
    name: 'EpiFix® Dehydrated Amniotic Membrane',
    qCode: 'Q4186',
    defaultPackageSqCm: 16,
    ratePerSqCm: 140,
    manufacturer: 'MiMedx Group',
    unitDescription: '4 cm x 4 cm allograft sheet',
  },
  {
    id: 'grafix',
    name: 'Grafix Prime® Cryopreserved Placental Membrane',
    qCode: 'Q4133',
    defaultPackageSqCm: 12,
    ratePerSqCm: 185,
    manufacturer: 'Smith & Nephew',
    unitDescription: '3 cm x 4 cm membrane',
  },
  {
    id: 'oasis',
    name: 'Oasis® Wound Matrix Porcine Extracellular Scaffold',
    qCode: 'Q4102',
    defaultPackageSqCm: 21,
    ratePerSqCm: 48,
    manufacturer: 'Smith & Nephew',
    unitDescription: '3 cm x 7 cm porcine scaffold',
  },
  {
    id: 'puraply',
    name: 'PuraPly® AM Antimicrobial Native Collagen Matrix',
    qCode: 'Q4172',
    defaultPackageSqCm: 25,
    ratePerSqCm: 135,
    manufacturer: 'Organogenesis',
    unitDescription: '5 cm x 5 cm antimicrobial sheet',
  },
];

export default function CtpSkinSubstituteCalculator() {
  const [selectedProductId, setSelectedProductId] = useState<string>('apligraf');
  const [packageSizeSqCm, setPackageSizeSqCm] = useState<number>(44);
  const [defectSizeSqCm, setDefectSizeSqCm] = useState<number>(14);
  const [unitRate, setUnitRate] = useState<number>(42);
  const [copied, setCopied] = useState<boolean>(false);

  // Form State
  const [clinicName, setClinicName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [hp, setHp] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [formError, setFormError] = useState('');

  const currentProduct = useMemo(() => {
    return CTP_PRODUCTS.find((p) => p.id === selectedProductId) || CTP_PRODUCTS[0];
  }, [selectedProductId]);

  const handleSelectProduct = (product: CtpProductPreset) => {
    setSelectedProductId(product.id);
    setPackageSizeSqCm(product.defaultPackageSqCm);
    setUnitRate(product.ratePerSqCm);
    if (defectSizeSqCm > product.defaultPackageSqCm) {
      setDefectSizeSqCm(Math.round(product.defaultPackageSqCm * 0.5));
    }
  };

  // Calculation Engine
  const calcResults = useMemo(() => {
    const administeredSqCm = Math.min(defectSizeSqCm, packageSizeSqCm);
    const discardedSqCm = Math.max(0, packageSizeSqCm - administeredSqCm);
    const administeredDollar = Math.round(administeredSqCm * unitRate);
    const discardedDollar = Math.round(discardedSqCm * unitRate);
    const totalAllowedDollar = administeredDollar + discardedDollar;
    const isZeroDiscarded = discardedSqCm === 0;

    let ediSnippet = '';
    if (isZeroDiscarded) {
      ediSnippet = `// 837P Loop 2400 Line 1 (100% Administered · Modifier JZ Mandated)\nLX*1~\nSV1*HC:${currentProduct.qCode}:JZ:${administeredDollar}.00:UN:${administeredSqCm}***1:2:3~`;
    } else {
      ediSnippet = `// 837P Loop 2400 Line 1: Administered Amount (No Modifier)\nLX*1~\nSV1*HC:${currentProduct.qCode}:${administeredDollar}.00:UN:${administeredSqCm}***1:2:3~\n\n// 837P Loop 2400 Line 2: Discarded Amount (Modifier JW Required)\nLX*2~\nSV1*HC:${currentProduct.qCode}:JW:${discardedDollar}.00:UN:${discardedSqCm}***1:2:3~`;
    }

    return {
      administeredSqCm,
      discardedSqCm,
      administeredDollar,
      discardedDollar,
      totalAllowedDollar,
      isZeroDiscarded,
      ediSnippet,
      forfeitedIfJwOmitted: discardedDollar,
    };
  }, [defectSizeSqCm, packageSizeSqCm, unitRate, currentProduct]);

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(calcResults.ediSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) return;
    setFormStatus('submitting');
    setFormError('');

    try {
      const payload = {
        name: contactName,
        email,
        phone,
        practice: clinicName,
        service: 'Skin Substitute CTP & Modifier JW/JZ Audit',
        notes: `[Tool: CTP Calculator] Product: ${currentProduct.name} (${currentProduct.qCode}) | Pkg: ${packageSizeSqCm} cm² | Defect: ${defectSizeSqCm} cm² | Rate: $${unitRate}/cm² | Wastage At Risk: $${calcResults.forfeitedIfJwOmitted.toLocaleString()} | Zero Waste: ${calcResults.isZeroDiscarded} | Details: ${notes || 'None provided'}`,
        source: 'Free Tool: /tools/ctp-skin-substitute-calculator',
      };

      const ok = await sendLeadToKiran('ctp_wastage_audit_inquiry', payload);
      if (ok) {
        setFormStatus('success');
        trackConversion('assessment');
      } else {
        setFormStatus('error');
        setFormError('Submission issue. Please email us directly at support@aetherahealthcare.com');
      }
    } catch {
      setFormStatus('error');
      setFormError('Network error. Please call (813) 519-4640.');
    }
  };

  return (
    <div className="space-y-12">
      {/* Main Tool Container */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Scissors className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-400 uppercase tracking-widest block">
                CMS Transmittal 11728 &amp; Section 90004 Mandate Engine
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-jakarta">
                Skin Substitute &amp; CTP Wastage Modifier JW / JZ Calculator
              </h2>
            </div>
          </div>
          <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300">
            Mandatory Modifiers JW &amp; JZ
          </div>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed pt-4">
          Under Section 90004 of the IIJA, Medicare strictly requires billing single-use Cellular &amp; Tissue-Based Products (CTPs)
          on two separate lines: administered square centimeters on Line 1 and discarded square centimeters with
          <strong className="text-white"> Modifier JW</strong> on Line 2. Omitting Modifier JW forfeits 100% of discarded product reimbursement,
          while failing to append <strong className="text-white">Modifier JZ</strong> on zero-waste cases triggers instant CARC 96 claim rejection.
        </p>

        {/* Product Preset Selector */}
        <div className="mt-8 space-y-6">
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
              1. Select Cellular &amp; Tissue-Based Product (CTP / Skin Substitute)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {CTP_PRODUCTS.map((prod) => {
                const isSelected = prod.id === selectedProductId;
                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => handleSelectProduct(prod)}
                    className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-teal-950/70 border-teal-500 text-white shadow-lg shadow-teal-500/10'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-medium mb-1">
                      <span className="text-teal-400 font-bold">{prod.manufacturer}</span>
                      <span className="font-mono text-[11px] text-slate-400">{prod.qCode}</span>
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-white line-clamp-1">{prod.name}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {prod.defaultPackageSqCm} cm² pkg · ${prod.ratePerSqCm}/cm²
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Measurements & Rate Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-800">
            {/* Defect Size Slider */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Wound / Defect Area
                </label>
                <span className="text-lg font-bold text-teal-400">{defectSizeSqCm} cm²</span>
              </div>
              <input
                type="range"
                min="1"
                max={packageSizeSqCm}
                step="1"
                value={defectSizeSqCm}
                onChange={(e) => setDefectSizeSqCm(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                <span>1 cm²</span>
                <span>{packageSizeSqCm} cm² (Max Pkg)</span>
              </div>
            </div>

            {/* Package Size Input */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Container / Sheet Size
                </label>
                <span className="text-lg font-bold text-white">{packageSizeSqCm} cm²</span>
              </div>
              <input
                type="number"
                min="1"
                max="250"
                value={packageSizeSqCm}
                onChange={(e) => setPackageSizeSqCm(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-mono"
              />
              <div className="text-[11px] text-slate-400 mt-2">{currentProduct.unitDescription}</div>
            </div>

            {/* ASP Unit Rate */}
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  ASP Allowable / cm²
                </label>
                <span className="text-lg font-bold text-emerald-400">${unitRate}</span>
              </div>
              <input
                type="number"
                min="10"
                max="500"
                value={unitRate}
                onChange={(e) => setUnitRate(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500 font-mono"
              />
              <div className="text-[11px] text-emerald-400 mt-2">Medicare Part B Average Sales Price</div>
            </div>
          </div>
        </div>

        {/* Section 2: Mathematical Breakdown & Verdict */}
        <div className="mt-8 pt-6 border-t border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {/* Line 1: Administered */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-xs font-bold text-teal-400 uppercase tracking-wider mb-1">
                Line 1: Administered Graft
              </div>
              <div className="text-2xl font-black text-white">
                {calcResults.administeredSqCm} <span className="text-xs font-normal text-slate-400">cm²</span>
              </div>
              <div className="text-xs font-mono text-emerald-400 mt-1">
                ${calcResults.administeredDollar.toLocaleString()} allowable
              </div>
              <div className="text-[11px] text-slate-400 mt-2">
                {calcResults.isZeroDiscarded
                  ? 'Append Modifier JZ (Zero Discarded)'
                  : 'No Modifier appended to administered line'}
              </div>
            </div>

            {/* Line 2: Discarded (Modifier JW) */}
            <div
              className={`p-4 rounded-xl border ${
                calcResults.isZeroDiscarded
                  ? 'bg-slate-950 border-slate-800 text-slate-400'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider mb-1">
                Line 2: Discarded Wastage (JW)
              </div>
              <div className="text-2xl font-black text-white">
                {calcResults.discardedSqCm} <span className="text-xs font-normal text-slate-400">cm²</span>
              </div>
              <div className="text-xs font-mono mt-1 font-bold">
                ${calcResults.discardedDollar.toLocaleString()} recoverable
              </div>
              <div className="text-[11px] text-slate-300 mt-2">
                {calcResults.isZeroDiscarded
                  ? 'Zero wastage to report'
                  : 'Mandatory Modifier JW appended'}
              </div>
            </div>

            {/* Total Reimbursable vs Forfeited */}
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30">
              <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
                Total Allowed Case Revenue
              </div>
              <div className="text-2xl font-black text-emerald-300">
                ${calcResults.totalAllowedDollar.toLocaleString()}
              </div>
              {!calcResults.isZeroDiscarded && (
                <div className="text-[11px] text-rose-400 mt-2 font-medium">
                  ⚠️ ${calcResults.forfeitedIfJwOmitted.toLocaleString()} forfeited if Modifier JW line is omitted
                </div>
              )}
            </div>
          </div>

          {/* Verdict Box */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white font-jakarta">
                  {calcResults.isZeroDiscarded
                    ? `Compliant Single-Line Claim (Modifier JZ Mandated)`
                    : `Compliant Dual-Line Split Claim (Modifier JW Required)`}
                </h3>
              </div>
              <div className="text-xs font-mono text-slate-400">
                HCPCS {currentProduct.qCode} · {currentProduct.name}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {calcResults.isZeroDiscarded
                ? `100% of the single-use package (${packageSizeSqCm} cm²) was administered to the patient. Under CMS Section 90004, you MUST append Modifier JZ to CPT/HCPCS ${currentProduct.qCode}. Submitting this claim without Modifier JZ will trigger an automated CARC 96 denial.`
                : `A portion of the single-use product (${calcResults.discardedSqCm} cm² out of ${packageSizeSqCm} cm²) was discarded. You must report two separate line items: Line 1 for the ${calcResults.administeredSqCm} cm² administered, and Line 2 for the ${calcResults.discardedSqCm} cm² discarded with Modifier JW appended. Do NOT bill full package units on a single line.`}
            </p>

            {/* Chart Audit Checklist */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                CMS Wound Care Chart Documentation Requirements:
              </div>
              <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                <li>Pre-application wound bed dimensions (length x width x depth in cm)</li>
                <li>Clinical rationalization why a smaller package size could not be utilized</li>
                <li>Exact amount of skin substitute applied ({calcResults.administeredSqCm} cm²)</li>
                <li>Exact amount discarded ({calcResults.discardedSqCm} cm²) explicitly recorded in operative nursing notes</li>
                <li>Manufacturer invoice or lot number documented in medical chart</li>
              </ul>
            </div>

            {/* ANSI X12 837P Loop 2400 Dual-Line Snippet */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono text-teal-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  ANSI X12 837P Loop 2400 Electronic Claim Lines
                </span>
                <button
                  type="button"
                  onClick={handleCopySnippet}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre p-3 bg-slate-900 rounded-lg">
                {calcResults.ediSnippet}
              </pre>
            </div>
          </div>
        </div>

        {/* Section 3: Free Wound Care Audit Intake Form */}
        <div className="mt-12 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="max-w-2xl mx-auto text-center space-y-2 mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-white font-jakarta">
              Request a Free 20-Encounter Wound Care &amp; CTP Wastage Audit
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Wound clinics lose tens of thousands each quarter due to omitted Modifier JW discarded lines or post-payment
              LCD debridement recoups. Submit 20 encounters to Aethera for a certified wound care coding audit at zero cost.
            </p>
          </div>

          {formStatus === 'success' ? (
            <div className="p-6 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="text-base font-bold text-white">Wound Care Audit Request Received</h4>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
                Thank you, <span className="font-semibold text-white">{contactName}</span>. Your wound care audit request has been sent
                directly to Kiran. We will reach out within 4 business hours to set up your secure encrypted submission link.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmitAudit} className="max-w-2xl mx-auto space-y-4">
              {formError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              {/* Honeypot */}
              <input
                type="text"
                name="hp"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="hidden"
                tabIndex={-1}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Wound Clinic / Facility *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Wound Healing Institute"
                    value={clinicName}
                    onChange={(e) => setClinicName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Laura Chen, DPM, CWSP"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="lchen@advancedwound.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 789-2345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Specific CTP Products or Wastage Issues (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Medicare MAC denying Modifier JW on Epifix sheets or downgrading 11042 debridements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                disabled={formStatus === 'submitting'}
                className="w-full py-3 px-4 rounded-xl font-bold font-jakarta text-slate-950 bg-teal-400 hover:bg-teal-300 active:scale-[0.99] transition shadow-md shadow-teal-400/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm"
              >
                {formStatus === 'submitting' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Audit Request…</span>
                  </>
                ) : (
                  <>
                    <span>Request Free 20-Encounter Wound Care Audit</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
