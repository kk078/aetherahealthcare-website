'use client';

import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Scale,
  ShieldCheck,
  ShieldAlert,
  DollarSign,
  FileText,
  Copy,
  Check,
  Sliders,
  RotateCcw,
  Activity,
  AlertTriangle,
  Clock,
  Sparkles,
  UserCheck
} from 'lucide-react';
import {
  HOSPICE_ARCHETYPES,
  HOSPICE_FY2026_BASE_RATES,
  HOSPICE_FY2026_AGGREGATE_CAP_AMOUNT,
  HOSPICE_LABOR_SHARES,
  evaluateFullHospiceSettlement,
  generateHospiceAuditDossier,
  type HospiceArchetypeProfile
} from '@/data/hospiceCapData';

export const HospiceCapArbiter: React.FC = () => {
  // Selected Archetype
  const [selectedArchetypeId, setSelectedArchetypeId] = useState<string>('bluegrass-community');
  const [activeTab, setActiveTab] = useState<'levels_of_care' | 'aggregate_cap' | 'inpatient_cap' | 'sia_engine'>('levels_of_care');

  // Active Archetype
  const activeArchetype: HospiceArchetypeProfile = useMemo(() => {
    return HOSPICE_ARCHETYPES.find(a => a.id === selectedArchetypeId) || HOSPICE_ARCHETYPES[0];
  }, [selectedArchetypeId]);

  // Interactive Sliders / State
  const [customBeneficiaries, setCustomBeneficiaries] = useState<number>(activeArchetype.netBeneficiaries);
  const [customGipDays, setCustomGipDays] = useState<number>(activeArchetype.annualCareDays.gipDays);
  const [customSiaHours, setCustomSiaHours] = useState<number>(
    Number((activeArchetype.siaMetrics.avgRnHrsPerDay + activeArchetype.siaMetrics.avgMswHrsPerDay).toFixed(1))
  );
  const [customWageIndex, setCustomWageIndex] = useState<number>(activeArchetype.wageIndex);

  // Modal State
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Switch Archetype Handler
  const handleArchetypeChange = (archetypeId: string) => {
    setSelectedArchetypeId(archetypeId);
    const target = HOSPICE_ARCHETYPES.find(a => a.id === archetypeId);
    if (target) {
      setCustomBeneficiaries(target.netBeneficiaries);
      setCustomGipDays(target.annualCareDays.gipDays);
      setCustomSiaHours(Number((target.siaMetrics.avgRnHrsPerDay + target.siaMetrics.avgMswHrsPerDay).toFixed(1)));
      setCustomWageIndex(target.wageIndex);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setCustomBeneficiaries(activeArchetype.netBeneficiaries);
    setCustomGipDays(activeArchetype.annualCareDays.gipDays);
    setCustomSiaHours(Number((activeArchetype.siaMetrics.avgRnHrsPerDay + activeArchetype.siaMetrics.avgMswHrsPerDay).toFixed(1)));
    setCustomWageIndex(activeArchetype.wageIndex);
  };

  // Calculation Report
  const settlementReport = useMemo(() => {
    return evaluateFullHospiceSettlement(activeArchetype, {
      netBeneficiaries: customBeneficiaries,
      gipDays: customGipDays,
      siaAvgHours: customSiaHours,
      wageIndex: customWageIndex
    });
  }, [activeArchetype, customBeneficiaries, customGipDays, customSiaHours, customWageIndex]);

  // Audit Dossier
  const auditDossier = useMemo(() => {
    return generateHospiceAuditDossier(settlementReport);
  }, [settlementReport]);

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(auditDossier.content);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="hospice-cap-arbiter"
      aria-label="Hospice Prospective Payment System (Hospice PPS) & Aggregate / Inpatient Cap Safeguard Arbiter"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] bg-rose-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-indigo-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold uppercase tracking-wider">
            <HeartPulse className="h-4 w-4 text-rose-400" />
            Social Security Act § 1814(i) & 42 CFR Part 418 Subpart G
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
            Hospice Prospective Payment System & Cap Safeguard
          </h2>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl mx-auto leading-relaxed">
            Autonomous multi-level Hospice PPS settlement engine enforcing the <span className="text-rose-400 font-semibold">42 CFR § 418.309 Aggregate Cap</span> ($34,465.34/beneficiary), the <span className="text-amber-400 font-semibold">42 CFR § 418.308 20% Inpatient Cap</span> ceiling, and <span className="text-emerald-400 font-semibold">42 CFR § 418.302(e)(3) Service Intensity Add-on (SIA)</span> protocolization against False Claims Act recoupment.
          </p>
        </div>

        {/* Archetype Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HOSPICE_ARCHETYPES.map((arch) => {
            const isSelected = arch.id === selectedArchetypeId;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => handleArchetypeChange(arch.id)}
                className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 border-rose-500 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/90'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      CCN {arch.ccn}
                    </span>
                    {arch.regulatoryRisk === 'CAP_SAFE' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Cap Safe
                      </span>
                    )}
                    {arch.regulatoryRisk === 'AGGREGATE_CAP_BREACH' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                        Cap Breach Risk
                      </span>
                    )}
                    {arch.regulatoryRisk === 'INPATIENT_20_BREACH' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        20% Inpatient Cap
                      </span>
                    )}
                    {arch.regulatoryRisk === 'HIGH_SIA_OPTIMIZED' && (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        High SIA Driver
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-white text-sm line-clamp-1">{arch.name}</h3>
                  <p className="text-slate-400 text-xs line-clamp-2">{arch.tagline}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>{arch.location}</span>
                  <span className="font-mono text-slate-300">ALOS: {arch.averageLengthOfStay}d</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Top-Level Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Gross Medicare Payments</span>
              <DollarSign className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">
              ${settlementReport.paymentBreakdown.grossMedicarePayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-slate-400">
              Across {settlementReport.inpatientCap.totalCareDays.toLocaleString()} patient care days
            </div>
          </div>

          <div className={`p-5 rounded-xl border space-y-1 ${
            settlementReport.aggregateCap.isBreached
              ? 'bg-red-950/30 border-red-500/40'
              : settlementReport.aggregateCap.riskStatus === 'MODERATE'
              ? 'bg-amber-950/30 border-amber-500/40'
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className={settlementReport.aggregateCap.isBreached ? 'text-red-300' : 'text-slate-400'}>
                {settlementReport.aggregateCap.isBreached ? 'Cap Overpayment Demand' : 'Aggregate Cap Buffer'}
              </span>
              {settlementReport.aggregateCap.isBreached ? (
                <ShieldAlert className="h-4 w-4 text-red-400" />
              ) : (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              )}
            </div>
            <div className={`text-2xl font-bold font-mono ${
              settlementReport.aggregateCap.isBreached ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {settlementReport.aggregateCap.isBreached
                ? `-$${settlementReport.aggregateCap.overpaymentLiability.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                : `+$${settlementReport.aggregateCap.safeBuffer.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
            </div>
            <div className="text-[11px] text-slate-400">
              Allowed: ${settlementReport.aggregateCap.totalCapAllowance.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({settlementReport.aggregateCap.netBeneficiaries} beneficiaries)
            </div>
          </div>

          <div className={`p-5 rounded-xl border space-y-1 ${
            settlementReport.inpatientCap.isBreached
              ? 'bg-amber-950/30 border-amber-500/40'
              : 'bg-slate-900/80 border-slate-800'
          }`}>
            <div className="flex items-center justify-between text-xs">
              <span className={settlementReport.inpatientCap.isBreached ? 'text-amber-300' : 'text-slate-400'}>
                20% Inpatient Cap Ratio
              </span>
              <Scale className={`h-4 w-4 ${settlementReport.inpatientCap.isBreached ? 'text-amber-400' : 'text-emerald-400'}`} />
            </div>
            <div className={`text-2xl font-bold font-mono ${
              settlementReport.inpatientCap.isBreached ? 'text-amber-400' : 'text-white'
            }`}>
              {(settlementReport.inpatientCap.inpatientRatio * 100).toFixed(2)}%
            </div>
            <div className="text-[11px] text-slate-400">
              {settlementReport.inpatientCap.isBreached
                ? `${settlementReport.inpatientCap.excessInpatientDays} excess days (Recoupment: $${settlementReport.inpatientCap.clawbackAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })})`
                : `Limit: ${settlementReport.inpatientCap.maxAllowedInpatientDays} days (Ceiling 20.00%)`}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Service Intensity Add-on (SIA)</span>
              <Sparkles className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-indigo-300">
              ${settlementReport.paymentBreakdown.siaPayment.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-[11px] text-slate-400">
              RN/MSW visits during last 7 days of life
            </div>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-rose-400" />
              <h3 className="font-semibold text-white text-base">Hospice Parameter Sensitivity Controls</h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Defaults
              </button>
              <button
                type="button"
                onClick={() => setShowDossierModal(true)}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-950/40 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                CMS-1984-14 Audit Dossier
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Beneficiaries Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Net Beneficiaries</span>
                <span className="font-mono text-rose-400 font-semibold">{customBeneficiaries}</span>
              </div>
              <input
                type="range"
                min={50}
                max={1000}
                step={10}
                value={customBeneficiaries}
                onChange={(e) => setCustomBeneficiaries(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>50</span>
                <span>500</span>
                <span>1000</span>
              </div>
            </div>

            {/* GIP Days Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">General Inpatient (GIP) Days</span>
                <span className="font-mono text-amber-400 font-semibold">{customGipDays}</span>
              </div>
              <input
                type="range"
                min={200}
                max={6000}
                step={100}
                value={customGipDays}
                onChange={(e) => setCustomGipDays(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>200d</span>
                <span>3000d</span>
                <span>6000d</span>
              </div>
            </div>

            {/* SIA Hours Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">SIA RN/MSW Hours/Day (Max 4.0h)</span>
                <span className="font-mono text-indigo-400 font-semibold">{customSiaHours.toFixed(1)}h</span>
              </div>
              <input
                type="range"
                min={0}
                max={4.0}
                step={0.1}
                value={customSiaHours}
                onChange={(e) => setCustomSiaHours(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.0h</span>
                <span>2.0h</span>
                <span>4.0h (Cap)</span>
              </div>
            </div>

            {/* CBSA Wage Index Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">CBSA Wage Index</span>
                <span className="font-mono text-emerald-400 font-semibold">{customWageIndex.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min={0.75}
                max={1.45}
                step={0.005}
                value={customWageIndex}
                onChange={(e) => setCustomWageIndex(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.7500</span>
                <span>1.0000</span>
                <span>1.4500</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-800 flex gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('levels_of_care')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'levels_of_care'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            4 Levels of Care & Rates
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('aggregate_cap')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'aggregate_cap'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Aggregate Cap Ledger (42 CFR § 418.309)
            {settlementReport.aggregateCap.isBreached && (
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('inpatient_cap')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'inpatient_cap'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            20% Inpatient Cap Safeguard (42 CFR § 418.308)
            {settlementReport.inpatientCap.isBreached && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sia_engine')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'sia_engine'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-slate-400 hover:text-slate-300'
            }`}
          >
            Service Intensity Add-on (SIA) Engine
          </button>
        </div>

        {/* Tab 1: 4 Levels of Care & Rate Architecture */}
        {activeTab === 'levels_of_care' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-400" />
                  Statutory Hospice Levels of Care Schedule (FY 2026 CMS-1807-F)
                </h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/60">
                  <table className="w-full text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-800/50 text-slate-400">
                        <th className="p-3">Level of Care</th>
                        <th className="p-3">Rev Code</th>
                        <th className="p-3">Base Rate</th>
                        <th className="p-3">Labor Share</th>
                        <th className="p-3">Wage-Adjusted</th>
                        <th className="p-3">Annual Days</th>
                        <th className="p-3 text-right">Payment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      <tr>
                        <td className="p-3 font-sans text-white font-medium">Routine Home Care (Days 1–60)</td>
                        <td className="p-3 text-slate-400">0651</td>
                        <td className="p-3 text-slate-300">${HOSPICE_FY2026_BASE_RATES.rhcTier1.toFixed(2)}</td>
                        <td className="p-3 text-slate-400">{(HOSPICE_LABOR_SHARES.rhc * 100).toFixed(1)}%</td>
                        <td className="p-3 text-emerald-400 font-semibold">${settlementReport.wageAdjustedRates.rhcTier1.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{settlementReport.profile.annualCareDays.rhcTier1Days.toLocaleString()}</td>
                        <td className="p-3 text-right text-white font-semibold">
                          ${settlementReport.paymentBreakdown.rhcTier1Payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans text-white font-medium">Routine Home Care (Days 61+)</td>
                        <td className="p-3 text-slate-400">0651</td>
                        <td className="p-3 text-slate-300">${HOSPICE_FY2026_BASE_RATES.rhcTier2.toFixed(2)}</td>
                        <td className="p-3 text-slate-400">{(HOSPICE_LABOR_SHARES.rhc * 100).toFixed(1)}%</td>
                        <td className="p-3 text-emerald-400 font-semibold">${settlementReport.wageAdjustedRates.rhcTier2.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{settlementReport.profile.annualCareDays.rhcTier2Days.toLocaleString()}</td>
                        <td className="p-3 text-right text-white font-semibold">
                          ${settlementReport.paymentBreakdown.rhcTier2Payment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans text-white font-medium">Continuous Home Care (24-hr)</td>
                        <td className="p-3 text-slate-400">0652</td>
                        <td className="p-3 text-slate-300">${HOSPICE_FY2026_BASE_RATES.chcDaily.toFixed(2)}</td>
                        <td className="p-3 text-slate-400">{(HOSPICE_LABOR_SHARES.chc * 100).toFixed(1)}%</td>
                        <td className="p-3 text-emerald-400 font-semibold">${settlementReport.wageAdjustedRates.chcDaily.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{settlementReport.profile.annualCareDays.chcDays.toLocaleString()}</td>
                        <td className="p-3 text-right text-white font-semibold">
                          ${settlementReport.paymentBreakdown.chcPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans text-white font-medium">Inpatient Respite Care (IRC)</td>
                        <td className="p-3 text-slate-400">0655</td>
                        <td className="p-3 text-slate-300">${HOSPICE_FY2026_BASE_RATES.irc.toFixed(2)}</td>
                        <td className="p-3 text-slate-400">{(HOSPICE_LABOR_SHARES.irc * 100).toFixed(1)}%</td>
                        <td className="p-3 text-emerald-400 font-semibold">${settlementReport.wageAdjustedRates.irc.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{settlementReport.profile.annualCareDays.ircDays.toLocaleString()}</td>
                        <td className="p-3 text-right text-white font-semibold">
                          ${settlementReport.paymentBreakdown.ircPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-sans text-white font-medium">General Inpatient Care (GIP)</td>
                        <td className="p-3 text-slate-400">0656</td>
                        <td className="p-3 text-slate-300">${HOSPICE_FY2026_BASE_RATES.gip.toFixed(2)}</td>
                        <td className="p-3 text-slate-400">{(HOSPICE_LABOR_SHARES.gip * 100).toFixed(1)}%</td>
                        <td className="p-3 text-emerald-400 font-semibold">${settlementReport.wageAdjustedRates.gip.toFixed(2)}</td>
                        <td className="p-3 text-slate-300">{customGipDays.toLocaleString()}</td>
                        <td className="p-3 text-right text-white font-semibold">
                          ${settlementReport.paymentBreakdown.gipPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  RHC 60-Day Two-Tier Payment Rules
                </h4>
                <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                  <p>
                    • <strong className="text-white">Days 1–60 (Tier 1)</strong>: Reimbursed at the higher base rate of <span className="font-mono text-emerald-400">${HOSPICE_FY2026_BASE_RATES.rhcTier1.toFixed(2)}</span> to offset intensive interdisciplinary intake, comprehensive clinical assessment, and care plan formulation.
                  </p>
                  <p>
                    • <strong className="text-white">Days 61+ (Tier 2)</strong>: Steps down to <span className="font-mono text-emerald-400">${HOSPICE_FY2026_BASE_RATES.rhcTier2.toFixed(2)}</span> per day as patient maintenance stabilizes.
                  </p>
                  <p>
                    • <strong className="text-white">60-Day Discharge Gap Reset</strong>: If a patient is discharged and re-admitted after <span className="font-semibold text-rose-300">&gt;60 consecutive calendar days</span> out of hospice, the Day 1–60 higher tier rate resets. Gaps &le;60 days continue the previous cumulative day counter.
                  </p>
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 font-mono text-[11px] text-slate-300">
                    <div>Wage Adjustment Formula:</div>
                    <div className="text-emerald-400 mt-1">
                      Rate = (Base × Labor% × WageIndex) + (Base × (1 - Labor%))
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Aggregate Cap Ledger */}
        {activeTab === 'aggregate_cap' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-semibold text-white flex items-center gap-2">
                    <Scale className="h-4 w-4 text-rose-400" />
                    Hospice Aggregate Cap Audit Ledger (42 CFR § 418.309 & Form CMS-1984-14 Worksheet E)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Statutory annual limit capping cumulative Medicare payments per net unduplicated beneficiary across the cap year.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">FY 2026 Cap Amount:</span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-emerald-400 font-semibold">
                    ${HOSPICE_FY2026_AGGREGATE_CAP_AMOUNT.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Progress Bar of Cap Utilization */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Cap Utilization Rate</span>
                  <span className={`font-mono font-semibold ${
                    settlementReport.aggregateCap.isBreached ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {(settlementReport.aggregateCap.capUtilizationRatio * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full transition-all duration-500 ${
                      settlementReport.aggregateCap.isBreached
                        ? 'bg-red-500'
                        : settlementReport.aggregateCap.capUtilizationRatio > 0.90
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, settlementReport.aggregateCap.capUtilizationRatio * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>$0</span>
                  <span>Cap Ceiling: ${settlementReport.aggregateCap.totalCapAllowance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-slate-400 font-sans">Net Unduplicated Beneficiaries</div>
                  <div className="text-lg font-bold text-white">{customBeneficiaries.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400 font-sans">Proportional Share Method</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-slate-400 font-sans">Statutory Cap Allowance</div>
                  <div className="text-lg font-bold text-emerald-400">
                    ${settlementReport.aggregateCap.totalCapAllowance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">{customBeneficiaries} × $34,465.34</div>
                </div>
                <div className={`p-4 rounded-xl border space-y-1 ${
                  settlementReport.aggregateCap.isBreached
                    ? 'bg-red-950/40 border-red-500/50 text-red-300'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                }`}>
                  <div className="font-sans text-slate-400">
                    {settlementReport.aggregateCap.isBreached ? 'Overpayment Clawback Liability' : 'Safe Headroom Buffer'}
                  </div>
                  <div className={`text-lg font-bold ${
                    settlementReport.aggregateCap.isBreached ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {settlementReport.aggregateCap.isBreached
                      ? `-$${settlementReport.aggregateCap.overpaymentLiability.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : `+$${settlementReport.aggregateCap.safeBuffer.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                  </div>
                  <div className="text-[10px] font-sans">
                    {settlementReport.aggregateCap.isBreached
                      ? 'Actionable MAC demand letter issued within 30 days'
                      : 'Compliant margin against repayment demands'}
                  </div>
                </div>
              </div>

              {settlementReport.aggregateCap.isBreached && (
                <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-red-200 space-y-1">
                    <strong className="text-red-300 font-semibold">Statutory Cap Overpayment Liability Triggered (42 CFR § 418.309):</strong>
                    <p>
                      Medicare payments exceed the statutory cap limitation by <span className="font-mono font-bold text-red-400">${settlementReport.aggregateCap.overpaymentLiability.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>. Under Medicare Claims Processing Manual Ch. 11, the MAC will demand full repayment or initiate 100% withholding on incoming claims. Long average length of stay (ALOS &gt; 180 days) is the primary driver of this liability.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: 20% Inpatient Cap Safeguard */}
        {activeTab === 'inpatient_cap' && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-base font-semibold text-white flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-amber-400" />
                    20% Inpatient Cap Safeguard (42 CFR § 418.308)
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    The total number of inpatient care days (GIP + Respite) cannot exceed 20% of total hospice care days provided across the entire cap year.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">Statutory Inpatient Ceiling:</span>
                  <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-amber-400 font-semibold">
                    20.00%
                  </span>
                </div>
              </div>

              {/* Inpatient Ratio Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Inpatient Day Percentage</span>
                  <span className={`font-mono font-semibold ${
                    settlementReport.inpatientCap.isBreached ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {(settlementReport.inpatientCap.inpatientRatio * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex relative">
                  {/* 20% marker line */}
                  <div className="absolute top-0 bottom-0 left-[20%] w-0.5 bg-rose-500 z-10" />
                  <div
                    className={`h-full transition-all duration-500 ${
                      settlementReport.inpatientCap.isBreached ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, settlementReport.inpatientCap.inpatientRatio * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>0.0%</span>
                  <span className="text-rose-400">20.00% Statutory Cap Threshold</span>
                  <span>100.0%</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-slate-400 font-sans">Total Care Days</div>
                  <div className="text-lg font-bold text-white">
                    {settlementReport.inpatientCap.totalCareDays.toLocaleString()}d
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">RHC + CHC + IRC + GIP</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-slate-400 font-sans">Inpatient Days Billed</div>
                  <div className={`text-lg font-bold ${
                    settlementReport.inpatientCap.isBreached ? 'text-amber-400' : 'text-white'
                  }`}>
                    {settlementReport.inpatientCap.inpatientDays.toLocaleString()}d
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">IRC ({settlementReport.profile.annualCareDays.ircDays}) + GIP ({customGipDays})</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                  <div className="text-slate-400 font-sans">Statutory Maximum Allowed</div>
                  <div className="text-lg font-bold text-emerald-400">
                    {settlementReport.inpatientCap.maxAllowedInpatientDays.toLocaleString()}d
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">20% × Total Days</div>
                </div>
                <div className={`p-4 rounded-xl border space-y-1 ${
                  settlementReport.inpatientCap.isBreached
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-300'
                    : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                }`}>
                  <div className="font-sans text-slate-400">Excess Day Recoupment</div>
                  <div className={`text-lg font-bold ${
                    settlementReport.inpatientCap.isBreached ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {settlementReport.inpatientCap.isBreached
                      ? `$${settlementReport.inpatientCap.clawbackAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                      : '$0.00'}
                  </div>
                  <div className="text-[10px] font-sans">
                    {settlementReport.inpatientCap.excessInpatientDays} excess days downgraded to RHC
                  </div>
                </div>
              </div>

              {settlementReport.inpatientCap.isBreached && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-200 space-y-1">
                    <strong className="text-amber-300 font-semibold">20% Inpatient Cap Recoupment Penalty (42 CFR § 418.308):</strong>
                    <p>
                      Because inpatient days comprise <span className="font-mono font-bold text-amber-300">{(settlementReport.inpatientCap.inpatientRatio * 100).toFixed(2)}%</span> of total hospice care days, the {settlementReport.inpatientCap.excessInpatientDays} days above the 20% limit are only payable at the lower Routine Home Care (RHC) rate ($<span className="font-mono">{settlementReport.inpatientCap.averageRhcPerDiem.toFixed(2)}</span>/day) rather than the inpatient per diem ($<span className="font-mono">{settlementReport.inpatientCap.averageInpatientPerDiem.toFixed(2)}</span>/day). The Medicare contractor will recoup <span className="font-mono font-bold text-amber-300">${settlementReport.inpatientCap.clawbackAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> on Form CMS-1984-14 Worksheet E.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Service Intensity Add-on (SIA) Engine */}
        {activeTab === 'sia_engine' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <h4 className="text-base font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Service Intensity Add-on (SIA) Mechanics (42 CFR § 418.302(e)(3))
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The Service Intensity Add-on compensates hospices for direct, in-person patient care provided by an <strong className="text-white">RN (Revenue Code 0551)</strong> or <strong className="text-white">Medical Social Worker (Revenue Code 0561)</strong> during the <strong className="text-rose-400">last 7 calendar days of life</strong> for patients receiving Routine Home Care (RHC) who are discharged deceased.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                    <div className="text-slate-400 font-sans">Hourly SIA Billing Rate</div>
                    <div className="text-lg font-bold text-indigo-300">
                      ${settlementReport.wageAdjustedRates.chcHourly.toFixed(2)}/hr
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">CHC Hourly Wage-Adjusted</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                    <div className="text-slate-400 font-sans">Daily Cap per Beneficiary</div>
                    <div className="text-lg font-bold text-indigo-300">
                      ${(settlementReport.wageAdjustedRates.chcHourly * 4.0).toFixed(2)}/day
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">Statutory 4.0 Hours Max</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1">
                    <div className="text-slate-400 font-sans">Total Annual SIA Revenue</div>
                    <div className="text-lg font-bold text-emerald-400">
                      ${settlementReport.paymentBreakdown.siaPayment.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">Across eligible decedents</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-2 text-xs">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-emerald-400" />
                    Statutory Billing & OIG Safe Harbor Prerequisites
                  </div>
                  <ul className="space-y-1 text-slate-300 list-disc list-inside">
                    <li>Must be delivered in person at the patient&apos;s home/residence (RHC setting).</li>
                    <li>Only RN or MSW care qualifies; LPN, aide, or chaplain hours are excluded by statute.</li>
                    <li>Calls, documentation, or travel time cannot be counted toward billable SIA hours.</li>
                    <li>Billed on UB-04 with line-item 15-minute increments (G0299 for RN, G0155 for MSW).</li>
                  </ul>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-rose-400" />
                  Facility SIA Cohort Metrics
                </h4>
                <div className="space-y-3 text-xs text-slate-300 font-mono">
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="font-sans text-slate-400">Decedents Receiving SIA</span>
                    <span className="text-white font-semibold">{settlementReport.profile.siaMetrics.decedentsReceivingSia}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="font-sans text-slate-400">Avg RN Hours / Day</span>
                    <span className="text-indigo-300 font-semibold">{settlementReport.profile.siaMetrics.avgRnHrsPerDay.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="font-sans text-slate-400">Avg MSW Hours / Day</span>
                    <span className="text-indigo-300 font-semibold">{settlementReport.profile.siaMetrics.avgMswHrsPerDay.toFixed(1)} hrs</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="font-sans text-slate-400">Avg Eligible Days</span>
                    <span className="text-white font-semibold">{settlementReport.profile.siaMetrics.avgSiaDays.toFixed(1)} / 7 days</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800">
                    <span className="font-sans text-slate-400">Max Potential SIA / Patient</span>
                    <span className="text-emerald-400 font-semibold">${(settlementReport.wageAdjustedRates.chcHourly * 28).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Form CMS-1984-14 & UB-04 Hospice Audit Dossier */}
        {showDossierModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Form CMS-1984-14 Hospice Cost Report Audit Dossier"
          >
            <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-rose-400" />
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      Form CMS-1984-14 Worksheet E & Cap Settlement Dossier
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      Dossier ID: {auditDossier.dossierId}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyDossier}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition-colors"
                  >
                    {copiedDossier ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copiedDossier ? 'Copied' : 'Copy Dossier'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDossierModal(false)}
                    className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed bg-slate-950 space-y-4 whitespace-pre-wrap selection:bg-rose-900 selection:text-white">
                {auditDossier.content}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950/60 text-[11px] text-slate-400">
                <span>Cryptographic Proof: {auditDossier.sha256Hash.substring(0, 24)}...</span>
                <span>Enforceable under False Claims Act (31 U.S.C. § 3729)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HospiceCapArbiter;
