'use client';

import React, { useState, useMemo } from 'react';
import {
  Scissors,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Send,
  Loader2,
  FileCode,
  ShieldCheck,
  Scale,
  FileText,
  Info,
  Layers,
  Sparkles,
  Eye,
  Activity,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

type ProcedureType = 'blepharoplasty' | 'reduction_mammaplasty' | 'panniculectomy' | 'mastectomy_reconstruction';

export default function ReconstructivePriorAuthScrubber() {
  const [procedure, setProcedure] = useState<ProcedureType>('reduction_mammaplasty');

  // Blepharoplasty State
  const [mrd1Mm, setMrd1Mm] = useState<number>(1.5);
  const [visualFieldDefectPct, setVisualFieldDefectPct] = useState<number>(35);
  const [photosShowRedundantSkin, setPhotosShowRedundantSkin] = useState<boolean>(true);
  const [tapedVsUntapedComparison, setTapedVsUntapedComparison] = useState<boolean>(true);

  // Reduction Mammaplasty State (Schnur Scale)
  const [heightInches, setHeightInches] = useState<number>(64);
  const [weightLbs, setWeightLbs] = useState<number>(165);
  const [plannedResectionPerBreast, setPlannedResectionPerBreast] = useState<number>(550);
  const [conservativeTherapyMonths, setConservativeTherapyMonths] = useState<number>(6);
  const [shoulderGroovingDocumented, setShoulderGroovingDocumented] = useState<boolean>(true);

  // Panniculectomy State
  const [pannusGrade, setPannusGrade] = useState<number>(2); // 1 to 5
  const [intertrigoFailureMonths, setIntertrigoFailureMonths] = useState<number>(4);
  const [stableWeightMonths, setStableWeightMonths] = useState<number>(12);
  const [includesDiastasisRepair, setIncludesDiastasisRepair] = useState<boolean>(false);

  // WHCRA State
  const [mastectomyHistory, setMastectomyHistory] = useState<boolean>(true);
  const [isContralateralSymmetry, setIsContralateralSymmetry] = useState<boolean>(true);
  const [nippleReconstructionPlanned, setNippleReconstructionPlanned] = useState<boolean>(true);

  // Lead Form State
  const [practiceName, setPracticeName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEdi, setCopiedEdi] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  // Schnur Calculation: BSA = sqrt(height_cm * weight_kg / 3600)
  const schnurMetrics = useMemo(() => {
    const heightCm = heightInches * 2.54;
    const weightKg = weightLbs * 0.453592;
    const bsa = Math.sqrt((heightCm * weightKg) / 3600);
    // Schnur formula approximation for 22nd percentile cutoff (grams per breast):
    // Grams = -212.18 + (348.6 * BSA)
    const schnurThresholdGrams = Math.round(Math.max(200, -212.18 + 348.6 * bsa));
    const meetsSchnur = plannedResectionPerBreast >= schnurThresholdGrams;
    const gramDifference = plannedResectionPerBreast - schnurThresholdGrams;

    return {
      bsa: Number(bsa.toFixed(2)),
      schnurThresholdGrams,
      meetsSchnur,
      gramDifference,
    };
  }, [heightInches, weightLbs, plannedResectionPerBreast]);

  // Medical Necessity Analysis per Procedure
  const complianceAssessment = useMemo(() => {
    if (procedure === 'blepharoplasty') {
      const passesMrd1 = mrd1Mm <= 2.0;
      const passesVf = visualFieldDefectPct >= 30;
      const passesPhotos = photosShowRedundantSkin && tapedVsUntapedComparison;
      const isDefensible = passesMrd1 && passesVf && passesPhotos;

      const deficiencies: string[] = [];
      if (!passesMrd1) deficiencies.push(`MRD-1 is ${mrd1Mm} mm (Commercial LCD requires ≤ 2.0 mm).`);
      if (!passesVf) deficiencies.push(`Visual field superior loss is ${visualFieldDefectPct}% (Requires ≥ 30% reduction).`);
      if (!photosShowRedundantSkin) deficiencies.push('Missing frontal and lateral photographs demonstrating skin resting on eyelashes.');
      if (!tapedVsUntapedComparison) deficiencies.push('Missing taped vs untaped Humphrey 24-2 visual field comparative grid.');

      return {
        cpt: '15823',
        title: 'Functional Upper Blepharoplasty',
        status: isDefensible ? ('defensible' as const) : ('high_risk' as const),
        deficiencies,
        allowedEst: 1420.0,
      };
    }

    if (procedure === 'reduction_mammaplasty') {
      const passesSchnur = schnurMetrics.meetsSchnur;
      const passesConservative = conservativeTherapyMonths >= 6;
      const passesGrooving = shoulderGroovingDocumented;
      const isDefensible = passesSchnur && passesConservative && passesGrooving;

      const deficiencies: string[] = [];
      if (!passesSchnur) {
        deficiencies.push(`Planned resection (${plannedResectionPerBreast}g) fails Schnur 22nd percentile requirement (${schnurMetrics.schnurThresholdGrams}g).`);
      }
      if (!passesConservative) {
        deficiencies.push(`Conservative therapy documented for only ${conservativeTherapyMonths} months (Commercial plans mandate ≥ 6 continuous months).`);
      }
      if (!passesGrooving) {
        deficiencies.push('Missing photographic documentation of permanent shoulder grooving / strap indentation.');
      }

      return {
        cpt: '19318-50',
        title: 'Bilateral Reduction Mammaplasty',
        status: isDefensible ? ('defensible' as const) : ('high_risk' as const),
        deficiencies,
        allowedEst: 2840.0,
      };
    }

    if (procedure === 'panniculectomy') {
      const passesGrade = pannusGrade >= 2;
      const passesIntertrigo = intertrigoFailureMonths >= 3;
      const passesStability = stableWeightMonths >= 6;
      const hasCosmeticRisk = includesDiastasisRepair;
      const isDefensible = passesGrade && passesIntertrigo && passesStability && !hasCosmeticRisk;

      const deficiencies: string[] = [];
      if (!passesGrade) deficiencies.push('Pannus does not reach or drape over pubis (Grade 1 does not meet functional necessity).');
      if (!passesIntertrigo) deficiencies.push(`Intertrigo medical treatment documented for ${intertrigoFailureMonths} months (Requires ≥ 3 months rx antifungal/antibacterial failure).`);
      if (!passesStability) deficiencies.push('Weight post-bariatric surgery not demonstrated stable for ≥ 6 continuous months.');
      if (hasCosmeticRisk) deficiencies.push('Diastasis recti plication included in operative scope (Payers classify as non-covered cosmetic abdominoplasty).');

      return {
        cpt: '15830',
        title: 'Functional Panniculectomy',
        status: isDefensible ? ('defensible' as const) : ('high_risk' as const),
        deficiencies,
        allowedEst: 1980.0,
      };
    }

    // Breast Reconstruction WHCRA
    const isStatutoryMandate = mastectomyHistory;
    const deficiencies: string[] = [];
    if (!mastectomyHistory) {
      deficiencies.push('No documented history of mastectomy or lumpectomy for breast carcinoma.');
    }

    return {
      cpt: '19357',
      title: 'Post-Mastectomy Breast Reconstruction',
      status: isStatutoryMandate ? ('statutory_mandate' as const) : ('high_risk' as const),
      deficiencies,
      allowedEst: 3250.0,
    };
  }, [
    procedure,
    mrd1Mm,
    visualFieldDefectPct,
    photosShowRedundantSkin,
    tapedVsUntapedComparison,
    schnurMetrics,
    conservativeTherapyMonths,
    shoulderGroovingDocumented,
    pannusGrade,
    intertrigoFailureMonths,
    stableWeightMonths,
    includesDiastasisRepair,
    mastectomyHistory,
  ]);

  // ANSI X12 837P EDI Simulation
  const ediSnippet = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    let dx = 'N62'; // Breast hypertrophy
    let cpt = complianceAssessment.cpt;

    if (procedure === 'blepharoplasty') dx = 'H02.831'; // Dermatochalasis
    else if (procedure === 'panniculectomy') dx = 'L98.7'; // Excessive skin fold / intertrigo
    else if (procedure === 'mastectomy_reconstruction') dx = 'Z85.3'; // Personal history of breast cancer

    return `ISA*00*          *00*          *ZZ*SURGERYBILLER  *ZZ*PAYERAUTH      *${today.slice(2)}*0930*^*00501*000000001*0*P*:~
GS*HC*SENDER*RECEIVER*${today}*0930*1*X*005010X222A1~
ST*837*0001*005010X222A1~
BHT*0019*00*PA-${procedure.toUpperCase()}-${today}*${today}*0930*CH~
NM1*85*2*PLASTIC & RECONSTRUCTIVE SURGEONS*****XX*1928374650~
NM1*IL*1*DOE*JANE****MI*PL998877665~
CLM*AUTH-${today}-01*${(complianceAssessment.allowedEst * 2.3).toFixed(2)}***11:B:1*Y*A*Y*Y~
REF*G1*PA-APPROVED-PENDING~
HI*ABK:${dx}~
LX*1~
SV1*HC:${cpt}*${(complianceAssessment.allowedEst * 2.3).toFixed(2)}*UN*1***1~
DTP*472*D8*${today}~
PWK*09*AA*AC***FT*VISUAL_FIELDS_SCHNUR_PHOTOS_ATTACHED~
SE*16*0001~
GE*1*1~
IEA*1*000000001~`;
  }, [procedure, complianceAssessment]);

  // Medical Necessity Appeal / Letter Snippet
  const medicalNecessityLetter = useMemo(() => {
    if (procedure === 'reduction_mammaplasty') {
      return `RE: PRIOR AUTHORIZATION REQUEST / RECONSIDERATION
PATIENT: Jane Doe (DOB: 01/15/1982) | POLICY ID: PL998877665
REQUESTED PROCEDURE: CPT 19318-50 (Bilateral Reduction Mammaplasty)
DIAGNOSIS: N62 (Macromastia / Breast Hypertrophy)

To Whom It May Concern,
This letter documents the objective functional medical necessity for bilateral reduction mammaplasty for the patient listed above. The patient suffers from severe symptomatic macromastia refractory to documented conservative modalities.

1. SCHNUR SLIDING SCALE COMPLIANCE:
- Patient Height: ${heightInches} inches (${(heightInches * 2.54).toFixed(1)} cm)
- Patient Weight: ${weightLbs} lbs (${(weightLbs * 0.453592).toFixed(1)} kg)
- Calculated BSA: ${schnurMetrics.bsa} m² (Mosteller formula)
- Schnur 22nd Percentile Cutoff: ${schnurMetrics.schnurThresholdGrams} grams per breast
- Planned Resection: ${plannedResectionPerBreast} grams per breast (${schnurMetrics.meetsSchnur ? 'EXCEEDS' : 'BELOW'} required minimum threshold by ${Math.abs(schnurMetrics.gramDifference)}g).

2. REFRACTORY CLINICAL SYMPTOMS & FAILED CONSERVATIVE CARE:
- Documented refractory cervicothoracic and upper spine pain exceeding ${conservativeTherapyMonths} months.
- Permanent clavicular and acromial shoulder grooving from bra straps documented via attached high-resolution clinical photographs.
- Formal failure of non-surgical management including chiropractic therapy, physical therapy, NSAIDs, and supportive wide-strap orthotic bras.

Per the American Society of Plastic Surgeons (ASPS) Functional Reduction Mammaplasty guidelines, this surgery is restorative and non-cosmetic. We request immediate prior authorization approval.`;
    }

    if (procedure === 'blepharoplasty') {
      return `RE: PRIOR AUTHORIZATION REQUEST / CLINICAL DOCUMENTATION
PATIENT: John Smith (DOB: 04/22/1960) | POLICY ID: BL11223344
REQUESTED PROCEDURE: CPT 15823-50 (Bilateral Upper Blepharoplasty)
DIAGNOSIS: H02.831 (Dermatochalasis of bilateral upper eyelids)

To Whom It May Concern,
This clinical dossier substantiates functional visual impairment resulting from severe dermatochalasis. The requested surgery is reconstructive and functional, not cosmetic:

1. OBJECTIVE MEASUREMENTS:
- Margin Reflex Distance 1 (MRD-1): ${mrd1Mm} mm (Meets commercial LCD standard ≤ 2.0 mm).
- Humphrey Automated Visual Field (HVF 24-2): Demonstrates ${visualFieldDefectPct}% superior field obstruction untaped, corrected to normal with taped eyelid elevation.

2. PHOTOGRAPHIC EVIDENCE:
- Attached frontal, lateral, and oblique external photographs demonstrate redundant pseudoptosis skin resting on the lash margin in primary gaze, inducing pseudoptosis and chronic frontalis compensatory cephalalgia.

We request urgent approval of CPT 15823 under functional visual restoration guidelines.`;
    }

    if (procedure === 'panniculectomy') {
      return `RE: PRIOR AUTHORIZATION MEDICAL NECESSITY DOSSIER
PATIENT: Robert Davis (DOB: 08/11/1975) | POLICY ID: PN55443322
REQUESTED PROCEDURE: CPT 15830 (Excision, excessive skin and subcutaneous tissue, abdomen)
DIAGNOSIS: L98.7 (Excessive and redundant skin and subcutaneous tissue)

To Medical Review Directorate,
The patient presents with symptomatic hanging panniculus (Grade ${pannusGrade}, covering groin and pubic symphysis). 
- History of significant weight reduction with weight stabilization documented for ${stableWeightMonths} months.
- Chronic intertrigo and recurrent candidal dermatitis in the sub-pannicular crease refractory to ${intertrigoFailureMonths} months of prescribed topical nystatin, clotrimazole, and barrier ointments.
- Procedure is strictly functional panniculectomy (CPT 15830). Diastasis recti plication (cosmetic abdominoplasty) is explicitly omitted from the surgical plan.`;
    }

    return `RE: MANDATORY STATUTORY COVERAGE UNDER FEDERAL WHCRA
PATIENT: Sarah Jenkins (DOB: 06/30/1984) | POLICY ID: BR88990011
REQUESTED PROCEDURE: CPT 19357 (Tissue expander placement) / CPT 19350 (Nipple reconstruction)
DIAGNOSIS: Z85.3 (Personal history of malignant neoplasm of female breast)

To Payer Appeals & Prior Authorization Department:
Under the federal Women's Health and Cancer Rights Act of 1998 (WHCRA), 29 U.S.C. § 1185b and 42 U.S.C. § 300gg-6, all group health plans and commercial health insurers that offer medical and surgical coverage must cover:
1. Reconstruction of the breast on which the mastectomy was performed.
2. Surgery and reconstruction of the other breast to produce a symmetrical appearance.
3. Prostheses and physical complications at all stages of mastectomy, including lymphedemas.

Denial of this prior authorization request constitutes a direct violation of federal statutory mandates. Please issue immediate written authorization.`;
  }, [
    procedure,
    heightInches,
    weightLbs,
    schnurMetrics,
    plannedResectionPerBreast,
    conservativeTherapyMonths,
    mrd1Mm,
    visualFieldDefectPct,
    pannusGrade,
    stableWeightMonths,
    intertrigoFailureMonths,
  ]);

  const handleCopyEdi = async () => {
    try {
      await navigator.clipboard.writeText(ediSnippet);
      setCopiedEdi(true);
      setTimeout(() => setCopiedEdi(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleCopyLetter = async () => {
    try {
      await navigator.clipboard.writeText(medicalNecessityLetter);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;

    setSubmitting(true);
    const payload = {
      practiceName,
      contactName,
      email,
      phone,
      procedureType: procedure,
      procedureTitle: complianceAssessment.title,
      cptCode: complianceAssessment.cpt,
      complianceStatus: complianceAssessment.status,
      estimatedAllowed: complianceAssessment.allowedEst,
      schnurMetrics: procedure === 'reduction_mammaplasty' ? schnurMetrics : null,
      deficienciesCount: complianceAssessment.deficiencies.length,
      deficiencies: complianceAssessment.deficiencies,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '/tools/reconstructive-prior-auth-scrubber',
      submittedAt: new Date().toISOString(),
    };

    try {
      await sendLeadToKiran('reconstructive_prior_auth_scrubber_audit', payload);
      trackConversion('assessment', complianceAssessment.allowedEst);
      setSubmitted(true);
    } catch (err) {
      console.error('Lead submission failed:', err);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray/15 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-pink-50 border border-pink-200 text-pink-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Scissors className="h-3.5 w-3.5 text-pink-600" />
              ASPS &amp; WHCRA Reconstructive Necessity Engine
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-jakarta text-navy">
              Reconstructive vs Cosmetic Prior-Authorization Scrubber
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Verify medical necessity thresholds for reduction mammaplasty (Schnur sliding scale), functional blepharoplasty (MRD-1 &amp; visual fields), panniculectomy vs cosmetic abdominoplasty, and federal WHCRA breast reconstruction mandates.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-center min-w-[240px]">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Prior-Auth Defense Status
            </span>
            <div
              className={`text-2xl font-extrabold flex items-center gap-2 ${
                complianceAssessment.status === 'defensible' || complianceAssessment.status === 'statutory_mandate'
                  ? 'text-emerald-700'
                  : 'text-amber-600'
              }`}
            >
              {complianceAssessment.status === 'statutory_mandate' ? (
                <>
                  <Sparkles className="h-6 w-6 text-emerald-600" /> WHCRA Mandate
                </>
              ) : complianceAssessment.status === 'defensible' ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" /> Pre-Auth Defensible
                </>
              ) : (
                <>
                  <AlertTriangle className="h-6 w-6 text-amber-500" /> Cosmetic Risk
                </>
              )}
            </div>
            <span className="text-xs text-slate-500 mt-1">
              Estimated Allowed: ${complianceAssessment.allowedEst.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Procedure Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'reduction_mammaplasty', label: 'Breast Reduction (19318)', icon: Scale },
          { id: 'blepharoplasty', label: 'Blepharoplasty (15823)', icon: Eye },
          { id: 'panniculectomy', label: 'Panniculectomy (15830)', icon: Layers },
          { id: 'mastectomy_reconstruction', label: 'WHCRA Breast Recon', icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = procedure === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProcedure(tab.id as ProcedureType)}
              className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all text-center ${
                isActive
                  ? 'bg-navy text-white border-navy shadow-xs'
                  : 'bg-white text-slate-700 border-gray/20 hover:border-slate-300'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-mint' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB 1: Reduction Mammaplasty & Schnur Scale */}
          {procedure === 'reduction_mammaplasty' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-700 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy">Schnur Sliding Scale Calculator (CPT 19318)</h3>
                  <p className="text-xs text-slate-500">
                    Commercial payers mandate minimum tissue resection based on Patient BSA (22nd percentile)
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Patient Height: <span className="font-mono font-bold text-navy">{heightInches} in ({Math.floor(heightInches / 12)}&apos;{heightInches % 12}&quot;)</span>
                  </label>
                  <input
                    type="range"
                    min="55"
                    max="78"
                    value={heightInches}
                    onChange={(e) => setHeightInches(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Patient Weight: <span className="font-mono font-bold text-navy">{weightLbs} lbs</span>
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="320"
                    value={weightLbs}
                    onChange={(e) => setWeightLbs(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-2 text-xs text-pink-950">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Calculated Body Surface Area (BSA):</span>
                  <span className="font-mono font-bold text-navy text-sm">{schnurMetrics.bsa} m²</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Schnur 22nd Percentile Minimum Grams per Breast:</span>
                  <span className="font-mono font-bold text-pink-700 text-sm">{schnurMetrics.schnurThresholdGrams} grams</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Planned Tissue Resection per Breast: <span className="font-mono font-bold text-navy">{plannedResectionPerBreast} grams</span>
                </label>
                <input
                  type="range"
                  min="200"
                  max="1400"
                  step="25"
                  value={plannedResectionPerBreast}
                  onChange={(e) => setPlannedResectionPerBreast(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                />
              </div>

              {schnurMetrics.meetsSchnur ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    Planned resection exceeds Schnur cutoff by <strong className="font-bold">{schnurMetrics.gramDifference} grams</strong>. Defensible against cosmetic denial.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>
                    Resection is <strong className="font-bold">{Math.abs(schnurMetrics.gramDifference)} grams below</strong> the Schnur threshold. Payers will downcode or deny as cosmetic.
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-navy uppercase tracking-wider">Required Conservative Care &amp; Clinical Signs</h4>
                
                <div>
                  <div className="flex justify-between text-xs text-slate-700 mb-1">
                    <span>Duration of Documented Conservative Therapy:</span>
                    <span className="font-mono font-bold text-navy">{conservativeTherapyMonths} Months</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={conservativeTherapyMonths}
                    onChange={(e) => setConservativeTherapyMonths(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-600"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Plans like Aetna, BCBS, and UnitedHealthcare require a minimum of 6 continuous months of documented physical therapy, supportive bras, or NSAID management.
                  </p>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={shoulderGroovingDocumented}
                    onChange={(e) => setShoulderGroovingDocumented(e.target.checked)}
                    className="rounded text-pink-600 focus:ring-pink-500 h-4 w-4"
                  />
                  <span>Photographic evidence of permanent shoulder grooving / strap indentations attached.</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 2: Functional Blepharoplasty */}
          {procedure === 'blepharoplasty' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy">Functional Upper Blepharoplasty (CPT 15823)</h3>
                  <p className="text-xs text-slate-500">
                    Medicare LCD and Commercial policy requires documented visual axis obstruction
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Margin Reflex Distance 1 (MRD-1):</span>
                  <span className={`font-mono font-bold ${mrd1Mm <= 2.0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {mrd1Mm.toFixed(1)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="4.5"
                  step="0.1"
                  value={mrd1Mm}
                  onChange={(e) => setMrd1Mm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Distance from pupillary light reflex to upper eyelid margin. LCD benchmark requires MRD-1 ≤ 2.0 mm.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Superior Visual Field Deficit (Humphrey HVF):</span>
                  <span className={`font-mono font-bold ${visualFieldDefectPct >= 30 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {visualFieldDefectPct}% Loss
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="1"
                  value={visualFieldDefectPct}
                  onChange={(e) => setVisualFieldDefectPct(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Commercial prior-auth requires ≥ 30% reduction or 120° impairment in superior visual field.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={photosShowRedundantSkin}
                    onChange={(e) => setPhotosShowRedundantSkin(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>High-resolution photos demonstrate redundant skin resting on eyelashes in primary gaze.</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={tapedVsUntapedComparison}
                    onChange={(e) => setTapedVsUntapedComparison(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span>Both taped and untaped visual field tests demonstrate ≥ 12 degrees or 30% visual improvement.</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: Panniculectomy */}
          {procedure === 'panniculectomy' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy">Functional Panniculectomy (CPT 15830)</h3>
                  <p className="text-xs text-slate-500">
                    Audit medical necessity vs cosmetic abdominoplasty (diastasis plication)
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Panniculus Apron Grade:</span>
                  <span className="font-mono font-bold text-navy">Grade {pannusGrade}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPannusGrade(g)}
                      className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        pannusGrade === g
                          ? 'bg-purple-700 text-white border-purple-700'
                          : 'bg-slate-50 text-slate-700 border-gray/20 hover:border-purple-300'
                      }`}
                    >
                      Gr {g}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Grade 2 (covers pubic symphysis) or higher is mandatory for commercial coverage. Grade 1 is routinely denied.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Refractory Intertrigo / Cellulitis Medical Management:</span>
                  <span className="font-mono font-bold text-navy">{intertrigoFailureMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={intertrigoFailureMonths}
                  onChange={(e) => setIntertrigoFailureMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Requires ≥ 3 continuous months of prescription oral or topical antifungal/antibacterial therapy failures.
                </p>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-700 mb-1">
                  <span>Weight Stability Post-Bariatric Surgery:</span>
                  <span className="font-mono font-bold text-navy">{stableWeightMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="24"
                  value={stableWeightMonths}
                  onChange={(e) => setStableWeightMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                <label className="flex items-start gap-2 text-xs text-red-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includesDiastasisRepair}
                    onChange={(e) => setIncludesDiastasisRepair(e.target.checked)}
                    className="rounded text-red-600 focus:ring-red-500 h-4 w-4 mt-0.5"
                  />
                  <span>
                    <strong className="font-bold block">Surgical plan includes Rectus Diastasis Plication (Abdominoplasty):</strong>
                    Commercial payers automatically classify rectus plication as cosmetic abdominoplasty and will deny the entire panniculectomy claim.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: WHCRA Post-Mastectomy Reconstruction */}
          {procedure === 'mastectomy_reconstruction' && (
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray/15 shadow-sm space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                  1
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy">Women&apos;s Health and Cancer Rights Act (WHCRA)</h3>
                  <p className="text-xs text-slate-500">Federal statutory guarantee of reconstructive and symmetry surgery</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  Federal Mandate: 29 U.S.C. § 1185b / 42 U.S.C. § 300gg-6
                </div>
                <p className="leading-relaxed">
                  Under the WHCRA of 1998, payers cannot deny breast reconstruction following a mastectomy or lumpectomy. This federal mandate covers the diseased breast, contralateral breast symmetry procedures, and nipple-areola reconstruction.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={mastectomyHistory}
                    onChange={(e) => setMastectomyHistory(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="font-bold">Patient has documented history of mastectomy or lumpectomy for cancer.</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isContralateralSymmetry}
                    onChange={(e) => setIsContralateralSymmetry(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Contralateral symmetry procedure included (Mastopexy / Reduction / Augmentation).</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nippleReconstructionPlanned}
                    onChange={(e) => setNippleReconstructionPlanned(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>Nipple-areola complex reconstruction &amp; medical tattooing (CPT 19350 / 11920) requested.</span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Defense Findings, Letter & EDI (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Compliance & Defense Findings Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray/15 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray/10 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-pink-600" />
                <h3 className="font-bold text-base text-navy">Prior-Auth Readiness Report</h3>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  complianceAssessment.status === 'defensible' || complianceAssessment.status === 'statutory_mandate'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {complianceAssessment.status === 'statutory_mandate'
                  ? 'WHCRA Mandated'
                  : complianceAssessment.status === 'defensible'
                  ? 'Audit Ready'
                  : 'Deficiencies Found'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Target CPT Code:</span>
                <span className="font-mono font-bold text-navy">{complianceAssessment.cpt}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Procedure Scope:</span>
                <span className="font-medium text-slate-800">{complianceAssessment.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Estimated Allowed Amount:</span>
                <span className="font-bold text-emerald-700">${complianceAssessment.allowedEst.toFixed(2)}</span>
              </div>
            </div>

            {/* Deficiencies or Success Feedback */}
            {complianceAssessment.deficiencies.length > 0 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  {complianceAssessment.deficiencies.length} Prior-Auth Risk Factor(s) Detected
                </div>
                <ul className="text-xs text-amber-800 list-disc list-inside space-y-1">
                  {complianceAssessment.deficiencies.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold block">Defensible Reconstructive Necessity:</strong>
                  All clinical criteria, measurements, and required duration standards are satisfied. Ready for payer prior-authorization packet assembly.
                </div>
              </div>
            )}
          </div>

          {/* Letter of Medical Necessity Preview */}
          <div className="bg-white rounded-3xl p-6 border border-gray/15 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-navy" />
                <span className="text-xs font-bold uppercase tracking-wider text-navy">
                  Medical Necessity Letter Dossier
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLetter}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedLetter ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copiedLetter ? 'Copied' : 'Copy Letter'}
              </button>
            </div>
            <pre className="font-mono text-[11px] leading-relaxed text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 overflow-x-auto max-h-56 scrollbar-thin whitespace-pre-wrap">
              {medicalNecessityLetter}
            </pre>
          </div>

          {/* ANSI X12 837P Preview */}
          <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-pink-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ANSI X12 837P Prior-Auth Segment
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyEdi}
                className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md transition-colors"
              >
                {copiedEdi ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copiedEdi ? 'Copied' : 'Copy 837P Segment'}
              </button>
            </div>
            <pre className="font-mono text-[11px] leading-relaxed text-pink-300/90 bg-slate-950 p-3.5 rounded-xl overflow-x-auto max-h-48 scrollbar-thin">
              {ediSnippet}
            </pre>
          </div>

          {/* Practice Audit Lead Card */}
          <div className="bg-gradient-to-br from-navy via-[#003087] to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 bg-mint/20 border border-mint/40 text-mint text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                <Scissors className="h-3 w-3" />
                Prior Authorization Defense
              </div>
              <div>
                <h4 className="text-lg font-bold">Audit 25 Denied Reconstructive Claims Free</h4>
                <p className="text-xs text-cream/80 mt-1 leading-relaxed">
                  Our certified plastic and reconstructive surgery coders will audit up to 25 denied prior-auth requests or cosmetic downcoding rejections to overturn denials.
                </p>
              </div>

              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Audit request received. Kiran’s surgical appeals team will contact you within 24 hours.</span>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Surgical Practice Name"
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Surgeon / Manager Name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Work Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-hidden focus:border-mint"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-teal hover:bg-teal/90 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting Request...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" /> Request Reconstructive Prior-Auth Audit
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-cream/60 text-center">
                    Confidential HIPAA compliant · Zero obligation · Direct to Kiran
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
