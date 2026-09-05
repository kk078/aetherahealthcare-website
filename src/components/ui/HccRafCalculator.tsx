'use client';

import React, { useState, useMemo } from 'react';
import {
  Activity,
  Calculator,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  FileCheck2,
  Copy,
  CheckCircle2,
  Check,
  Send,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Info,
  DollarSign,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface DemographicCoeff {
  ageGroup: string;
  maleNonDual: number;
  femaleNonDual: number;
  maleDual: number;
  femaleDual: number;
}

const DEMOGRAPHIC_RATES: DemographicCoeff[] = [
  { ageGroup: '65–69', maleNonDual: 0.308, femaleNonDual: 0.268, maleDual: 0.442, femaleDual: 0.395 },
  { ageGroup: '70–74', maleNonDual: 0.362, femaleNonDual: 0.320, maleDual: 0.518, femaleDual: 0.465 },
  { ageGroup: '75–79', maleNonDual: 0.432, femaleNonDual: 0.390, maleDual: 0.605, femaleDual: 0.552 },
  { ageGroup: '80–84', maleNonDual: 0.512, femaleNonDual: 0.472, maleDual: 0.702, femaleDual: 0.655 },
  { ageGroup: '85+', maleNonDual: 0.625, femaleNonDual: 0.584, maleDual: 0.835, femaleDual: 0.792 },
];

interface HccCondition {
  id: string;
  category: string;
  name: string;
  icd10Samples: string;
  v24Hcc: string;
  v24Coeff: number;
  v28Hcc: string;
  v28Coeff: number;
  changeNote: string;
  meatGuidance: string;
}

const HCC_CONDITIONS: HccCondition[] = [
  {
    id: 'dm_uncomp',
    category: 'Endocrine & Metabolic',
    name: 'Diabetes Mellitus without Complication',
    icd10Samples: 'E11.9, E10.9',
    v24Hcc: 'HCC 19',
    v24Coeff: 0.105,
    v28Hcc: 'Discontinued (No HCC)',
    v28Coeff: 0.0,
    changeNote: 'CMS removed uncomplicated diabetes in v28. Document specific manifestations (neuropathy, nephropathy) to capture risk.',
    meatGuidance: 'Document specific glycemic control, HbA1c target, diet/oral hypoglycemic regimen, and inspect for subclinical complications.',
  },
  {
    id: 'dm_chronic_comp',
    category: 'Endocrine & Metabolic',
    name: 'Diabetes with Chronic Complications',
    icd10Samples: 'E11.21 (Nephropathy), E11.40 (Neuropathy), E11.319 (Retinopathy)',
    v24Hcc: 'HCC 18',
    v24Coeff: 0.302,
    v28Hcc: 'HCC 37',
    v28Coeff: 0.166,
    changeNote: 'Coefficients reduced by ~45% in v28. Comprehensive organ system documentation required to justify disease acuity.',
    meatGuidance: 'Link microvascular end-organ damage directly to diabetes. Document eGFR/microalbuminuria, monofilament exam, or dilated eye exam.',
  },
  {
    id: 'chf',
    category: 'Cardiovascular',
    name: 'Heart Failure (Systolic, Diastolic, Combined)',
    icd10Samples: 'I50.22 (Chronic systolic), I50.32 (Chronic diastolic), I50.9',
    v24Hcc: 'HCC 85',
    v24Coeff: 0.368,
    v28Hcc: 'HCC 226',
    v28Coeff: 0.360,
    changeNote: 'Maintained comparable weight in v28. Echo ejection fraction and NYHA functional class must be explicitly recorded annually.',
    meatGuidance: 'Document NYHA functional class (I–IV), current EF%, stability/compensation status, and diuretic/ACE/beta-blocker dosage.',
  },
  {
    id: 'ckd_stage3',
    category: 'Renal',
    name: 'Chronic Kidney Disease — Stage 3',
    icd10Samples: 'N18.30, N18.31, N18.32',
    v24Hcc: 'HCC 138',
    v24Coeff: 0.070,
    v28Hcc: 'Discontinued (No HCC)',
    v28Coeff: 0.0,
    changeNote: 'Removed in v28. Monitor eGFR closely; patients progressing to eGFR <30 qualify for CKD Stage 4 (HCC 328).',
    meatGuidance: 'Track eGFR trends. Note baseline vs acute fluctuations. Document underlying etiology (hypertensive or diabetic nephrosclerosis).',
  },
  {
    id: 'ckd_stage4',
    category: 'Renal',
    name: 'Chronic Kidney Disease — Stage 4 (Severe)',
    icd10Samples: 'N18.4',
    v24Hcc: 'HCC 137',
    v24Coeff: 0.289,
    v28Hcc: 'HCC 328',
    v28Coeff: 0.240,
    changeNote: 'Retained in v28 with slight coefficient recalibration. Must document eGFR 15–29 mL/min and nephrology referral status.',
    meatGuidance: 'Document exact eGFR lab values, electrolyte management (K+, phosphorus), bicarbonate therapy, and vascular access planning if applicable.',
  },
  {
    id: 'ckd_stage5_esrd',
    category: 'Renal',
    name: 'Chronic Kidney Disease — Stage 5 / ESRD',
    icd10Samples: 'N18.5, N18.6, Z99.2 (Hemodialysis)',
    v24Hcc: 'HCC 136 / 134',
    v24Coeff: 0.289,
    v28Hcc: 'HCC 327 / 326',
    v28Coeff: 0.370,
    changeNote: 'Increased coefficient weight in v28 reflecting intensive clinical resources required for end-stage renal management.',
    meatGuidance: 'Document dialysis frequency, dialysis center, shunt/catheter monitoring, dry weight, and monthly nephrologist oversight.',
  },
  {
    id: 'copd',
    category: 'Respiratory',
    name: 'COPD, Emphysema & Chronic Bronchitis',
    icd10Samples: 'J44.9, J43.9, J42',
    v24Hcc: 'HCC 111',
    v24Coeff: 0.335,
    v28Hcc: 'HCC 276',
    v28Coeff: 0.330,
    changeNote: 'Stable coefficient across models. Annual documentation must capture exacerbation history and maintenance inhaler adherence.',
    meatGuidance: 'Document baseline dyspnea on exertion, oxygen saturation, spirometry (FEV1), inhaler regimen (LABA/LAMA/ICS), and exacerbation triggers.',
  },
  {
    id: 'pvd_claudication',
    category: 'Cardiovascular',
    name: 'Peripheral Vascular Disease / Intermittent Claudication',
    icd10Samples: 'I73.9, I70.201, I70.202',
    v24Hcc: 'HCC 108',
    v24Coeff: 0.288,
    v28Hcc: 'Discontinued (No HCC)',
    v28Coeff: 0.0,
    changeNote: 'Uncomplicated PVD dropped in v28! Only peripheral disease with critical limb ischemia or ulceration maps to v28 HCC 263/264.',
    meatGuidance: 'Inspect lower extremities for rest pain, ischemic ulcers, or gangrene. Document ankle-brachial index (ABI) and pulse quality.',
  },
  {
    id: 'arrhythmia_afib',
    category: 'Cardiovascular',
    name: 'Atrial Fibrillation & Specified Arrhythmias',
    icd10Samples: 'I48.0, I48.19, I48.20, I48.91',
    v24Hcc: 'HCC 96',
    v24Coeff: 0.268,
    v28Hcc: 'HCC 238',
    v28Coeff: 0.220,
    changeNote: 'Recalibrated slightly downward in v28. Anticoagulation tracking and rhythm vs rate control strategy must be documented.',
    meatGuidance: 'Document heart rate, rhythm regularity on physical exam, 12-lead ECG date/findings, and stroke risk stratification (CHA2DS2-VASc) with DOAC dosage.',
  },
  {
    id: 'depression_major',
    category: 'Behavioral Health',
    name: 'Major Depressive Disorder (Single/Recurrent)',
    icd10Samples: 'F32.9, F33.0, F33.1, F33.2',
    v24Hcc: 'HCC 59',
    v24Coeff: 0.309,
    v28Hcc: 'HCC 155',
    v28Coeff: 0.300,
    changeNote: 'Maintained strong value. Require documented severity (mild/moderate/severe), remission status, and PHQ-9 scoring.',
    meatGuidance: 'Administer and document annual PHQ-9 score, response to antidepressant pharmacotherapy, suicidal ideation screening, and counseling referral.',
  },
  {
    id: 'rheumatoid_arthritis',
    category: 'Musculoskeletal & Autoimmune',
    name: 'Rheumatoid Arthritis & Autoimmune Connective Tissue',
    icd10Samples: 'M06.9, M05.79, M32.9 (SLE)',
    v24Hcc: 'HCC 40',
    v24Coeff: 0.423,
    v28Hcc: 'HCC 93',
    v28Coeff: 0.380,
    changeNote: 'Slight recalibration. Specific disease activity scoring (CDAI/RAPID3) and DMARD/biologic drug monitoring required.',
    meatGuidance: 'Document joint swelling/tenderness, morning stiffness duration, DMARD/biologic adherence, and regular liver/renal toxicity labs.',
  },
  {
    id: 'morbid_obesity',
    category: 'Endocrine & Metabolic',
    name: 'Morbid Obesity (BMI >= 40 or BMI >= 35 with Comorbidity)',
    icd10Samples: 'E66.01 + Z68.41–Z68.45',
    v24Hcc: 'HCC 22',
    v24Coeff: 0.273,
    v28Hcc: 'HCC 48',
    v28Coeff: 0.250,
    changeNote: 'Both the diagnosis code (E66.01) AND the corresponding BMI secondary code (Z68.41–Z68.45) must appear on the same claim.',
    meatGuidance: 'Document calculated BMI, dietary/lifestyle counseling, co-existing sleep apnea or osteoarthritis burden, and bariatric/GLP-1 therapy considerations.',
  },
];

export default function HccRafCalculator() {
  const [ageGroup, setAgeGroup] = useState<string>('70–74');
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dualStatus, setDualStatus] = useState<'NonDual' | 'Dual'>('NonDual');
  const [benchmarkRate, setBenchmarkRate] = useState<number>(1050); // Monthly MA capitation base
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    'dm_chronic_comp',
    'chf',
    'copd',
  ]);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [copied, setCopied] = useState<boolean>(false);

  // Lead Generation State
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadOrg, setLeadOrg] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);

  // Demographic coefficient calculation
  const demoCoeff = useMemo(() => {
    const row = DEMOGRAPHIC_RATES.find((r) => r.ageGroup === ageGroup) || DEMOGRAPHIC_RATES[1];
    if (gender === 'Male') {
      return dualStatus === 'Dual' ? row.maleDual : row.maleNonDual;
    } else {
      return dualStatus === 'Dual' ? row.femaleDual : row.femaleNonDual;
    }
  }, [ageGroup, gender, dualStatus]);

  // Selected condition objects
  const activeConditions = useMemo(() => {
    return HCC_CONDITIONS.filter((c) => selectedConditions.includes(c.id));
  }, [selectedConditions]);

  // Interaction multipliers
  const diseaseInteractions = useMemo(() => {
    const hasDm = selectedConditions.includes('dm_uncomp') || selectedConditions.includes('dm_chronic_comp');
    const hasChf = selectedConditions.includes('chf');
    const hasCopd = selectedConditions.includes('copd');
    const hasCkd = selectedConditions.includes('ckd_stage4') || selectedConditions.includes('ckd_stage5_esrd');

    let v24Interactions = 0;
    let v28Interactions = 0;
    const labels: string[] = [];

    if (hasDm && hasChf) {
      v24Interactions += 0.121;
      v28Interactions += 0.110;
      labels.push('Diabetes + Heart Failure Interaction');
    }
    if (hasChf && hasCopd) {
      v24Interactions += 0.174;
      v28Interactions += 0.145;
      labels.push('Heart Failure + COPD Interaction');
    }
    if (hasChf && hasCkd) {
      v24Interactions += 0.189;
      v28Interactions += 0.160;
      labels.push('Heart Failure + CKD (Cardiorenal) Interaction');
    }

    return { v24Interactions, v28Interactions, labels };
  }, [selectedConditions]);

  // Total Scores
  const scores = useMemo(() => {
    const v24Clinical = activeConditions.reduce((acc, c) => acc + c.v24Coeff, 0);
    const v28Clinical = activeConditions.reduce((acc, c) => acc + c.v28Coeff, 0);

    const v24Total = Number((demoCoeff + v24Clinical + diseaseInteractions.v24Interactions).toFixed(3));
    const v28Total = Number((demoCoeff + v28Clinical + diseaseInteractions.v28Interactions).toFixed(3));

    // 2025 CMS Blended Phase: 67% v28 + 33% v24
    const blendedTotal = Number((0.67 * v28Total + 0.33 * v24Total).toFixed(3));

    const v24AnnualRev = Math.round(v24Total * benchmarkRate * 12);
    const v28AnnualRev = Math.round(v28Total * benchmarkRate * 12);
    const blendedAnnualRev = Math.round(blendedTotal * benchmarkRate * 12);

    const deltaRaf = Number((v28Total - v24Total).toFixed(3));
    const deltaRev = v28AnnualRev - v24AnnualRev;
    const pctChange = Number(((deltaRev / (v24AnnualRev || 1)) * 100).toFixed(1));

    return {
      v24Clinical,
      v28Clinical,
      v24Total,
      v28Total,
      blendedTotal,
      v24AnnualRev,
      v28AnnualRev,
      blendedAnnualRev,
      deltaRaf,
      deltaRev,
      pctChange,
    };
  }, [demoCoeff, activeConditions, diseaseInteractions, benchmarkRate]);

  const toggleCondition = (id: string) => {
    if (selectedConditions.includes(id)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== id));
    } else {
      setSelectedConditions([...selectedConditions, id]);
    }
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    HCC_CONDITIONS.forEach((c) => set.add(c.category));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredConditions = useMemo(() => {
    if (activeCategoryFilter === 'All') return HCC_CONDITIONS;
    return HCC_CONDITIONS.filter((c) => c.category === activeCategoryFilter);
  }, [activeCategoryFilter]);

  const copyReport = () => {
    const reportText = `CMS HCC RISK ADJUSTMENT & RAF SCORE AUDIT REPORT
Generated via Aethera Healthcare Solutions (https://aetherahealthcare.com/tools/hcc-raf-calculator)

PATIENT DEMOGRAPHIC PROFILE:
• Age Group: ${ageGroup}
• Gender: ${gender}
• Dual Eligibility: ${dualStatus === 'Dual' ? 'Medicaid Full/Partial Dual' : 'Medicare Non-Dual'}
• Demographic Base RAF: ${demoCoeff.toFixed(3)}
• Benchmark Monthly MA Capitation Rate: $${benchmarkRate.toLocaleString()}

CLINICAL CONDITIONS SELECTED (${activeConditions.length}):
${activeConditions
  .map(
    (c) =>
      `- ${c.name} (${c.icd10Samples})
   v24: ${c.v24Hcc} (${c.v24Coeff.toFixed(3)}) | v28: ${c.v28Hcc} (${c.v28Coeff.toFixed(3)})
   Documentation MEAT Focus: ${c.meatGuidance}`
  )
  .join('\n')}

DISEASE INTERACTIONS:
${
  diseaseInteractions.labels.length > 0
    ? diseaseInteractions.labels.map((l) => `- ${l}`).join('\n')
    : '- None active'
}

RAF SCORE SUMMARY & MODEL BENCHMARK:
• CMS-HCC v24 Total RAF: ${scores.v24Total.toFixed(3)} ($${scores.v24AnnualRev.toLocaleString()}/patient/year)
• CMS-HCC v28 Total RAF: ${scores.v28Total.toFixed(3)} ($${scores.v28AnnualRev.toLocaleString()}/patient/year)
• 2025 CMS Blended RAF (67% v28 / 33% v24): ${scores.blendedTotal.toFixed(3)} ($${scores.blendedAnnualRev.toLocaleString()}/patient/year)
• Net v28 Model Delta: ${scores.deltaRaf >= 0 ? '+' : ''}${scores.deltaRaf.toFixed(3)} RAF (${scores.deltaRev >= 0 ? '+' : ''}$${scores.deltaRev.toLocaleString()}/patient/year, ${scores.pctChange}%)

AETHERA REVENUE CYCLE REMEDIATION PLAN:
1. Recertify chronic manifestations annually under strict MEAT criteria (Monitor, Evaluate, Assess, Treat).
2. Code diabetic end-organ complications (neuropathy, nephropathy, microalbuminuria) rather than uncomplicated codes.
3. Bridge eGFR drops to stage 4 CKD promptly with lab confirmation.
4. Schedule a 50-chart clinical risk adjustment gap audit with Aethera Healthcare Solutions: https://aetherahealthcare.com/contact`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadEmail) return;
    setLeadLoading(true);

    try {
      await sendLeadToKiran('hcc_risk_adjustment_audit_request', {
        source: 'HCC RAF Score Calculator & Audit Tool',
        name: leadName || 'Risk Adjustment Director',
        email: leadEmail,
        phone: leadPhone || 'Not provided',
        organization: leadOrg || 'Medical Group / ACO',
        message: `Requested 50-Chart HCC Risk Adjustment Gap Audit.
Demographic: ${ageGroup} ${gender} (${dualStatus})
v24 RAF: ${scores.v24Total.toFixed(3)} ($${scores.v24AnnualRev.toLocaleString()}/yr)
v28 RAF: ${scores.v28Total.toFixed(3)} ($${scores.v28AnnualRev.toLocaleString()}/yr)
Blended RAF: ${scores.blendedTotal.toFixed(3)} ($${scores.blendedAnnualRev.toLocaleString()}/yr)
Net Delta: ${scores.deltaRaf >= 0 ? '+' : ''}${scores.deltaRaf.toFixed(3)} ($${scores.deltaRev.toLocaleString()}/yr, ${scores.pctChange}%)
Selected HCCs: ${activeConditions.map((c) => c.id).join(', ')}`,
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
              CMS-HCC v28 vs v24 Risk Adjustment Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-jakarta">
              CMS HCC Risk Adjustment & RAF Score Benchmarker
            </h2>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
              Model patient risk score erosion under the new CMS-HCC v28 risk model. Calculate Medicare Advantage
              capitation revenue differentials, identify disease interaction bonuses, and view MEAT documentation
              defensibility criteria.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={copyReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors shadow-sm"
              title="Copy complete RAF Score audit summary"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Audit Copied!' : 'Copy Audit Summary'}
            </button>
          </div>
        </div>

        {/* Quick Transition Alert */}
        <div className="mt-6 p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">CMS 2025 Transition Note:</strong> For 2025 dates of
            service, CMS utilizes a blended payment model of <strong>67% v28 + 33% v24</strong>. Uncomplicated diabetes
            and CKD Stage 3 have been removed from v28, driving an average <strong>3%–12% RAF score contraction</strong>{' '}
            for practices lacking high-specificity documentation.
          </div>
        </div>
      </div>

      {/* Control Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Demographics & Benchmark Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              1. Patient Demographics
            </h2>

            {/* Age Group */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Age Bracket
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['65–69', '70–74', '75–79', '80–84', '85+'].map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setAgeGroup(range)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      ageGroup === range
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Biological Sex
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['Male', 'Female'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                      gender === g
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual Eligible Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Medicaid Dual Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDualStatus('NonDual')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    dualStatus === 'NonDual'
                      ? 'bg-navy text-white border-navy shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Non-Dual (Community)
                </button>
                <button
                  type="button"
                  onClick={() => setDualStatus('Dual')}
                  className={`px-3 py-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    dualStatus === 'Dual'
                      ? 'bg-navy text-white border-navy shadow-sm'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Full / Partial Dual
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Base demographic weight: <strong className="text-slate-800 font-mono">{demoCoeff.toFixed(3)}</strong>
              </p>
            </div>

            {/* Monthly Benchmark Capitation */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  County Benchmark Rate
                </label>
                <span className="text-xs font-bold font-mono text-emerald-600">
                  ${benchmarkRate.toLocaleString()}/mo
                </span>
              </div>
              <input
                type="range"
                min="800"
                max="1600"
                step="25"
                value={benchmarkRate}
                onChange={(e) => setBenchmarkRate(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>$800/mo (Rural)</span>
                <span>$1,050/mo (National Avg)</span>
                <span>$1,600/mo (Metro)</span>
              </div>
            </div>
          </div>

          {/* RAF Score Differential Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-navy text-white rounded-2xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Risk Score Comparison
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                  scores.deltaRev >= 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {scores.deltaRev >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {scores.deltaRev >= 0 ? '+' : ''}
                {scores.pctChange}% Impact
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-300 font-medium">CMS-HCC v24 (Old)</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{scores.v24Total.toFixed(3)}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  ${scores.v24AnnualRev.toLocaleString()}/yr
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="text-[11px] text-slate-300 font-medium">CMS-HCC v28 (New)</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{scores.v28Total.toFixed(3)}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  ${scores.v28AnnualRev.toLocaleString()}/yr
                </div>
              </div>
            </div>

            {/* 2025 Blended Payment Box */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-emerald-300">
                <span className="font-semibold">2025 Blended Rate (67% v28 / 33% v24):</span>
                <span className="font-bold font-mono text-white">{scores.blendedTotal.toFixed(3)} RAF</span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono">
                ${scores.blendedAnnualRev.toLocaleString()}
                <span className="text-xs font-normal text-slate-300 ml-1">/ patient / yr</span>
              </div>
              <div className="text-[11px] text-slate-300">
                Net model revenue variance:{' '}
                <strong
                  className={scores.deltaRev >= 0 ? 'text-emerald-300 font-mono' : 'text-rose-300 font-mono'}
                >
                  {scores.deltaRev >= 0 ? '+' : ''}${scores.deltaRev.toLocaleString()}
                </strong>{' '}
                per patient annually.
              </div>
            </div>

            {/* Disease Interaction Pills */}
            {diseaseInteractions.labels.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                  Active Disease Interactions
                </div>
                {diseaseInteractions.labels.map((label, idx) => (
                  <div
                    key={idx}
                    className="text-xs bg-white/10 text-slate-200 px-2.5 py-1 rounded-lg flex items-center justify-between"
                  >
                    <span>{label}</span>
                    <span className="font-mono text-emerald-400 text-[11px]">
                      +{(diseaseInteractions.v28Interactions / (diseaseInteractions.labels.length || 1)).toFixed(3)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Columns: Disease Selector & MEAT Guidance */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  2. Select Chronic Clinical Conditions
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check all active chronic conditions substantiated in the medical record.
                </p>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategoryFilter(cat)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                      activeCategoryFilter === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition List Cards */}
            <div className="grid grid-cols-1 gap-3 max-h-[580px] overflow-y-auto pr-1">
              {filteredConditions.map((cond) => {
                const isSelected = selectedConditions.includes(cond.id);
                const isDroppedInV28 = cond.v28Coeff === 0;

                return (
                  <div
                    key={cond.id}
                    onClick={() => toggleCondition(cond.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-50/90 border-emerald-500 ring-1 ring-emerald-500/20 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">{cond.name}</span>
                            <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {cond.icd10Samples}
                            </span>
                            {isDroppedInV28 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Dropped in v28
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{cond.changeNote}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-1">
                        <div className="text-xs">
                          <span className="text-slate-400 mr-1.5 font-medium">v24:</span>
                          <span className="font-mono font-bold text-slate-700">+{cond.v24Coeff.toFixed(3)}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-slate-400 mr-1.5 font-medium">v28:</span>
                          <span
                            className={`font-mono font-bold ${
                              cond.v28Coeff < cond.v24Coeff ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            +{cond.v28Coeff.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* MEAT Criteria Expandable Callout if Selected */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-slate-200/80 bg-white/60 p-3 rounded-lg flex items-start gap-2.5">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-slate-700 leading-relaxed">
                          <strong className="text-slate-900 font-semibold">MEAT Documentation Criteria:</strong>{' '}
                          {cond.meatGuidance}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Value-Based Gap Remediation Playbook */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-navy/5 flex items-center justify-center text-navy font-bold">
            <ShieldCheck className="w-5 h-5 text-navy" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Aethera Clinical Documentation Improvement (CDI) & MEAT Protocol
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              How our dedicated risk adjustment coding pods protect capitated revenue under CMS-HCC v28.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                M
              </span>
              <h4 className="text-sm font-bold text-slate-900">Monitor</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record symptoms, disease stability, vitals, disease progression, and review recent specialist consults or
              diagnostic lab trends.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                E
              </span>
              <h4 className="text-sm font-bold text-slate-900">Evaluate</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review test results, eGFR labs, echocardiogram ejection fractions, spirometry FEV1, and response to ongoing
              treatment regimens.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                A
              </span>
              <h4 className="text-sm font-bold text-slate-900">Assess</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Document explicit clinical status: well-controlled, deteriorating, stable, or poorly controlled with clear
              causal linkages.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-navy text-white text-xs font-bold flex items-center justify-center">
                T
              </span>
              <h4 className="text-sm font-bold text-slate-900">Treat</h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Document specific prescription medication continuation/titration, diet/exercise therapy, or sub-specialist
              referrals.
            </p>
          </div>
        </div>
      </div>

      {/* Free 50-Chart HCC Audit Lead Generation Form */}
      <div className="bg-gradient-to-br from-navy via-slate-900 to-slate-950 text-white rounded-2xl p-6 sm:p-10 shadow-xl">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Complimentary Practice Audit
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Schedule a 50-Chart CMS-HCC v28 Risk Adjustment & Gap Audit
          </h3>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Our certified AAPC CRC coders audit 50 sample Medicare Advantage or ACO charts to identify undocumented
            chronic conditions, verify MEAT criteria defensibility, and recover v28 revenue erosion.
          </p>
        </div>

        {leadSubmitted ? (
          <div className="mt-8 max-w-xl mx-auto p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-white">HCC Audit Request Submitted</h4>
            <p className="text-sm text-slate-300">
              Our Risk Adjustment Practice Director has received your specifications and will deliver your custom 50-chart
              audit protocol within 1 business day.
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
                  placeholder="Dr. Sarah Jenkins"
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
                  placeholder="sjenkins@medicalgroup.com"
                  value={leadEmail}
                  onChange={(e) => setLeadEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Practice / ACO Name</label>
                <input
                  type="text"
                  placeholder="Valley Health Partners"
                  value={leadOrg}
                  onChange={(e) => setLeadOrg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 234-5678"
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
                  Request 50-Chart HCC Risk Adjustment Audit
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-400">
              Zero cost, zero obligation. Strict HIPAA Business Associate Agreement (BAA) executed prior to data review.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
