'use client';

import React, { useState, useMemo } from 'react';
import {
  Syringe,
  Pill,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  FileText,
  Sliders,
  ShieldAlert,
  Scale,
  TrendingDown,
} from 'lucide-react';
import {
  PART_B_DRUGS,
  DRUG_WASTE_SCENARIOS,
  calculateDrugWasteClaim,
  calculateAnnualDrugWasteExposure,
  generateDrugWasteAuditDossier,
  type DrugWasteScenario,
  type PartBDrugProfile,
} from '@/data/drugWasteData';

export function DrugWasteEngine() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('scenario-keytruda-nsclc');
  const [billingMode, setBillingMode] = useState<
    'COMPLIANT_SPLIT_JW' | 'MISSING_JZ_ZERO_WASTE' | 'UNBILLED_WASTE_ALL_ADMIN' | 'IMPROPER_MDC_REUSE'
  >('COMPLIANT_SPLIT_JW');

  // Interactive Dose Override
  const [customDoseMg, setCustomDoseMg] = useState<number>(175);

  // Annual Modeler State
  const [monthlyEncounters, setMonthlyEncounters] = useState<number>(250);
  const [avgVialCost, setAvgVialCost] = useState<number>(4800);
  const [avgWastePercent, setAvgWastePercent] = useState<number>(14);
  const [unbilledRate, setUnbilledRate] = useState<number>(12);

  // Modal State
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  const activeScenario: DrugWasteScenario = useMemo(() => {
    return DRUG_WASTE_SCENARIOS.find((s) => s.id === selectedScenarioId) || DRUG_WASTE_SCENARIOS[0];
  }, [selectedScenarioId]);

  const activeDrug: PartBDrugProfile = useMemo(() => {
    return PART_B_DRUGS.find((d) => d.id === activeScenario.drugId) || PART_B_DRUGS[0];
  }, [activeScenario]);

  // Handle Scenario Switch
  const handleScenarioChange = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    const target = DRUG_WASTE_SCENARIOS.find((s) => s.id === scenarioId);
    if (target) {
      setCustomDoseMg(target.prescribedDoseMg);
      setBillingMode('COMPLIANT_SPLIT_JW');
    }
  };

  // Compute Vials Needed based on dose and active drug config
  const vialCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (const vial of activeScenario.vialsDrawn) {
      counts[vial.vialSizeMg] = vial.count;
    }
    return counts;
  }, [activeScenario]);

  const calculationResult = useMemo(() => {
    return calculateDrugWasteClaim(activeDrug, customDoseMg, vialCounts, billingMode);
  }, [activeDrug, customDoseMg, vialCounts, billingMode]);

  const annualExposureResult = useMemo(() => {
    return calculateAnnualDrugWasteExposure(
      monthlyEncounters,
      avgVialCost,
      avgWastePercent,
      unbilledRate
    );
  }, [monthlyEncounters, avgVialCost, avgWastePercent, unbilledRate]);

  const dossierText = useMemo(() => {
    return generateDrugWasteAuditDossier(activeScenario, calculationResult);
  }, [activeScenario, calculationResult]);

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(dossierText);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="drug-waste-engine"
      className="bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Ambient Radial Lighting */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Syringe className="w-3.5 h-3.5 text-emerald-400" />
            SEC. 90004 IIJA • 42 CFR § 414.904 • CMS MODIFIERS -JW & -JZ AUDITOR
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            CMS Single-Dose Vial Drug Waste Engine & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Modifiers -JW vs. -JZ Discarded Units Auditor
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Eliminating False Claims Act exposure for concealed drug waste, auditing discarded vs. administered
            billing units for single-dose biologics and oncology injectables, enforcing 11-digit zero-padded NDC
            conversions, and monitoring Section 90004 manufacturer refund thresholds.
          </p>

          {/* Statutory Reference Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              Section 90004 IIJA (Part B Waste Refunds)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              42 CFR § 414.904 (Mandatory -JW & -JZ)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              USP &lt;797&gt; Sterile Compounding
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              11-Digit HIPAA 5010 NDC (5-4-2)
            </span>
          </div>
        </div>

        {/* Clinical Administration Case Selector Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Pill className="w-4 h-4 text-emerald-400" />
              Select Single-Dose Infusion / Injection Study:
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Showing 4 High-Cost Part B Biologics & Oncology Injectables
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {DRUG_WASTE_SCENARIOS.map((s) => {
              const isSelected = s.id === selectedScenarioId;
              const drug = PART_B_DRUGS.find((d) => d.id === s.drugId) || PART_B_DRUGS[0];
              const wasteValue = s.discardedDoseMg * drug.aspRatePerBillingUnit;
              return (
                <button
                  key={s.id}
                  onClick={() => handleScenarioChange(s.id)}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/90 border-emerald-500 ring-1 ring-emerald-500/50 shadow-lg shadow-emerald-950/40'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                        {drug.hcpcsCode}
                      </span>
                      <span className="text-rose-400 font-mono font-bold">
                        {wasteValue > 0 ? `-$${Math.round(wasteValue).toLocaleString()} Waste` : '$0 Waste (JZ)'}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {drug.brandName} ({drug.genericName.split(' ')[0]})
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{s.specialty}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{s.prescribedDoseMg} mg Dose</span>
                    <span className="text-teal-400 font-medium">
                      {s.discardedDoseMg > 0 ? `${s.discardedDoseMg} mg Discarded` : '100% Utilized'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Drug Administration & Compounding Detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          {/* Left Column: Clinical Presentation, Dose & Compounding */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Droplets className="w-4 h-4" />
                Pharmaceutical Compounding & Clinical Administration Profile
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                {activeScenario.specialty}
              </span>
            </div>

            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">
                {activeDrug.brandName} ({activeDrug.genericName}) — {activeScenario.title}
              </h4>
              <p className="text-xs text-slate-400 italic">{activeScenario.patientProfile}</p>
            </div>

            {/* Packaging & Pricing Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-500 font-semibold mb-0.5">HCPCS Billing Unit</div>
                <div className="font-mono font-bold text-emerald-300 text-sm">{activeDrug.hcpcsCode}</div>
                <div className="text-slate-400 text-[11px] mt-0.5">{activeDrug.billingUnitDefinition} / unit</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-500 font-semibold mb-0.5">Medicare ASP+6% Rate</div>
                <div className="font-mono font-bold text-cyan-300 text-sm">
                  ${activeDrug.aspRatePerBillingUnit.toFixed(2)}
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">Per Billing Unit</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-500 font-semibold mb-0.5">Vial Classification</div>
                <div className="font-mono font-bold text-teal-300 text-sm">Single-Dose Container</div>
                <div className="text-slate-400 text-[11px] mt-0.5">USP &lt;797&gt; No Preservative</div>
              </div>
            </div>

            {/* Compounding & Order Narrative */}
            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-1.5 text-xs">
              <div className="text-slate-400 font-medium">Compounding Context & Single-Dose Waste:</div>
              <p className="text-slate-300 leading-relaxed">{activeScenario.compoundingContext}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/50 space-y-1.5 text-xs">
              <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                USP &lt;797&gt; Cleanroom Compounding Documentation Excerpt:
              </div>
              <p className="text-emerald-100 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded border border-emerald-900/60 leading-normal">
                &ldquo;{activeScenario.clinicalDocumentationExcerpt}&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: 11-Digit NDC Mapping & Common Billing Traps */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  11-Digit HIPAA 5010 NDC Conversion
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                  5-4-2 Format
                </span>
              </div>

              {/* NDC Transformation Box */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-cyan-900/50 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">FDA Package NDC (10-Digit):</span>
                  <span className="font-mono text-slate-300 font-bold">
                    {activeDrug.vialConfigurations[0].fdaNdc10} ({activeDrug.vialConfigurations[0].ndc10Format})
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800">
                  <span className="text-emerald-400 font-semibold">HIPAA Zero-Padded (11-Digit):</span>
                  <span className="font-mono text-emerald-300 font-bold text-sm">
                    {calculationResult.hipaa11DigitNdc}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Under HIPAA 5010 EDI 837P Loop 2410 LIN03, commercial and Medicare payers strictly reject 10-digit
                  NDCs. Leading zeros must be prepended depending on the drug manufacturer’s format.
                </p>
              </div>

              {/* Common Billing Errors for this Scenario */}
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  Regulatory &amp; False Claims Act Hazards:
                </div>
                <div className="space-y-2">
                  {activeScenario.commonBillingErrors.map((err, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/70 border border-rose-900/40 text-[11px] space-y-1"
                    >
                      <div className="font-bold text-rose-300 flex items-center justify-between">
                        <span>{err.errorType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="text-slate-400">{err.description}</div>
                      <div className="text-amber-300/90 font-mono text-[10px]">
                        Consequence: {err.financialOrLegalConsequence}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Button for Audit Brief */}
            <button
              onClick={() => setIsDossierModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 group"
            >
              <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Generate USP &lt;797&gt; Drug Waste Defense Packet
            </button>
          </div>
        </div>

        {/* Interactive Dosage, Split-Line Claim Engine & Error Simulator */}
        <div className="space-y-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-semibold uppercase tracking-wider">
                <Syringe className="w-4 h-4" />
                CMS-1500 / 837P Split-Line Claim Generator &amp; Error Simulator
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Deterministic Drug Waste &amp; Modifier Compliance Auditor
              </h3>
            </div>

            {/* Billing Simulation Mode Selector */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 hidden sm:inline">Billing Mode:</span>
              <div className="inline-flex rounded-lg p-1 bg-slate-950 border border-slate-800 flex-wrap gap-1">
                <button
                  onClick={() => setBillingMode('COMPLIANT_SPLIT_JW')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    billingMode === 'COMPLIANT_SPLIT_JW'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Compliant Split (-JW / -JZ)
                </button>
                <button
                  onClick={() => setBillingMode('MISSING_JZ_ZERO_WASTE')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    billingMode === 'MISSING_JZ_ZERO_WASTE'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Missing -JZ Modifier
                </button>
                <button
                  onClick={() => setBillingMode('UNBILLED_WASTE_ALL_ADMIN')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    billingMode === 'UNBILLED_WASTE_ALL_ADMIN'
                      ? 'bg-amber-600 text-white shadow-md shadow-amber-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Concealed Waste (100% Admin)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Dosage Slider & Vial Volume Bar */}
          <div className="space-y-4 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-semibold">Patient Prescribed Dose:</span>
                <span className="font-mono font-bold text-emerald-300 text-base">{customDoseMg} mg</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span>
                  Total Vials Drawn:{' '}
                  <strong className="text-white font-mono">{calculationResult.totalVialsUsed} vial(s)</strong>
                </span>
                <span>
                  Packaged:{' '}
                  <strong className="text-white font-mono">{calculationResult.totalMgPackaged} mg</strong>
                </span>
              </div>
            </div>

            {/* Vial Fill vs Discarded Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{
                    width: `${
                      calculationResult.totalMgPackaged > 0
                        ? (calculationResult.administeredMg / calculationResult.totalMgPackaged) * 100
                        : 100
                    }%`,
                  }}
                  className="bg-emerald-500 h-full transition-all duration-300 relative group"
                />
                <div
                  style={{
                    width: `${
                      calculationResult.totalMgPackaged > 0
                        ? (calculationResult.discardedMg / calculationResult.totalMgPackaged) * 100
                        : 0
                    }%`,
                  }}
                  className="bg-rose-500 h-full transition-all duration-300 relative group"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span className="text-emerald-400 font-mono">
                  ● Administered: {calculationResult.administeredMg} mg ({calculationResult.administeredBillingUnits}{' '}
                  Units)
                </span>
                <span className="text-rose-400 font-mono">
                  ● Discarded (Waste): {calculationResult.discardedMg} mg ({calculationResult.discardedBillingUnits}{' '}
                  Units) — {calculationResult.wastePercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* Generated Claim Lines (CMS-1500 / 837P) */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Electronic Claim Form Line Items (ANSI 837P Loop 2400)</span>
              <span className="font-mono text-cyan-400">Total Billed: ${calculationResult.totalPayment.toLocaleString()}</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {calculationResult.claimLines.map((line) => (
                <div
                  key={line.lineNumber}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    line.modifier === '-JW'
                      ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                      : line.modifier === '-JZ'
                      ? 'bg-emerald-950/20 border-emerald-800/60 text-emerald-200'
                      : 'bg-slate-950/80 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px] font-bold">
                      Line {line.lineNumber}
                    </span>
                    <span className="font-bold text-white text-sm">{line.hcpcs}</span>
                    {line.modifier && (
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          line.modifier === '-JW'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        MOD: {line.modifier}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-sans">{line.description}</span>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                    <span className="text-slate-400">
                      Units: <strong className="text-white">{line.units}</strong>
                    </span>
                    <span className="text-emerald-400 font-bold text-sm">
                      ${line.lineCharge.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Compliance Audit Outcome Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
              calculationResult.auditComplianceStatus === 'FULLY_COMPLIANT'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : calculationResult.auditComplianceStatus === 'CRITICAL_REJECTION_RISK'
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            }`}
          >
            {calculationResult.auditComplianceStatus === 'FULLY_COMPLIANT' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : calculationResult.auditComplianceStatus === 'CRITICAL_REJECTION_RISK' ? (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sm">
                {calculationResult.auditComplianceStatus === 'FULLY_COMPLIANT' &&
                  'FULLY COMPLIANT: Clean Part B Claim Approved for Immediate Adjudication'}
                {calculationResult.auditComplianceStatus === 'CRITICAL_REJECTION_RISK' &&
                  'CRITICAL CLAIM SUSPENSION: Missing Mandatory CMS Modifier -JZ / -JW'}
                {calculationResult.auditComplianceStatus === 'FALSE_CLAIMS_ACT_EXPOSURE' &&
                  'STATUTORY HAZARD: False Claims Act Exposure for Concealed Drug Waste'}
              </div>
              <p className="leading-relaxed opacity-90">{calculationResult.auditRecommendation}</p>
            </div>
          </div>
        </div>

        {/* Hospital & Oncology Clinic Annual Part B Waste Exposure Modeler */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                Facility-Wide Part B Waste &amp; Liability Modeler
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Annual Drug Waste Revenue Recovery &amp; FCA Exposure Forecast
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Simulate enterprise infusion center or hospital outpatient department
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Area */}
            <div className="lg:col-span-7 space-y-5">
              {/* Slider 1: Monthly Biologic / Oncology Encounters */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Monthly Part B Biologic Infusions:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {monthlyEncounters.toLocaleString()} Encounters / Month
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={monthlyEncounters}
                  onChange={(e) => setMonthlyEncounters(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>50 (Small Clinic)</span>
                  <span>250 (Regional Center)</span>
                  <span>1,000 (Cancer Center)</span>
                </div>
              </div>

              {/* Slider 2: Average Vial Cost */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Average Packaged Drug Cost per Encounter:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    ${avgVialCost.toLocaleString()} / Encounter
                  </span>
                </div>
                <input
                  type="range"
                  min="1500"
                  max="10000"
                  step="250"
                  value={avgVialCost}
                  onChange={(e) => setAvgVialCost(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>$1,500 (Ophthalmology)</span>
                  <span>$4,800 (Biologics)</span>
                  <span>$10,000 (Complex IO)</span>
                </div>
              </div>

              {/* Slider 3: Average Discarded Waste Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Average Discarded Waste Percentage:</span>
                  <span className="font-mono font-bold text-amber-300">{avgWastePercent}% of Drug Packaged</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  step="1"
                  value={avgWastePercent}
                  onChange={(e) => setAvgWastePercent(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5% (Optimized Vials)</span>
                  <span>14% (National Blended)</span>
                  <span>30% (High Waste)</span>
                </div>
              </div>

              {/* Slider 4: Unbilled / Concealed Waste Error Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Unbilled / Improper -JW Error Rate:</span>
                  <span className="font-mono font-bold text-rose-300">{unbilledRate}% of Waste Encounters</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  step="1"
                  value={unbilledRate}
                  onChange={(e) => setUnbilledRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>2% (High Compliance)</span>
                  <span>12% (Industry Average)</span>
                  <span>25% (High Audit Risk)</span>
                </div>
              </div>
            </div>

            {/* Calculated Exposure Displays */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-4">
              <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-900/60 space-y-2">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Annual Part B Waste Discarded</span>
                  <TrendingDown className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">
                  ${annualExposureResult.annualDiscardedValue.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  Legitimate Part B reimbursement captured under Modifier -JW rather than forfeited or written off as
                  unbillable overhead.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/80 border border-rose-900/60 space-y-2">
                <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                  <span>False Claims Act Treble Exposure</span>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-rose-400">
                  -${annualExposureResult.fcaRecoupmentRisk.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  Potential statutory treble damages under 31 U.S.C. § 3729 if unbilled waste was concealed and billed as
                  administered units.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Compounding & Audit Defense Dossier Modal */}
      {isDossierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">
                  USP &lt;797&gt; Sterile Compounding &amp; Part B Waste Defense Packet
                </h3>
              </div>
              <button
                onClick={() => setIsDossierModalOpen(false)}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close [ESC]
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed whitespace-pre-wrap select-all">
              {dossierText}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Statutory reference: 42 CFR § 414.904 &amp; Section 90004 IIJA (P.L. 117-58)
              </div>
              <button
                onClick={handleCopyDossier}
                className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/60"
              >
                {copiedDossier ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Defense Packet
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DrugWasteEngine;
