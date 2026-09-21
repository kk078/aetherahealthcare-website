'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  ShieldAlert,
  AlertTriangle,
  Scale,
  FileText,
  Copy,
  Check,
  Sliders,
  TrendingDown,
  Building2,
  FileCheck2,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react';
import {
  TWO_MIDNIGHT_CASES,
  PAYER_COMPLIANCE_METRICS,
  calculateLevelOfCareArbitration,
  calculateHospitalAnnualMaExposure,
  generateTwoMidnightAppealDossier,
  type TwoMidnightCase,
} from '@/data/twoMidnightData';

export function TwoMidnightRuleArbiter() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-adhf-cardiorenal');
  const [selectedSetting, setSelectedSetting] = useState<'INPATIENT_PART_A' | 'OUTPATIENT_OBSERVATION'>('OUTPATIENT_OBSERVATION');
  const [midnightsExpected, setMidnightsExpected] = useState<number>(3);
  const [hasValidOrder, setHasValidOrder] = useState<boolean>(true);

  // Hospital Exposure Modeler State
  const [annualMaAdmissions, setAnnualMaAdmissions] = useState<number>(1200);
  const [denialRate, setDenialRate] = useState<number>(18);
  const [avgShortfall, setAvgShortfall] = useState<number>(9500);

  // Modal State
  const [isAppealModalOpen, setIsAppealModalOpen] = useState<boolean>(false);
  const [copiedAppeal, setCopiedAppeal] = useState<boolean>(false);

  const activeCase: TwoMidnightCase = useMemo(() => {
    return TWO_MIDNIGHT_CASES.find((c) => c.id === selectedCaseId) || TWO_MIDNIGHT_CASES[0];
  }, [selectedCaseId]);

  // Sync expected midnights when case changes
  const handleCaseChange = (caseId: string) => {
    setSelectedCaseId(caseId);
    const targetCase = TWO_MIDNIGHT_CASES.find((c) => c.id === caseId);
    if (targetCase) {
      setMidnightsExpected(targetCase.physicianAdmissionOrder.midnightsExpected);
      setSelectedSetting('OUTPATIENT_OBSERVATION'); // Default to showing the MA downgrade scenario
    }
  };

  const arbitrationResult = useMemo(() => {
    return calculateLevelOfCareArbitration(
      activeCase,
      selectedSetting,
      midnightsExpected,
      hasValidOrder
    );
  }, [activeCase, selectedSetting, midnightsExpected, hasValidOrder]);

  const annualExposureResult = useMemo(() => {
    return calculateHospitalAnnualMaExposure(annualMaAdmissions, denialRate, avgShortfall);
  }, [annualMaAdmissions, denialRate, avgShortfall]);

  const appealText = useMemo(() => {
    return generateTwoMidnightAppealDossier(activeCase);
  }, [activeCase]);

  const handleCopyAppeal = () => {
    navigator.clipboard.writeText(appealText);
    setCopiedAppeal(true);
    setTimeout(() => setCopiedAppeal(false), 2000);
  };

  return (
    <section
      id="two-midnight-arbiter"
      className="bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20 py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header Block */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Scale className="w-3.5 h-3.5 text-cyan-400" />
            42 CFR § 412.3 & § 422.101 • CMS-4201-F TWO-MIDNIGHT ARBITER
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            CMS-4201-F Two-Midnight Rule & <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-sky-400 bg-clip-text text-transparent">
              Medicare Advantage Level-of-Care Arbiter
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Eliminating coercive Medicare Advantage observation downgrades, enforcing Traditional Medicare Part A
            coverage rules over unauthorized commercial algorithms (MCG / InterQual), and modeling Level-of-Care DRG
            recoveries under the landmark 2024 CMS-4201-F Final Rule.
          </p>

          {/* Statutory Reference Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              42 CFR § 412.3 (Two-Midnight Benchmark)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              42 CFR § 422.101(f) (Commercial Criteria Bar)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              CMS-4201-F (88 FR 22120)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800">
              Condition Code 44 Procedural Defense
            </span>
          </div>
        </div>

        {/* Inpatient Admission Case Selector Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Select Inpatient Admission Case Study:
            </h3>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Showing 4 High-Frequency MA Observation Downgrade Scenarios
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TWO_MIDNIGHT_CASES.map((c) => {
              const isSelected = c.id === selectedCaseId;
              const delta = c.inpatientDrg.paymentAmount - c.observationApc.paymentAmount;
              return (
                <button
                  key={c.id}
                  onClick={() => handleCaseChange(c.id)}
                  className={`p-4 rounded-xl text-left border transition-all duration-200 relative group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900/90 border-cyan-500 ring-1 ring-cyan-500/50 shadow-lg shadow-cyan-950/40'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                        {c.inpatientDrg.code}
                      </span>
                      <span className="text-rose-400 font-mono font-bold">
                        -${delta.toLocaleString()}
                      </span>
                    </div>
                    <div className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {c.title}
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">{c.specialty}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{c.maPayer.name.split(' ')[0]} MA</span>
                    <span className="text-amber-400 font-medium">
                      {c.physicianAdmissionOrder.midnightsExpected} Midnights
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Case Clinical & Payer Audit Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          {/* Left Column: Clinical Admission Profile & Physician Order */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4" />
                Inpatient Admission Profile & Hour-0 Certification
              </span>
              <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono">
                {activeCase.specialty}
              </span>
            </div>

            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">{activeCase.title}</h4>
              <p className="text-xs text-slate-400 italic">{activeCase.patientProfile}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-500 font-semibold mb-1">Principal Admitting Diagnosis</div>
                <div className="font-mono font-bold text-cyan-300 text-sm">{activeCase.admittingDiagnosis.code}</div>
                <div className="text-slate-300 mt-0.5">{activeCase.admittingDiagnosis.description}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="text-slate-500 font-semibold mb-1">Documented Comorbidities</div>
                <div className="space-y-1">
                  {activeCase.secondaryComorbidities.map((sc) => (
                    <div key={sc.code} className="flex items-center justify-between text-slate-300">
                      <span className="font-mono text-slate-200">
                        {sc.code}{' '}
                        <span
                          className={`text-[10px] px-1 py-0.2 rounded font-bold ${
                            sc.type === 'MCC' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {sc.type}
                        </span>
                      </span>
                      <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[160px] text-right">
                        {sc.description.split('(')[0]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800/90 space-y-1.5 text-xs">
              <div className="text-slate-400 font-medium">Clinical Presentation & Course:</div>
              <p className="text-slate-300 leading-relaxed">{activeCase.clinicalPresentation}</p>
            </div>

            <div className="p-3.5 rounded-lg bg-cyan-950/20 border border-cyan-800/50 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-cyan-300 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Hour-0 Admitting Physician Order & Two-Midnight Expectation:
                </span>
                <span className="font-mono text-[11px] text-cyan-400">
                  {activeCase.physicianAdmissionOrder.orderTimestamp}
                </span>
              </div>
              <p className="text-cyan-100 font-mono text-[11px] bg-slate-950/60 p-2.5 rounded border border-cyan-900/60 leading-normal">
                &ldquo;{activeCase.physicianAdmissionOrder.expectationText}&rdquo;
              </p>
              <div className="text-[11px] text-cyan-300/80">
                <span className="font-semibold text-cyan-200">Clinical Rationale:</span>{' '}
                {activeCase.physicianAdmissionOrder.clinicalRationale}
              </div>
            </div>
          </div>

          {/* Right Column: MA Payer Denial vs CMS-4201-F Violation */}
          <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  MA Commercial Denial & Coercion Tactics
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-bold">
                  {activeCase.maPayer.aljOverturnRate}% ALJ Overturn Rate
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/50 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-100">{activeCase.maPayer.name}</div>
                  <span className="text-[11px] text-slate-400">{activeCase.maPayer.planType}</span>
                </div>
                <div className="text-slate-400">
                  <span className="text-rose-400 font-semibold">Commercial Criterion:</span>{' '}
                  <span className="font-mono text-slate-300">{activeCase.maPayer.commercialCriteriaUsed}</span>
                </div>
                <blockquote className="p-2.5 rounded bg-rose-950/20 border-l-2 border-rose-500 text-rose-200 italic leading-snug">
                  {activeCase.maPayer.denialQuote}
                </blockquote>
                <div className="text-[11px] text-slate-400">
                  <span className="text-amber-400 font-semibold">Coercive Practice:</span>{' '}
                  {activeCase.maPayer.coercionTactics}
                </div>
              </div>

              {/* CMS-4201-F Regulatory Violation Box */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-cyan-500/40 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                  <Scale className="w-3.5 h-3.5" />
                  CMS-4201-F Regulatory Violation Audit
                </div>
                <div className="font-mono text-cyan-300 font-semibold">{activeCase.cmsViolation.cfrCitation}</div>
                <p className="text-slate-300 leading-snug">{activeCase.cmsViolation.ruleSummary}</p>
                <div className="pt-1.5 border-t border-slate-800 text-rose-300 font-medium">
                  {activeCase.cmsViolation.prohibitedConduct}
                </div>
              </div>
            </div>

            {/* Quick Action Button for Appeal */}
            <button
              onClick={() => setIsAppealModalOpen(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide uppercase transition-all shadow-lg shadow-cyan-950/60 flex items-center justify-center gap-2 group"
            >
              <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
              Generate CMS-4201-F Inpatient Appeal Brief
            </button>
          </div>
        </div>

        {/* Interactive Level of Care & Two-Midnight Arbiter Simulator */}
        <div className="space-y-6 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 lg:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">
                <Clock className="w-4 h-4" />
                Two-Midnight Benchmark Simulation Engine (42 CFR § 412.3)
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Level-of-Care Adjudication & Financial Disparity Meter
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Adjudicated Setting:</span>
              <div className="inline-flex rounded-lg p-1 bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setSelectedSetting('INPATIENT_PART_A')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    selectedSetting === 'INPATIENT_PART_A'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Inpatient Part A (Protected)
                </button>
                <button
                  onClick={() => setSelectedSetting('OUTPATIENT_OBSERVATION')}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    selectedSetting === 'OUTPATIENT_OBSERVATION'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Observation (MA Downgrade)
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Input Controls: Expected Midnights and Certification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  Physician Documented Expectation of Hospital Stays:
                </label>
                <span className="font-mono font-bold text-cyan-300">
                  {midnightsExpected} Midnight{midnightsExpected > 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMidnightsExpected(m)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      midnightsExpected === m
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300 shadow-sm'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m === 3 ? '3+ Midnights' : `${m} Midnight${m > 1 ? 's' : ''}`}
                    <span className="block text-[10px] text-slate-500 font-normal">
                      {m >= 2 ? 'Meets Benchmark' : 'Below Benchmark'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-300 font-semibold flex items-center gap-1.5">
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                  Physician Inpatient Order & Certification Status:
                </label>
                <span className="font-mono font-bold text-emerald-300">
                  {hasValidOrder ? 'Valid Order Documented' : 'Missing / Incomplete'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setHasValidOrder(true)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    hasValidOrder
                      ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Certified Part A Order
                  <span className="block text-[10px] text-slate-500 font-normal">
                    42 CFR § 412.3(a) Compliant
                  </span>
                </button>
                <button
                  onClick={() => setHasValidOrder(false)}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    !hasValidOrder
                      ? 'bg-rose-950/50 border-rose-500 text-rose-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Uncertified / Flawed Order
                  <span className="block text-[10px] text-slate-500 font-normal">
                    Procedural Vulnerability
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Real-Time Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-medium">Inpatient Baseline (MS-DRG)</div>
              <div className="text-2xl font-bold font-mono text-cyan-400">
                ${activeCase.inpatientDrg.paymentAmount.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>{activeCase.inpatientDrg.code}</span>
                <span>Wt: {activeCase.inpatientDrg.relativeWeight.toFixed(4)}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-medium">Adjudicated Level Payment</div>
              <div
                className={`text-2xl font-bold font-mono ${
                  arbitrationResult.assignedSetting === 'INPATIENT_PART_A' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                ${arbitrationResult.assignedPayment.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>{arbitrationResult.assignedCode}</span>
                <span>{arbitrationResult.assignedSetting === 'INPATIENT_PART_A' ? 'IPPS Part A' : 'OPPS Observation'}</span>
              </div>
            </div>

            <div
              className={`p-4 rounded-xl border space-y-1 ${
                arbitrationResult.revenueShortfall > 0
                  ? 'bg-rose-950/30 border-rose-600/50'
                  : 'bg-emerald-950/30 border-emerald-600/50'
              }`}
            >
              <div className="text-xs font-medium flex items-center justify-between">
                <span className={arbitrationResult.revenueShortfall > 0 ? 'text-rose-300' : 'text-emerald-300'}>
                  Encounter Revenue Shortfall
                </span>
                <TrendingDown
                  className={`w-3.5 h-3.5 ${
                    arbitrationResult.revenueShortfall > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                />
              </div>
              <div
                className={`text-2xl font-bold font-mono ${
                  arbitrationResult.revenueShortfall > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {arbitrationResult.revenueShortfall > 0
                  ? `-$${arbitrationResult.revenueShortfall.toLocaleString()}`
                  : '$0 (Protected)'}
              </div>
              <div className="text-[11px] text-slate-400">
                {arbitrationResult.revenueShortfall > 0
                  ? 'Unjustified MA commercial downcoding loss'
                  : 'Full MS-DRG payment captured'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="text-xs text-slate-400 font-medium">Prompt-Pay Statutory Penalty</div>
              <div className="text-2xl font-bold font-mono text-indigo-400">
                ${arbitrationResult.promptPayInterestExposures.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-500">
                45-day statutory interest at 8% per annum
              </div>
            </div>
          </div>

          {/* Dynamic Statutory Verdict Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
              arbitrationResult.arbitrationStatus === 'CMS_COMPLIANT_INPATIENT'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : arbitrationResult.arbitrationStatus === 'UNLAWFUL_MA_DOWNGRADE'
                ? 'bg-rose-950/40 border-rose-500/60 text-rose-200'
                : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
            }`}
          >
            {arbitrationResult.arbitrationStatus === 'CMS_COMPLIANT_INPATIENT' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : arbitrationResult.arbitrationStatus === 'UNLAWFUL_MA_DOWNGRADE' ? (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1 text-xs">
              <div className="font-bold text-sm">
                {arbitrationResult.arbitrationStatus === 'CMS_COMPLIANT_INPATIENT' &&
                  'CMS-4201-F COMPLIANT: Full Inpatient Part A Reimbursement Guaranteed'}
                {arbitrationResult.arbitrationStatus === 'UNLAWFUL_MA_DOWNGRADE' &&
                  'CRITICAL VIOLATION: Unlawful Commercial Medicare Advantage Downgrade Detected'}
                {arbitrationResult.arbitrationStatus === 'LEGITIMATE_OBSERVATION' &&
                  'OBSERVATION STATUS: Encounter Does Not Meet the Two-Midnight Expectation'}
              </div>
              <p className="leading-relaxed opacity-90">{arbitrationResult.arbitrationVerdict}</p>
            </div>
          </div>
        </div>

        {/* National MA Payer Two-Midnight Compliance Scorecard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                Medicare Advantage Plan Enforcement Scorecard
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                Two-Midnight Commercial Denial & ALJ Overturn Index
              </h3>
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Data source: CMS MA Audit Findings & OMHA Appeals Records
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PAYER_COMPLIANCE_METRICS.map((payer) => (
              <div
                key={payer.payerName}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3"
              >
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-medium">{payer.marketShare}</div>
                  <div className="font-bold text-sm text-slate-100">{payer.payerName}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Two-Midnight Denials</span>
                    <span className="font-mono font-bold text-rose-400">{payer.twoMidnightDenialRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">ALJ Overturn Rate</span>
                    <span className="font-mono font-bold text-emerald-400">{payer.aljOverturnRate}%</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 line-clamp-1">
                  <span className="text-slate-500">Criterion:</span> {payer.primaryCriterion}
                </div>

                <div className="text-[10px] font-bold px-2 py-0.5 rounded text-center uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  {payer.complianceRiskLevel.replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital-Wide Annual MA Observation Exposure Calculator */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 lg:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                Hospital-Wide Revenue Exposure Modeler
              </div>
              <h3 className="text-xl font-bold text-white mt-1">
                Annual Facility Financial Loss from Unlawful MA Downgrades
              </h3>
            </div>
            <span className="text-xs text-slate-400">
              Simulate recovery across acute care inpatient volume
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Sliders Area */}
            <div className="lg:col-span-7 space-y-5">
              {/* Slider 1: Annual MA Inpatient Admissions */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Annual Medicare Advantage Admissions:</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {annualMaAdmissions.toLocaleString()} Inpatient Cases
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="5000"
                  step="100"
                  value={annualMaAdmissions}
                  onChange={(e) => setAnnualMaAdmissions(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>200 (Community)</span>
                  <span>1,500 (Regional)</span>
                  <span>5,000 (Major System)</span>
                </div>
              </div>

              {/* Slider 2: Payer Two-Midnight Denial Rate */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">MA Observation Downgrade Rate:</span>
                  <span className="font-mono font-bold text-rose-300">{denialRate}% of MA Admissions</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="1"
                  value={denialRate}
                  onChange={(e) => setDenialRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>5% (Low Risk)</span>
                  <span>18% (National Average)</span>
                  <span>35% (Aggressive Payer)</span>
                </div>
              </div>

              {/* Slider 3: Average Shortfall per Downgraded Encounter */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">Average Shortfall per Case (DRG vs APC 8011):</span>
                  <span className="font-mono font-bold text-amber-300">${avgShortfall.toLocaleString()} / Case</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="15000"
                  step="500"
                  value={avgShortfall}
                  onChange={(e) => setAvgShortfall(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>$5,000 (Medical)</span>
                  <span>$9,500 (Blended)</span>
                  <span>$15,000 (Surgical / ICU)</span>
                </div>
              </div>
            </div>

            {/* Calculated Output Displays */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-4">
              <div className="p-5 rounded-xl bg-slate-950/80 border border-rose-900/60 space-y-2">
                <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Total Annual Facility Exposure</span>
                  <span className="text-rose-500 font-mono text-[11px]">
                    {annualExposureResult.annualDenials} Denials/Year
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-rose-400">
                  -${annualExposureResult.totalAnnualLoss.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  Unreimbursed cost of acute inpatient care coerced into outpatient observation status by MA plans.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-slate-950/80 border border-emerald-900/60 space-y-2">
                <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Recoverable with Sovereign Arbiter</span>
                  <span className="text-emerald-400 font-mono text-[11px]">83% ALJ Win Rate</span>
                </div>
                <div className="text-3xl sm:text-4xl font-mono font-bold text-emerald-400">
                  +${annualExposureResult.recoverableWithArbiter.toLocaleString()}
                </div>
                <p className="text-xs text-slate-400 leading-snug">
                  Direct revenue restored through automated CMS-4201-F compliance appeals and prompt-pay enforcement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1-Click Appeal Dossier Modal */}
      {isAppealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-bold text-white">
                  CMS-4201-F Level-of-Care Expedited Appeal Dossier
                </h3>
              </div>
              <button
                onClick={() => setIsAppealModalOpen(false)}
                className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              >
                Close [ESC]
              </button>
            </div>

            {/* Modal Body / Preformatted Text */}
            <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed whitespace-pre-wrap select-all">
              {appealText}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                Statutory reference: 42 CFR § 422.101(b) & (f) • Binding on all MA Coordinated Care Plans
              </div>
              <button
                onClick={handleCopyAppeal}
                className="py-2.5 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/60"
              >
                {copiedAppeal ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Appeal Brief
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

export default TwoMidnightRuleArbiter;
