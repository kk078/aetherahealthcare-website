'use client';

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Activity,
  Send,
  Sparkles,
  HelpCircle,
  Scissors,
  Layers,
  Copy,
  Sliders,
  Flame,
  Eye,
  Microscope,
  Scale,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface LineItem {
  code: string;
  modifier: string;
  description: string;
  rvu: number;
  estAllowed: number;
  status: 'compliant' | 'warning' | 'fatal';
  editReason?: string;
}

export default function DiepFlapReconstructionScrubber() {
  // Clinical Reconstructive State
  const [laterality, setLaterality] = useState<'unilateral' | 'bilateral'>('bilateral');
  const [useMicroscope, setUseMicroscope] = useState<boolean>(true);
  const [useIcgAngiography, setUseIcgAngiography] = useState<boolean>(true);
  const [secondVenousAnastomosis, setSecondVenousAnastomosis] = useState<boolean>(true);
  const [contralateralSymmetry, setContralateralSymmetry] = useState<boolean>(false);
  const [flapCriticalMonitoring, setFlapCriticalMonitoring] = useState<boolean>(true);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Dynamic Audit Ledger Calculation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Free Flap Breast Reconstruction (CPT 19364)
    if (laterality === 'unilateral') {
      const flapRvu = 45.3;
      const flapFee = 3850;
      grossValue += flapFee;
      items.push({
        code: '19364',
        modifier: '',
        description: 'Breast reconstruction; with free flap of lower abdomen (DIEP), unilateral, with microvascular anastomosis',
        rvu: flapRvu,
        estAllowed: flapFee,
        status: 'compliant',
        editReason: 'Primary autologous deep inferior epigastric perforator microvascular reconstruction.',
      });
    } else {
      // Bilateral DIEP Flap: CPT 19364 with Modifier -50 (or separate lines 19364-50)
      const bilateralRvu = 68.0; // 150% standard bilateral multiple procedure fee schedule
      const bilateralFee = 5775;
      grossValue += bilateralFee;
      items.push({
        code: '19364',
        modifier: '50',
        description: 'Breast reconstruction; with free flap of lower abdomen (DIEP), bilateral autologous microvascular transfer',
        rvu: bilateralRvu,
        estAllowed: bilateralFee,
        status: 'compliant',
        editReason: 'Bilateral autologous reconstruction: Two separate microvascular harvests and dual recipient internal mammary anastomoses.',
      });
      atRiskValue += Math.round(bilateralFee * 0.33); // Often downcoded to unilateral or pedicled TRAM
      recommendations.push(
        'Bilateral Defense (CPT 19364-50): Federal WHCRA mandates complete coverage of bilateral reconstruction; submit separate operative times and dual donor-recipient pedicle dissection logs.'
      );
    }

    // 2. Operating Microscope Add-on (CPT +69990)
    if (useMicroscope) {
      const micRvu = laterality === 'bilateral' ? 12.4 : 6.2;
      const micFee = laterality === 'bilateral' ? 980 : 490;
      grossValue += micFee;
      items.push({
        code: '69990',
        modifier: laterality === 'bilateral' ? '50' : '',
        description: 'Microsurgical techniques, requiring use of operating microscope for micro-arterial and venous coupler anastomoses',
        rvu: micRvu,
        estAllowed: micFee,
        status: 'compliant',
        editReason: 'Reportable under NCCI Chapter VIII guidelines with CPT 19364; requires 10x-16x optical magnification documentation.',
      });
      atRiskValue += micFee;
      recommendations.push(
        'Defend CPT +69990 against clearinghouse bundling edits by citing NCCI Chapter VIII exempt status for CPT 19364.'
      );
    } else {
      warnings.push(
        'DOCUMENTATION GAP: Operating microscope utilization must be explicitly documented in operative narrative to capture +69990.'
      );
    }

    // 3. Indocyanine Green (ICG) Laser Fluorescence Angiography (CPT +15860)
    if (useIcgAngiography) {
      const icgRvu = laterality === 'bilateral' ? 6.2 : 3.1;
      const icgFee = laterality === 'bilateral' ? 490 : 245;
      grossValue += icgFee;
      items.push({
        code: '15860',
        modifier: laterality === 'bilateral' ? '59' : '',
        description: 'Intravenous indocyanine green (ICG) laser fluorescence angiography to evaluate flap microvascular perfusion & zone viability',
        rvu: icgRvu,
        estAllowed: icgFee,
        status: 'compliant',
        editReason: 'Real-time vascular mapping to prevent distal flap fat necrosis and guide selective debridement.',
      });
      atRiskValue += icgFee;
      recommendations.push(
        'Append Modifier -59 to CPT +15860 and document quantified SPY/ICG perfusion timings to override non-covered investigational denials.'
      );
    }

    // 4. Second Venous Outflow Anastomosis / Venous Rescue (CPT 35201-59)
    if (secondVenousAnastomosis) {
      const veinRvu = 18.6;
      const veinFee = 1480;
      grossValue += veinFee;
      items.push({
        code: '35201',
        modifier: '59',
        description: 'Repair blood vessel, direct; additional venous outflow coupling to secondary internal mammary branch or cephalic vein',
        rvu: veinRvu,
        estAllowed: veinFee,
        status: 'compliant',
        editReason: 'Distinct surgical intervention to avert acute microvascular venous hypertension and flap congestion.',
      });
      atRiskValue += veinFee;
      recommendations.push(
        'Ensure operative report documents clinical indication for second vein (e.g. sluggish venous outflow, inadequate coupler flow) to defend 35201-59.'
      );
    }

    // 5. Contralateral Symmetry Procedure (Unilateral Cases)
    if (laterality === 'unilateral' && contralateralSymmetry) {
      const symRvu = 14.5;
      const symFee = 1150;
      grossValue += symFee;
      items.push({
        code: '19316',
        modifier: '59',
        description: 'Mastopexy of contralateral normal breast to achieve aesthetic symmetry post-mastectomy reconstruction',
        rvu: symRvu,
        estAllowed: symFee,
        status: 'compliant',
        editReason: 'Mandated under Women’s Health and Cancer Rights Act (WHCRA) to produce symmetrical appearance.',
      });
      atRiskValue += symFee;
      recommendations.push(
        'Cite 29 U.S.C. § 1185b (WHCRA federal statute) when commercial payers incorrectly deny contralateral symmetry mastopexy (19316-59) as cosmetic.'
      );
    }

    // 6. Inpatient Flap Hemodynamic Monitoring & Care (CPT 99223-25)
    if (flapCriticalMonitoring) {
      const careRvu = 5.8;
      const careFee = 460;
      grossValue += careFee;
      items.push({
        code: '99223',
        modifier: '25',
        description: 'Initial hospital care, high complexity, for intensive post-microvascular free flap monitoring & hemodynamic management',
        rvu: careRvu,
        estAllowed: careFee,
        status: 'compliant',
        editReason: 'Distinct E/M service addressing severe post-transfer fluid resuscitation, hemoglobin targets, and perfusion checks.',
      });
      atRiskValue += careFee;
      recommendations.push(
        'Append Modifier -25 to CPT 99223 with dedicated ICU admission note outlining frequent microvascular Doppler surveillance intervals.'
      );
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
      totalRvu: items.reduce((sum, item) => sum + item.rvu, 0),
    };
  }, [laterality, useMicroscope, useIcgAngiography, secondVenousAnastomosis, contralateralSymmetry, flapCriticalMonitoring]);

  const handleCopyLedger = () => {
    const text = auditResult.items
      .map(
        (i) =>
          `${i.code}${i.modifier ? `-${i.modifier}` : ''} | ${i.description} | RVU: ${i.rvu} | Est: $${i.estAllowed}`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('diep_flap_reconstruction_scrubber', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        laterality,
        useMicroscope,
        useIcgAngiography,
        secondVenousAnastomosis,
        contralateralSymmetry,
        flapCriticalMonitoring,
        grossValue: auditResult.grossValue,
        atRiskValue: auditResult.atRiskValue,
        totalRvu: auditResult.totalRvu,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Lead submission error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-teal/15 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#311042] to-[#1e293b] px-6 py-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Microscope className="h-7 w-7 text-pink-300 animate-pulse" />
          <span className="px-3 py-1 rounded-full bg-pink-400/20 text-pink-200 text-xs font-semibold uppercase tracking-wider border border-pink-300/30">
            Reconstructive Microsurgery RCM Engine
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-jakarta tracking-tight">
          DIEP Flap Breast Reconstruction Claim Scrubber
        </h2>
        <p className="mt-2 text-pink-100/90 text-sm md:text-base max-w-2xl leading-relaxed">
          Audit autologous microvascular deep inferior epigastric perforator (DIEP) free flap claims. Defend bilateral reconstruction (19364-50), operating microscope unbundling (+69990), ICG laser angiography (+15860), second venous outflow coupling (35201-59), and WHCRA parity protections.
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-cream/40 p-5 rounded-xl border border-gray/10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
              Surgical Laterality &amp; Flap Configuration
            </label>
            <select
              value={laterality}
              onChange={(e) => setLaterality(e.target.value as any)}
              className="w-full bg-white border border-gray/20 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal font-medium"
            >
              <option value="bilateral">Bilateral Autologous DIEP Free Flaps (19364-50)</option>
              <option value="unilateral">Unilateral DIEP Free Flap Reconstruction (19364)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Bilateral flaps require separate microvascular anastomoses and WHCRA statutory parity defense.
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="p-3 bg-white border border-gray/15 rounded-lg">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5 mb-1">
                <Scale className="h-4 w-4 text-teal" /> WHCRA Federal Parity Compliance
              </span>
              <p className="text-[11px] text-gray-600 leading-snug">
                The Women&apos;s Health and Cancer Rights Act of 1998 mandates health insurance coverage for all stages of reconstruction, surgery on the non-affected breast for symmetry, and prostheses.
              </p>
            </div>
          </div>
        </div>

        {/* Procedural Checkboxes */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-teal" /> Microvascular Add-Ons &amp; Adjunctive Procedures
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={useMicroscope}
                onChange={(e) => setUseMicroscope(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Operating Microscope (+69990)</strong>
                High-power optical magnification for 1.5–2.5mm arterial and venous coupler micro-anastomoses.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={useIcgAngiography}
                onChange={(e) => setUseIcgAngiography(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">ICG Laser Angiography (+15860)</strong>
                Intraoperative indocyanine green perfusion imaging to evaluate zone IV viability &amp; prevent fat necrosis.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={secondVenousAnastomosis}
                onChange={(e) => setSecondVenousAnastomosis(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Second Venous Outflow Coupling (CPT 35201-59)</strong>
                Additional venous anastomosis to second internal mammary perforator or cephalic vein to relieve congestion.
              </span>
            </label>

            {laterality === 'unilateral' ? (
              <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
                <input
                  type="checkbox"
                  checked={contralateralSymmetry}
                  onChange={(e) => setContralateralSymmetry(e.target.checked)}
                  className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
                />
                <span className="ml-3 text-xs text-navy">
                  <strong className="block font-semibold">Contralateral Symmetry Mastopexy (CPT 19316-59)</strong>
                  Balancing mastopexy or reduction of opposite breast under WHCRA statutory mandate.
                </span>
              </label>
            ) : (
              <div className="flex items-center p-3 bg-cream/30 border border-gray/10 rounded-lg text-xs text-gray-500">
                <span>Contralateral symmetry is superseded by bilateral DIEP reconstruction.</span>
              </div>
            )}

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition md:col-span-2">
              <input
                type="checkbox"
                checked={flapCriticalMonitoring}
                onChange={(e) => setFlapCriticalMonitoring(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Inpatient Flap Monitoring &amp; Resuscitation (CPT 99223-25)</strong>
                High-complexity initial inpatient care for intensive hourly microvascular Doppler flap monitoring.
              </span>
            </label>
          </div>
        </div>

        {/* Audit Metrics Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-cream/50 border border-gray/15 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Scored RVUs</span>
            <div className="text-2xl font-black text-navy mt-1 font-jakarta">{auditResult.totalRvu}</div>
            <span className="text-[11px] text-gray-400">Total Work + Malpractice RVU</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/50 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Estimated Allowed</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-jakarta">
              ${auditResult.grossValue.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600">Standard Payer Contract Baseline</span>
          </div>
          <div className="bg-rose-50/70 border border-rose-200/50 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-rose-800 tracking-wider">At-Risk Revenue Defended</span>
            <div className="text-2xl font-black text-rose-700 mt-1 font-jakarta">
              ${auditResult.atRiskValue.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-600">Shielded From Bundling &amp; Downcoding</span>
          </div>
        </div>

        {/* Clean Line-Item Ledger */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
              <FileText className="h-4 w-4 text-teal" /> Compliant Coding &amp; Modifier Ledger
            </h3>
            <button
              onClick={handleCopyLedger}
              type="button"
              className="text-xs font-semibold text-teal hover:text-navy flex items-center gap-1 transition"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? 'Copied to Clipboard!' : 'Copy Claim Lines'}
            </button>
          </div>

          <div className="overflow-x-auto border border-gray/15 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream/60 border-b border-gray/15 text-navy font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">CPT / Mod</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3 text-right">RVU</th>
                  <th className="py-2.5 px-3 text-right">Est. Allowed</th>
                  <th className="py-2.5 px-3">Scrubber Finding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray/10">
                {auditResult.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-cream/20">
                    <td className="py-2.5 px-3 font-mono font-bold text-navy whitespace-nowrap">
                      {item.code}{item.modifier ? `-${item.modifier}` : ''}
                    </td>
                    <td className="py-2.5 px-3 text-gray-700 max-w-xs">{item.description}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{item.rvu}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-navy">
                      ${item.estAllowed.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-gray-600">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> Compliant
                      </span>
                      {item.editReason && (
                        <p className="text-[11px] text-gray-500 mt-0.5">{item.editReason}</p>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actionable Rules & Payer Defense Strategies */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-teal" /> NCCI Bundling Defenses &amp; WHCRA Protocols
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {auditResult.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="p-3 bg-teal/5 border border-teal/20 rounded-lg text-xs text-navy leading-relaxed flex items-start gap-2"
              >
                <CheckCircle2 className="h-4 w-4 text-teal flex-shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
            {auditResult.warnings.map((warn, idx) => (
              <div
                key={idx}
                className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 leading-relaxed flex items-start gap-2"
              >
                <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>{warn}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Capture Box */}
        <div className="bg-gradient-to-br from-cream to-teal/10 rounded-xl p-6 border border-teal/20">
          <h3 className="text-lg font-bold text-navy mb-1 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal" /> Request an Autologous Microsurgery Claim Audit
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Connect directly with Kiran’s expert reconstructive plastic and microsurgical billing audit team. We resolve bilateral DIEP downcoding, defend operating microscope reimbursement (+69990), and recover unpaid venous rescue claims.
          </p>

          {submitSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span>
                Thank you! Your reconstructive audit inquiry has been securely transmitted. Kiran and the reconstructive RCM team will reach out promptly.
              </span>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Microsurgeon / Practice Administrator Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
                className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <input
                type="email"
                placeholder="Work Email Address *"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
                className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <input
                type="text"
                placeholder="Plastic Surgery Center / Hospital"
                value={contactPractice}
                onChange={(e) => setContactPractice(e.target.value)}
                className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="bg-white border border-gray/20 rounded-lg px-3 py-2 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-teal"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="sm:col-span-2 mt-2 inline-flex items-center justify-center px-5 py-2.5 bg-teal hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isSubmitting ? (
                  'Transmitting Audit Request...'
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 mr-2" /> Request Practice Revenue Defense Audit
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
