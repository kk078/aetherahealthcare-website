'use client';

import React, { useState, useMemo } from 'react';
import {
  Pill,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Coins,
  Scale,
  ShieldCheck,
  Check,
  Copy,
  Sliders,
  Award,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  COVERED_ENTITY_ARCHETYPES,
  SAMPLE_SPLIT_BILLING_ENCOUNTERS,
  adjudicate340bEncounter,
  calculateAnnual340bExposure,
  generate340bAuditDossier,
  type CoveredEntityProfile,
} from '@/data/drug340bData';

export function Drug340bAuditor() {
  const [selectedEntityId, setSelectedEntityId] = useState<string>('dsh-metro-health');
  const [activeTab, setActiveTab] = useState<'accumulator' | 'medicaid' | 'orphan-gpo' | 'charity'>('accumulator');

  // Interactive Parameter Overrides
  const [customUnits, setCustomUnits] = useState<number>(14500);
  const [customDiscount, setCustomDiscount] = useState<number>(38.5);
  const [customErrorRate, setCustomErrorRate] = useState<number>(2.5);
  const [customDshPercent, setCustomDshPercent] = useState<number>(28.45);

  // Modal State
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  const activeEntity: CoveredEntityProfile = useMemo(() => {
    return COVERED_ENTITY_ARCHETYPES.find((e) => e.id === selectedEntityId) || COVERED_ENTITY_ARCHETYPES[0];
  }, [selectedEntityId]);

  const handleEntityChange = (entityId: string) => {
    setSelectedEntityId(entityId);
    const target = COVERED_ENTITY_ARCHETYPES.find((e) => e.id === entityId);
    if (target) {
      setCustomUnits(target.monthlyOutpatientRxUnits);
      setCustomDiscount(target.average340bDiscountPercent);
      setCustomDshPercent(target.dshAdjustmentPercentage);
    }
  };

  // Virtual Split-Billing Adjudications for the 4 encounters
  const encounterResults = useMemo(() => {
    return SAMPLE_SPLIT_BILLING_ENCOUNTERS.map((enc) => {
      const result = adjudicate340bEncounter(activeEntity, enc);
      return {
        encounter: enc,
        result,
      };
    });
  }, [activeEntity]);

  // Annual Financial & Recoupment Calculations
  const annualExposure = useMemo(() => {
    return calculateAnnual340bExposure(activeEntity, {
      customRxUnits: customUnits,
      customDiscountPercent: customDiscount,
      customAuditErrorRatePercent: customErrorRate,
    });
  }, [activeEntity, customUnits, customDiscount, customErrorRate]);

  // DSH Compliance Check with custom DSH slider
  const isDshCompliant = useMemo(() => {
    if (activeEntity.statutoryDshRequirement === 0) return true;
    return customDshPercent >= activeEntity.statutoryDshRequirement;
  }, [activeEntity, customDshPercent]);

  // 1-Click Dossier
  const dossier = useMemo(() => {
    return generate340bAuditDossier(activeEntity, annualExposure);
  }, [activeEntity, annualExposure]);

  const handleCopyDossier = () => {
    const text = `${dossier.legalHeader}\n` +
      `Audit Hash: ${dossier.auditHash}\n` +
      `Timestamp: ${dossier.timestamp}\n\n` +
      `COVERED ENTITY STATUTORY VERIFICATION:\n` +
      Object.entries(dossier.coveredEntityVerification).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nSPLIT-BILLING POLICY & AUDIT COMPLIANCE:\n` +
      Object.entries(dossier.splitBillingPolicyCompliance).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\n${dossier.statutorySafeHarborBrief}`;

    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="drug-340b-auditor"
      aria-label="340B Drug Pricing Covered Entity Eligibility & Split-Billing Compliance Auditor"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Glows */}
      <div className="absolute top-0 right-1/3 w-[600px] h-[350px] bg-emerald-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] bg-teal-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Pill className="h-4 w-4 text-emerald-400" />
            42 U.S.C. § 256b • HRSA OPAIS Compliance Engine
          </div>
          <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            340B Covered Entity Eligibility &amp; Split-Billing Compliance Auditor
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Deterministic auditing for Disproportionate Share Hospital (DSH) thresholds (&gt;11.75%), GPO prohibition
            enforcement, Orphan Drug statutory carve-outs, Medicaid duplicate discount prevention (Modifier -U6 / MEF),
            and HRSA audit defense.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-300">
              PHSA Section 340B (42 U.S.C. § 256b)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-teal-300">
              HRSA 3-Part Patient Definition (61 Fed. Reg. 55156)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300">
              GPO Prohibition &amp; Orphan Drug Carve-Out
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-purple-300">
              Medicaid Exclusion File (MEF)
            </span>
          </div>
        </div>

        {/* Covered Entity Archetype Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Select Covered Entity Designation:
            </span>
            <span className="text-xs text-emerald-400 font-mono">
              OPAIS ID: {activeEntity.opaisId} | Provider #{activeEntity.medicareProviderNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {COVERED_ENTITY_ARCHETYPES.map((entity) => {
              const isSelected = entity.id === selectedEntityId;
              return (
                <button
                  key={entity.id}
                  onClick={() => handleEntityChange(entity.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 shadow-lg shadow-emerald-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {entity.entityType} Entity
                      </span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </div>
                    <div className="text-sm font-bold text-white">{entity.name}</div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{entity.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      {entity.statutoryDshRequirement > 0 ? `DSH: ${entity.dshAdjustmentPercentage.toFixed(1)}%` : 'Grantee/CAH'}
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {entity.medicaidPolicy.replace(/_/g, ' ')}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 High-Impact KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Annual 340B Savings */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-emerald-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Annual 340B Drug Savings</span>
              <Coins className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
              ${Math.round(annualExposure.annualGross340bSavings).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>WAC Spend: ${Math.round(annualExposure.annualGrossWacSpend / 1000000)}M</span>
              <span className="text-emerald-400 font-semibold">{customDiscount}% Discount</span>
            </div>
          </div>

          {/* Card 2: HRSA Audit Exposure */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-rose-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Audit Recoupment Exposure</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-300 font-mono">
              ${Math.round(annualExposure.annualRecoupmentExposure).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Error Rate: {customErrorRate}%</span>
              <span className="text-rose-400 font-semibold">Repayment Risk</span>
            </div>
          </div>

          {/* Card 3: Net Program Benefit */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-teal-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Net 340B Margin Captured</span>
              <Award className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">
              ${Math.round(annualExposure.net340bBenefitCaptured).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Net of Audit Reserve</span>
              <span className="text-teal-400 font-semibold">Audited Sovereign</span>
            </div>
          </div>

          {/* Card 4: Community Benefit Ratio */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-purple-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Charity Care Reinvestment</span>
              <Scale className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
              {(annualExposure.communityBenefitRatio * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Charity: ${Math.round(activeEntity.annualCharityCareProvided / 1000000)}M</span>
              <span className="text-purple-300 font-semibold">HRSA Mission Ratio</span>
            </div>
          </div>
        </div>

        {/* DSH Eligibility Alert Banner (if applicable) */}
        {activeEntity.statutoryDshRequirement > 0 && !isDshCompliant && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/60 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-rose-200">
                CRITICAL 340B ELIGIBILITY HAZARD: DSH Percentage Below Statutory Threshold
              </div>
              <p className="text-slate-300 leading-relaxed">
                The current DSH adjustment percentage ({customDshPercent.toFixed(2)}%) has fallen below the mandatory
                federal threshold of {activeEntity.statutoryDshRequirement}%. Under 42 U.S.C. § 256b(a)(4)(L), this entity
                faces immediate loss of 340B covered entity status on HRSA OPAIS, termination of all 340B purchasing accounts,
                and retroactive manufacturer clawbacks.
              </p>
            </div>
          </div>
        )}

        {/* Interactive Sensitivity Controls Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Interactive Split-Billing Parameters &amp; Sensitivity Modeler
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-time 42 U.S.C. § 256b Adjudication</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Slider 1: Monthly Outpatient Rx Units */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Monthly Outpatient Units:</span>
                <span className="font-mono font-bold text-emerald-300">{customUnits.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min={500}
                max={Math.max(25000, customUnits * 1.5)}
                step={500}
                value={customUnits}
                onChange={(e) => setCustomUnits(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>500</span>
                <span>Annual: {(customUnits * 12).toLocaleString()}</span>
              </div>
            </div>

            {/* Slider 2: Average 340B Discount Percent */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Avg 340B Discount Below WAC:</span>
                <span className="font-mono font-bold text-teal-300">{customDiscount}%</span>
              </div>
              <input
                type="range"
                min={20}
                max={60}
                step={1}
                value={customDiscount}
                onChange={(e) => setCustomDiscount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>20% (Minimum)</span>
                <span>60% (High-Rebate Biologics)</span>
              </div>
            </div>

            {/* Slider 3: Audit Error Rate */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">Split-Billing Audit Error Rate:</span>
                <span className="font-mono font-bold text-rose-300">{customErrorRate}%</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={10.0}
                step={0.5}
                value={customErrorRate}
                onChange={(e) => setCustomErrorRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0.5% (Aethera Clean)</span>
                <span>10.0% (Unscrubbed)</span>
              </div>
            </div>

            {/* Slider 4: DSH Adjustment Percentage Override */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-semibold">CMS-2552 Worksheet E DSH%:</span>
                <span className={`font-mono font-bold ${isDshCompliant ? 'text-purple-300' : 'text-rose-400'}`}>
                  {customDshPercent.toFixed(2)}%
                </span>
              </div>
              <input
                type="range"
                min={5.0}
                max={40.0}
                step={0.25}
                value={customDshPercent}
                onChange={(e) => setCustomDshPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Min: 5%</span>
                <span>Threshold: {activeEntity.statutoryDshRequirement}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('accumulator')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'accumulator'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Virtual Split-Billing Accumulator</span>
          </button>

          <button
            onClick={() => setActiveTab('medicaid')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'medicaid'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Medicaid Duplicate Discount &amp; MEF</span>
          </button>

          <button
            onClick={() => setActiveTab('orphan-gpo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orphan-gpo'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>GPO Prohibition &amp; Orphan Exclusion</span>
          </button>

          <button
            onClick={() => setActiveTab('charity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'charity'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Community Benefit &amp; HRSA OPAIS Record</span>
          </button>
        </div>

        {/* Tab 1: Virtual Split-Billing Accumulator */}
        {activeTab === 'accumulator' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Live Virtual Split-Billing Accumulation Stream</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Adjudicating dispensing encounters against the 3-part HRSA patient definition, provider credentials, and clinic site registration.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                Replenishment Accounts: 340B • WAC • GPO
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {encounterResults.map(({ encounter, result }) => {
                const is340b = result.allocation === '340B_ELIGIBLE';
                const isGpo = result.allocation === 'GPO_INPATIENT_ONLY';
                const isWac = result.allocation === 'WAC_NON_ELIGIBLE';
                const isDiversion = result.allocation === 'STATUTORY_VIOLATION_DIVERSION';

                return (
                  <div
                    key={encounter.encounterId}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      is340b
                        ? 'bg-emerald-950/20 border-emerald-500/40'
                        : isGpo
                        ? 'bg-blue-950/20 border-blue-500/40'
                        : isWac
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-rose-950/30 border-rose-500/50'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {is340b && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                        {isGpo && <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />}
                        {isWac && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
                        {isDiversion && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                        <span className="font-bold text-white text-sm">{encounter.drugName}</span>
                        <span className="text-xs font-mono text-slate-400">({encounter.hcpcs} • NDC: {encounter.ndc})</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {encounter.patientType.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          {encounter.payerType.replace(/_/g, ' ')}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded font-bold ${
                            is340b
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : isGpo
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : isWac
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {result.purchaseAccount} ACCOUNT ({result.allocation})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                      <div>
                        <span className="text-slate-400">Dispensed Units:</span>
                        <div className="font-bold text-white">{encounter.unitsDispensed} units</div>
                      </div>
                      <div>
                        <span className="text-slate-400">WAC Acquisition:</span>
                        <div className="text-slate-300">${(encounter.unitsDispensed * encounter.wacPricePerUnit).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-slate-400">Actual Cost:</span>
                        <div className={`font-bold ${is340b ? 'text-emerald-300' : 'text-slate-200'}`}>
                          ${Math.round(result.acquisitionCost).toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-400">Net 340B Savings:</span>
                        <div className={`font-bold ${result.savingsVsWac > 0 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {result.savingsVsWac > 0 ? `+$${Math.round(result.savingsVsWac).toLocaleString()}` : '$0.00'}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                      <span className="text-slate-400 font-mono text-[11px] shrink-0">Rationale:</span>
                      <span>{result.reason}</span>
                    </div>

                    {result.complianceWarning && (
                      <div className="p-2 rounded bg-slate-900/90 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{result.complianceWarning}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Medicaid Duplicate Discount & MEF */}
        {activeTab === 'medicaid' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-bold text-white">
                    Medicaid Duplicate Discount Prohibition (42 U.S.C. § 256b(a)(5)(A))
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Mandatory protocol preventing drug manufacturers from paying both a 340B discount and a statutory Medicaid rebate.
                </p>
              </div>

              <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                activeEntity.medicaidPolicy === 'CARVE_IN'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}>
                Current Policy: {activeEntity.medicaidPolicy}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Carve-In Protocol */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                activeEntity.medicaidPolicy === 'CARVE_IN'
                  ? 'bg-teal-950/20 border-teal-500/60'
                  : 'bg-slate-950 border-slate-800 opacity-70'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300">Protocol A: Medicaid Carve-In</span>
                  {activeEntity.medicaidPolicy === 'CARVE_IN' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-teal-500/30 text-teal-200 font-mono">ACTIVE</span>
                  )}
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>Entity purchases drugs on 340B account and bills Medicaid FFS / MCO.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>Must be listed on the public <strong>HRSA Medicaid Exclusion File (MEF)</strong> with provider NPI and Medicaid billing number.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>State Medicaid agencies query MEF to exclude these claims from manufacturer rebate invoices.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                    <span>Claim lines must append <strong>Modifier -U6</strong> (or state-mandated 340B modifier).</span>
                  </li>
                </ul>
              </div>

              {/* Carve-Out Protocol */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                activeEntity.medicaidPolicy === 'CARVE_OUT'
                  ? 'bg-amber-950/20 border-amber-500/60'
                  : 'bg-slate-950 border-slate-800 opacity-70'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Protocol B: Medicaid Carve-Out</span>
                  {activeEntity.medicaidPolicy === 'CARVE_OUT' && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 font-mono">ACTIVE</span>
                  )}
                </div>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Entity dispenses non-340B drugs (purchased via WAC/GPO) to all Medicaid patients.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Entity is listed as Carve-Out on HRSA OPAIS; zero 340B Medicaid claims filed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>State Medicaid agency collects 100% of standard manufacturer statutory rebates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>Eliminates audit exposure from state Medicaid MCO cross-over billing errors.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-white">HRSA OPAIS Medicaid Exclusion File Verification:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">MEF Status:</span>{' '}
                  <span className={activeEntity.mefRegistrationActive ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {activeEntity.mefRegistrationActive ? 'ACTIVE_REGISTERED' : 'NOT_REGISTERED'}
                  </span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Billing NPI:</span>{' '}
                  <span className="text-white">1497820144</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">State Code:</span>{' '}
                  <span className="text-teal-300">NY-MEDICAID-DOH</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: GPO Prohibition & Orphan Drug Exclusion */}
        {activeTab === 'orphan-gpo' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <h3 className="text-base font-bold text-white">
                    GPO Prohibition &amp; Orphan Drug Exclusion Defense Matrix
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Statutory restrictions governing outpatient drug replenishment and rare-disease biologic acquisitions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GPO Prohibition Panel */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-300">Group Purchasing Organization (GPO) Prohibition</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    activeEntity.gpoProhibitionApplies
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {activeEntity.gpoProhibitionApplies ? 'MANDATORY ENFORCEMENT' : 'EXEMPT'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under 42 U.S.C. § 256b(a)(4)(L)(iii), Disproportionate Share Hospitals (DSH), Children&apos;s Hospitals,
                  and Free-Standing Cancer Hospitals are legally <strong>prohibited</strong> from purchasing covered outpatient
                  drugs through a GPO.
                </p>
                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div className="text-amber-400 font-bold">The GPO Violation Trap:</div>
                  <div className="text-slate-400">
                    If an outpatient clinic drug is replenished on a GPO account (even by accident), HRSA can terminate
                    the hospital&apos;s 340B eligibility entirely, triggering retroactive repayment of all 340B discounts
                    to every drug manufacturer.
                  </div>
                </div>
              </div>

              {/* Orphan Drug Exclusion Panel */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-300">Statutory Orphan Drug Exclusion (ACA § 7101)</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    activeEntity.orphanDrugExclusionApplies
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {activeEntity.orphanDrugExclusionApplies ? 'ACTIVE EXCLUSION' : 'NOT APPLICABLE (DSH/FQHC)'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Under 42 U.S.C. § 256b(a)(3), Critical Access Hospitals (CAH), Sole Community Hospitals (SCH), Rural
                  Referral Centers (RRC), and Cancer Hospitals cannot purchase drugs designated by the FDA under Section 526
                  of the FFDCA for rare diseases on 340B pricing.
                </p>
                <div className="p-3 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                  <div className="text-purple-400 font-bold">The Indication Trap:</div>
                  <div className="text-slate-400">
                    Even if an orphan drug (e.g., Darzalex, Keytruda) is prescribed for a common, non-orphan indication,
                    SCH/CAH entities must carve it out to the non-340B WAC account. Dispensing on 340B creates direct HRSA
                    audit clawback liability.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Community Benefit & HRSA Record */}
        {activeTab === 'charity' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">
                    HRSA Legislative Intent: 340B Savings Reinvestment in Community Benefit
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Demonstrating that 340B margins stretch scarce federal resources to expand healthcare services to low-income populations.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Total Annual Charity Care:</span>
                <div className="text-2xl font-bold font-mono text-purple-300">
                  ${Math.round(activeEntity.annualCharityCareProvided).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Net 340B Benefit</span>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  ${Math.round(annualExposure.net340bBenefitCaptured).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-300">
                  Drug manufacturer statutory pricing margin captured through sovereign split-billing.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Uncompensated Care</span>
                <div className="text-xl font-bold text-white font-mono">
                  ${Math.round(activeEntity.annualCharityCareProvided).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-300">
                  Documented on CMS Form 2552-10 Worksheet S-10 (Uncompensated Care Data).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Reinvestment Multiplier</span>
                <div className="text-xl font-bold text-purple-400 font-mono">
                  {(annualExposure.communityBenefitRatio).toFixed(2)}x
                </div>
                <p className="text-[11px] text-slate-300">
                  For every $1.00 of 340B margin, entity delivers ${(annualExposure.communityBenefitRatio).toFixed(2)} in safety-net care.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-white">HRSA OPAIS Public Database Registration Record:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 font-mono text-[11px]">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">OPAIS ID:</span> <span className="text-emerald-300 font-bold">{activeEntity.opaisId}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Entity:</span> <span className="text-white">{activeEntity.entityType}</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Participating Sites:</span> <span className="text-teal-300">14 Child Sites</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <span className="text-slate-400">Recertification:</span> <span className="text-emerald-400">COMPLETED (FY2026)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Callout Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-emerald-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>HRSA OPAIS 340B Audit Defense Dossier &amp; Cryptographic Proof Ready</span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Generate an auditable compliance brief certifying DSH percentage calculation, 3-part patient eligibility,
              GPO non-violation, and Medicaid MEF carve-in/carve-out verification with SHA-256 audit stamping.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDossierModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>Generate HRSA 340B Audit Dossier</span>
            </button>
          </div>
        </div>

        {/* 1-Click HRSA Audit Dossier Modal */}
        {isDossierModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="HRSA Office of Pharmacy Affairs 340B Audit Dossier"
          >
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                    <Pill className="w-3.5 h-3.5" />
                    <span>{dossier.auditHash}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">HRSA OPAIS 340B Audit &amp; Split-Billing Dossier</h3>
                </div>
                <button
                  onClick={() => setIsDossierModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xl font-bold p-2"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
                {/* Legal Header */}
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-emerald-300">
                  {dossier.legalHeader}
                </div>

                {/* Covered Entity Verification */}
                <div className="space-y-2">
                  <div className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
                    Statutory Covered Entity Verification (42 U.S.C. § 256b)
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    {Object.entries(dossier.coveredEntityVerification).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Split-Billing Policy Compliance */}
                <div className="space-y-2">
                  <div className="text-teal-400 font-bold uppercase tracking-wider text-xs">
                    Split-Billing Software &amp; Inventory Policy Controls
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    {Object.entries(dossier.splitBillingPolicyCompliance).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Brief */}
                <div className="space-y-2">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-xs">
                    False Claims Act &amp; Statutory Safe-Harbor Substantiation
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap text-slate-300 leading-relaxed">
                    {dossier.statutorySafeHarborBrief}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Certified SHA-256 Audit Trail • 42 U.S.C. § 256b
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyDossier}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedDossier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDossier ? 'Copied to Clipboard' : 'Copy Full Dossier'}</span>
                  </button>
                  <button
                    onClick={() => setIsDossierModalOpen(false)}
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
}

export default Drug340bAuditor;
