'use client';

import React, { useState, useMemo } from 'react';
import {
  Scale,
  Calculator,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Copy,
  Check,
  Send,
  Loader2,
  ArrowRight,
  Sparkles,
  Info,
  DollarSign,
  HelpCircle,
  FileCode,
  CheckCircle2,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

type MspScenario = 'working_aged' | 'disability' | 'esrd' | 'workers_comp' | 'auto_nofault' | 'liability' | 'medicare_primary';

export default function MspDeterminationEngine() {
  // Scenario Selection
  const [scenario, setScenario] = useState<MspScenario>('working_aged');

  // Question Inputs
  const [patientAge, setPatientAge] = useState<'65_plus' | 'under_65'>('65_plus');
  const [isEmployed, setIsEmployed] = useState<boolean>(true);
  const [employerSize, setEmployerSize] = useState<'under_20' | '20_to_99' | '100_plus'>('20_to_99');
  const [hasEgphCoverage, setHasEgphCoverage] = useState<boolean>(true);

  // Disability specifics
  const [isSsdi, setIsSsdi] = useState<boolean>(false);

  // ESRD specifics
  const [hasEsrd, setHasEsrd] = useState<boolean>(false);
  const [dialysisMonths, setDialysisMonths] = useState<number>(14);

  // Injury specifics
  const [isWorkRelated, setIsWorkRelated] = useState<boolean>(false);
  const [isAutoAccident, setIsAutoAccident] = useState<boolean>(false);
  const [isLiabilityTort, setIsLiabilityTort] = useState<boolean>(false);

  // UI state
  const [copied, setCopied] = useState<boolean>(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadOrg, setLeadOrg] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  // MSP Rule Determination Engine
  const determination = useMemo(() => {
    // 1. Work-Related Injury -> Workers' Comp
    if (scenario === 'workers_comp' || isWorkRelated) {
      return {
        primaryPayer: "Workers' Compensation Carrier",
        secondaryPayer: 'Medicare (Conditional or Secondary)',
        mspType: '15',
        typeLabel: "Workers' Compensation (WC)",
        statutoryCitation: 'Section 1862(b)(2)(A)(ii) of the Social Security Act & 42 CFR § 411.40',
        electronicMapping: 'Loop 2320 SBR05=WC, SBR09=15. Attach EOB with CARC PR amounts in Loop 2320 CAS.',
        conditionalAllowed: true,
        summary:
          "Workers' compensation is strictly primary for all services related to the compensable injury or illness. Medicare will reject primary claims with CARC CO-22.",
        guidance:
          "Obtain WC claim number, date of injury, adjuster name, and formal billing address. If the WC carrier contests compensability, bill Medicare conditionally using Modifier -32 and document the dispute.",
      };
    }

    // 2. Auto / No-Fault
    if (scenario === 'auto_nofault' || isAutoAccident) {
      return {
        primaryPayer: 'Auto / No-Fault / PIP Insurance Carrier',
        secondaryPayer: 'Medicare (Secondary or Conditional)',
        mspType: '14',
        typeLabel: 'No-Fault Insurance / Auto PIP',
        statutoryCitation: '42 U.S.C. § 1395y(b)(2)(A)(i) & 42 CFR § 411.50',
        electronicMapping: 'Loop 2320 SBR05=NF, SBR09=14. State accident date in Loop 2300 DTP*439.',
        conditionalAllowed: true,
        summary:
          'Automobile Personal Injury Protection (PIP) or Medical Payments coverage is primary up to statutory policy limits regardless of fault.',
        guidance:
          'Bill the auto PIP carrier first. When policy exhaustion letter (exhaustion of benefits EOB) is received, submit secondary claim to Medicare with exhaustion documentation.',
      };
    }

    // 3. Third-Party Liability
    if (scenario === 'liability' || isLiabilityTort) {
      return {
        primaryPayer: 'Third-Party Liability Insurer / Settlement',
        secondaryPayer: 'Medicare (Conditional Payment)',
        mspType: '47',
        typeLabel: 'Liability Insurance',
        statutoryCitation: '42 U.S.C. § 1395y(b)(2)(B) & 42 CFR § 411.54',
        electronicMapping: 'Loop 2320 SBR05=LI, SBR09=47. Prompt settlement tracking required.',
        conditionalAllowed: true,
        summary:
          'Liability insurance (premises, commercial general liability, tort) is primary. If payment is not reasonably expected within 120 days of service, Medicare may pay conditionally.',
        guidance:
          'If the liability insurer has not settled within 120 days, submit a conditional claim to Medicare. Medicare will assert a statutory super-lien against any eventual settlement proceeds via the BCRC.',
      };
    }

    // 4. End-Stage Renal Disease (ESRD)
    if (scenario === 'esrd' || hasEsrd) {
      const isWithin30Months = dialysisMonths <= 30;
      if (hasEgphCoverage && isWithin30Months) {
        return {
          primaryPayer: 'Employer Group Health Plan (EGHP)',
          secondaryPayer: 'Medicare',
          mspType: '13',
          typeLabel: 'End-Stage Renal Disease (ESRD) — Coordination Period',
          statutoryCitation: 'Section 1862(b)(1)(C) of the Social Security Act & 42 CFR § 411.162',
          electronicMapping: 'Loop 2320 SBR05=CI/EP, SBR09=13. Record coordination start date in Loop 2300.',
          conditionalAllowed: false,
          summary: `Patient is within month ${dialysisMonths} of the 30-month statutory coordination period. EGHP is PRIMARY.`,
          guidance:
            'EGHP must pay primary benefits for the entire 30-month coordination window regardless of employer size. After month 30, Medicare automatically shifts to primary status.',
        };
      } else {
        return {
          primaryPayer: 'Medicare',
          secondaryPayer: hasEgphCoverage ? 'Employer Group Health Plan (EGHP)' : 'None / Supplement',
          mspType: 'None',
          typeLabel: 'Medicare Primary (ESRD Post-Coordination Window)',
          statutoryCitation: '42 CFR § 411.162(a)(2)',
          electronicMapping: 'Standard Medicare Part B Loop 2000B primary claim submission.',
          conditionalAllowed: false,
          summary:
            dialysisMonths > 30
              ? 'Patient has exceeded the 30-month statutory coordination period. Medicare is now PRIMARY.'
              : 'No EGHP coverage reported. Medicare is PRIMARY.',
          guidance:
            'Submit claim directly to Medicare as primary payer. Cross over remaining balances to secondary EGHP or Medigap supplement.',
        };
      }
    }

    // 5. Disability (Under 65)
    if (scenario === 'disability' || (patientAge === 'under_65' && isSsdi)) {
      if (hasEgphCoverage && employerSize === '100_plus') {
        return {
          primaryPayer: 'Large Group Health Plan (LGHP)',
          secondaryPayer: 'Medicare',
          mspType: '43',
          typeLabel: 'Disability with Large Group Health Plan (100+ employees)',
          statutoryCitation: 'Section 1862(b)(1)(B) of the Social Security Act & 42 CFR § 411.200',
          electronicMapping: 'Loop 2320 SBR05=CI/EP, SBR09=43. Record employee relationship in SBR02.',
          conditionalAllowed: false,
          summary:
            'Patient is entitled to Medicare via Disability and covered under an LGHP with 100+ employees. LGHP is PRIMARY.',
          guidance:
            'Bill the LGHP primary. Bill Medicare secondary with primary adjudication remittance details in Loop 2320 CAS segments.',
        };
      } else {
        return {
          primaryPayer: 'Medicare',
          secondaryPayer: hasEgphCoverage ? 'Employer Group Health Plan' : 'None',
          mspType: 'None',
          typeLabel: 'Medicare Primary (Disability with Employer <100)',
          statutoryCitation: '42 CFR § 411.201',
          electronicMapping: 'Standard Medicare primary claim submission.',
          conditionalAllowed: false,
          summary: 'Employer has under 100 employees. Medicare is PRIMARY.',
          guidance: 'Medicare pays primary. If employer plan exists, bill secondary.',
        };
      }
    }

    // 6. Working Aged (65+)
    if (scenario === 'working_aged' || patientAge === '65_plus') {
      if (isEmployed && hasEgphCoverage && (employerSize === '20_to_99' || employerSize === '100_plus')) {
        return {
          primaryPayer: 'Employer Group Health Plan (EGHP)',
          secondaryPayer: 'Medicare',
          mspType: '12',
          typeLabel: 'Working Aged (EGHP with 20+ employees)',
          statutoryCitation: 'Section 1862(b)(1)(A) of the Social Security Act & 42 CFR § 411.170',
          electronicMapping: 'Loop 2320 SBR05=CI/EP, SBR09=12. Patient or spouse employment status verified.',
          conditionalAllowed: false,
          summary:
            'Patient (or spouse) is employed by an entity with 20+ employees with active group health insurance. EGHP is PRIMARY.',
          guidance:
            'Bill commercial EGHP first. If Medicare is mistakenly billed primary, claim will be rejected with CARC CO-22.',
        };
      } else {
        return {
          primaryPayer: 'Medicare',
          secondaryPayer: hasEgphCoverage ? 'Small Employer Plan (<20)' : 'None / Supplemental',
          mspType: 'None',
          typeLabel: 'Medicare Primary (Small Employer <20 or Retired)',
          statutoryCitation: '42 CFR § 411.172(b)',
          electronicMapping: 'Standard Medicare primary claim submission.',
          conditionalAllowed: false,
          summary:
            employerSize === 'under_20'
              ? 'Employer has fewer than 20 employees. Medicare is PRIMARY.'
              : 'Patient/spouse is retired with no active employment group health plan. Medicare is PRIMARY.',
          guidance:
            'Medicare pays primary benefits. Bill small employer coverage or Medigap policy secondary.',
        };
      }
    }

    // Default Fallback
    return {
      primaryPayer: 'Medicare',
      secondaryPayer: 'None',
      mspType: 'None',
      typeLabel: 'Medicare Primary',
      statutoryCitation: 'Medicare Claims Processing Manual Pub. 100-04, Ch. 28',
      electronicMapping: 'Standard 837P Loop 2000B primary.',
      conditionalAllowed: false,
      summary: 'No secondary payer rules triggered. Medicare is PRIMARY.',
      guidance: 'Submit primary claim to Medicare Part B contractor.',
    };
  }, [
    scenario,
    patientAge,
    isEmployed,
    employerSize,
    hasEgphCoverage,
    isSsdi,
    hasEsrd,
    dialysisMonths,
    isWorkRelated,
    isAutoAccident,
    isLiabilityTort,
  ]);

  const copyReport = () => {
    const reportText = `CMS MEDICARE SECONDARY PAYER (MSP) STATUTORY DETERMINATION REPORT
Generated via Aethera Healthcare Solutions (https://aetherahealthcare.com/tools/msp-determination-engine)

DETERMINATION SUMMARY:
• Primary Payer: ${determination.primaryPayer}
• Secondary Payer: ${determination.secondaryPayer}
• MSP Type Code: ${determination.mspType} (${determination.typeLabel})
• Statutory Authority: ${determination.statutoryCitation}

ELECTRONIC CLAIM (ANSI X12 837P) SPECIFICATION:
• EDI Routing: ${determination.electronicMapping}
• Conditional Billing Permitted: ${determination.conditionalAllowed ? 'YES (Prompt Payment / 120-Day Rule)' : 'NO (Mandatory Primary Adjudication Required)'}

CLINICAL BILLING ADVICE:
${determination.summary}

COMPLIANCE PROTOCOL:
${determination.guidance}

AETHERA MSP DEFENSE:
1. Retain signed CMS MSP Questionnaire for 10 years to defend against RAC and MAC post-payment recoupments.
2. Automate Loop 2320 CAS cross-coding to eliminate CO-22 Coordination of Benefits denials.
3. Schedule an MSP audit with Aethera Healthcare Solutions: https://aetherahealthcare.com/contact`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;
    setLeadLoading(true);

    try {
      await sendLeadToKiran('msp_determination_audit_request', {
        source: 'MSP Determination Engine & Questionnaire Tool',
        name: leadName || 'Billing Compliance Director',
        email: leadEmail,
        phone: leadPhone || 'Not provided',
        organization: leadOrg || 'Medical Group / Health Center',
        message: `Requested MSP Secondary Coordination & CO-22 Elimination Audit.
Scenario: ${scenario}
Determined Primary: ${determination.primaryPayer}
MSP Type: ${determination.mspType} (${determination.typeLabel})
Statutory Citation: ${determination.statutoryCitation}`,
      });
      setLeadSubmitted(true);
    } catch {
      setLeadSubmitted(true);
    } finally {
      setLeadLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Tool Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              CMS Medicare Secondary Payer (MSP) Statutory Rulebook
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-jakarta">
              Medicare Secondary Payer (MSP) Determination Engine
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
              Determine statutory primary vs secondary payer order pursuant to Section 1862(b) of the Social Security
              Act. Generate ANSI X12 837P Loop 2320 electronic crossover segments and eliminate CARC CO-22 coordination
              denials.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors shadow-sm"
              title="Copy complete MSP determination summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Determination Copied!' : 'Copy Determination Summary'}
            </button>
          </div>
        </div>

        {/* Statutory Warning Box */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">CMS Post-Payment Recoupment Risk:</strong> Inappropriate
            billing of Medicare as primary when an Employer Group Health Plan, Workers&apos; Comp, or No-Fault insurer is
            primary triggers automatic False Claims audits, mandatory refunding with statutory interest, and immediate
            downstream CARC CO-22 denial sweeps.
          </div>
        </div>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {[
          { id: 'working_aged', label: 'Working Aged (65+)' },
          { id: 'disability', label: 'Disability (<65)' },
          { id: 'esrd', label: 'ESRD / Dialysis' },
          { id: 'workers_comp', label: "Workers' Comp" },
          { id: 'auto_nofault', label: 'Auto / No-Fault' },
          { id: 'liability', label: 'Liability / Tort' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setScenario(tab.id as MspScenario)}
            className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
              scenario === tab.id
                ? 'bg-navy text-white border-navy shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Questionnaire vs Determination */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 6 Columns: Questionnaire Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600" />
              MSP Clinical Intake Questionnaire
            </h3>

            {/* Working Aged Branch */}
            {scenario === 'working_aged' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Patient Age
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPatientAge('65_plus')}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        patientAge === '65_plus'
                          ? 'bg-navy text-white border-navy'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Age 65 or Older
                    </button>
                    <button
                      type="button"
                      onClick={() => setPatientAge('under_65')}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        patientAge === 'under_65'
                          ? 'bg-navy text-white border-navy'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Under Age 65
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Is Patient or Spouse Currently Employed?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEmployed(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        isEmployed
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Yes, Actively Employed
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEmployed(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        !isEmployed
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      No, Retired / Not Working
                    </button>
                  </div>
                </div>

                {isEmployed && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Employer Group Health Plan (EGHP) Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'under_20', label: '<20 Employees' },
                          { id: '20_to_99', label: '20–99 Employees' },
                          { id: '100_plus', label: '100+ Employees' },
                        ].map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => setEmployerSize(opt.id as any)}
                            className={`p-2.5 rounded-xl border text-xs font-bold ${
                              employerSize === opt.id
                                ? 'bg-navy text-white border-navy'
                                : 'bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Covered under active EGHP through that employment?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setHasEgphCoverage(true)}
                          className={`p-2.5 rounded-xl border text-xs font-bold ${
                            hasEgphCoverage
                              ? 'bg-navy text-white border-navy'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          Yes, Covered by EGHP
                        </button>
                        <button
                          type="button"
                          onClick={() => setHasEgphCoverage(false)}
                          className={`p-2.5 rounded-xl border text-xs font-bold ${
                            !hasEgphCoverage
                              ? 'bg-navy text-white border-navy'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          No EGHP Coverage
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Disability Branch */}
            {scenario === 'disability' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  Under 42 CFR § 411.200, when a disabled beneficiary under 65 is covered by an employer with{' '}
                  <strong>100 or more employees</strong>, the Large Group Health Plan (LGHP) must pay primary.
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Employer Headcount
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEmployerSize('100_plus')}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        employerSize === '100_plus'
                          ? 'bg-navy text-white border-navy'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      100+ Employees (LGHP)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEmployerSize('under_20')}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        employerSize !== '100_plus'
                          ? 'bg-navy text-white border-navy'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Under 100 Employees
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Active Group Coverage via Self or Family Member?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasEgphCoverage(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        hasEgphCoverage
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Yes, Active LGHP
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasEgphCoverage(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        !hasEgphCoverage
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      No LGHP
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ESRD Branch */}
            {scenario === 'esrd' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Months Since Dialysis / Transplant Start
                    </label>
                    <span className="text-sm font-bold font-mono text-emerald-600">
                      Month {dialysisMonths} of 30
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="48"
                    step="1"
                    value={dialysisMonths}
                    onChange={(e) => setDialysisMonths(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Month 1 (Initiation)</span>
                    <span className="font-bold text-amber-600">Month 30 (Coordination Cliff)</span>
                    <span>Month 48</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Is Patient Covered by Commercial Employer Group Health Plan?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setHasEgphCoverage(true)}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        hasEgphCoverage
                          ? 'bg-navy text-white border-navy'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Yes, EGHP Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setHasEgphCoverage(false)}
                      className={`p-2.5 rounded-xl border text-xs font-bold ${
                        !hasEgphCoverage
                          ? 'bg-navy text-white border-navy'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      No EGHP
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Workers Comp Branch */}
            {scenario === 'workers_comp' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Mandatory Workers&apos; Comp Primary Adjudication
                  </div>
                  <p>
                    All medical, surgical, and diagnostic items related to the occupational injury must be billed to the
                    Workers&apos; Compensation carrier.
                  </p>
                  <p className="text-[11px] text-slate-500">
                    If the WC carrier issues a formal denial of compensability (e.g. pre-existing condition), Medicare
                    may be billed with the formal WC denial attached.
                  </p>
                </div>
              </div>
            )}

            {/* Auto / No-Fault Branch */}
            {scenario === 'auto_nofault' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Automobile PIP / Med-Pay Exhaustion Rule
                  </div>
                  <p>
                    Automobile No-Fault insurance is primary regardless of who caused the accident. Medicare will not pay
                    primary claims until the PIP policy is 100% exhausted.
                  </p>
                </div>
              </div>
            )}

            {/* Liability Branch */}
            {scenario === 'liability' && (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    120-Day Conditional Billing Window
                  </div>
                  <p>
                    If the liability insurer has not made payment within 120 days of the date of service, Medicare may pay
                    conditionally to protect provider cash flow.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 6 Columns: Statutory Determination Card */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 via-navy to-slate-950 text-white rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Statutory Determination
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                MSP Code: {determination.mspType}
              </span>
            </div>

            {/* Payer Hierarchy Verdict */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div>
                <div className="text-[11px] text-slate-400 font-medium">PRIMARY PAYER:</div>
                <div className="text-xl font-bold font-jakarta text-white mt-0.5">
                  {determination.primaryPayer}
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <div className="text-[11px] text-slate-400 font-medium">SECONDARY PAYER:</div>
                <div className="text-base font-semibold text-teal mt-0.5">
                  {determination.secondaryPayer}
                </div>
              </div>
            </div>

            {/* EDI X12 Mapping Specification */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-emerald-400" />
                ANSI X12 837P Electronic Coordination Mapping:
              </div>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs text-emerald-300 leading-relaxed">
                {determination.electronicMapping}
              </div>
            </div>

            {/* Legal Authority */}
            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="font-semibold text-slate-400">Statutory Citation:</div>
              <p className="font-mono text-[11px] text-slate-200">{determination.statutoryCitation}</p>
            </div>

            {/* Guidance Callout */}
            <div className="p-3.5 rounded-xl bg-teal/10 border border-teal/30 text-xs text-teal leading-relaxed">
              <strong className="font-semibold text-white block mb-1">Aethera Billing Action:</strong>
              {determination.guidance}
            </div>
          </div>
        </div>
      </div>

      {/* Free 50-Claim MSP Audit Form */}
      <div className="bg-gradient-to-br from-navy via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Complimentary Practice Audit
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Schedule a 50-Claim MSP Secondary Coordination &amp; CO-22 Audit
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Our certified billing compliance specialists audit 50 Medicare claims to eliminate CO-22 coordination of
            benefit rejections, recover uncollected secondary balances, and insulate your practice from CMS False
            Claims recoupments.
          </p>
        </div>

        {leadSubmitted ? (
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">MSP Audit Request Submitted</h4>
            <p className="text-sm text-slate-300">
              Our Medicare Compliance Pod has received your submission and will contact you within 1 business day with
              your custom MSP review protocol.
            </p>
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} className="mt-8 max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Patricia Gomez"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  required
                  placeholder="pgomez@regionalhealth.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Practice / Facility Name</label>
                <input
                  type="text"
                  placeholder="Regional Specialty Physicians"
                  value={leadOrg}
                  onChange={(e) => setLeadOrg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 678-1234"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={leadLoading}
              className="w-full py-3 px-6 rounded-xl font-bold text-sm bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 mt-2"
            >
              {leadLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Audit Protocol...
                </>
              ) : (
                <>
                  Request 50-Claim MSP Coordination Audit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400">
              100% HIPAA compliant. Direct response from certified AAPC / AHIMA compliance specialists.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
