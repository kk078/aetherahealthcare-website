'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  ShieldAlert,
  ShieldCheck,
  Scale,
  FileCheck,
  Sliders,
  DollarSign,
  Building2,
  Copy,
  Check,
  TrendingDown,
  TrendingUp,
  Layers,
  AlertCircle
} from 'lucide-react';
import {
  IRF_FACILITY_ARCHETYPES,
  IRF_13_QUALIFYING_CONDITIONS,
  IRF_STATUTORY_COMPLIANCE_THRESHOLD,
  IRF_FY2026_STANDARD_CONVERSION_FACTOR,
  evaluateIrfCompliance,
  generateIrfAuditDossier,
  type IrfFacilityProfile
} from '@/data/irfPpsData';

export const IrfPpsArbiter: React.FC = () => {
  // Selected Profile & Tab
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('allegheny-excluded-unit');
  const [activeTab, setActiveTab] = useState<'compliance' | 'reclassification' | 'cmg_tiers' | 'medical_review'>('compliance');

  // Interactive Sliders
  const [customPresumptiveRate, setCustomPresumptiveRate] = useState<number>(0.564);
  const [customMedicalReviewDelta, setCustomMedicalReviewDelta] = useState<number>(0.068);
  const [customDischarges, setCustomDischarges] = useState<number>(310);

  // Modal State
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Active Profile
  const activeFacility: IrfFacilityProfile = useMemo(() => {
    return IRF_FACILITY_ARCHETYPES.find((f) => f.id === selectedFacilityId) || IRF_FACILITY_ARCHETYPES[0];
  }, [selectedFacilityId]);

  // Handle Profile Switch
  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    const target = IRF_FACILITY_ARCHETYPES.find((f) => f.id === facilityId);
    if (target) {
      setCustomPresumptiveRate(target.basePresumptiveRate);
      setCustomMedicalReviewDelta(target.medicalReviewDocumentationRate);
      setCustomDischarges(target.medicareDischargesAnnual);
    }
  };

  // Deterministic Settlement Calculation
  const calcResult = useMemo(() => {
    return evaluateIrfCompliance(
      activeFacility,
      customPresumptiveRate,
      customMedicalReviewDelta,
      customDischarges
    );
  }, [activeFacility, customPresumptiveRate, customMedicalReviewDelta, customDischarges]);

  // Audit Dossier
  const dossier = useMemo(() => {
    return generateIrfAuditDossier(activeFacility, calcResult);
  }, [activeFacility, calcResult]);

  const handleCopyDossier = () => {
    const text = `${dossier.legalHeader}\n` +
      `Audit Hash: ${dossier.auditHash}\n` +
      `Timestamp: ${dossier.timestamp}\n\n` +
      `FACILITY IDENTIFICATION & CLASSIFICATION:\n` +
      Object.entries(dossier.facilityIdentification).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\n42 CFR § 412.29 60% COMPLIANCE AUDIT:\n` +
      Object.entries(dossier.complianceRuleAudit).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nREIMBURSEMENT SETTLEMENT & IPPS RECLASSIFICATION RISK:\n` +
      Object.entries(dossier.reimbursementSettlement).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\n${dossier.statutorySafeHarbor}`;

    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="irf-pps-arbiter"
      aria-label="Inpatient Rehabilitation Facility (IRF) PPS & 60% Compliance Rule Arbiter"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Ambient Background Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-sky-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-indigo-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-semibold uppercase tracking-wider">
            <Activity className="h-4 w-4 text-sky-400" />
            42 CFR § 412.29 &amp; § 412.604 • SSA § 1886(j) • Form CMS-2552-10
          </div>
          <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            IRF PPS &amp; 60% Compliance Rule Arbiter
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Deterministic compliance modeling and revenue defense for Inpatient Rehabilitation Facilities (IRFs).
            Audit the 13 statutory qualifying medical conditions, automated presumptive computerized screening,
            medical review chart appeal recovery, and multi-million dollar acute IPPS reclassification clawbacks.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-sky-300">
              Statutory 60% Rule: 42 CFR § 412.29(b)(2)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-300">
              FY 2026 Base Conversion Factor: ${IRF_FY2026_STANDARD_CONVERSION_FACTOR.toLocaleString()}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300">
              Rural IRF Multiplier: +14.9% (1.149x)
            </span>
          </div>
        </div>

        {/* Archetype Selector Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-sky-400" />
              Select Facility Archetype &amp; Audit Profile
            </span>
            <span>{IRF_FACILITY_ARCHETYPES.length} Regulated Archetypes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {IRF_FACILITY_ARCHETYPES.map((facility) => {
              const isSelected = facility.id === selectedFacilityId;
              const isCompliant = facility.basePresumptiveRate >= IRF_STATUTORY_COMPLIANCE_THRESHOLD ||
                (facility.basePresumptiveRate + facility.medicalReviewDocumentationRate) >= IRF_STATUTORY_COMPLIANCE_THRESHOLD;
              
              return (
                <button
                  key={facility.id}
                  onClick={() => handleFacilityChange(facility.id)}
                  type="button"
                  className={`p-4 rounded-xl text-left transition-all border ${
                    isSelected
                      ? 'bg-slate-900/90 border-sky-500 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/30'
                      : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      CCN #{facility.ccn}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isCompliant
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                      }`}
                    >
                      {(facility.basePresumptiveRate * 100).toFixed(1)}% Screen
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-white mb-1 line-clamp-1">
                    {facility.name}
                  </h3>
                  <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                    {facility.summary}
                  </p>

                  <div className="text-[11px] font-mono text-slate-400 space-y-1 pt-2 border-t border-slate-800/80">
                    <div className="flex justify-between">
                      <span>Beds / Type:</span>
                      <span className="text-slate-200">{facility.licensedBeds} Beds • {facility.facilityType === 'FREESTANDING_IRF' ? 'Freestanding' : 'Unit'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Wage Index:</span>
                      <span className="text-slate-200">{facility.wageIndex.toFixed(3)} {facility.isRural ? '(+14.9% Rural)' : ''}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Real-time Status Metric Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Compliance Status */}
          <div className={`p-4 rounded-xl border ${
            calcResult.finalComplianceStatus === 'COMPLIANT_IRF_PPS'
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">60% Rule Status</span>
              {calcResult.finalComplianceStatus === 'COMPLIANT_IRF_PPS' ? (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              ) : (
                <ShieldAlert className="h-4 w-4 text-rose-400" />
              )}
            </div>
            <div className="text-xl font-bold font-mono">
              {calcResult.finalComplianceStatus === 'COMPLIANT_IRF_PPS' ? 'COMPLIANT (IRF PPS)' : 'RECLASSIFIED (IPPS)'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {calcResult.presumptiveStatus === 'PASS' 
                ? `Presumptive: ${(calcResult.presumptiveComplianceRate * 100).toFixed(1)}% (Pass)` 
                : `Medical Review: ${(calcResult.medicalReviewComplianceRate * 100).toFixed(1)}% (${calcResult.medicalReviewStatus})`}
            </p>
          </div>

          {/* Settled IRF Payment Per Discharge */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">IRF Payment / Case</span>
              <DollarSign className="h-4 w-4 text-sky-400" />
            </div>
            <div className="text-xl font-bold font-mono text-sky-400">
              ${calcResult.settledIrfPaymentPerCase.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Wage: {activeFacility.wageIndex.toFixed(3)} • CMG: {activeFacility.averageCmgWeight.toFixed(2)}
            </p>
          </div>

          {/* IPPS Counterfactual Disparity */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">IPPS Counterfactual</span>
              <Scale className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono text-amber-400">
              ${calcResult.counterfactualIppsPaymentPerCase.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              +${calcResult.perCaseDisparityDelta.toLocaleString()} IRF Advantage / Case
            </p>
          </div>

          {/* Annual Program Settlement & Risk */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Annual Settlement</span>
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              ${(calcResult.annualIrfPpsProgramRevenue / 1000000).toFixed(2)}M
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {calcResult.annualReclassificationPenaltyLoss > 0 ? (
                <span className="text-rose-400 font-semibold">
                  -${(calcResult.annualReclassificationPenaltyLoss / 1000000).toFixed(2)}M Clawback Loss
                </span>
              ) : calcResult.medicalReviewRecoveryValue > 0 ? (
                <span className="text-emerald-400 font-semibold">
                  +${(calcResult.medicalReviewRecoveryValue / 1000000).toFixed(2)}M Saved via Audit
                </span>
              ) : (
                <span className="text-slate-400">Zero Reclassification Risk</span>
              )}
            </p>
          </div>
        </div>

        {/* Interactive Sliders / Sensitivity Controls */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sliders className="h-4 w-4 text-sky-400" />
              Interactive Sensitivity &amp; Medical Review Simulation
            </div>
            <button
              onClick={() => {
                setCustomPresumptiveRate(activeFacility.basePresumptiveRate);
                setCustomMedicalReviewDelta(activeFacility.medicalReviewDocumentationRate);
                setCustomDischarges(activeFacility.medicareDischargesAnnual);
              }}
              type="button"
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors font-mono underline"
            >
              Reset to Archetype Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Presumptive Compliance Rate Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Presumptive Screening Rate</span>
                <span className="font-mono text-sky-400 font-semibold">
                  {(customPresumptiveRate * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0.40"
                max="0.85"
                step="0.005"
                value={customPresumptiveRate}
                onChange={(e) => setCustomPresumptiveRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>40.0% (Fail)</span>
                <span className="text-amber-400 font-semibold">60.0% Threshold</span>
                <span>85.0% (Strong)</span>
              </div>
            </div>

            {/* Medical Review Documentation Recovery Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Medical Review Chart Recovery</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  +{(customMedicalReviewDelta * 100).toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="0.00"
                max="0.12"
                step="0.002"
                value={customMedicalReviewDelta}
                onChange={(e) => setCustomMedicalReviewDelta(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>+0.0% (No Recovery)</span>
                <span>Adjusted: {((customPresumptiveRate + customMedicalReviewDelta) * 100).toFixed(1)}%</span>
                <span>+12.0% (Max Appeal)</span>
              </div>
            </div>

            {/* Annual Medicare Discharges */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Annual Medicare Discharges</span>
                <span className="font-mono text-amber-400 font-semibold">
                  {customDischarges.toLocaleString()} Discharges
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="1000"
                step="10"
                value={customDischarges}
                onChange={(e) => setCustomDischarges(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>100 Cases</span>
                <span>Licensed Beds: {activeFacility.licensedBeds}</span>
                <span>1,000 Cases</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Analytical Perspectives */}
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
            {[
              { id: 'compliance', label: '60% Rule Compliance & Screen', icon: Activity },
              { id: 'reclassification', label: 'IRF vs IPPS Penalty Risk', icon: Scale },
              { id: 'cmg_tiers', label: 'CMG & Comorbidity Tiers', icon: Layers },
              { id: 'medical_review', label: 'Medical Review Audit Defense', icon: FileCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  type="button"
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab 1: 60% Rule Compliance & Presumptive Screening */}
          {activeTab === 'compliance' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Activity className="h-4 w-4 text-sky-400" />
                      42 CFR § 412.29(b)(2) Compliance Screen: 13 Statutory Conditions
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Automated computer algorithm assesses Medicare and non-Medicare admissions against CMS Presumptive ICD-10 List.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-mono text-slate-400">Current Margin</div>
                      <div className={`text-sm font-bold font-mono ${
                        calcResult.complianceMarginDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {calcResult.complianceMarginDelta >= 0 ? '+' : ''}{calcResult.complianceMarginDelta.toFixed(1)}% vs 60.0%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Compliance Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-slate-300">
                    <span>Presumptive: {(calcResult.presumptiveComplianceRate * 100).toFixed(1)}%</span>
                    <span className="text-amber-400 font-bold">Statutory Threshold: 60.0%</span>
                    <span>Adjusted: {(calcResult.medicalReviewComplianceRate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden relative flex">
                    {/* 60% Marker Line */}
                    <div className="absolute top-0 bottom-0 left-[60%] w-0.5 bg-amber-400 z-10 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    
                    {/* Presumptive Fill */}
                    <div
                      className={`h-full transition-all ${
                        calcResult.presumptiveComplianceRate >= 0.60 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, calcResult.presumptiveComplianceRate * 100)}%` }}
                    />
                    
                    {/* Medical Review Rescue Fill */}
                    {calcResult.medicalReviewComplianceRate > calcResult.presumptiveComplianceRate && (
                      <div
                        className="h-full bg-sky-500/80 transition-all"
                        style={{
                          width: `${Math.min(
                            100 - (calcResult.presumptiveComplianceRate * 100),
                            (calcResult.medicalReviewComplianceRate - calcResult.presumptiveComplianceRate) * 100
                          )}%`
                        }}
                      />
                    )}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>0.0%</span>
                    <span className="text-amber-400">Target ≥ 60.0% Under 42 CFR § 412.29</span>
                    <span>100.0%</span>
                  </div>
                </div>

                {/* 13 Statutory Conditions Grid */}
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    The 13 Statutory Qualifying Medical Conditions (IRF-PAI)
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {IRF_13_QUALIFYING_CONDITIONS.slice(0, 6).map((cond) => (
                      <div key={cond.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-sky-400 font-bold">RIC Code #{cond.code}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                            Presumptive
                          </span>
                        </div>
                        <div className="font-semibold text-slate-200">{cond.name}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{cond.clinicalCriteria}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {IRF_13_QUALIFYING_CONDITIONS.slice(6, 9).map((cond) => (
                      <div key={cond.id} className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-sky-400 font-bold">RIC Code #{cond.code}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
                            Presumptive
                          </span>
                        </div>
                        <div className="font-semibold text-slate-200">{cond.name}</div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{cond.clinicalCriteria}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {IRF_13_QUALIFYING_CONDITIONS.slice(9, 13).map((cond) => (
                      <div key={cond.id} className="p-3 rounded-lg bg-slate-950 border border-amber-900/40 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-amber-400 font-bold">Condition #{cond.code} (Conditional)</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                            Medical Review Required
                          </span>
                        </div>
                        <div className="font-semibold text-slate-200">{cond.name}</div>
                        <p className="text-[11px] text-slate-400">{cond.clinicalCriteria}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: IRF PPS vs IPPS Reclassification Risk Matrix */}
          {activeTab === 'reclassification' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="h-4 w-4 text-amber-400" />
                    IPPS MS-DRG Reclassification Clawback &amp; Margin Collapse Analysis
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    If an IRF fails the 60% rule during its 12-month compliance cost reporting period, CMS revokes its excluded status.
                    The facility is reclassified to acute IPPS MS-DRG prospective payment, resulting in a devastating revenue reduction.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* IRF PPS Reimbursement Model */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-sky-400 uppercase tracking-wider">
                        IRF PPS Payment (42 CFR § 412.624)
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/30">
                        Excluded Status Active
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Standard Base Conversion:</span>
                        <span className="text-slate-200">${IRF_FY2026_STANDARD_CONVERSION_FACTOR.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Wage Index Adjusted Base:</span>
                        <span className="text-slate-200">${calcResult.wageAdjustedBaseRate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Facility Multiplier (Rural/LIP/Teach):</span>
                        <span className="text-slate-200">{calcResult.facilityMultiplier.toFixed(4)}x</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>CMG &amp; Tier Relative Weight:</span>
                        <span className="text-slate-200">{(activeFacility.averageCmgWeight * calcResult.tierBlendedMultiplier).toFixed(3)}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-sky-400">
                        <span>Payment Per Discharge:</span>
                        <span>${calcResult.settledIrfPaymentPerCase.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-1">
                        <span>Annual Medicare Program Total:</span>
                        <span className="text-emerald-400">${calcResult.annualIrfPpsProgramRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* IPPS Reclassification Model */}
                  <div className="p-5 rounded-xl bg-slate-950 border border-rose-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">
                        Acute IPPS MS-DRG Counterfactual
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
                        Reclassified Post-Failure
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between text-slate-400">
                        <span>Acute IPPS Base Counterfactual:</span>
                        <span className="text-slate-200">$11,840</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Wage Index Adjustment:</span>
                        <span className="text-slate-200">{activeFacility.wageIndex.toFixed(3)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Average Inpatient MS-DRG Rate:</span>
                        <span className="text-slate-200">${calcResult.counterfactualIppsPaymentPerCase.toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-800 flex justify-between text-sm font-bold text-rose-400">
                        <span>Loss Per Discharge:</span>
                        <span>-${calcResult.perCaseDisparityDelta.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold text-white pt-1">
                        <span>Annual Reclassified Revenue:</span>
                        <span className="text-rose-300">${calcResult.annualIppsReclassificationRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Net Financial Impact Callout */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <TrendingDown className="h-4 w-4 text-rose-400" />
                      Annual Reclassification Penalty Exposure
                    </div>
                    <p className="text-xs text-slate-400">
                      Potential operating revenue clawback if compliance drops below 60.0% and appeals fail.
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-2xl font-black text-rose-400">
                      -${((calcResult.annualIrfPpsProgramRevenue - calcResult.annualIppsReclassificationRevenue) / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-[10px] text-slate-400">
                      ({(((calcResult.counterfactualIppsPaymentPerCase - calcResult.settledIrfPaymentPerCase) / calcResult.settledIrfPaymentPerCase) * 100).toFixed(1)}% Revenue Haircut)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Case-Mix Groups & Comorbidity Tiers */}
          {activeTab === 'cmg_tiers' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-400" />
                    IRF Case-Mix Groups (CMG) &amp; Comorbidity Tier Architecture
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    IRF PPS classifies patients into ~92 CMGs across 28 Rehabilitation Impairment Categories (RICs), adjusted by 4 comorbidity tiers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-sky-400">Tier 1 Comorbidity</span>
                      <span className="font-mono text-slate-400">~1.285x</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      High-cost conditions: tracheostomy, ventilator dependency, severe quadriplegia, Stage IV ulcers.
                    </p>
                    <div className="text-xs font-mono text-slate-300 pt-2 border-t border-slate-800 flex justify-between">
                      <span>Facility Mix:</span>
                      <span className="text-sky-300 font-bold">{(activeFacility.tierDistribution.tier1Pct * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-emerald-400">Tier 2 Comorbidity</span>
                      <span className="font-mono text-slate-400">~1.162x</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Moderate-cost conditions: end-stage renal disease on dialysis, deep vein thrombosis, acute myelopathy.
                    </p>
                    <div className="text-xs font-mono text-slate-300 pt-2 border-t border-slate-800 flex justify-between">
                      <span>Facility Mix:</span>
                      <span className="text-emerald-300 font-bold">{(activeFacility.tierDistribution.tier2Pct * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-amber-400">Tier 3 Comorbidity</span>
                      <span className="font-mono text-slate-400">~1.074x</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Low-cost conditions: complicated diabetes, severe protein-calorie malnutrition, secondary hemiplegia.
                    </p>
                    <div className="text-xs font-mono text-slate-300 pt-2 border-t border-slate-800 flex justify-between">
                      <span>Facility Mix:</span>
                      <span className="text-amber-300 font-bold">{(activeFacility.tierDistribution.tier3Pct * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-400">Tier 0 (None)</span>
                      <span className="font-mono text-slate-400">1.000x</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      No qualifying secondary comorbidities documented on IRF-PAI assessment.
                    </p>
                    <div className="text-xs font-mono text-slate-300 pt-2 border-t border-slate-800 flex justify-between">
                      <span>Facility Mix:</span>
                      <span className="text-slate-300 font-bold">{(activeFacility.tierDistribution.tier0Pct * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-sky-400" />
                    Composite Tier Multiplier Impact
                  </div>
                  <p className="text-slate-400">
                    The facility&apos;s current clinical comorbidity documentation yields a blended tier multiplier of{' '}
                    <strong className="text-white font-mono">{calcResult.tierBlendedMultiplier.toFixed(4)}x</strong>.
                    Proper capture of Tier 1 and Tier 2 secondary diagnoses on the IRF-PAI expands reimbursement by hundreds of thousands of dollars annually without compromising medical necessity.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Medical Review Audit Defense & Appeals */}
          {activeTab === 'medical_review' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    Medical Review Audit Defense &amp; Chart Recovery Strategy
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    When automated presumptive screening fails (&lt; 60%), CMS MACs conduct manual medical review.
                    Targeted documentation protocols salvage borderline cases to satisfy statutory compliance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-sky-400">Joint Replacement Criteria</div>
                    <p className="text-xs text-slate-400">
                      Standard unilateral joint replacements do not qualify presumptively. Chart review substantiates (1) bilateral procedures, (2) BMI ≥ 50, or (3) age ≥ 85.
                    </p>
                    <div className="text-[11px] font-mono text-emerald-400 pt-1">
                      +2.4% Compliance Recovery
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-emerald-400">Severe Arthritis Proof</div>
                    <p className="text-xs text-slate-400">
                      Documentation demonstrates severe osteoarthritis in ≥2 major weight-bearing joints with outpatient physical therapy failure prior to admission.
                    </p>
                    <div className="text-[11px] font-mono text-emerald-400 pt-1">
                      +2.8% Compliance Recovery
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-amber-400">Secondary Myelopathy &amp; Trauma</div>
                    <p className="text-xs text-slate-400">
                      Identifies underlying neurological deficits and major multiple trauma in admissions incorrectly coded as general medical debility.
                    </p>
                    <div className="text-[11px] font-mono text-emerald-400 pt-1">
                      +1.6% Compliance Recovery
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      Statutory Compliance Preservation
                    </div>
                    <p className="text-xs text-slate-300">
                      By executing comprehensive medical review substantiation, the facility recovers{' '}
                      <strong className="text-emerald-400 font-mono">+{(customMedicalReviewDelta * 100).toFixed(1)}%</strong> in qualifying volume,
                      lifting overall compliance to{' '}
                      <strong className="text-white font-mono">{((customPresumptiveRate + customMedicalReviewDelta) * 100).toFixed(1)}%</strong>.
                    </p>
                  </div>
                  {calcResult.medicalReviewRecoveryValue > 0 && (
                    <div className="text-right font-mono">
                      <div className="text-xl font-bold text-emerald-400">
                        +${(calcResult.medicalReviewRecoveryValue / 1000000).toFixed(2)}M
                      </div>
                      <div className="text-[10px] text-slate-400">Revenue Protected from Clawback</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 1-Click Dossier Generator Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <FileCheck className="h-4 w-4 text-sky-400" />
              CMS-2552-10 Worksheet S-2 &amp; IRF-PAI Settlement Dossier
            </h4>
            <p className="text-xs text-slate-400">
              Generate an auditable compliance verification brief with cryptographic SHA-256 fingerprint for MAC submission.
            </p>
          </div>
          <button
            onClick={() => setShowDossierModal(true)}
            type="button"
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-sky-500/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <FileCheck className="h-4 w-4 text-slate-950" />
            Generate CMS-2552-10 Brief
          </button>
        </div>
      </div>

      {/* Audit Dossier Modal */}
      {showDossierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-[10px] font-mono text-sky-400 uppercase tracking-wider mb-1">
                  {dossier.auditHash}
                </div>
                <h3 className="text-lg font-bold text-white">
                  Form CMS-2552-10 IRF 60% Compliance Settlement Brief
                </h3>
              </div>
              <button
                onClick={() => setShowDossierModal(false)}
                type="button"
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 space-y-4 border border-slate-800/80">
              <div className="text-slate-400 border-b border-slate-800 pb-2">
                CMS FORM 2552-10 (WORKSHEET S-2 PART I &amp; E-3 PART III) REVENUE SETTLEMENT BRIEF<br />
                Statutory Authority: 42 U.S.C. § 1395ww(j), 42 CFR § 412.29 &amp; § 412.604<br />
                Certified Facility: {dossier.facilityIdentification.facilityName} (CCN #{dossier.facilityIdentification.ccn}, NPI {dossier.facilityIdentification.npi})
              </div>

              <div className="space-y-1">
                <div className="text-sky-400 font-bold">FACILITY IDENTIFICATION &amp; STATUTORY STATUS</div>
                {Object.entries(dossier.facilityIdentification).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span>{k}:</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="text-amber-400 font-bold">42 CFR § 412.29 60% COMPLIANCE AUDIT</div>
                {Object.entries(dossier.complianceRuleAudit).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span>{k}:</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-800">
                <div className="text-emerald-400 font-bold">REIMBURSEMENT SETTLEMENT &amp; FINANCIAL DISPARITY</div>
                {Object.entries(dossier.reimbursementSettlement).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-slate-400">
                    <span>{k}:</span>
                    <span className="text-slate-200">{v}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-slate-400 text-[11px] leading-relaxed">
                <div className="text-sky-400 font-bold mb-1">STATUTORY SAFE-HARBOR CERTIFICATION (31 U.S.C. § 3729)</div>
                {dossier.statutorySafeHarbor}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-slate-400">
                Certified SHA-256 Audit Trail • 42 CFR § 412.29
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyDossier}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedDossier ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Full Dossier
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowDossierModal(false)}
                  type="button"
                  className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default IrfPpsArbiter;
