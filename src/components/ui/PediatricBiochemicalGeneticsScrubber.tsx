'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Activity,
  Send,
  Sparkles,
  HelpCircle,
  Dna,
  ChevronRight,
  Layers,
  Copy,
  FlaskConical,
} from 'lucide-react';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
import { sendLeadToKiran } from '@/lib/worker';

interface LineItem {
  code: string;
  modifier: string;
  description: string;
  rvu: number;
  estAllowed: number;
  status: 'compliant' | 'warning' | 'fatal';
  editReason?: string;
}

export default function PediatricBiochemicalGeneticsScrubber() {
  // Inborn Error Indication & Lab Workup
  const [metabolicCondition, setMetabolicCondition] = useState<'msud' | 'pku' | 'mma_pa' | 'ucd'>('mma_pa');
  const [aminoAcidMethod, setAminoAcidMethod] = useState<'ms_ms_quantitative' | 'qualitative'>('ms_ms_quantitative');
  const [includeUrineOrganic, setIncludeUrineOrganic] = useState<boolean>(true);
  const [includeCarnitine, setIncludeCarnitine] = useState<boolean>(true);
  const [visitType, setVisitType] = useState<'new_99205' | 'established_99215'>('new_99205');
  const [prolongedTimeUnits, setProlongedTimeUnits] = useState<number>(2); // 2 units of +99417 (+30 min)
  const [medicalFoodOption, setMedicalFoodOption] = useState<'b4162_approved' | 'b4157_unauthorized' | 'none'>('b4162_approved');
  const [ammoniaRescue, setAmmoniaRescue] = useState<boolean>(false);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Claim Audit Calculation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Clinical Genetics Consultation & Prolonged Service
    const isNew = visitType === 'new_99205';
    const visitCode = isNew ? '99205' : '99215';
    const visitRvu = isNew ? 4.9 : 3.8;
    const visitFee = isNew ? 245 : 190;
    grossValue += visitFee;

    items.push({
      code: visitCode,
      modifier: '',
      description: isNew
        ? 'Office consultation / new patient visit, high complexity medical decision making (60–74 min)'
        : 'Office visit / established patient, high complexity medical decision making (40–54 min)',
      rvu: visitRvu,
      estAllowed: visitFee,
      status: 'compliant',
      editReason: 'High complexity MDM supported by extensive genetic chart review, metabolic crisis risk, and diagnostic testing.',
    });

    // Prolonged Outpatient Care Add-on (+99417)
    if (prolongedTimeUnits > 0) {
      const prolongedFee = prolongedTimeUnits * 75;
      const prolongedRvu = prolongedTimeUnits * 1.45;
      grossValue += prolongedFee;

      items.push({
        code: '+99417',
        modifier: '',
        description: `Prolonged outpatient evaluation and management service add-on, each 15 min (${prolongedTimeUnits} units, +${prolongedTimeUnits * 15} min)`,
        rvu: prolongedRvu,
        estAllowed: prolongedFee,
        status: 'compliant',
        editReason: 'Prolonged face-to-face and non-face-to-face geneticist counseling time explicitly documented in time statement.',
      });
    }

    // 2. Tandem Mass Spectrometry (MS/MS) Amino Acids
    if (aminoAcidMethod === 'ms_ms_quantitative') {
      const aaFee = 215;
      grossValue += aaFee;
      items.push({
        code: '82139',
        modifier: '',
        description: 'Amino acids, multiple, quantitative, each specimen (Tandem MS/MS fractionation)',
        rvu: 4.2,
        estAllowed: aaFee,
        status: 'compliant',
        editReason: 'Tandem mass spectrometry quantitative fractionation supported by inborn error of metabolism diagnosis.',
      });
    } else {
      const aaFee = 115;
      grossValue += aaFee;
      items.push({
        code: '82136',
        modifier: '',
        description: 'Amino acids, 2 to 5 amino acids, quantitative',
        rvu: 2.3,
        estAllowed: aaFee,
        status: 'warning',
        editReason: 'Qualitative or limited amino acid screens forfeit complete acylcarnitine and organic acid diagnostic correlation.',
      });
      warnings.push('Limited amino acid panel (82136) may be downcoded by commercial payers unless specific targeted analytes are charted.');
      atRiskValue += 100;
    }

    // 3. Urine Organic Acids (GC/MS)
    if (includeUrineOrganic) {
      const uoaFee = 195;
      grossValue += uoaFee;
      items.push({
        code: '83918',
        modifier: '',
        description: 'Organic acids; total, quantitative, each specimen (Gas chromatography / mass spectrometry)',
        rvu: 3.8,
        estAllowed: uoaFee,
        status: 'compliant',
        editReason: 'Urine organic acid profiling validated for organic acidemia / branched chain ketoaciduria diagnostics.',
      });
    }

    // 4. Free & Total Carnitine Panel
    if (includeCarnitine) {
      const carnitineFee = 145;
      grossValue += carnitineFee;
      items.push({
        code: '82010',
        modifier: '',
        description: 'Acylcarnitines; quantitative, each specimen (plasma acylcarnitine profile)',
        rvu: 2.9,
        estAllowed: carnitineFee,
        status: 'compliant',
        editReason: 'Acylcarnitine panel paired with urine organic acids to exclude fatty acid oxidation disorders.',
      });
    }

    // 5. Medical Formula / Orphan Food (HCPCS B4162 vs B4157)
    if (medicalFoodOption === 'b4162_approved') {
      const formulaFee = 1850; // Monthly supply
      grossValue += formulaFee;
      items.push({
        code: 'B4162',
        modifier: 'BO',
        description: 'Enteral formula, for pediatrics, special metabolic disease (amino-acid modified, orally administered)',
        rvu: 0,
        estAllowed: formulaFee,
        status: 'compliant',
        editReason: 'Statutory medical food mandate satisfied with Letter of Medical Necessity (LMN), enzyme assay, and prescription.',
      });
      recommendations.push('Maintain active annual state metabolic medical food prior-authorization on file with signed dietitian caloric titration notes.');
    } else if (medicalFoodOption === 'b4157_unauthorized') {
      items.push({
        code: 'B4157',
        modifier: 'UNAUTHORIZED',
        description: 'Enteral formula, nutritionally complete, for inherited disease of metabolism',
        rvu: 0,
        estAllowed: 1650,
        status: 'fatal',
        editReason: 'Payer denial: Billed as nutritional OTC dietary supplement without metabolic enzyme deficiency prior-authorization attachment.',
      });
      warnings.push('CRITICAL DENIAL: Specialized metabolic formula submitted without prior-authorization is denied as a non-covered dietary supplement ($1,650 clawback).');
      recommendations.push('Attach clinical biochemical genetics narrative establishing formula as indispensable medicine preventing neurocognitive decline.');
      atRiskValue += 1650;
    }

    // 6. Emergency Hyperammonemia Infusion Protocol
    if (ammoniaRescue) {
      const rescueFee = 420;
      grossValue += rescueFee;
      items.push({
        code: '96365',
        modifier: '59',
        description: 'Intravenous infusion, for therapy, prophylaxis, or diagnosis; initial, up to 1 hour (Sodium phenylacetate / benzoate scavenger)',
        rvu: 1.9,
        estAllowed: rescueFee,
        status: 'compliant',
        editReason: 'Acute hyperammonemic nitrogen scavenger administration unbundled from inpatient critical care consultation via distinct nursing protocol.',
      });
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
      cleanAllowed: grossValue,
    };
  }, [metabolicCondition, aminoAcidMethod, includeUrineOrganic, includeCarnitine, visitType, prolongedTimeUnits, medicalFoodOption, ammoniaRescue]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('pediatric_biochemical_genetics_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        metabolicCondition,
        aminoAcidMethod,
        includeUrineOrganic,
        includeCarnitine,
        visitType,
        prolongedTimeUnits,
        medicalFoodOption,
        grossValue: auditResult.grossValue,
        atRiskValue: auditResult.atRiskValue,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPacket = () => {
    const text = `--- AETHERA HEALTHCARE RCM PEDIATRIC BIOCHEMICAL GENETICS AUDIT ---
Condition: ${metabolicCondition.toUpperCase()}
Visit: ${visitType.toUpperCase()} (Prolonged +99417 Units: ${prolongedTimeUnits})
Amino Acids: ${aminoAcidMethod.toUpperCase()}
Urine Organics: ${includeUrineOrganic ? 'YES' : 'NO'}
Carnitine Panel: ${includeCarnitine ? 'YES' : 'NO'}
Medical Formula: ${medicalFoodOption.toUpperCase()}
Gross Clean Allowed: $${auditResult.grossValue.toLocaleString()}
Revenue At Risk: $${auditResult.atRiskValue.toLocaleString()}

CLAIM CODING LEDGER:
${auditResult.items.map((i) => `${i.code}${i.modifier ? `-${i.modifier}` : ''} | $${i.estAllowed} | ${i.description}`).join('\n')}

RECOMMENDATIONS:
${auditResult.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy/90 to-teal text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-mint/20 text-mint border border-mint/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <FlaskConical className="w-3.5 h-3.5" />
            Inborn Errors of Metabolism &amp; Rare Disease Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Pediatric Biochemical Genetics &amp; Metabolic Formula Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Audit tandem mass spectrometry panels (82139/82136), urine organic acid chromatography (83918), prolonged outpatient geneticist consultations (+99417), and overturn medical food/formula prior-auth denials (HCPCS B4162/B4157).
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Dna className="w-5 h-5 text-teal" />
              1. Inborn Error Condition &amp; Clinical Visit
            </h3>

            {/* Metabolic condition selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Primary Metabolic Disease
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mma_pa', label: 'MMA / PA (E71.12)' },
                  { id: 'msud', label: 'MSUD (E71.0)' },
                  { id: 'pku', label: 'PKU (E70.0)' },
                  { id: 'ucd', label: 'Urea Cycle (E72.2)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMetabolicCondition(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      metabolicCondition === item.id
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visit level & Prolonged Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Clinical Genetics Visit Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisitType('new_99205')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      visitType === 'new_99205' ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    New (99205)
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitType('established_99215')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      visitType === 'established_99215' ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    Established (99215)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Prolonged Time (+99417)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0, 1, 2].map((units) => (
                    <button
                      key={units}
                      type="button"
                      onClick={() => setProlongedTimeUnits(units)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        prolongedTimeUnits === units ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                      }`}
                    >
                      {units === 0 ? 'None' : `+${units * 15}m (${units})`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Laboratory Diagnostic Profiling & Medical Food */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-teal" />
              2. Biochemical Labs &amp; Medical Food Authorization
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Tandem MS/MS Amino Acid Methodology
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAminoAcidMethod('ms_ms_quantitative')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    aminoAcidMethod === 'ms_ms_quantitative' ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                  }`}
                >
                  Quantitative MS/MS (82139)
                </button>
                <button
                  type="button"
                  onClick={() => setAminoAcidMethod('qualitative')}
                  className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    aminoAcidMethod === 'qualitative' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray/20 text-slate-600'
                  }`}
                >
                  Limited Screen (82136)
                </button>
              </div>
            </div>

            {/* Checkboxes: Urine Organics, Carnitine, Ammonia Rescue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUrineOrganic}
                  onChange={(e) => setIncludeUrineOrganic(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Urine Organic Acids (83918)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeCarnitine}
                  onChange={(e) => setIncludeCarnitine(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Acylcarnitine Panel (82010)</span>
              </label>
            </div>

            {/* Medical Food Option */}
            <div className="pt-2 border-t border-gray/10">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Medical Food / Metabolic Formula Prior-Auth Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'b4162_approved', label: 'Pediatric Formula Approved (B4162)' },
                  { id: 'b4157_unauthorized', label: 'Denied as OTC Supplement (B4157)' },
                  { id: 'none', label: 'No Formula Billed' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMedicalFoodOption(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      medicalFoodOption === item.id
                        ? item.id === 'b4157_unauthorized'
                          ? 'border-rose-500 bg-rose-50 text-rose-700'
                          : 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-gray/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ammoniaRescue}
                  onChange={(e) => setAmmoniaRescue(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Emergency Nitrogen Scavenger Infusion (+96365)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Ledger & Action Center */}
        <div className="lg:col-span-6 space-y-6">
          {/* Audit Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray/15 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Clean Allowed</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
                ${auditResult.cleanAllowed.toLocaleString()}
              </div>
              <span className="text-xs text-teal font-medium mt-1 inline-block">Clinical &amp; Lab Revenue</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray/15 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue At Risk</span>
              <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${auditResult.atRiskValue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${auditResult.atRiskValue.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-1 inline-block">Formula Denials &amp; Panel Bundling</span>
            </div>
          </div>

          {/* Warnings Panel */}
          {auditResult.warnings.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>Metabolic Coding &amp; Coverage Warning</span>
              </div>
              <ul className="space-y-2 text-xs text-rose-700">
                {auditResult.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Line Item Ledger */}
          <div className="bg-white border border-gray/15 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray/10 pb-3">
              <h4 className="font-bold text-navy text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                ANSI X12 837P Claim Line Item Ledger
              </h4>
              <button
                type="button"
                onClick={handleCopyPacket}
                className="inline-flex items-center gap-1.5 text-xs text-teal hover:text-navy font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Audit Copied!' : 'Copy Audit Packet'}
              </button>
            </div>

            <div className="divide-y divide-gray/10">
              {auditResult.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-navy text-sm">{item.code}</span>
                      {item.modifier && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                          item.modifier === 'UNAUTHORIZED' ? 'bg-rose-100 text-rose-700' : 'bg-teal/15 text-teal'
                        }`}>
                          {item.modifier}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        item.status === 'compliant'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{item.description}</p>
                    {item.editReason && (
                      <p className="text-[11px] text-slate-500 italic">{item.editReason}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-navy">${item.estAllowed.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-400">{item.rvu} RVUs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Capture Form */}
          <div className="bg-gradient-to-br from-cream/40 to-teal/5 border border-teal/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal" />
              <h4 className="font-bold text-navy text-sm">Request Comprehensive Biochemical Genetics Practice Audit</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Have our rare disease billing specialists review your metabolic lab panels, prolonged geneticist visits, and orphan formula prior-authorization workflows.
            </p>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-emerald-900">Audit Request Received</h5>
                <p className="text-xs text-emerald-700 mt-1">
                  Our pediatric biochemical genetics RCM team will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Physician / Clinic Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email (e.g. echen@geneticsclinic.org)"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Children's Hospital / Genetics Institute"
                    value={contactPractice}
                    onChange={(e) => setContactPractice(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Direct Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal hover:bg-navy text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    'Processing Audit Request...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Metabolic Case for Comprehensive Practice Audit
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
