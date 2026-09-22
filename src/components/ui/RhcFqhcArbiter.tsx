'use client';

import React, { useState, useMemo } from 'react';
import {
  Stethoscope,
  ShieldCheck,
  Scale,
  FileCheck,
  Sliders,
  DollarSign,
  TrendingDown,
  Building2,
  Copy,
  Check,
  TrendingUp,
  HeartPulse,
  Users,
  Activity,
} from 'lucide-react';
import {
  RURAL_CLINIC_ARCHETYPES,
  CAA_2026_STATUTORY_RHC_CAP,
  evaluateRhcFqhcReimbursement,
  generateRhcFqhcAuditDossier,
  type ClinicProfile,
} from '@/data/rhcFqhcData';

export const RhcFqhcArbiter: React.FC = () => {
  // Active State Selections
  const [selectedClinicId, setSelectedClinicId] = useState<string>('ozark-grandfathered-rhc');
  const [activeTab, setActiveTab] = useState<'air_cap' | 'productivity' | 'fqhc_pps' | 'care_mgmt'>('air_cap');

  // Interactive Sensitivity Modifiers
  const [customVisits, setCustomVisits] = useState<number>(14800);
  const [customCosts, setCustomCosts] = useState<number>(4413360);
  const [customCareMgmtPatients, setCustomCareMgmtPatients] = useState<number>(145);

  // Modal State
  const [showDossierModal, setShowDossierModal] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  // Active Clinic Profile
  const activeClinic: ClinicProfile = useMemo(() => {
    return RURAL_CLINIC_ARCHETYPES.find((c) => c.id === selectedClinicId) || RURAL_CLINIC_ARCHETYPES[0];
  }, [selectedClinicId]);

  // Handle clinic archetype switch and re-seed sliders
  const handleClinicChange = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    const target = RURAL_CLINIC_ARCHETYPES.find((c) => c.id === clinicId);
    if (target) {
      setCustomVisits(target.annualTotalVisits);
      setCustomCosts(target.annualAllowableCosts);
      setCustomCareMgmtPatients(target.careManagementEnrolledPatients);
    }
  };

  // Deterministic Reimbursement Calculation
  const calcResult = useMemo(() => {
    return evaluateRhcFqhcReimbursement(
      activeClinic,
      customVisits,
      customCosts,
      customCareMgmtPatients
    );
  }, [activeClinic, customVisits, customCosts, customCareMgmtPatients]);

  // Form CMS-222-17 / CMS-224-14 Audit Dossier
  const dossier = useMemo(() => {
    return generateRhcFqhcAuditDossier(activeClinic, calcResult);
  }, [activeClinic, calcResult]);

  const handleCopyDossier = () => {
    const text = `${dossier.legalHeader}\n` +
      `Audit Hash: ${dossier.auditHash}\n` +
      `Timestamp: ${dossier.timestamp}\n\n` +
      `FACILITY IDENTIFICATION & STATUTORY STATUS:\n` +
      Object.entries(dossier.facilityIdentification).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nPRODUCTIVITY COMPLIANCE AUDIT (42 CFR § 405.2468):\n` +
      Object.entries(dossier.productivityComplianceAudit).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nREIMBURSEMENT SETTLEMENT & REVENUE BREAKDOWN:\n` +
      Object.entries(dossier.reimbursementSettlement).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\n${dossier.statutorySafeHarborCertification}`;

    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="rhc-fqhc-arbiter"
      aria-label="Rural Health Clinic (RHC) All-Inclusive Rate (AIR) & FQHC PPS Cap Disparity Optimizer"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-amber-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-emerald-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold uppercase tracking-wider">
            <Stethoscope className="h-4 w-4 text-amber-400" />
            42 CFR Part 405 Subpart X • CAA § 130 • SSA § 1833(a)(3) &amp; § 1834(o)
          </div>
          <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            RHC All-Inclusive Rate (AIR) &amp; FQHC PPS Cap Disparity Optimizer
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Deterministic reimbursement modeling for Rural Health Clinic (RHC) cost-per-visit settlements,
            Consolidated Appropriations Act § 130 statutory payment limits ($165/visit), grandfathered provider-based rate preservation,
            FQHC PPS parity analysis, and 42 CFR § 405.2468 productivity penalty safeguards.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-amber-300">
              CAA 2026 Statutory RHC Cap: $165.00 / Visit
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-emerald-300">
              FQHC Base Rate: $195.99 (CY 2025/2026)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">
              New Patient / AWV Multiplier: 1.341x (+34.1%)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-purple-300">
              Productivity Standard: 4,200 MD / 2,100 NPP
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-teal-300">
              G0511 Care Mgmt: $77.94 / Mo Outside Cap
            </span>
          </div>
        </div>

        {/* Clinic Archetype Selector (4 Authentic Profiles) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Select Rural Clinic or Community Health Center Archetype:
            </span>
            <span className="text-xs text-amber-400 font-mono">
              CCN: {activeClinic.ccn} | NPI: {activeClinic.npi}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {RURAL_CLINIC_ARCHETYPES.map((clinic) => {
              const isSelected = clinic.id === selectedClinicId;
              return (
                <button
                  key={clinic.id}
                  onClick={() => handleClinicChange(clinic.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {clinic.clinicType.replace(/_/g, ' ')}
                      </span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />}
                    </div>
                    <div className="text-sm font-bold text-white">{clinic.name}</div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{clinic.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      {clinic.annualTotalVisits.toLocaleString()} Visits/Yr
                    </span>
                    <span className={`font-bold ${
                      clinic.isGrandfathered
                        ? 'text-emerald-400'
                        : clinic.clinicType === 'FQHC_COMMUNITY_HEALTH_CENTER'
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }`}>
                      {clinic.isGrandfathered ? 'Grandfathered' : clinic.clinicType === 'FQHC_COMMUNITY_HEALTH_CENTER' ? 'FQHC PPS' : '$165 Cap'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 High-Impact KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Settled Rate per Encounter */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-amber-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Settled Encounter Rate</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">
              ${calcResult.settledEncounterRate.toFixed(2)}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Unadjusted: ${calcResult.unadjustedCostPerVisit.toFixed(2)}</span>
              <span className={calcResult.effectiveCapApplied ? 'text-rose-400 font-semibold' : 'text-emerald-300 font-semibold'}>
                {calcResult.effectiveCapApplied ? 'Capped at $165' : 'Uncapped / Protected'}
              </span>
            </div>
          </div>

          {/* Card 2: Total Annual Medicare Program Revenue */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-emerald-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Annual Medicare Program</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">
              ${Math.round(calcResult.totalAnnualMedicareProgramRevenue).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{activeClinic.medicareVisitsAnnual.toLocaleString()} Visits + G0511</span>
              <span className="text-emerald-300 font-semibold">CMS Cost Settlement</span>
            </div>
          </div>

          {/* Card 3: Grandfathered Exemption / Disparity Advantage */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-cyan-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">
                {activeClinic.isGrandfathered ? 'Grandfathered Advantage' : 'Cap Haircut Loss'}
              </span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${
              activeClinic.isGrandfathered
                ? 'text-cyan-300'
                : calcResult.annualCapHaircutLoss > 0
                ? 'text-rose-400'
                : 'text-slate-300'
            }`}>
              {activeClinic.isGrandfathered
                ? `+$${Math.round(calcResult.grandfatheredExemptionValue).toLocaleString()}`
                : calcResult.annualCapHaircutLoss > 0
                ? `-$${Math.round(calcResult.annualCapHaircutLoss).toLocaleString()}`
                : '$0 Baseline'}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>CAA § 130 Differential</span>
              <span className="text-cyan-300 font-semibold">
                {activeClinic.isGrandfathered ? 'Protected Margin' : 'Statutory Deficit'}
              </span>
            </div>
          </div>

          {/* Card 4: Productivity Standard Compliance */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-purple-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Productivity Standard</span>
              <Activity className="w-4 h-4 text-purple-400" />
            </div>
            <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${
              calcResult.meetsProductivityStandard ? 'text-emerald-300' : 'text-amber-400'
            }`}>
              {calcResult.meetsProductivityStandard ? '100% Met' : `${Math.round((calcResult.actualVisitsFurnished / calcResult.minimumRequiredVisits) * 100)}% Standard`}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Req: {calcResult.minimumRequiredVisits.toLocaleString()} Visits</span>
              <span className={calcResult.meetsProductivityStandard ? 'text-emerald-300 font-semibold' : 'text-amber-400 font-semibold'}>
                {calcResult.meetsProductivityStandard ? 'No Imputation' : `-${calcResult.productivityDeficitVisits} Deficit`}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Sensitivity Controls Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                Interactive Clinic Operations &amp; Cost-Report Sensitivity Modeler
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Form CMS-222-17 / CMS-224-14 Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Control 1: Annual Total Encounters */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Annual Total Encounters:</span>
                <span className="font-mono text-amber-300 font-bold">
                  {customVisits.toLocaleString()} Visits
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={30000}
                step={200}
                value={customVisits}
                onChange={(e) => setCustomVisits(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Productivity Deficit (&lt;8k)</span>
                <span>High Volume (&gt;20k)</span>
              </div>
            </div>

            {/* Control 2: Annual Allowable Costs */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Allowable Clinic Costs:</span>
                <span className="font-mono text-emerald-300 font-bold">
                  ${(customCosts / 1000000).toFixed(2)}M
                </span>
              </div>
              <input
                type="range"
                min={1000000}
                max={6000000}
                step={50000}
                value={customCosts}
                onChange={(e) => setCustomCosts(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Lean ($1.0M)</span>
                <span>Multi-Specialty ($6.0M)</span>
              </div>
            </div>

            {/* Control 3: Care Management Beneficiaries */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">G0511 Care Mgmt Patients:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {customCareMgmtPatients} Patients (+${Math.round(calcResult.annualG0511CareManagementRevenue).toLocaleString()}/yr)
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={500}
                step={10}
                value={customCareMgmtPatients}
                onChange={(e) => setCustomCareMgmtPatients(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>0 Patients</span>
                <span>500 Patients (+$467k)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Navigation: 4 Analytical Perspectives */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('air_cap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'air_cap'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>RHC All-Inclusive Rate (AIR) &amp; CAA § 130 Cap Disparity</span>
          </button>

          <button
            onClick={() => setActiveTab('productivity')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'productivity'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>CMS-222-17 Productivity Standard Safeguard (4,200/2,100)</span>
          </button>

          <button
            onClick={() => setActiveTab('fqhc_pps')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'fqhc_pps'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>FQHC PPS &amp; Same-Day Mental Health Splitter</span>
          </button>

          <button
            onClick={() => setActiveTab('care_mgmt')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'care_mgmt'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>G0511 Care Management &amp; Non-Capped Revenue</span>
          </button>
        </div>

        {/* Tab 1: RHC All-Inclusive Rate (AIR) & CAA § 130 Cap Disparity */}
        {activeTab === 'air_cap' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Section 130 Payment Limit Analysis</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Consolidated Appropriations Act (CAA), 2021</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-300 text-xs font-mono font-bold">
                  CY 2026 Cap: ${CAA_2026_STATUTORY_RHC_CAP.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Actual Clinic Allowable Cost / Visit:</span>
                  <span className="font-mono font-bold text-slate-200">
                    ${calcResult.unadjustedCostPerVisit.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Effective Statutory Rate Ceiling:</span>
                  <span className="font-mono font-bold text-amber-300">
                    ${calcResult.statutoryCappedRate.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded-lg bg-amber-950/30 border border-amber-500/40">
                  <span className="text-amber-200 font-semibold">Final Settled Encounter Rate:</span>
                  <span className="font-mono font-extrabold text-amber-300 text-sm">
                    ${calcResult.settledEncounterRate.toFixed(2)} / Encounter
                  </span>
                </div>

                {calcResult.effectiveCapApplied ? (
                  <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 text-rose-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <TrendingDown className="w-4 h-4 text-rose-400" />
                      <span>Statutory Payment Cap Haircut Active</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Because this clinic is subject to the CAA statutory limit ($165.00), allowable costs of{' '}
                      <span className="text-white font-mono">${calcResult.unadjustedCostPerVisit.toFixed(2)}</span> are trimmed by{' '}
                      <span className="text-rose-400 font-mono font-bold">-${calcResult.capDisparityPerVisit.toFixed(2)}</span> per encounter, resulting in an annual revenue loss of{' '}
                      <span className="text-rose-400 font-mono font-bold">-${Math.round(calcResult.annualCapHaircutLoss).toLocaleString()}</span>.
                    </p>
                  </div>
                ) : activeClinic.isGrandfathered ? (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Grandfathered Provider-Based Exemption Preserved</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Enrolled prior to Dec 31, 2020 by a hospital with &lt;50 beds, this clinic receives its historical 2020 cost base indexed to the Medicare Economic Index (${calcResult.settledEncounterRate.toFixed(2)}/visit), generating an annual advantage of{' '}
                      <span className="text-emerald-300 font-mono font-bold">+${Math.round(calcResult.grandfatheredExemptionValue).toLocaleString()}</span> above the statutory cap.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs">
                    Allowable cost per visit is currently below the statutory limit. Full reasonable cost settlement achieved.
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Statutory CAA Cap Phase-In Trajectory */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Statutory RHC Payment Cap Trajectory</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Public Law 116-260 Phase-In Schedule</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { year: '2023', cap: 126.00, status: 'Historical' },
                  { year: '2024', cap: 139.00, status: 'Historical' },
                  { year: '2025', cap: 152.00, status: 'Historical' },
                  { year: '2026 (Current)', cap: 165.00, status: 'Active Law', active: true },
                  { year: '2027', cap: 178.00, status: 'Scheduled' },
                  { year: '2028', cap: 190.00, status: 'Statutory Target' },
                  { year: 'Post-2028', cap: 190.00, status: 'MEI Indexed', mei: true },
                ].map((tier, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2 rounded-lg border ${
                      tier.active
                        ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-semibold">{tier.year}</span>
                    <span className="font-mono font-bold text-white">${tier.cap.toFixed(2)} {tier.mei && '+ MEI'}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800">
                      {tier.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: CMS-222-17 Productivity Standard Safeguard */}
        {activeTab === 'productivity' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">42 CFR § 405.2468 Productivity Standards Compliance</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Form CMS-222-17 Worksheet B-1 Minimum Visit Thresholds</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                calcResult.meetsProductivityStandard
                  ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950 border border-amber-500/40 text-amber-300'
              }`}>
                {calcResult.meetsProductivityStandard ? 'PRODUCTIVITY STANDARD MET' : 'DEFICIT IMPUTATION PENALTY'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Physician Standard</span>
                <div className="text-xl font-bold text-purple-300 font-mono">
                  {activeClinic.physicianFte} FTE = {(activeClinic.physicianFte * 4200).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">4,200 visits / FTE per year</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">NPP Standard</span>
                <div className="text-xl font-bold text-cyan-300 font-mono">
                  {activeClinic.nonPhysicianFte} FTE = {(activeClinic.nonPhysicianFte * 2100).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">2,100 visits / FTE per year</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Actual vs Required</span>
                <div className={`text-xl font-bold font-mono ${
                  calcResult.meetsProductivityStandard ? 'text-emerald-300' : 'text-amber-400'
                }`}>
                  {calcResult.actualVisitsFurnished.toLocaleString()} / {calcResult.minimumRequiredVisits.toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">
                  {calcResult.meetsProductivityStandard ? 'Zero visit penalty' : `${calcResult.productivityDeficitVisits} visits imputed`}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <div className="font-bold text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-purple-400" />
                <span>Worksheet B-1 Cost Reduction Mechanism:</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                Under 42 CFR § 405.2468, Medicare computes allowable cost per visit by dividing total allowable costs by the GREATER of actual visits or minimum required visits. When actual visits fall below statutory standards, Medicare artificially inflates the divisor to the minimum standard, driving down the allowable cost per visit and reducing interim payment rates.
              </p>
              {!calcResult.meetsProductivityStandard && (
                <div className="pt-2 border-t border-slate-800 text-amber-300">
                  Impact: Unadjusted cost of ${calcResult.unadjustedCostPerVisit.toFixed(2)} is reduced to ${calcResult.productivityImputedCostPerVisit.toFixed(2)} (-${calcResult.productivityPenaltyPerVisit.toFixed(2)} penalty per visit).
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: FQHC PPS & Same-Day Mental Health Splitter */}
        {activeTab === 'fqhc_pps' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">FQHC Prospective Payment System (PPS) &amp; Dual Encounters</h3>
                  <p className="text-[11px] text-slate-400 font-mono">42 CFR § 405.2462, § 405.2467 &amp; § 405.2463</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                FQHC Base: ${calcResult.fqhcBaseRateAdjusted.toFixed(2)} (GPCI {activeClinic.gpci.toFixed(3)})
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white">FQHC PPS Composite Rate Calculation:</div>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">National FQHC Base Rate:</span>
                    <span className="text-white font-bold">$195.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Geographic Practice Cost Index (GPCI):</span>
                    <span className="text-cyan-300 font-bold">{activeClinic.gpci.toFixed(3)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">GPCI-Adjusted Base:</span>
                    <span className="text-white font-bold">${calcResult.fqhcBaseRateAdjusted.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">New Patient / AWV Factor (1.341x):</span>
                    <span className="text-emerald-300 font-bold">{activeClinic.newPatientAwvPercent}% of Visits</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-cyan-200 font-semibold">Blended FQHC PPS Rate:</span>
                    <span className="text-cyan-300 font-extrabold">${calcResult.fqhcCompositeRate.toFixed(2)} / Visit</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-3">
                <div className="font-bold text-cyan-300">Same-Day Mental Health Dual Encounter Rule:</div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Under 42 CFR § 405.2463, while Medicare generally pays only 1 encounter per beneficiary per day, an exception permits a separate mental health encounter on the same day as a medical visit when documented by a qualified clinical psychologist or clinical social worker.
                </p>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Annual Dual Encounters:</span>
                    <span className="text-white font-bold">{activeClinic.sameDayMentalHealthVisitsAnnual} Visits</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Incremental Medicare Revenue:</span>
                    <span className="text-emerald-400 font-bold">+${Math.round(calcResult.sameDayMentalHealthRevenue).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: G0511 Care Management & Non-Capped Revenue Engine */}
        {activeTab === 'care_mgmt' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">HCPCS Code G0511 General Care Management Revenue Engine</h3>
                  <p className="text-[11px] text-slate-400 font-mono">Reimbursable Outside RHC All-Inclusive Rate &amp; FQHC PPS Caps</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                $77.94 / Beneficiary / Month
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="font-bold text-white">Eligible Care Management Services Under G0511:</div>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Chronic Care Management (CCM):</strong> Minimum 20 minutes/month of non-face-to-face clinical staff care coordination for patients with &gt;=2 chronic conditions.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">General Behavioral Health Integration (BHI):</strong> Systematic behavioral health assessment and ongoing care plan management.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-white">Principal Care Management (PCM):</strong> Comprehensive management for 1 complex high-risk chronic illness.</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                <div className="font-bold text-emerald-300">Financial Impact on Rural Operating Margin:</div>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Enrolled Beneficiaries:</span>
                    <span className="text-white font-bold">{customCareMgmtPatients} Patients</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Program Revenue:</span>
                    <span className="text-white font-bold">${Math.round(customCareMgmtPatients * 77.94).toLocaleString()} / Mo</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-emerald-200 font-semibold">Annual Non-Capped Revenue:</span>
                    <span className="text-emerald-300 font-extrabold text-sm">
                      +${Math.round(calcResult.annualG0511CareManagementRevenue).toLocaleString()} / Year
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Note: Because G0511 is paid outside the AIR encounter cap and does not count toward clinic visit productivity denominators, 100% of revenue flows directly into clinic net operating margin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 1-Click Form CMS-222-17 & CMS-224-14 Audit Dossier Action */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/40 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <FileCheck className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white">
                CMS Form 222-17 &amp; Form 224-14 Audit Defense Ready
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Generate a formal Medicare cost report revenue settlement dossier, statutory cap substantiation,
              and productivity compliance certification secured with SHA-256 cryptographic proof.
            </p>
          </div>

          <button
            onClick={() => setShowDossierModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap flex items-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Generate RHC / FQHC Audit Dossier</span>
          </button>
        </div>

        {/* 1-Click RHC/FQHC Audit Dossier Modal */}
        {showDossierModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="CMS Form 222-17 & CMS-224-14 Audit Dossier"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {dossier.auditHash}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    CMS Form 222-17 &amp; Form 224-14 Cost Settlement Brief
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

                {/* Facility Identification */}
                <div className="space-y-2">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    Facility Identification &amp; Statutory Status
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
                    {Object.entries(dossier.facilityIdentification).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-white font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Productivity Compliance Audit */}
                <div className="space-y-2">
                  <div className="text-purple-400 font-bold uppercase tracking-wider text-[11px]">
                    Productivity Compliance Audit (42 CFR § 405.2468)
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
                    {Object.entries(dossier.productivityComplianceAudit).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-white font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Reimbursement Settlement */}
                <div className="space-y-2">
                  <div className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                    Reimbursement Settlement &amp; Program Revenue
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
                    {Object.entries(dossier.reimbursementSettlement).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="text-white font-bold">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Safe Harbor Certification */}
                <div className="space-y-2">
                  <div className="text-cyan-400 font-bold uppercase tracking-wider text-[11px]">
                    Statutory Safe Harbor Certification (31 U.S.C. § 3729)
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 whitespace-pre-line leading-relaxed text-[11px]">
                    {dossier.statutorySafeHarborCertification}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400 font-mono">
                  Certified SHA-256 Audit Trail • 42 U.S.C. § 1395x(aa)(1)
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
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all"
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

export default RhcFqhcArbiter;
