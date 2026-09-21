'use client';

import React, { useState, useMemo } from 'react';
import {
  Compass,
  TrendingUp,
  AlertTriangle,
  FileText,
  Check,
  Copy,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Building,
  Gavel,
  Sliders
} from 'lucide-react';
import {
  MAC_JURISDICTIONS,
  CPT_PARITY_BENCHMARKS,
  PAYER_ARBITRAGE_PROFILES,
  MPFS_CONVERSION_FACTOR,
  type MacJurisdiction,
  type CptParityBenchmark,
  type PayerArbitrageProfile
} from '@/data/feeScheduleParityData';

export function FeeScheduleParityHeatmap() {
  const [selectedMacId, setSelectedMacId] = useState<string>('novitas-tx');
  const [selectedCptCode, setSelectedCptCode] = useState<string>('22633');
  const [selectedPayerId, setSelectedPayerId] = useState<string>('uhc-optum');
  const [contractMultiplier, setContractMultiplier] = useState<number>(2.20); // 220% of Medicare
  const [daysElapsed, setDaysElapsed] = useState<number>(45); // Days since clean claim submission
  const [annualCaseVolume, setAnnualCaseVolume] = useState<number>(40);
  const [isBriefModalOpen, setIsBriefModalOpen] = useState<boolean>(false);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);

  const activeMac: MacJurisdiction = useMemo(() => {
    return MAC_JURISDICTIONS.find((m) => m.id === selectedMacId) || MAC_JURISDICTIONS[0];
  }, [selectedMacId]);

  const activeCpt: CptParityBenchmark = useMemo(() => {
    return CPT_PARITY_BENCHMARKS.find((c) => c.cptCode === selectedCptCode) || CPT_PARITY_BENCHMARKS[0];
  }, [selectedCptCode]);

  const activePayer: PayerArbitrageProfile = useMemo(() => {
    return PAYER_ARBITRAGE_PROFILES.find((p) => p.id === selectedPayerId) || PAYER_ARBITRAGE_PROFILES[0];
  }, [selectedPayerId]);

  // Exact GPCI-adjusted Medicare Physician Fee Schedule (MPFS) calculation
  const calculatedMacMedicareRate = useMemo(() => {
    const workComponent = activeCpt.workRvu * activeMac.workGpci;
    const peComponent = activeCpt.peRvu * activeMac.peGpci;
    const mpComponent = activeCpt.mpRvu * activeMac.mpGpci;
    const totalAdjustedRvu = workComponent + peComponent + mpComponent;
    return totalAdjustedRvu * MPFS_CONVERSION_FACTOR;
  }, [activeCpt, activeMac]);

  // Expected contractual payment based on contracted multiplier of Medicare
  const expectedContractualAmount = useMemo(() => {
    return calculatedMacMedicareRate * contractMultiplier;
  }, [calculatedMacMedicareRate, contractMultiplier]);

  // What the payer actually remitted based on typical unmonitored settlement rate
  const actualPayerPayment = useMemo(() => {
    return calculatedMacMedicareRate * activePayer.typicalSettlementRateOfMedicare;
  }, [calculatedMacMedicareRate, activePayer]);

  // Underpayment shortfall per claim
  const underpaymentShortfall = useMemo(() => {
    return Math.max(0, expectedContractualAmount - actualPayerPayment);
  }, [expectedContractualAmount, actualPayerPayment]);

  // Annual practice revenue lost
  const annualRevenueShortfall = useMemo(() => {
    return underpaymentShortfall * annualCaseVolume;
  }, [underpaymentShortfall, annualCaseVolume]);

  // Prompt pay violation determination
  const promptPayStatute = activeMac.promptPayStatute;
  const isPromptPayViolated = daysElapsed > promptPayStatute.electronicPaymentWindowDays;
  const overdueDays = Math.max(0, daysElapsed - promptPayStatute.electronicPaymentWindowDays);

  // Accrued statutory prompt pay interest penalty
  const accruedStatutoryInterest = useMemo(() => {
    if (!isPromptPayViolated) return 0;
    const dailyRate = (promptPayStatute.statutoryInterestRatePercent / 100) / 365;
    return underpaymentShortfall * dailyRate * overdueDays;
  }, [isPromptPayViolated, promptPayStatute, underpaymentShortfall, overdueDays]);

  const handleCopyDemandLetter = () => {
    const letterText = `FORMAL NOTICE OF CONTRACTUAL UNDERPAYMENT & STATUTORY PROMPT PAY DEMAND
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
VIA CERTIFIED MAIL & ELECTRONIC CLAIMS APPEALS PORTAL

TO: Claims Appeals & Provider Relations Department
PAYER: ${activePayer.payerName}
RE: Underpayment of CPT ${activeCpt.cptCode} (${activeCpt.procedureTitle})
MAC Jurisdiction: ${activeMac.macName} (${activeMac.jurisdictionCode})
Primary State Jurisdiction: ${activeMac.primaryState}
Governing Prompt Pay Statute: ${promptPayStatute.statuteCitation}
Enforcement Agency: ${promptPayStatute.regulatoryEnforcementAgency}

I. STATUTORY & CONTRACTUAL SUMMARY OF UNDERPAYMENT
1. Procedure Performed: CPT ${activeCpt.cptCode} (${activeCpt.specialty}).
2. GPCI-Adjusted Geographic Medicare Base Rate: $${calculatedMacMedicareRate.toFixed(2)} (Work GPCI: ${activeMac.workGpci}, PE GPCI: ${activeMac.peGpci}, MP GPCI: ${activeMac.mpGpci}).
3. Contracted Multiplier of Medicare: ${(contractMultiplier * 100).toFixed(0)}%.
4. Expected Contractual Allowable: $${expectedContractualAmount.toFixed(2)}.
5. Amount Remitted by ${activePayer.payerName}: $${actualPayerPayment.toFixed(2)} (${(activePayer.typicalSettlementRateOfMedicare * 100).toFixed(0)}% of Medicare).
6. Net Contractual Underpayment Shortfall: $${underpaymentShortfall.toFixed(2)}.

II. STATUTORY PROMPT PAY VIOLATION & ACCRUED PENALTY INTEREST
Under ${promptPayStatute.statuteCitation}, clean electronic claims must be adjudicated within ${promptPayStatute.electronicPaymentWindowDays} calendar days.
- Days Elapsed Since Clean Claim Receipt: ${daysElapsed} days.
- Overdue Period: ${overdueDays} days in default.
- Statutory Interest Rate: ${promptPayStatute.statutoryInterestRatePercent.toFixed(1)}% per annum.
- Accrued Statutory Interest Owed: $${accruedStatutoryInterest.toFixed(2)}.
Total Immediate Liquidated Balance Due: $${(underpaymentShortfall + accruedStatutoryInterest).toFixed(2)}.

III. RECOUPMENT & CLAWBACK STATUTE OF LIMITATIONS NOTICE
Please be advised that under ${promptPayStatute.statuteCitation}, retroactive recoupment or post-payment clawbacks are strictly limited to ${promptPayStatute.recoupmentLookbackLimitMonths} months from payment date. Any automated offset exceeding this statutory lookback constitutes an illegal conversion and bad-faith insurance practice.

IV. 15-DAY MANDATORY NOTICE BEFORE REGULATORY ESCALATION
${promptPayStatute.mandatoryAuditRemedy}
Notice is hereby given that if full payment of the contractual shortfall ($${underpaymentShortfall.toFixed(2)}) plus accrued statutory interest ($${accruedStatutoryInterest.toFixed(2)}) is not remitted within fifteen (15) calendar days of receipt of this notice, our practice will immediately file a formal Administrative Complaint with the ${promptPayStatute.regulatoryEnforcementAgency} and initiate binding ERISA § 502(a) enforcement actions to recover the principal balance, statutory penalties, and all associated legal fees.

CERTIFIED SOVEREIGN COMPLIANCE OFFICER:
Aethera Healthcare Sovereign RCM Legal Unit on behalf of Attending Surgical Provider`;

    navigator.clipboard.writeText(letterText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  return (
    <section
      id="fee-schedule-parity"
      className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Ambient background lighting */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[500px] bg-emerald-500/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[500px] bg-blue-500/5 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs font-mono uppercase tracking-wider mb-4">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            Geographic Reimbursement Arbitrage • CPT Benchmark Radar
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Global Commercial vs. Medicare Fee Schedule Parity Heatmap
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
            Commercial payers systematically underpay surgical claims relative to contracted multipliers through silent PPO leasing and unmonitored fee schedules. Select your Medicare Administrative Contractor (MAC) jurisdiction and specialty CPT to expose geographic reimbursement arbitrage, calculate statutory prompt pay interest, and generate immediate legal demand briefs.
          </p>
        </div>

        {/* 1. MAC Jurisdiction Selector Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              1. Select Medicare Administrative Contractor (MAC) Regional Jurisdiction
            </h3>
            <span className="text-xs text-slate-500 font-mono">7 Federal Jurisdictions Available</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {MAC_JURISDICTIONS.map((mac) => {
              const isSelected = mac.id === selectedMacId;
              return (
                <button
                  key={mac.id}
                  onClick={() => setSelectedMacId(mac.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-emerald-950/50 border-emerald-500 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold">
                      {mac.promptPayStatute.stateCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      GPCI {mac.compositeGpci.toFixed(2)}x
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {mac.primaryState}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {mac.macName.split('(')[0].trim()}
                  </div>
                  <div className="mt-2 text-[9px] font-mono text-slate-500 flex items-center justify-between">
                    <span>Pay Window:</span>
                    <span className="text-emerald-400 font-semibold">{mac.promptPayStatute.electronicPaymentWindowDays}d</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CPT Surgical Procedure & Specialty Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              2. Select High-Value Surgical Encounter & CPT Procedure
            </h3>
            <span className="text-xs text-slate-500 font-mono">Base RVU & Medicare Allowed Benchmark</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {CPT_PARITY_BENCHMARKS.map((cpt) => {
              const isSelected = cpt.cptCode === selectedCptCode;
              return (
                <button
                  key={cpt.cptCode}
                  onClick={() => setSelectedCptCode(cpt.cptCode)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-extrabold text-cyan-300">
                      CPT {cpt.cptCode}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {cpt.totalNationalRvu.toFixed(1)} RVU
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white line-clamp-2 leading-snug">
                    {cpt.procedureTitle}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-2 truncate">
                    {cpt.specialty.split('/')[0].trim()}
                  </div>
                  <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <span>Base Nat&apos;l:</span>
                    <span className="text-slate-200 font-semibold">${cpt.nationalMedicareRate.toFixed(0)}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Commercial Payer Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              3. Select Target Commercial Insurer
            </h3>
            <span className="text-xs text-slate-500 font-mono">Typical Unmonitored Payment Behavior</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {PAYER_ARBITRAGE_PROFILES.map((payer) => {
              const isSelected = payer.id === selectedPayerId;
              return (
                <button
                  key={payer.id}
                  onClick={() => setSelectedPayerId(payer.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500 shadow-md shadow-blue-950/40 ring-1 ring-blue-400'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold text-white truncate">
                    {payer.payerName.split('/')[0].trim()}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {payer.payerCategory}
                  </div>
                  <div className="mt-2 text-[10px] font-mono flex items-center justify-between">
                    <span className="text-slate-500">Unmonitored:</span>
                    <span className="text-rose-400 font-semibold">{(payer.typicalSettlementRateOfMedicare * 100).toFixed(0)}% Med</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Main Parity Heatmap & Arbitrage Calculation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Left Column: Interactive Multiplier & GPCI Rate Breakdown (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Regional GPCI Calculation</span>
                  <div className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                    <span>{activeMac.primaryState} • {activeMac.jurisdictionCode}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400">Medicare Allowed</span>
                  <div className="text-xl font-black text-emerald-400 font-mono">
                    ${calculatedMacMedicareRate.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* GPCI Factor Badges */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">Work GPCI</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{activeMac.workGpci.toFixed(3)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">PE GPCI</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{activeMac.peGpci.toFixed(3)}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase">MP GPCI</span>
                  <span className="text-xs font-mono font-bold text-slate-200">{activeMac.mpGpci.toFixed(3)}</span>
                </div>
              </div>

              {/* Contract Multiplier Slider */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Target Contracted Multiplier of Medicare:
                  </label>
                  <span className="text-sm font-mono font-extrabold text-cyan-400">
                    {(contractMultiplier * 100).toFixed(0)}% of Medicare
                  </span>
                </div>
                <input
                  type="range"
                  min="1.50"
                  max="3.00"
                  step="0.05"
                  value={contractMultiplier}
                  onChange={(e) => setContractMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>150% (Floor)</span>
                  <span>220% (Regional Avg)</span>
                  <span>300% (High-Acuity)</span>
                </div>
              </div>

              {/* Case Volume Estimator */}
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Annual Practice Encounter Volume:
                  </label>
                  <span className="text-xs font-mono font-bold text-slate-200">
                    {annualCaseVolume} cases/year
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={annualCaseVolume}
                  onChange={(e) => setAnnualCaseVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Payer Exploit Notice */}
            <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Payer Underpayment Exploit: {activeCpt.payerExploits.exploitName}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {activeCpt.payerExploits.mechanism}
              </p>
            </div>
          </div>

          {/* Right Column: Parity Visual Bar, Underpayment Radar & Shortfall (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  Arbitrage Differential Comparison (Per Encounter)
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-bold">
                  Underpayment Detected
                </span>
              </div>

              {/* Rate Comparison Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {/* 1. Medicare Base */}
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">100% Medicare Allowed</span>
                  <div className="text-lg font-mono font-bold text-slate-200 mt-1">
                    ${calculatedMacMedicareRate.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">Statutory GPCI Base</span>
                </div>

                {/* 2. Contracted Expectation */}
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase block">Contracted Expectation</span>
                  <div className="text-lg font-mono font-extrabold text-cyan-300 mt-1">
                    ${expectedContractualAmount.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-cyan-400/80 mt-1 block">@ {(contractMultiplier * 100).toFixed(0)}% of Medicare</span>
                </div>

                {/* 3. Actual Payer Payment */}
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/50">
                  <span className="text-[10px] font-mono text-rose-400 uppercase block">Payer Remitted Payment</span>
                  <div className="text-lg font-mono font-extrabold text-rose-300 mt-1">
                    ${actualPayerPayment.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-rose-400/80 mt-1 block">@ {(activePayer.typicalSettlementRateOfMedicare * 100).toFixed(0)}% of Medicare</span>
                </div>
              </div>

              {/* Visual Multi-Bar Comparator */}
              <div className="space-y-3 mb-6 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-cyan-400">Contracted Entitlement:</span>
                    <span className="text-white font-bold">${expectedContractualAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-rose-400">Payer Unmonitored Remittance:</span>
                    <span className="text-rose-300 font-bold">${actualPayerPayment.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (actualPayerPayment / expectedContractualAmount) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Practice Financial Shortfall HUD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/40 via-slate-950/60 to-slate-950/40 border border-rose-800/60 mb-5">
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400">Per-Encounter Shortfall</span>
                  <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                    -${underpaymentShortfall.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Unilaterally withheld per surgical case.
                  </p>
                </div>
                <div className="sm:border-l sm:border-slate-800 sm:pl-4">
                  <span className="text-[10px] font-mono uppercase text-emerald-400">Annual Recoverable Revenue</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">
                    +${annualRevenueShortfall.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Over {annualCaseVolume} annual cases in practice.
                  </p>
                </div>
              </div>
            </div>

            {/* Prompt Pay & Action Row */}
            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>ERISA § 502(a) &amp; State Prompt Pay Enforcement</span>
              </div>
              <button
                onClick={() => setIsBriefModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-950/50"
              >
                <FileText className="w-4 h-4 text-slate-950" />
                Generate Underpayment Demand
                <ArrowRight className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Prompt Pay Penalty Calculator & Recoupment Defense Ribbon */}
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Gavel className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">
                  State Prompt Pay Penalty Radar &amp; Clawback Lookback Audit
                </h4>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Statutory Authority: {promptPayStatute.statuteCitation} • Enforced by {promptPayStatute.regulatoryEnforcementAgency}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">Clean Claim Age:</span>
              <span className="text-sm font-mono font-bold text-white bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                {daysElapsed} Calendar Days
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Days Elapsed Slider */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Days Since Clean Claim Submission:</span>
                <span className="text-xs font-mono text-emerald-400">{daysElapsed}d</span>
              </label>
              <input
                type="range"
                min="10"
                max="120"
                step="5"
                value={daysElapsed}
                onChange={(e) => setDaysElapsed(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>10 Days</span>
                <span>Statutory Deadline ({promptPayStatute.electronicPaymentWindowDays}d)</span>
                <span>120 Days</span>
              </div>
            </div>

            {/* Prompt Pay Status */}
            <div className={`p-4 rounded-xl border ${
              isPromptPayViolated
                ? 'bg-rose-950/40 border-rose-700/60'
                : 'bg-emerald-950/30 border-emerald-800/40'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Prompt Pay Status</span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                  isPromptPayViolated ? 'bg-rose-900/80 text-rose-200' : 'bg-emerald-900/80 text-emerald-200'
                }`}>
                  {isPromptPayViolated ? 'VIOLATION ACCRUING' : 'WITHIN WINDOW'}
                </span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {isPromptPayViolated
                  ? `${overdueDays} Days Past Statutory Limit`
                  : `${promptPayStatute.electronicPaymentWindowDays - daysElapsed} Days Remaining`}
              </div>
              <div className="text-xs text-slate-300 mt-2 flex items-center justify-between">
                <span>Accrued Penalty Interest ({promptPayStatute.statutoryInterestRatePercent}%/yr):</span>
                <span className="font-mono font-bold text-amber-400">
                  +${accruedStatutoryInterest.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Recoupment Statute of Limitations Guard */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase text-slate-400">Recoupment Lookback Limit</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 font-bold">
                  {promptPayStatute.recoupmentLookbackLimitMonths} Months Max
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-200 mt-1">
                Payer Post-Payment Clawback Defense
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                In {activeMac.primaryState}, payers cannot unilaterally offset or demand refunds past {promptPayStatute.recoupmentLookbackLimitMonths} months without proof of intentional fraud.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Legal Demand Brief Modal */}
        {isBriefModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">
                    Formal Contractual Underpayment &amp; Prompt Pay Demand Notice
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
                <div className="text-emerald-400 font-bold">
                  TO: {activePayer.payerName} Claims Appeals &amp; Legal Regulatory Compliance
                  <br />
                  RE: Underpayment of CPT {activeCpt.cptCode} • MAC {activeMac.macName}
                  <br />
                  STATUTE: {promptPayStatute.statuteCitation} • ERISA § 502(a)
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">I. CONTRACTUAL RATE ENTITLEMENT</span>
                  The practice performed CPT {activeCpt.cptCode} ({activeCpt.procedureTitle}). The geographic Medicare allowable for {activeMac.primaryState} ({activeMac.jurisdictionCode}) is $${calculatedMacMedicareRate.toFixed(2)}. Based on our contracted rate of {(contractMultiplier * 100).toFixed(0)}% of Medicare, the expected payment is $${expectedContractualAmount.toFixed(2)}. Payer remitted only $${actualPayerPayment.toFixed(2)}, generating a contractual underpayment of $${underpaymentShortfall.toFixed(2)}.
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">II. STATUTORY PROMPT PAY DEFAULT &amp; ACCRUED INTEREST</span>
                  Clean claim has been pending {daysElapsed} days, exceeding the {promptPayStatute.electronicPaymentWindowDays}-day statutory deadline under {promptPayStatute.statuteCitation}. Pursuant to state law, mandatory interest of {promptPayStatute.statutoryInterestRatePercent.toFixed(1)}% per annum is assessed, yielding $${accruedStatutoryInterest.toFixed(2)} in accrued statutory interest. Total liquidated amount due: $${(underpaymentShortfall + accruedStatutoryInterest).toFixed(2)}.
                </div>

                <div className="border-t border-slate-800 pt-3">
                  <span className="text-white font-bold block mb-1">III. 15-DAY MANDATORY NOTICE BEFORE REGULATORY ACTION</span>
                  Demand is hereby made for full remittance within fifteen (15) calendar days. Failure to remit will trigger immediate administrative complaint filing with the {promptPayStatute.regulatoryEnforcementAgency} and federal ERISA § 502(a) litigation.
                </div>

                <div className="text-[11px] text-amber-400 border-t border-slate-800 pt-3">
                  SOVEREIGN CLINICAL CODING &amp; COMPLIANCE ATTESTATION:
                  Calculated against official CMS CY2024 MPFS conversion factor ($33.2875) and regional GPCI composite indices.
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <span className="text-xs text-slate-400">
                  Formatted for certified mail submittal and clearinghouse portal appeals.
                </span>
                <button
                  onClick={handleCopyDemandLetter}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                >
                  {copiedBrief ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-950" />
                      Copy Legal Demand Notice
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
