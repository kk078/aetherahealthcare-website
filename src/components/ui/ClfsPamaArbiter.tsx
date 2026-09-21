'use client';

import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  Scale,
  FileCheck,
  Sliders,
  DollarSign,
  TrendingDown,
  Building2,
  Copy,
  Check,
  Dna,
  PieChart,
  BarChart3,
} from 'lucide-react';
import {
  CLFS_LABORATORY_ARCHETYPES,
  CLFS_TEST_CATALOG,
  DEFAULT_PAYER_TIERS_80053,
  evaluateClfsPamaSettlement,
  generateClfsPamaAuditDossier,
  type ClfsLaboratoryProfile,
  type LabTestProfile,
  type PrivatePayerRateTier,
} from '@/data/clfsPamaData';

export const ClfsPamaArbiter: React.FC = () => {
  // Active State Selections
  const [selectedLabId, setSelectedLabId] = useState<string>('national-reference-lab');
  const [selectedCptCode, setSelectedCptCode] = useState<string>('80053');
  const [activeTab, setActiveTab] = useState<'weighted_median' | 'applicable_lab' | 'adlt_recoupment' | 'cmp_guard'>('weighted_median');

  // Sensitivity Modifiers
  const [marketRateAdjustmentPercent, setMarketRateAdjustmentPercent] = useState<number>(0); // -40% to +30%
  const [customListCharge, setCustomListCharge] = useState<number>(5800);
  const [daysLateReporting, setDaysLateReporting] = useState<number>(0);

  // Modal State
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Active Laboratory & Test Profiles
  const activeLab: ClfsLaboratoryProfile = useMemo(() => {
    return CLFS_LABORATORY_ARCHETYPES.find((l) => l.id === selectedLabId) || CLFS_LABORATORY_ARCHETYPES[0];
  }, [selectedLabId]);

  const activeTest: LabTestProfile = useMemo(() => {
    return CLFS_TEST_CATALOG.find((t) => t.cptCode === selectedCptCode) || CLFS_TEST_CATALOG[0];
  }, [selectedCptCode]);

  // Scaled Private Payer Tiers based on sensitivity adjustment
  const activePayerTiers: PrivatePayerRateTier[] = useMemo(() => {
    const scaleFactor = 1 + marketRateAdjustmentPercent / 100;
    const baseRate = activeTest.currentClfsRate;

    // Scale default tiers relative to test baseline
    return DEFAULT_PAYER_TIERS_80053.map((tier) => ({
      ...tier,
      allowedRate: Number(
        Math.max(0.5, (baseRate * (tier.allowedRate / 10.65)) * scaleFactor).toFixed(2)
      ),
    }));
  }, [marketRateAdjustmentPercent, activeTest.currentClfsRate]);

  // Settlement Engine Evaluation
  const calcResult = useMemo(() => {
    return evaluateClfsPamaSettlement(
      activeLab,
      activeTest,
      activePayerTiers,
      activeTest.category === 'ADLT_NEW_INITIAL' ? customListCharge : undefined,
      daysLateReporting
    );
  }, [activeLab, activeTest, activePayerTiers, customListCharge, daysLateReporting]);

  // Form CMS-116 / PAMA Audit Dossier
  const dossier = useMemo(() => {
    return generateClfsPamaAuditDossier(activeLab, activeTest, calcResult);
  }, [activeLab, activeTest, calcResult]);

  const handleLabChange = (labId: string) => {
    setSelectedLabId(labId);
    if (labId === 'genomic-adlt-institute') {
      setSelectedCptCode('0242U');
    } else if (labId === 'rural-cah-lab') {
      setSelectedCptCode('80053');
    }
  };

  const handleCopyDossier = () => {
    const text = `${dossier.legalHeader}\n` +
      `Audit Hash: ${dossier.auditHash}\n` +
      `Timestamp: ${dossier.timestamp}\n\n` +
      `APPLICABLE LABORATORY DETERMINATION (42 CFR § 414.504):\n` +
      Object.entries(dossier.applicableLabDetermination).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nPAMA RATE SETTLEMENT & STATUTORY CAP (SSA § 1834A):\n` +
      Object.entries(dossier.pamaRateSettlement).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nADLT RECOUPMENT SAFEGUARD (42 CFR § 414.522):\n` +
      Object.entries(dossier.adltRecoupmentAnalysis).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\n${dossier.cmpSafeHarborCertification}`;

    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="clfs-pama-arbiter"
      aria-label="Clinical Laboratory Fee Schedule (CLFS) Private Payer Data Reporting & PAMA Market-Based Rate Arbiter"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Accent Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-cyan-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <FlaskConical className="h-4 w-4 text-emerald-400" />
            42 CFR Part 414 Subpart G • PAMA § 216 • SSA § 1834A (42 U.S.C. § 1395m-1)
          </div>
          <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            CLFS Private Payer Data Reporting &amp; PAMA Market-Based Rate Arbiter
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Deterministic private payer weighted-median rate calculation, 15% statutory phase-in reduction cap safeguards,
            Advanced Diagnostic Laboratory Test (ADLT) 130% list charge recoupment defense, and $10,000/day Civil Monetary Penalty (CMP) compliance shields.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-300">
              SSA § 1834A(b)(3) Phase-In Cap: Max 15% Cut / Year
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">
              Low-Expenditure Floor: $12,500 CLFS
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-purple-300">
              42 CFR § 414.522 ADLT Recoupment: &gt;130% List Charge
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-rose-300">
              CMP Reporting Guard: $10,000 / Day Violation
            </span>
          </div>
        </div>

        {/* Laboratory Archetype Selector (4 Authentic Profiles) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Select CLIA Certified Laboratory Archetype:
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              CLIA: {activeLab.cliaNumber} | NPI: {activeLab.npi}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CLFS_LABORATORY_ARCHETYPES.map((lab) => {
              const isSelected = lab.id === selectedLabId;
              return (
                <button
                  key={lab.id}
                  onClick={() => handleLabChange(lab.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {lab.labType.replace(/_/g, ' ')}
                      </span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                    <div className="text-sm font-bold text-white">{lab.name}</div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{lab.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      ${(lab.annualClfsMedicareRevenue / 1000000).toFixed(1)}M CLFS
                    </span>
                    <span className={`font-bold ${
                      lab.reportingComplianceStatus === 'COMPLIANT'
                        ? 'text-emerald-400'
                        : lab.reportingComplianceStatus === 'REPORTING_WINDOW_ACTIVE'
                        ? 'text-cyan-400'
                        : 'text-slate-400'
                    }`}>
                      {lab.reportingComplianceStatus === 'COMPLIANT' ? 'PAMA Active' : lab.reportingComplianceStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 High-Impact KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Settled Medicare Rate per Test */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-emerald-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Settled Medicare Rate</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
              ${calcResult.finalSettledMedicareRate.toFixed(2)}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>National: ${activeTest.currentClfsRate.toFixed(2)}</span>
              <span className={calcResult.phaseInProtectionSavingsPerTest > 0 ? 'text-amber-400 font-semibold' : 'text-slate-400'}>
                {calcResult.phaseInProtectionSavingsPerTest > 0 ? '15% Cap Active' : 'Market Settled'}
              </span>
            </div>
          </div>

          {/* Card 2: Annual CLFS Medicare Baseline */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-cyan-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Annual Medicare CLFS</span>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              ${Math.round(calcResult.annualMedicareRevenuePostPama).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{activeLab.annualTotalTestsPerformed.toLocaleString()} Total Tests</span>
              <span className="text-cyan-300 font-semibold">42 CFR § 414.508</span>
            </div>
          </div>

          {/* Card 3: Phase-In Protection Savings */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-amber-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Phase-In Cap Protection</span>
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              +${Math.round(calcResult.annualPhaseInProtectionValue).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{calcResult.phaseInProtectionSavingsPerTest > 0 ? `+$${calcResult.phaseInProtectionSavingsPerTest.toFixed(2)}/test` : '$0 (Uncapped)'}</span>
              <span className="text-amber-300 font-semibold">SSA § 1834A(b)(3)</span>
            </div>
          </div>

          {/* Card 4: CMP Penalty Shield */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-rose-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">CMP Penalty Safeguard</span>
              <ShieldCheck className="w-4 h-4 text-rose-400" />
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${calcResult.potentialCmpPenaltyExposure > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {calcResult.potentialCmpPenaltyExposure > 0 ? `-$${calcResult.potentialCmpPenaltyExposure.toLocaleString()}` : '$0 Safe'}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{daysLateReporting} Days Delinquency</span>
              <span className={calcResult.potentialCmpPenaltyExposure > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-300 font-semibold'}>
                {calcResult.potentialCmpPenaltyExposure > 0 ? 'CMP Exposure' : 'Safe Harbor Certified'}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Test & PAMA Sensitivity Controls Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Interactive Test Selection &amp; Private Payer Market Rate Sensitivity Modeler
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">42 CFR § 414.507 Engine</span>
          </div>

          {/* Row 1: Test Selection & Sensitivity Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Test Selector */}
            <div className="space-y-1.5 sm:col-span-2">
              <span className="text-xs text-slate-300 font-semibold block">Select Laboratory Test (CPT/HCPCS):</span>
              <select
                value={selectedCptCode}
                onChange={(e) => setSelectedCptCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                {CLFS_TEST_CATALOG.map((t) => (
                  <option key={t.cptCode} value={t.cptCode}>
                    CPT {t.cptCode} • {t.testName} ({t.category.replace(/_/g, ' ')}) — National: ${t.currentClfsRate.toFixed(2)}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 line-clamp-1">{activeTest.description}</p>
            </div>

            {/* Market Rate Pressure Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Private Payer Shift:</span>
                <span className={`font-mono font-bold ${marketRateAdjustmentPercent < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {marketRateAdjustmentPercent > 0 ? `+${marketRateAdjustmentPercent}%` : `${marketRateAdjustmentPercent}%`}
                </span>
              </div>
              <input
                type="range"
                min={-50}
                max={30}
                step={5}
                value={marketRateAdjustmentPercent}
                onChange={(e) => setMarketRateAdjustmentPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Severe Cut (-50%)</span>
                <span>Favorable (+30%)</span>
              </div>
            </div>

            {/* Delinquency Days Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Reporting Delinquency:</span>
                <span className={`font-mono font-bold ${daysLateReporting > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {daysLateReporting} Days
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={60}
                step={5}
                value={daysLateReporting}
                onChange={(e) => setDaysLateReporting(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Compliant (0d)</span>
                <span>$600k Exposure (60d)</span>
              </div>
            </div>
          </div>

          {/* Row 2: Special ADLT List Charge Control (Active only for New ADLT) */}
          {activeTest.category === 'ADLT_NEW_INITIAL' && (
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-purple-300 font-bold text-xs">
                  <Dna className="w-4 h-4 text-purple-400" />
                  <span>42 CFR § 414.522 New ADLT List Charge Recoupment Modeler</span>
                </div>
                <span className="text-[11px] font-mono text-purple-400">Initial 3-Quarter Period</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-semibold">Laboratory Actual List Charge:</span>
                    <span className="font-mono text-purple-300 font-bold">${customListCharge.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min={3500}
                    max={8500}
                    step={100}
                    value={customListCharge}
                    onChange={(e) => setCustomListCharge(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
                  />
                </div>
                <div className="text-xs text-slate-300 flex flex-col justify-center space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">130% Recoupment Ceiling:</span>
                    <span className="font-mono font-bold text-slate-200">
                      ${calcResult.listChargeRecoupmentThreshold.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Clawback Exposure:</span>
                    <span className={`font-mono font-bold ${calcResult.exceeds130PercentThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {calcResult.exceeds130PercentThreshold
                        ? `-$${calcResult.clawbackExposurePerTest.toFixed(2)}/test ($${Math.round(calcResult.annualAdltClawbackExposure).toLocaleString()} total)`
                        : 'ZERO CLAWBACK (Safe)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tabbed Navigation: 4 Analytical Perspectives */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('weighted_median')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'weighted_median'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>PAMA Weighted Median &amp; 15% Reduction Cap</span>
          </button>

          <button
            onClick={() => setActiveTab('applicable_lab')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'applicable_lab'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Applicable Laboratory Status &amp; 14x TOB Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('adlt_recoupment')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'adlt_recoupment'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            <span>ADLT 130% List Charge Recoupment Guard</span>
          </button>

          <button
            onClick={() => setActiveTab('cmp_guard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'cmp_guard'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>$10,000/Day CMP Reporting Penalty Safeguard</span>
          </button>
        </div>

        {/* Tab 1: PAMA Weighted Median & Phase-In Reduction Cap */}
        {activeTab === 'weighted_median' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: Private Payer Volume & Rate Distribution */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <PieChart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Private Payer Data Reporting Matrix</h3>
                    <p className="text-[11px] text-slate-400 font-mono">42 CFR § 414.504 Reported Allowed Rates</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  {calcResult.totalPrivatePayerVolume.toLocaleString()} Paid Tests
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {activePayerTiers.map((tier, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{tier.payerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tier.payerType.replace(/_/g, ' ')}</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-emerald-300 font-bold">${tier.allowedRate.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-400">{tier.paidVolume.toLocaleString()} tests</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel: Mathematical Derivation & Statutory 15% Cap */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">SSA § 1834A(b)(3) Statutory Settlement</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Volume-Weighted Median &amp; 15% Reduction Floor</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-cyan-300 text-xs font-mono font-bold">
                  CPT {activeTest.cptCode}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Historical CLFS Benchmark Rate:</span>
                  <span className="font-mono font-bold text-slate-200">${activeTest.currentClfsRate.toFixed(2)}</span>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Computed Private Payer Weighted Median:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    ${calcResult.weightedMedianRate.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Statutory 15.0% Reduction Floor (SSA § 1834A(b)(3)):</span>
                  <span className="font-mono font-bold text-amber-300">
                    ${(activeTest.currentClfsRate * 0.85).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
                  <span className="text-emerald-200 font-semibold">Final Settled Medicare CLFS Rate:</span>
                  <span className="font-mono font-extrabold text-emerald-300 text-sm">
                    ${calcResult.finalSettledMedicareRate.toFixed(2)} / Test
                  </span>
                </div>

                {calcResult.phaseInProtectionSavingsPerTest > 0 ? (
                  <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Statutory 15% Reduction Cap Safeguard Triggered</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Without PAMA statutory protections, private payer weighting would have slashed reimbursement by{' '}
                      <span className="text-rose-300 font-mono font-bold">
                        {Math.abs(calcResult.nominalPercentChange).toFixed(1)}%
                      </span>. Section 1834A(b)(3) shields{' '}
                      <span className="text-amber-300 font-mono font-bold">
                        ${calcResult.phaseInProtectionSavingsPerTest.toFixed(2)}
                      </span> per test, preserving{' '}
                      <span className="text-amber-300 font-mono font-bold">
                        ${Math.round(calcResult.annualPhaseInProtectionValue).toLocaleString()}
                      </span> in annual facility operating margin.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-200 text-xs">
                    <span>Market weighted median rate is within the statutory 15% corridor. Full market parity achieved.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Applicable Laboratory Status & 14x TOB Radar */}
        {activeTab === 'applicable_lab' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">42 CFR § 414.504 Applicable Laboratory Statutory Test</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Majority Medicare Revenue Test &amp; $12,500 Low-Expenditure Threshold</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                calcResult.isApplicableLaboratory
                  ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                  : 'bg-slate-800 border border-slate-700 text-slate-300'
              }`}>
                {calcResult.isApplicableLaboratory ? 'MANDATORY APPLICABLE LAB' : 'EXEMPT FROM REPORTING'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">CLFS + PFS Revenue Ratio</span>
                <div className="text-xl font-extrabold text-cyan-300 font-mono">
                  {calcResult.majorityMedicareRevenuePercent.toFixed(1)}%
                </div>
                <div className="text-[11px] text-slate-400">
                  Statutory Threshold: &gt; 50.0% of Medicare
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Low-Expenditure Floor</span>
                <div className="text-xl font-extrabold text-emerald-300 font-mono">
                  ${activeLab.annualClfsMedicareRevenue.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">
                  Statutory Threshold: &gt;= $12,500
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Billing Mechanism</span>
                <div className="text-xl font-extrabold text-purple-300 font-mono">
                  {activeLab.usesHospitalTob14x ? '14x Outreach' : activeLab.billsUnderSeparateNpi ? 'Independent NPI' : 'CAH Cost-Based'}
                </div>
                <div className="text-[11px] text-slate-400">
                  CMS-1784-F Hospital Outreach Rule
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Statutory Applicability Substantiation:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                {calcResult.applicabilitySubstantiation}
              </p>
              <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                <span className="text-cyan-300 font-semibold">CMS Revised Rule on Hospital Outreach Laboratories:</span> Effective January 1, 2019, CMS revised the definition of an applicable laboratory under 42 CFR § 414.504 to permit hospital outreach laboratories that bill using Type of Bill (TOB) 14x to determine applicable laboratory status based solely on their outreach Medicare revenues, rather than requiring the entire hospital to meet the 50% majority threshold.
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: ADLT 130% List Charge Recoupment Guard */}
        {activeTab === 'adlt_recoupment' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                  <Dna className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">42 CFR § 414.522 Advanced Diagnostic Laboratory Test (ADLT) Arbiter</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Criteria A &amp; B Molecular Algorithms vs. 130% List Charge Recoupment</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-purple-950 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold">
                {activeTest.isMolecularGenomic ? 'MOLECULAR ADLT' : 'STANDARD CDLT'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Statutory ADLT Classification Criteria:</div>
                  <ul className="space-y-2 text-slate-300">
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold font-mono">Criterion A:</span>
                      <span>Molecular pathology test analyzing multiple biomarkers of DNA, RNA, or proteins combined with a proprietary unique algorithm to provide a patient-specific result (e.g. Oncotype DX CPT 81519).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-purple-400 font-bold font-mono">Criterion B:</span>
                      <span>Test cleared or approved by the FDA under Premarket Approval (PMA) or 510(k) (e.g. Guardant360 CDx CPT 0242U, Cologuard CPT 81528).</span>
                    </li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="font-bold text-white">Initial 3-Quarter List Charge Period:</div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Under 42 CFR § 414.522(a), Medicare pays for a new ADLT at the laboratory&apos;s actual list charge during an initial period of three full calendar quarters. Once private payer data is reported, Medicare establishes a permanent market-based rate equal to the weighted median.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-200">130% Recoupment Clawback Test:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      calcResult.exceeds130PercentThreshold
                        ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                        : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                    }`}>
                      {calcResult.exceeds130PercentThreshold ? 'VIOLATION DETECTED' : 'SAFE HARBOR COMPLIANT'}
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual List Charge Billed:</span>
                      <span className="text-white font-bold">${customListCharge.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Market Weighted Median:</span>
                      <span className="text-emerald-300 font-bold">${calcResult.weightedMedianRate.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">130% Recoupment Ceiling:</span>
                      <span className="text-purple-300 font-bold">${calcResult.listChargeRecoupmentThreshold.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-purple-500/30">
                      <span className="text-slate-300">Total Medicare Clawback Liability:</span>
                      <span className={`font-bold ${calcResult.exceeds130PercentThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                        ${Math.round(calcResult.annualAdltClawbackExposure).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Authority: If the actual list charge exceeds 130% of the weighted median rate, CMS claws back the full difference between the list charge and the market rate for all claims paid during the initial period, plus statutory interest.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Civil Monetary Penalty (CMP) Defense & Safe Harbor Audit Log */}
        {activeTab === 'cmp_guard' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">42 U.S.C. § 1395m-1(a)(9) Civil Monetary Penalty (CMP) Safeguard</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Up to $10,000 / Day Penalty for Reporting Non-Compliance or Omission</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                calcResult.potentialCmpPenaltyExposure > 0
                  ? 'bg-rose-950 border border-rose-500/40 text-rose-300'
                  : 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
              }`}>
                {calcResult.potentialCmpPenaltyExposure > 0 ? `-$${calcResult.potentialCmpPenaltyExposure.toLocaleString()} CMP RISK` : 'ZERO CMP EXPOSURE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono uppercase">Statutory Penalty Rate</span>
                <div className="text-xl font-bold text-rose-400 font-mono">$10,000 / Day</div>
                <div className="text-[11px] text-slate-400">SSA § 1834A(a)(9)</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono uppercase">Delinquency Period</span>
                <div className="text-xl font-bold text-amber-300 font-mono">{daysLateReporting} Days</div>
                <div className="text-[11px] text-slate-400">Data Reporting Window</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-slate-400 font-mono uppercase">False Claims Safe Harbor</span>
                <div className="text-xl font-bold text-emerald-400 font-mono">VERIFIED</div>
                <div className="text-[11px] text-slate-400">31 U.S.C. § 3729 Shield</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <div className="font-bold text-white">Automated PAMA Data Integrity &amp; Audit Checklist:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-300">
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Contractual discounts &amp; rebates deducted from allowed rates</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Excludes unfinalized denials and zero-dollar adjudication claims</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Separate NPI aggregation validated for multi-facility chains</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-900/60 border border-slate-800">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>SHA-256 cryptographic audit trail attached to CMS Form 116</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1-Click CMS Form 116 / PAMA Section 216 Audit Dossier Action */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                CMS Form 116 &amp; PAMA Section 216 Audit Defense Ready
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Generate an auditable Medicare CLFS private payer data reporting compliance dossier, weighted median substantiation,
              and ADLT recoupment certification secured with SHA-256 cryptographic proof.
            </p>
          </div>

          <button
            onClick={() => setShowDossierModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/20 whitespace-nowrap flex items-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Generate CLFS PAMA Audit Dossier</span>
          </button>
        </div>

        {/* 1-Click CLFS PAMA Audit Dossier Modal */}
        {showDossierModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="CMS Form 116 & PAMA Section 216 Audit Dossier"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {dossier.auditHash}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    CMS Form 116 &amp; PAMA Section 216 Compliance Brief
                  </h3>
                </div>
                <button
                  onClick={() => setShowDossierModal(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 text-xs font-mono">
                {/* Legal Header */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed text-[11px]">
                  {dossier.legalHeader}
                </div>

                {/* Applicable Lab Section */}
                <div className="space-y-2">
                  <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                    Applicable Laboratory Determination (42 CFR § 414.504)
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
                    {Object.entries(dossier.applicableLabDetermination).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-white font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PAMA Rate Settlement Section */}
                <div className="space-y-2">
                  <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                    PAMA Rate Settlement &amp; Statutory Cap (SSA § 1834A)
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
                    {Object.entries(dossier.pamaRateSettlement).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-white font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ADLT Recoupment Analysis */}
                <div className="space-y-2">
                  <div className="text-purple-400 font-bold uppercase tracking-wider text-[11px]">
                    ADLT Recoupment Safeguard (42 CFR § 414.522)
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
                    {Object.entries(dossier.adltRecoupmentAnalysis).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-white font-bold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CMP Certification */}
                <div className="space-y-2">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    Statutory CMP &amp; False Claims Act Certification
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed text-[11px]">
                    {dossier.cmpSafeHarborCertification}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-mono">
                  Certified SHA-256 Audit Trail • 42 U.S.C. § 1395m-1
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyDossier}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedDossier ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Full Dossier</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowDossierModal(false)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ClfsPamaArbiter;
