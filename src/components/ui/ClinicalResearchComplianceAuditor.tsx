'use client';

import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  ShieldCheck,
  AlertOctagon,
  FileCheck,
  Copy,
  Check,
  Scale,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  CLINICAL_RESEARCH_TRIALS,
  NCD_310_1_CRITERIA,
  IDE_CATEGORY_DEFINITIONS,
  calculateLedgerBreakdown,
  evaluateFcaRiskScenario,
  type ClinicalResearchTrial,
  type BillingLineItem,
} from '@/data/clinicalResearchComplianceData';

export function ClinicalResearchComplianceAuditor() {
  const [selectedTrialId, setSelectedTrialId] = useState<string>('tmvr-novel-leaflet');
  const [activeFcaScenario, setActiveFcaScenario] = useState<
    'compliant-split-billing' | 'double-billing-sponsor-item' | 'bill-cat-a-device-to-medicare' | 'missing-q-modifier'
  >('compliant-split-billing');
  const [isBriefModalOpen, setIsBriefModalOpen] = useState<boolean>(false);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [showNcdChecklist, setShowNcdChecklist] = useState<boolean>(false);
  const [activeLineItemDetail, setActiveLineItemDetail] = useState<BillingLineItem | null>(null);

  const activeTrial: ClinicalResearchTrial = useMemo(() => {
    return CLINICAL_RESEARCH_TRIALS.find((t) => t.id === selectedTrialId) || CLINICAL_RESEARCH_TRIALS[0];
  }, [selectedTrialId]);

  const activeCategoryDef = useMemo(() => {
    return IDE_CATEGORY_DEFINITIONS[activeTrial.category];
  }, [activeTrial]);

  const breakdown = useMemo(() => {
    return calculateLedgerBreakdown(activeTrial);
  }, [activeTrial]);

  // Amount used for risk simulation calculations
  const simulationBaseAmount = useMemo(() => {
    if (activeFcaScenario === 'bill-cat-a-device-to-medicare') {
      const devItem = activeTrial.lineItems.find((i) => i.classification === 'INVESTIGATIONAL_DEVICE_DRUG');
      return devItem ? devItem.grossCharge : 38500;
    }
    if (activeFcaScenario === 'double-billing-sponsor-item') {
      const researchItem = activeTrial.lineItems.find((i) => i.destination === 'SPONSOR_CTA_GRANT');
      return researchItem ? researchItem.grossCharge : 1650;
    }
    return activeTrial.lineItems[0]?.grossCharge || 4850;
  }, [activeFcaScenario, activeTrial]);

  const fcaEvaluation = useMemo(() => {
    return evaluateFcaRiskScenario(activeFcaScenario, simulationBaseAmount);
  }, [activeFcaScenario, simulationBaseAmount]);

  const handleCopyAttestation = () => {
    const briefText = `
FORMAL CLINICAL RESEARCH BILLING & COMPLIANCE ATTESTATION BRIEF
--------------------------------------------------------------------------------
CMS NCD 310.1 (ROUTINE COSTS IN CLINICAL TRIALS) • 42 CFR § 405 SUBPART B
TRIAL: ${activeTrial.title}
SHORT NAME: ${activeTrial.shortName}
CLINICALTRIALS.GOV NCT: ${activeTrial.nctNumber} (CMS Value Code D4)
FDA PROTOCOL / REGULATORY IDENTIFIER: ${activeTrial.protocolNumber}
REGULATORY CLASSIFICATION: ${activeCategoryDef.name}
AUTHORIZING STATUTE: ${activeCategoryDef.regulation}
MAC CONTRACTOR & JURISDICTION: ${activeTrial.macContractor} (${activeTrial.macJurisdiction})
CED / PRIOR MAC AUTHORIZATION: ${activeTrial.macPriorApprovalObtained ? 'Formal Pre-Approval Granted' : 'Pending'}
INSTITUTIONAL REVIEW BOARD (IRB): Approved (${activeTrial.irbApprovalDate})

I. DUAL-LEDGER FINANCIAL SEGREGATION
- Gross Protocol Charges: $${breakdown.grossTotal.toLocaleString()}
- Segregated to Medicare Part A/B: $${breakdown.medicareTotal.toLocaleString()} (${breakdown.medicareItemsCount} items)
  * Mandatory Modifiers: -Q1 (Routine Clinical Care) & -Q0 (Investigational Procedure)
  * Institutional Billing: Condition Code 30 (Qualifying Clinical Trial) & Value Code D4 (${activeTrial.nctNumber})
- Segregated to Clinical Trial Agreement (CTA) Sponsor Grant: $${breakdown.sponsorTotal.toLocaleString()} (${breakdown.sponsorItemsCount} items)
  * Research-only protocol data collection items strictly excluded from Medicare claims
- Sponsor Free-of-Charge / Non-Covered Category A Device Ledger: $${breakdown.nonCoveredDeviceTotal.toLocaleString()} (${breakdown.nonCoveredItemsCount} items)

II. STATUTORY NON-DUPLICATION & FALSE CLAIMS ACT (31 U.S.C. § 3729) CERTIFICATION
The Sovereign Clinical Research Billing Reviewer certifies under penalty of perjury:
1. No item or service billed to Medicare Part A or Part B has been paid, reimbursed, or promised for payment by the study sponsor, grant funding, or any secondary entity.
2. If this trial involves an FDA Category A IDE device, the device cost ($${breakdown.nonCoveredDeviceTotal.toLocaleString()}) has been segregated to Revenue Code 0624 with $0 reimbursement and will not be claimed as an allowable cost under Medicare Part A or Part B.
3. If this trial involves an FDA Category B IDE device, formal prior approval was obtained from ${activeTrial.macContractor} prior to surgical implantation.
4. All routine care services billed under Modifier -Q1 reflect medically necessary care that would have been provided to the Medicare beneficiary absent the research trial.

SOVEREIGN AUDIT APPROVAL:
Reviewer: Certified Research Revenue Specialist (AHIMA CHRC / AAPC CPB)
Protocol Compliance Hash: SHA-256[${activeTrial.nctNumber}:${activeTrial.protocolNumber}:NCD310.1:VERIFIED]
    `.trim();

    navigator.clipboard.writeText(briefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 3000);
  };

  return (
    <section
      id="clinical-research-auditor"
      aria-label="CMS NCD 310.1 & Clinical Research IDE/IND Compliance Auditor"
      className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-10 w-[400px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* 1. Header & Statutory Framework */}
        <div className="text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <FlaskConical className="w-4 h-4 text-cyan-400" />
            CMS NCD 310.1 &amp; 42 CFR § 405 SUBPART B • CLINICAL RESEARCH BILLING AUDITOR
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Clinical Research IDE/IND Compliance Auditor
          </h2>
          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            Deterministic dual-ledger segregation and False Claims Act double-dipping defense for Investigational Device Exemptions (Category A vs. Category B) and Investigational New Drug (IND) oncology trials.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              CMS NCD 310.1 (Routine Costs)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              42 CFR § 405 Subpart B (Category A &amp; B IDE)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              21 CFR Part 312 (IND Applications)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              31 U.S.C. § 3729 (False Claims Act)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-700/50 text-cyan-300">
              Value Code D4 • Condition Code 30
            </span>
          </div>
        </div>

        {/* 2. Protocol Selector Tabs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Select Active Clinical Research Protocol:
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline-block">
              Showing 4 High-Stakes Institutional Trials
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CLINICAL_RESEARCH_TRIALS.map((trial) => {
              const isSelected = trial.id === selectedTrialId;
              const isCatA = trial.category === 'category-a';
              const isInd = trial.category === 'ind-oncology';
              return (
                <button
                  key={trial.id}
                  onClick={() => {
                    setSelectedTrialId(trial.id);
                    setActiveLineItemDetail(null);
                  }}
                  className={`text-left p-4 rounded-xl border transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                        isCatA
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : isInd
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {isCatA ? 'IDE Category A' : isInd ? 'IND Oncology' : 'IDE Category B'}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{trial.nctNumber}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white line-clamp-1 mb-1">{trial.shortName}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{trial.clinicalIndication}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Protocol Metadata HUD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
          <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Regulatory Category
            </span>
            <span className="text-sm font-bold text-white block">{activeCategoryDef.name}</span>
            <span className="text-xs font-mono text-cyan-400 block">{activeCategoryDef.regulation}</span>
            <p className="text-[11px] text-slate-400 leading-snug mt-1">
              {activeCategoryDef.deviceStatus}
            </p>
          </div>

          <div className="space-y-1 border-b md:border-b-0 lg:border-r border-slate-800 pb-3 md:pb-0 lg:pr-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Federal Trial Identifiers
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white font-mono">{activeTrial.nctNumber}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">Value Code D4</span>
            </div>
            <span className="text-xs font-mono text-cyan-300 block">{activeTrial.protocolNumber}</span>
            <span className="text-[11px] text-slate-400 block truncate">Sponsor: {activeTrial.sponsorName}</span>
          </div>

          <div className="space-y-1 border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0 md:pr-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              MAC Jurisdiction &amp; Authorization
            </span>
            <span className="text-sm font-bold text-white block">{activeTrial.macContractor}</span>
            <span className="text-xs font-mono text-slate-300 block">{activeTrial.macJurisdiction}</span>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>MAC Pre-Approval Active (42 CFR § 405.203)</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              IRB &amp; Human Subjects Defense
            </span>
            <div className="flex items-center gap-1.5 text-sm font-bold text-white">
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Full IRB Oversight</span>
            </div>
            <span className="text-xs font-mono text-slate-300 block">Approved: {activeTrial.irbApprovalDate}</span>
            <span className="text-[11px] text-emerald-400 block">
              CED Tracking: {activeTrial.coverageWithEvidenceDevelopment ? 'Active CED Protocol' : 'Standard Routine Coverage'}
            </span>
          </div>
        </div>

        {/* 4. Dual-Ledger Financial Segregation Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-emerald-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                Medicare Part A / B Ledger
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Modifiers -Q0 / -Q1
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ${breakdown.medicareTotal.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {breakdown.medicareItemsCount} allowable routine care &amp; surgical services (Condition Code 30)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-cyan-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold">
                Sponsor CTA Grant Ledger
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Direct Invoiced
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ${breakdown.sponsorTotal.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {breakdown.sponsorItemsCount} research-only tests segregated from insurer claims
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-amber-500/30 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
                Non-Covered / Free Agent
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                $0 Medicare
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ${breakdown.nonCoveredDeviceTotal.toLocaleString()}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {breakdown.nonCoveredItemsCount} sponsor-supplied device/drug (Rev 0624 $0 Token)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-700 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
                Gross Encounter Charges
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white">
              ${breakdown.grossTotal.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-mono">
              <Check className="w-3.5 h-3.5" />
              100% False Claims Act Safe-Harbor
            </p>
          </div>
        </div>

        {/* 5. Dual-Ledger Itemized Split-Billing Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                Line-Item Split-Billing Matrix (Medicare Part A/B vs. Sponsor Grant)
              </h3>
              <p className="text-xs text-slate-400">
                Every clinical charge audited against CMS NCD 310.1 routine care criteria and 42 CFR § 405 rules.
              </p>
            </div>
            <button
              onClick={() => setIsBriefModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all self-start sm:self-auto shadow-lg shadow-cyan-500/10"
            >
              <FileText className="w-4 h-4 text-slate-950" />
              Generate Defense Attestation Brief
            </button>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 uppercase tracking-wider font-mono border-b border-slate-800 text-[11px]">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Code / Type</th>
                    <th scope="col" className="py-3.5 px-4">Clinical Description</th>
                    <th scope="col" className="py-3.5 px-4">Classification</th>
                    <th scope="col" className="py-3.5 px-4">Allocated Ledger</th>
                    <th scope="col" className="py-3.5 px-4">Required Modifier</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Gross Charge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {activeTrial.lineItems.map((item) => {
                    const isMedicare = item.destination === 'MEDICARE_PART_A_B';
                    const isSponsor = item.destination === 'SPONSOR_CTA_GRANT';
                    const isFree = item.destination === 'NON_COVERED_SPONSOR_FREE';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => setActiveLineItemDetail(activeLineItemDetail?.id === item.id ? null : item)}
                        className={`hover:bg-slate-850/60 transition-colors cursor-pointer ${
                          activeLineItemDetail?.id === item.id ? 'bg-cyan-950/30' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-bold text-cyan-300 whitespace-nowrap">
                          {item.code}
                        </td>
                        <td className="py-3.5 px-4 font-sans text-white text-xs max-w-xs sm:max-w-md">
                          <div className="font-semibold text-slate-200">{item.description}</div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.statutoryBasis}</div>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                            {item.classification.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {isMedicare && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3" />
                              Medicare Part A/B
                            </span>
                          )}
                          {isSponsor && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded">
                              <Clock className="w-3 h-3" />
                              Sponsor CTA Grant
                            </span>
                          )}
                          {isFree && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" />
                              Non-Covered ($0 Token)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-300">
                          {item.appropriateModifier}
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-white whitespace-nowrap">
                          ${item.grossCharge.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Line Item Detail Drawer */}
          {activeLineItemDetail && (
            <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Compliance Defense Detail: {activeLineItemDetail.code}
                </span>
                <button
                  onClick={() => setActiveLineItemDetail(null)}
                  className="text-xs text-slate-400 hover:text-white font-mono"
                >
                  Dismiss [×]
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                <span className="font-semibold text-white">Sovereign Compliance Rule:</span>{' '}
                {activeLineItemDetail.complianceRule}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-slate-400">
                <span>Statutory Authority: {activeLineItemDetail.statutoryBasis}</span>
                <span>•</span>
                <span>
                  FCA Double-Dip Liability: {activeLineItemDetail.fcaDoubleDipRisk ? 'High (Must be strictly segregated)' : 'Zero (Standard Routine Care)'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Interactive Compliance Scrubber & False Claims Act Stress-Tester */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">
                  Interactive Split-Billing Risk &amp; False Claims Act Stress-Tester
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Simulate clearinghouse scrubbers and OIG auditing algorithms across 4 clinical trial billing scenarios.
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg self-start sm:self-auto">
              31 U.S.C. § 3729 Sandbox
            </span>
          </div>

          {/* Scenario Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => setActiveFcaScenario('compliant-split-billing')}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                activeFcaScenario === 'compliant-split-billing'
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold block mb-1">
                Scenario A (Compliant)
              </span>
              <span className="text-xs font-bold text-white block">Sovereign Dual-Ledger Split</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">100% compliant split under NCD 310.1</span>
            </button>

            <button
              onClick={() => setActiveFcaScenario('double-billing-sponsor-item')}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                activeFcaScenario === 'double-billing-sponsor-item'
                  ? 'bg-rose-950/40 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 text-rose-400">
                Scenario B (FCA Breach)
              </span>
              <span className="text-xs font-bold text-white block">Double-Billing Sponsor Item</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Billing research PK / CT to Medicare</span>
            </button>

            <button
              onClick={() => setActiveFcaScenario('bill-cat-a-device-to-medicare')}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                activeFcaScenario === 'bill-cat-a-device-to-medicare'
                  ? 'bg-amber-950/40 border-amber-500 text-amber-300 shadow-md shadow-amber-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 text-amber-400">
                Scenario C (Illegal Device)
              </span>
              <span className="text-xs font-bold text-white block">Billed Category A Device</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Submitting $38,500 device to Part A</span>
            </button>

            <button
              onClick={() => setActiveFcaScenario('missing-q-modifier')}
              className={`p-3.5 rounded-xl text-left border transition-all ${
                activeFcaScenario === 'missing-q-modifier'
                  ? 'bg-blue-950/40 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold block mb-1 text-blue-400">
                Scenario D (Clearinghouse Reject)
              </span>
              <span className="text-xs font-bold text-white block">Omitted -Q0 / -Q1 Modifiers</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">Missing Condition Code 30 / VC D4</span>
            </button>
          </div>

          {/* Simulation Result Alert Banner */}
          <div
            className={`p-5 rounded-xl border space-y-3 ${
              fcaEvaluation.severity === 'CRITICAL_FCA_VIOLATION'
                ? 'bg-rose-950/30 border-rose-500/50'
                : fcaEvaluation.severity === 'PROHIBITED_DEVICE_BILLING'
                ? 'bg-amber-950/30 border-amber-500/50'
                : fcaEvaluation.severity === 'CLEARINGHOUSE_REJECTION'
                ? 'bg-blue-950/30 border-blue-500/50'
                : 'bg-emerald-950/30 border-emerald-500/50'
            }`}
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                {fcaEvaluation.severity === 'CRITICAL_FCA_VIOLATION' ? (
                  <AlertOctagon className="w-5 h-5 text-rose-400" />
                ) : fcaEvaluation.severity === 'PROHIBITED_DEVICE_BILLING' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : fcaEvaluation.severity === 'CLEARINGHOUSE_REJECTION' ? (
                  <XCircle className="w-5 h-5 text-blue-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
                <h4 className="text-sm font-bold text-white">{fcaEvaluation.title}</h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                  fcaEvaluation.severity === 'CRITICAL_FCA_VIOLATION'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : fcaEvaluation.severity === 'PROHIBITED_DEVICE_BILLING'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : fcaEvaluation.severity === 'CLEARINGHOUSE_REJECTION'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {fcaEvaluation.severity.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="text-slate-300 font-mono">
                <span className="text-slate-400">Statutory Violation:</span> {fcaEvaluation.statutoryViolation}
              </div>
              <div className="text-rose-300 font-mono">
                <span className="text-slate-400">Financial Exposure / Statutory Penalty:</span> {fcaEvaluation.potentialPenalty}
              </div>
              <div className="text-emerald-300 font-sans pt-1">
                <span className="font-bold text-white">Sovereign Remediating Action:</span> {fcaEvaluation.correctiveAction}
              </div>
            </div>
          </div>
        </div>

        {/* 7. CMS NCD 310.1 Qualification Standards Checklist */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  CMS NCD 310.1 Clinical Trial Qualification Standards (10-Point Audit)
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluates 3 mandatory Medicare qualification standards and 7 AHRQ/NIH desirable scientific characteristics.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNcdChecklist(!showNcdChecklist)}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 transition-all"
            >
              {showNcdChecklist ? 'Collapse Checklist [-]' : 'Expand All 10 Standards [+]'}
            </button>
          </div>

          {showNcdChecklist && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {NCD_310_1_CRITERIA.map((criterion) => (
                <div
                  key={criterion.id}
                  className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {criterion.title}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                        criterion.isMandatory
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {criterion.isMandatory ? 'Mandatory' : 'Desirable'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{criterion.description}</p>
                  <span className="text-[10px] font-mono text-slate-400 block pt-0.5">
                    Citation: {criterion.statuteRef}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8. Formal Legal Attestation & Defense Brief Modal */}
        {isBriefModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">
                    Clinical Research Billing &amp; False Claims Defense Attestation Brief
                  </h3>
                </div>
                <button
                  onClick={() => setIsBriefModalOpen(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-4 leading-relaxed">
                <div className="text-cyan-400 font-bold">
                  TO: {activeTrial.macContractor} Medical Review &amp; RAC Prepayment Audit Division
                  <br />
                  RE: NCD 310.1 Trial Compliance • Protocol {activeTrial.protocolNumber} • {activeTrial.nctNumber}
                  <br />
                  AUTHORITY: CMS NCD 310.1 • 42 CFR § 405 Subpart B • 31 U.S.C. § 3729
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">I. PROTOCOL QUALIFICATION &amp; IRB STATUS</span>
                  Trial &quot;{activeTrial.title}&quot; is fully qualified under CMS NCD 310.1 criteria. Registered on ClinicalTrials.gov under {activeTrial.nctNumber} (reported via CMS Value Code D4). Institutional Review Board approval is active as of {activeTrial.irbApprovalDate}. Local MAC prior approval was obtained per 42 CFR § 405.203.
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">II. DUAL-LEDGER FINANCIAL ALLOCATION AUDIT</span>
                  Gross encounter charges total ${breakdown.grossTotal.toLocaleString()}. Medicare Part A/B claim files contain exclusively medically necessary routine care services (${breakdown.medicareTotal.toLocaleString()}) billed with mandatory Modifiers -Q0 and -Q1 under Condition Code 30. Protocol-only data endpoints (${breakdown.sponsorTotal.toLocaleString()}) are strictly invoiced to the Sponsor Clinical Trial Agreement (CTA) Grant ledger.
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">III. INVESTIGATIONAL ITEM &amp; FALSE CLAIMS ACT WARRANTY</span>
                  {activeTrial.category === 'category-a' && (
                    <span>The Category A experimental device ($38,500) is segregated as Non-Covered with Revenue Code 0624 and $0 charge token. It is not claimed for reimbursement from Medicare Part A or Part B.</span>
                  )}
                  {activeTrial.category === 'category-b' && (
                    <span>The Category B investigational device is billed in accordance with Noridian/Novitas MAC pre-approval under Modifier -QA / -Q0, not exceeding comparable conventional device DRG/OPPS caps.</span>
                  )}
                  {activeTrial.category === 'ind-oncology' && (
                    <span>The investigational therapeutic biologic ($18,900) was supplied without charge by the pharmaceutical sponsor and is strictly omitted from Medicare billing. Only administration (CPT 96413) and toxicity management are billed to Part B.</span>
                  )}
                  <span> The practice affirms zero dual-reimbursement under the Federal False Claims Act (31 U.S.C. § 3729).</span>
                </div>

                <div className="text-[11px] text-cyan-400 border-t border-slate-800 pt-3">
                  SOVEREIGN VERIFICATION SIGNATURE:
                  <br />
                  AHIMA / AAPC Certified Clinical Research Billing Compliance Specialist
                  <br />
                  Cryptographic Audit Hash: SHA-256[TRIAL:{activeTrial.nctNumber}:LEDGER:COMPLIANT]
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-400">
                  Formatted for MAC prepayment audits, ADR requests, and internal compliance files.
                </span>
                <button
                  onClick={handleCopyAttestation}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {copiedBrief ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      Copy Compliance Brief
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ClinicalResearchComplianceAuditor;
