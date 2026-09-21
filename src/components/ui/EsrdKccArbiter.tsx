'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Droplets,
  Calculator,
  AlertTriangle,
  FileText,
  Coins,
  ShieldCheck,
  Check,
  Copy,
  Sliders,
  Award,
  HeartPulse,
  Home,
} from 'lucide-react';
import {
  ESRD_FACILITY_ARCHETYPES,
  calculateEsrdPpsReimbursement,
  generateEsrdAuditDossier,
  type EsrdFacilityProfile,
  type DialysisEncounterCase,
  type DialysisModality,
} from '@/data/esrdKccData';

export function EsrdKccArbiter() {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('metro-renal-center');
  const [activeTab, setActiveTab] = useState<'casemix' | 'lowvolume' | 'kcc' | 'qip'>('casemix');

  // Patient & Clinical Encounter State
  const [patientAge, setPatientAge] = useState<number>(58);
  const [modality, setModality] = useState<DialysisModality>('IN_CENTER_HEMODIALYSIS');
  const [isOnset, setIsOnset] = useState<boolean>(false);
  const [comorbidityType, setComorbidityType] = useState<'NONE' | 'GI_BLEED' | 'PERITONITIS' | 'PNEUMONIA' | 'SICKLE_CELL'>('NONE');
  const [isUnderweight, setIsUnderweight] = useState<boolean>(false);
  const [isHomeTraining, setIsHomeTraining] = useState<boolean>(false);
  const [receivesTdapa, setReceivesTdapa] = useState<boolean>(false);

  // Facility Sensitivity Controls
  const [customWageIndex, setCustomWageIndex] = useState<number>(1.2854);
  const [customQipScore, setCustomQipScore] = useState<number>(84.5);
  const [customTreatments, setCustomTreatments] = useState<number>(14200);

  // Modal State
  const [isDossierModalOpen, setIsDossierModalOpen] = useState<boolean>(false);
  const [copiedDossier, setCopiedDossier] = useState<boolean>(false);

  const activeFacility: EsrdFacilityProfile = useMemo(() => {
    return ESRD_FACILITY_ARCHETYPES.find((f) => f.id === selectedFacilityId) || ESRD_FACILITY_ARCHETYPES[0];
  }, [selectedFacilityId]);

  const handleFacilityChange = (facilityId: string) => {
    setSelectedFacilityId(facilityId);
    const target = ESRD_FACILITY_ARCHETYPES.find((f) => f.id === facilityId);
    if (target) {
      setCustomWageIndex(target.wageIndex);
      setCustomQipScore(target.qipPerformanceScore);
      setCustomTreatments(target.annualTreatmentsFurnished);
      if (target.facilityType === 'ACADEMIC_PEDIATRIC') {
        setPatientAge(11);
      } else if (patientAge < 18) {
        setPatientAge(58);
      }
      if (target.facilityType === 'HOME_MODALITY_TRAINING') {
        setModality('PERITONEAL_DIALYSIS');
        setIsHomeTraining(true);
        setActiveTab('kcc');
      } else if (target.facilityType === 'RURAL_LOW_VOLUME') {
        setActiveTab('lowvolume');
      }
    }
  };

  const currentEncounter: DialysisEncounterCase = useMemo(() => {
    const isPediatric = patientAge < 18;
    const heightCm = isPediatric ? 140 : 175;
    const weightKg = isUnderweight ? (isPediatric ? 28 : 52) : (isPediatric ? 38 : 78);

    return {
      patientAge,
      isPediatric,
      heightCm,
      weightKg,
      modality,
      isOnsetOfDialysis: isOnset,
      hasAcuteComorbidity: comorbidityType === 'GI_BLEED' || comorbidityType === 'PERITONITIS' || comorbidityType === 'PNEUMONIA',
      acuteComorbidityType: comorbidityType === 'GI_BLEED' ? 'GI_BLEED' : comorbidityType === 'PERITONITIS' ? 'PERITONITIS' : comorbidityType === 'PNEUMONIA' ? 'BACTERIAL_PNEUMONIA' : undefined,
      hasChronicComorbidity: comorbidityType === 'SICKLE_CELL',
      chronicComorbidityType: comorbidityType === 'SICKLE_CELL' ? 'SICKLE_CELL' : undefined,
      isHomeTrainingSession: isHomeTraining,
      receivesTdapaInnovativeDrug: receivesTdapa,
      treatmentUnits: 1,
    };
  }, [patientAge, modality, isOnset, comorbidityType, isUnderweight, isHomeTraining, receivesTdapa]);

  const calcResult = useMemo(() => {
    return calculateEsrdPpsReimbursement(activeFacility, currentEncounter, {
      customWageIndex,
      customQipScore,
      customAnnualTreatments: customTreatments,
    });
  }, [activeFacility, currentEncounter, customWageIndex, customQipScore, customTreatments]);

  const dossier = useMemo(() => {
    return generateEsrdAuditDossier(activeFacility, currentEncounter, calcResult);
  }, [activeFacility, currentEncounter, calcResult]);

  const handleCopyDossier = () => {
    const text = `${dossier.legalHeader}\n` +
      `Audit Hash: ${dossier.auditHash}\n` +
      `Timestamp: ${dossier.timestamp}\n\n` +
      `ESRD PPS PAYMENT SETTLEMENT:\n` +
      Object.entries(dossier.ppsPaymentCalculation).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\nSTATUTORY ADJUSTMENTS & CASE-MIX:\n` +
      Object.entries(dossier.statutoryAdjustments).map(([k, v]) => `  ${k}: ${v}`).join('\n') +
      `\n\n${dossier.kccQualityDefenseBrief}`;

    navigator.clipboard.writeText(text);
    setCopiedDossier(true);
    setTimeout(() => setCopiedDossier(false), 2000);
  };

  return (
    <section
      id="esrd-kcc-arbiter"
      aria-label="End-Stage Renal Disease (ESRD) Prospective Payment System & Kidney Care Choices (KCC) Arbiter"
      className="py-20 md:py-28 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background Accent Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[350px] bg-cyan-500/10 blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[300px] bg-blue-500/10 blur-[130px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
            <Droplets className="h-4 w-4 text-cyan-400" />
            42 CFR Part 413 Subpart H • CMS-1805-F CY2025 ESRD PPS
          </div>
          <h2 className="font-jakarta text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            ESRD Prospective Payment System &amp; Kidney Care Choices (KCC) Arbiter
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            Deterministic reimbursement modeling for bundled maintenance dialysis, Low-Volume Payment Adjustments (18.9% LVPA),
            dialysis onset multipliers (1.510), TDAPA innovative drugs, ESRD QIP quality penalty protection, and CMMI value-based contracting.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-300">
              CY 2025 Base Rate: $273.82 / Treatment
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-blue-300">
              Low-Volume Adjustment (LVPA): +18.9%
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-teal-300">
              Dialysis Onset Multiplier: 1.510 (First 120 Days)
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-purple-300">
              Home Training Add-on: $95.60
            </span>
          </div>
        </div>

        {/* Facility Archetype Selector */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Select ESRD Facility Cost-Report Archetype:
            </span>
            <span className="text-xs text-cyan-400 font-mono">
              CCN: {activeFacility.ccn} | {activeFacility.dialysisStations} Stations
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ESRD_FACILITY_ARCHETYPES.map((facility) => {
              const isSelected = facility.id === selectedFacilityId;
              return (
                <button
                  key={facility.id}
                  onClick={() => handleFacilityChange(facility.id)}
                  className={`p-4 rounded-xl text-left border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {facility.facilityType.replace(/_/g, ' ')}
                      </span>
                      {isSelected && <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />}
                    </div>
                    <div className="text-sm font-bold text-white">{facility.name}</div>
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{facility.description}</p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                    <span className="text-slate-400">
                      {facility.annualTreatmentsFurnished.toLocaleString()} Tx/Yr
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {facility.qualifiesLowVolume ? '18.9% LVPA' : `WI: ${facility.wageIndex.toFixed(3)}`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4 High-Impact KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Net Payment Per Treatment */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-cyan-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Net Payment Per Treatment</span>
              <Coins className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">
              ${calcResult.netPaymentPerTreatment.toFixed(2)}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>Base: ${calcResult.cy2025BaseRate.toFixed(2)}</span>
              <span className="text-cyan-400 font-semibold">
                Mult: {(calcResult.compositePatientMultiplier * calcResult.compositeFacilityMultiplier).toFixed(3)}x
              </span>
            </div>
          </div>

          {/* Card 2: Annual Facility Medicare Revenue */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-blue-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">Annual Facility Revenue</span>
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-300 font-mono">
              ${Math.round(calcResult.annualFacilityMedicareRevenue).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{customTreatments.toLocaleString()} Treatments</span>
              <span className="text-blue-300 font-semibold">CMS-2552 Wksht I</span>
            </div>
          </div>

          {/* Card 3: Low-Volume & Rural Lifeline Value */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-teal-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">LVPA / Rural Lifeline</span>
              <HeartPulse className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-teal-300 font-mono">
              ${Math.round(calcResult.annualLowVolumeLifelineValue).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{calcResult.lowVolumeMultiplier > 1 ? '+18.9% LVPA' : 'Standard Scale'}</span>
              <span className="text-teal-300 font-semibold">42 CFR § 413.232</span>
            </div>
          </div>

          {/* Card 4: KCC Shared Savings */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-900/40 border border-purple-500/30 shadow-xl space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase tracking-wider">CMMI KCC Shared Savings</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono">
              +${Math.round(calcResult.annualKccSharedSavingsPotential).toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 flex items-center justify-between pt-1 border-t border-slate-800">
              <span>{activeFacility.homeModalitySharePercent}% Home Dialysis</span>
              <span className="text-purple-300 font-semibold">TCOC Upside</span>
            </div>
          </div>
        </div>

        {/* Interactive Case-Mix & Sensitivity Controls Panel */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-base font-bold text-white">
                Interactive Dialysis Encounter &amp; Case-Mix Sensitivity Modeler
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">42 CFR § 413.231 Case-Mix Engine</span>
          </div>

          {/* Row 1: Patient Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Age Control */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">Patient Age:</span>
                <span className="font-mono text-cyan-300 font-bold">
                  {patientAge} yrs ({calcResult.ageMultiplier.toFixed(3)}x)
                </span>
              </div>
              <input
                type="range"
                min={2}
                max={90}
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Pediatric (&lt;18)</span>
                <span>Adult (&gt;65)</span>
              </div>
            </div>

            {/* Modality Selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 font-semibold block">Dialysis Modality:</span>
              <div className="grid grid-cols-3 gap-1">
                {(['IN_CENTER_HEMODIALYSIS', 'PERITONEAL_DIALYSIS', 'HOME_HEMODIALYSIS'] as DialysisModality[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModality(m)}
                    className={`py-1.5 px-2 rounded text-[10px] font-mono font-semibold truncate border ${
                      modality === m
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m === 'IN_CENTER_HEMODIALYSIS' ? 'In-Center HD' : m === 'PERITONEAL_DIALYSIS' ? 'Home PD' : 'Home HHD'}
                  </button>
                ))}
              </div>
            </div>

            {/* Dialysis Onset Toggle */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 font-semibold block">Dialysis Onset (First 120 Days):</span>
              <button
                onClick={() => setIsOnset(!isOnset)}
                className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all border ${
                  isOnset
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/40'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                {isOnset ? 'ONSET ACTIVE (1.510 Multiplier / +51%)' : 'Established Maintenance (1.000)'}
              </button>
            </div>

            {/* Comorbidity Selector */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-300 font-semibold block">Comorbidity Multiplier:</span>
              <select
                value={comorbidityType}
                onChange={(e) => setComorbidityType(e.target.value as 'NONE' | 'GI_BLEED' | 'PERITONITIS' | 'PNEUMONIA' | 'SICKLE_CELL')}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg p-2 font-mono focus:border-cyan-500 outline-none"
              >
                <option value="NONE">None / Reference (1.000)</option>
                <option value="GI_BLEED">Acute GI Bleed (1.173)</option>
                <option value="PERITONITIS">Peritonitis (1.159)</option>
                <option value="PNEUMONIA">Bacterial Pneumonia (1.135)</option>
                <option value="SICKLE_CELL">Sickle Cell Anemia (1.223)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Add-Ons & Quality Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-800/80">
            {/* Underweight BMI Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-300 font-semibold block">Underweight BMI (&lt;18.5):</span>
                <span className="text-[10px] text-slate-400 font-mono">1.023x nutritional multiplier</span>
              </div>
              <input
                type="checkbox"
                checked={isUnderweight}
                onChange={(e) => setIsUnderweight(e.target.checked)}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Home Training Add-on Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-300 font-semibold block">Home Training Session:</span>
                <span className="text-[10px] text-purple-300 font-mono">+$95.60 per training session</span>
              </div>
              <input
                type="checkbox"
                checked={isHomeTraining}
                onChange={(e) => setIsHomeTraining(e.target.checked)}
                className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
              />
            </div>

            {/* TDAPA Innovative Drug Add-on Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs text-slate-300 font-semibold block">TDAPA Drug (Korsuva):</span>
                <span className="text-[10px] text-teal-300 font-mono">+$142.50 innovative add-on</span>
              </div>
              <input
                type="checkbox"
                checked={receivesTdapa}
                onChange={(e) => setReceivesTdapa(e.target.checked)}
                className="w-4 h-4 accent-teal-400 rounded cursor-pointer"
              />
            </div>

            {/* ESRD QIP Performance Score Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-semibold">ESRD QIP Score:</span>
                <span className={`font-mono font-bold ${customQipScore >= 57 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {customQipScore.toFixed(1)}/100 ({calcResult.qipPenaltyPercent > 0 ? `-${(calcResult.qipPenaltyPercent * 100).toFixed(1)}%` : '0% Cut'})
                </span>
              </div>
              <input
                type="range"
                min={30}
                max={100}
                step={1}
                value={customQipScore}
                onChange={(e) => setCustomQipScore(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>Penalty Zone (&lt;57)</span>
                <span>Top Decile (&gt;80)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('casemix')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'casemix'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Per-Treatment Case-Mix Breakdown</span>
          </button>

          <button
            onClick={() => setActiveTab('lowvolume')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'lowvolume'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>Low-Volume &amp; Rural Lifeline Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('kcc')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'kcc'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>CMMI Kidney Care Choices (KCC) Model</span>
          </button>

          <button
            onClick={() => setActiveTab('qip')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'qip'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ESRD QIP Quality Penalty Safeguard</span>
          </button>
        </div>

        {/* Tab 1: Per-Treatment Case-Mix Breakdown */}
        {activeTab === 'casemix' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel: Mathematical Breakdown */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">CY 2025 Case-Mix Multipliers</h3>
                    <p className="text-[11px] text-slate-400 font-mono">42 CFR § 413.235 Statutory Adjustments</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                  {calcResult.compositePatientMultiplier.toFixed(4)}x Patient Factor
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Age Multiplier ({patientAge} years):</span>
                  <span className="font-mono text-cyan-300 font-bold">{calcResult.ageMultiplier.toFixed(3)}x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Body Surface Area (BSA) Factor:</span>
                  <span className="font-mono text-slate-200">{calcResult.bsaMultiplier.toFixed(4)}x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">BMI Underweight Factor (&lt;18.5):</span>
                  <span className={`font-mono font-bold ${calcResult.bmiMultiplier > 1 ? 'text-teal-400' : 'text-slate-400'}`}>
                    {calcResult.bmiMultiplier.toFixed(3)}x
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Onset of Dialysis (First 120 Days):</span>
                  <span className={`font-mono font-bold ${calcResult.onsetMultiplier > 1 ? 'text-teal-400' : 'text-slate-400'}`}>
                    {calcResult.onsetMultiplier.toFixed(3)}x
                  </span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Acute / Chronic Comorbidity Multiplier:</span>
                  <span className={`font-mono font-bold ${calcResult.comorbidityMultiplier > 1 ? 'text-amber-300' : 'text-slate-400'}`}>
                    {calcResult.comorbidityMultiplier.toFixed(3)}x
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="text-cyan-400 font-bold">Composite Patient Multiplier Formula:</div>
                <div className="text-slate-400">
                  {calcResult.ageMultiplier.toFixed(3)} (Age) × {calcResult.bsaMultiplier.toFixed(3)} (BSA) × {calcResult.bmiMultiplier.toFixed(3)} (BMI) × {calcResult.onsetMultiplier.toFixed(3)} (Onset) × {calcResult.comorbidityMultiplier.toFixed(3)} (Comorb) = {calcResult.compositePatientMultiplier.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Right Panel: Final Payment Calculation */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                    <Coins className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Payment Settlement Per Treatment</h3>
                    <p className="text-[11px] text-slate-400 font-mono">Net Settled Treatment Amount</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
                  ${calcResult.netPaymentPerTreatment.toFixed(2)}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Federal Base Rate (CMS-1805-F):</span>
                  <span className="font-mono text-white">${calcResult.cy2025BaseRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Wage-Adjusted Base (WI: {customWageIndex.toFixed(4)}):</span>
                  <span className="font-mono text-cyan-300">${calcResult.wageAdjustedBaseRate.toFixed(2)}</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Facility Multiplier (LVPA &amp; Rural):</span>
                  <span className="font-mono text-teal-300">{calcResult.compositeFacilityMultiplier.toFixed(3)}x</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                  <span className="text-slate-400">Bundled Dialysis Treatment Rate:</span>
                  <span className="font-mono text-white font-bold">${calcResult.finalBundledRatePerTreatment.toFixed(2)}</span>
                </div>
                {calcResult.homeTrainingAddOn > 0 && (
                  <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-purple-300">Home Training Add-on:</span>
                    <span className="font-mono text-purple-300 font-bold">+${calcResult.homeTrainingAddOn.toFixed(2)}</span>
                  </div>
                )}
                {calcResult.tdapaPayment > 0 && (
                  <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                    <span className="text-teal-300">TDAPA Drug Add-on (Difelikefalin):</span>
                    <span className="font-mono text-teal-300 font-bold">+${calcResult.tdapaPayment.toFixed(2)}</span>
                  </div>
                )}
                {calcResult.qipPenaltyPercent > 0 && (
                  <div className="flex justify-between p-2 rounded bg-slate-950/60 border border-rose-500/30">
                    <span className="text-rose-400">ESRD QIP Quality Haircut:</span>
                    <span className="font-mono text-rose-400 font-bold">-${calcResult.qipDeductionPerTreatment.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 space-y-1">
                <div className="text-emerald-400 font-bold">Comprehensive Bundled Treatment Coverage:</div>
                <div className="text-slate-400">
                  Includes dialyzer, machine maintenance, specialized nursing, routine ESAs (Epogen, Aranesp), intravenous iron, vitamin D, and diagnostic laboratory tests.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Low-Volume & Rural Lifeline Radar */}
        {activeTab === 'lowvolume' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-5 h-5 text-teal-400" />
                  <h3 className="text-base font-bold text-white">
                    Low-Volume Payment Adjustment (LVPA) &amp; Rural Lifeline Radar
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Authority: 42 CFR § 413.232(b) &amp; Social Security Act § 1881(b)(14)
                </p>
              </div>

              <span className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                activeFacility.qualifiesLowVolume
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {activeFacility.qualifiesLowVolume ? 'LVPA QUALIFIED (+18.9%)' : 'STANDARD VOLUME'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Annual Treatment Census</span>
                <div className="text-xl font-bold text-white font-mono">
                  {customTreatments.toLocaleString()} Treatments
                </div>
                <p className="text-[11px] text-slate-300">
                  Must furnish &lt; 4,000 treatments annually across 3 preceding cost report years.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Statutory LVPA Multiplier</span>
                <div className="text-xl font-bold text-teal-400 font-mono">
                  1.189x (+18.9%)
                </div>
                <p className="text-[11px] text-slate-300">
                  Compensates isolated facilities for fixed overhead across smaller patient panels.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Annual Lifeline Value</span>
                <div className="text-xl font-bold text-cyan-300 font-mono">
                  ${Math.round(calcResult.annualLowVolumeLifelineValue).toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-300">
                  Critical margin keeping small rural and safety-net dialysis units solvent.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-white">42 CFR § 413.232 Geographic Distance Requirement:</span>
              <p className="text-slate-300 leading-relaxed">
                To receive the 18.9% LVPA adjustment, an ESRD facility cannot be located within <strong>5 road miles</strong> of another
                ESRD facility that is owned or operated by the same common entity or healthcare system. If an affiliate
                opens a dialysis clinic within 5 miles, both facilities lose LVPA status retroactively.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: CMMI Kidney Care Choices (KCC) Model */}
        {activeTab === 'kcc' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Home className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">
                    CMMI Kidney Care Choices (KCC) &amp; Comprehensive Kidney Care Contracting (CKCC)
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Value-based model shifting nephrologists and dialysis facilities from fee-for-service to total cost of care.
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Annual KCC Shared Savings Potential:</span>
                <div className="text-2xl font-bold font-mono text-purple-300">
                  +${Math.round(calcResult.annualKccSharedSavingsPotential).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Home Dialysis Adoption</span>
                <div className="text-xl font-bold text-purple-400 font-mono">
                  {activeFacility.homeModalitySharePercent}%
                </div>
                <p className="text-[11px] text-slate-300">
                  Peritoneal Dialysis &amp; Home Hemodialysis (National average ~14%).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Attributed Beneficiaries</span>
                <div className="text-xl font-bold text-white font-mono">
                  {Math.round(customTreatments / 156)} Patients
                </div>
                <p className="text-[11px] text-slate-300">
                  ESRD patients attributed to the Kidney Contracting Entity (KCE).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">TCOC Risk Track</span>
                <div className="text-xl font-bold text-teal-300 font-mono">
                  {activeFacility.kccTrack ?? 'NON_PARTICIPANT'}
                </div>
                <p className="text-[11px] text-slate-300">
                  {activeFacility.kccTrack === 'GLOBAL' ? '100% Shared Savings / Downside Risk' : '50% Shared Savings Track'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-2">
              <span className="font-bold text-purple-300">The KCC Total Cost of Care Paradigm:</span>
              <p className="text-slate-300 leading-relaxed">
                In standard fee-for-service, dialysis facilities earn revenue only when a patient dialyzes in a clinic chair.
                Under CMMI&apos;s Kidney Care Choices (KCC) model, Kidney Contracting Entities (KCEs) share in total Medicare Part A and B
                savings achieved by:
                (1) Increasing home dialysis adoption,
                (2) Expediting preemptive kidney transplants, and
                (3) Reducing central venous catheter bloodstream infections and avoidable hospital readmissions.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: ESRD QIP Quality Penalty Safeguard */}
        {activeTab === 'qip' && (
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                  <h3 className="text-base font-bold text-white">
                    ESRD Quality Incentive Program (QIP) Penalty Safeguard
                  </h3>
                </div>
                <p className="text-xs text-slate-300">
                  Authority: Social Security Act § 1881(h) &amp; 42 CFR § 413.178
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Annual Revenue at Risk:</span>
                <div className={`text-2xl font-bold font-mono ${calcResult.annualQipPenaltyExposure > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {calcResult.annualQipPenaltyExposure > 0 ? `-$${Math.round(calcResult.annualQipPenaltyExposure).toLocaleString()}` : '$0.00 (Protected)'}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Performance Score</span>
                <div className={`text-xl font-bold font-mono ${customQipScore >= 57 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {customQipScore.toFixed(1)} / 100
                </div>
                <p className="text-[11px] text-slate-300">
                  National minimum performance standard is ~57.0 points.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Payment Reduction Haircut</span>
                <div className={`text-xl font-bold font-mono ${calcResult.qipPenaltyPercent > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {(calcResult.qipPenaltyPercent * 100).toFixed(1)}%
                </div>
                <p className="text-[11px] text-slate-300">
                  Graduated statutory penalty from 0.5% up to 2.0% maximum.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono uppercase text-slate-400">Deduction Per Treatment</span>
                <div className="text-xl font-bold text-white font-mono">
                  ${calcResult.qipDeductionPerTreatment.toFixed(2)}
                </div>
                <p className="text-[11px] text-slate-300">
                  Deducted automatically from every Medicare claim line.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <span className="font-bold text-white">ESRD QIP Clinical Performance Domain Measures:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Kt/V Dialysis Adequacy (&gt;= 1.2):</span>
                  <span className="text-emerald-400 font-bold">98.4% Achieved</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Arteriovenous Fistula in Use:</span>
                  <span className="text-emerald-400 font-bold">74.2% (Target &gt;68%)</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Catheter &gt;90 Days Rate:</span>
                  <span className="text-cyan-300 font-bold">8.1% (Low Infection Risk)</span>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">NHSN Bloodstream Infection Rate:</span>
                  <span className="text-emerald-400 font-bold">0.42 per 100 patient-months</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Callout Bar */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-cyan-300 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>CMS Form 2552 Worksheet I &amp; ESRD PPS Audit Defense Ready</span>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Generate a formal Medicare renal cost report settlement brief, case-mix multiplier substantiation,
              and CMMI KCC value-based quality certification certified with SHA-256 cryptographic proof.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsDossierModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <FileText className="w-4 h-4" />
              <span>Generate ESRD PPS Audit Dossier</span>
            </button>
          </div>
        </div>

        {/* 1-Click ESRD PPS Audit Dossier Modal */}
        {isDossierModalOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="CMS Form 2552-10 Worksheet I-4 & ESRD PPS Audit Dossier"
          >
            <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{dossier.auditHash}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">CMS Form 2552-10 Worksheet I &amp; ESRD PPS Brief</h3>
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
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                  {dossier.legalHeader}
                </div>

                {/* PPS Payment Calculation */}
                <div className="space-y-2">
                  <div className="text-cyan-400 font-bold uppercase tracking-wider text-xs">
                    Per-Treatment Prospective Payment System Settlement (42 CFR § 413.230)
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    {Object.entries(dossier.ppsPaymentCalculation).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Adjustments */}
                <div className="space-y-2">
                  <div className="text-blue-400 font-bold uppercase tracking-wider text-xs">
                    Facility &amp; Patient-Level Case-Mix Adjustments
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
                    {Object.entries(dossier.statutoryAdjustments).map(([key, val]) => (
                      <div key={key} className="flex justify-between text-slate-300">
                        <span className="text-slate-400">{key}:</span>
                        <span className="font-bold text-white">{val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality & Legal Brief */}
                <div className="space-y-2">
                  <div className="text-teal-400 font-bold uppercase tracking-wider text-xs">
                    ESRD QIP &amp; False Claims Act Statutory Substantiation
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 whitespace-pre-wrap text-slate-300 leading-relaxed">
                    {dossier.kccQualityDefenseBrief}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Certified SHA-256 Audit Trail • 42 U.S.C. § 1395rr(b)(14)
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleCopyDossier}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    {copiedDossier ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedDossier ? 'Copied to Clipboard' : 'Copy Full Dossier'}</span>
                  </button>
                  <button
                    onClick={() => setIsDossierModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all"
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

export default EsrdKccArbiter;
