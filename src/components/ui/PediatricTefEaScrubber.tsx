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
  Baby,
  Layers,
  Copy,
  Sliders,
  Scissors,
  Flame,
  Stethoscope,
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

export default function PediatricTefEaScrubber() {
  // Clinical Classification & Procedural State
  const [grossType, setGrossType] = useState<'typeC' | 'typeA' | 'typeE' | 'typeB' | 'typeD'>('typeC');
  const [surgicalApproach, setSurgicalApproach] = useState<'thoracotomy' | 'thoracoscopic' | 'cervical'>('thoracotomy');
  const [fokerStagedElongation, setFokerStagedElongation] = useState<boolean>(false);
  const [rigidBronchoscopy, setRigidBronchoscopy] = useState<boolean>(true);
  const [gastrostomyTube, setGastrostomyTube] = useState<boolean>(true);
  const [lowBirthWeightComplex, setLowBirthWeightComplex] = useState<boolean>(true);
  const [neonatalCriticalCare, setNeonatalCriticalCare] = useState<boolean>(true);

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

    // 1. Primary Esophagoplasty & Fistula Repair
    let primaryCode = '43312';
    let primaryDesc = 'Esophagoplasty, thoracic approach; with repair of tracheoesophageal fistula (primary end-to-end anastomosis)';
    let primaryRvu = 42.6;
    let primaryFee = 3280;

    if (grossType === 'typeE' || surgicalApproach === 'cervical') {
      primaryCode = '43305';
      primaryDesc = 'Esophagoplasty, cervical approach; with repair of tracheoesophageal fistula (H-type TEF ligation)';
      primaryRvu = 31.4;
      primaryFee = 2420;
    } else if (grossType === 'typeA' && !fokerStagedElongation) {
      primaryCode = '43314';
      primaryDesc = 'Esophagoplasty, thoracic approach; with colon segment or bowel interposition for long-gap esophageal atresia';
      primaryRvu = 54.8;
      primaryFee = 4220;
    } else if (fokerStagedElongation) {
      primaryCode = '43312';
      primaryDesc = 'Esophagoplasty, thoracic approach; delayed primary anastomosis following internal Foker traction elongation [Modifier -58]';
      primaryRvu = 42.6;
      primaryFee = 3280;
    }

    const primaryModifier = fokerStagedElongation
      ? '58'
      : lowBirthWeightComplex && surgicalApproach === 'thoracoscopic'
      ? '22'
      : lowBirthWeightComplex
      ? '22'
      : '';

    if (primaryModifier === '22') {
      primaryFee = Math.round(primaryFee * 1.25);
      primaryRvu = Number((primaryRvu * 1.25).toFixed(1));
    }

    grossValue += primaryFee;
    items.push({
      code: primaryCode,
      modifier: primaryModifier,
      description: primaryDesc,
      rvu: primaryRvu,
      estAllowed: primaryFee,
      status: 'compliant',
      editReason: fokerStagedElongation
        ? 'Staged surgical session during post-operative global period for traction-assisted elongation.'
        : primaryModifier === '22'
        ? 'Modifier -22 warranted: extreme neonatal fragility (<2.5kg), delicate carina fistula dissection, or thoracoscopy.'
        : 'Primary neonatal TEF/EA surgical reconstruction benchmarked to anatomical gross classification.',
    });

    if (primaryModifier === '22') {
      atRiskValue += Math.round(primaryFee * 0.2);
      recommendations.push(
        'Modifier -22 Defense: Submit comprehensive operative report detailing >50% increase in dissection time, infant birth weight <2.5 kg, and proximity to carina.'
      );
    }

    // 2. Pre-Repair Diagnostic Rigid Bronchoscopy (CPT 31622-59)
    if (rigidBronchoscopy) {
      const bronchRvu = 4.8;
      const bronchFee = 385;
      grossValue += bronchFee;
      items.push({
        code: '31622',
        modifier: '59',
        description: 'Diagnostic rigid tracheobronchoscopy to inspect subglottic airway and locate proximal fistula orifice',
        rvu: bronchRvu,
        estAllowed: bronchFee,
        status: 'compliant',
        editReason: 'Distinct diagnostic airway evaluation performed prior to thoracic surgical incision; unbundled with Modifier -59/-XU.',
      });
      atRiskValue += bronchFee;
      recommendations.push(
        'Append Modifier -59 or -XU to CPT 31622 to prevent NCCI Chapter VI bundling into thoracic esophagoplasty (43312).'
      );
    } else {
      warnings.push(
        'CLINICAL ADVISORY: Diagnostic rigid bronchoscopy is vital to rule out double proximal fistulae (Type D) which occur in 1-2% of cases.'
      );
    }

    // 3. Gastrostomy Tube Enteral Decompression (CPT 43653-59 or 43830-59)
    if (gastrostomyTube) {
      const gastrostomyRvu = 12.9;
      const gastrostomyFee = 995;
      grossValue += gastrostomyFee;
      items.push({
        code: '43653',
        modifier: '59',
        description: 'Laparoscopic or separate open incision gastrostomy tube placement for neonatal gastric decompression and enteral feeding',
        rvu: gastrostomyRvu,
        estAllowed: gastrostomyFee,
        status: 'compliant',
        editReason: 'Separate anatomical cavity and incision (abdominal vs thoracic); reported with Modifier -59 to override edit.',
      });
      atRiskValue += gastrostomyFee;
      recommendations.push(
        'Ensure operative notes document separate abdominal skin prep, draping, and distinct abdominal entry to defend G-tube placement (43653-59).'
      );
    }

    // 4. Critical Care / Resuscitation (CPT 99291-25)
    if (neonatalCriticalCare) {
      const ccRvu = 8.8;
      const ccFee = 680;
      grossValue += ccFee;
      items.push({
        code: '99291',
        modifier: '25',
        description: 'Critical care, evaluation and management of the critically ill neonatal patient; first 30-74 minutes pre/post-op',
        rvu: ccRvu,
        estAllowed: ccFee,
        status: 'compliant',
        editReason: 'Distinct significant medical management of high-risk neonatal hemodynamics, ventilatory failure, and fluid shift.',
      });
      atRiskValue += ccFee;
      recommendations.push(
        'Append Modifier -25 to CPT 99291. Confirm physician critical care time excludes surgical operative time and procedural sedation.'
      );
    }

    // Additional cross-checks & warnings
    if (fokerStagedElongation && primaryModifier !== '58') {
      warnings.push(
        'GLOBAL PERIOD TRAP: Staged traction procedures during post-op global period will trigger 100% denial without Modifier -58.'
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
  }, [grossType, surgicalApproach, fokerStagedElongation, rigidBronchoscopy, gastrostomyTube, lowBirthWeightComplex, neonatalCriticalCare]);

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
      await sendLeadToKiran('pediatric_tef_ea_scrubber', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        grossType,
        surgicalApproach,
        fokerStagedElongation,
        rigidBronchoscopy,
        gastrostomyTube,
        lowBirthWeightComplex,
        neonatalCriticalCare,
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
      <div className="bg-gradient-to-r from-[#0d3b66] via-[#004b49] to-[#002828] px-6 py-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Baby className="h-7 w-7 text-teal-300 animate-pulse" />
          <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-200 text-xs font-semibold uppercase tracking-wider border border-teal-300/30">
            Neonatal Thoracic RCM Intelligence
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-jakarta tracking-tight">
          Pediatric TEF &amp; Esophageal Atresia Claim Scrubber
        </h2>
        <p className="mt-2 text-teal-100/90 text-sm md:text-base max-w-2xl leading-relaxed">
          Audit Gross Type A–E congenital esophageal atresia repairs. Defend pre-repair diagnostic rigid bronchoscopy (+31622-59), enteral gastrostomy (+43653-59), staged Foker traction elongation (Modifier -58), and neonatal complexity (Modifier -22).
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-cream/40 p-5 rounded-xl border border-gray/10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
              Gross Classification &amp; Anatomic Variant
            </label>
            <select
              value={grossType}
              onChange={(e) => setGrossType(e.target.value as any)}
              className="w-full bg-white border border-gray/20 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal font-medium"
            >
              <option value="typeC">Gross Type C (85%): Atresia with Distal TEF</option>
              <option value="typeA">Gross Type A (8%): Pure Atresia (Long-Gap)</option>
              <option value="typeE">Gross Type E (4%): H-Type Fistula without Atresia</option>
              <option value="typeB">Gross Type B (1%): Atresia with Proximal Fistula</option>
              <option value="typeD">Gross Type D (1%): Atresia with Proximal &amp; Distal Fistulae</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Determines primary surgical code (43312 vs 43305 vs 43314) and fistula division parameters.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
              Surgical Approach &amp; Technique
            </label>
            <select
              value={surgicalApproach}
              onChange={(e) => setSurgicalApproach(e.target.value as any)}
              className="w-full bg-white border border-gray/20 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal font-medium"
            >
              <option value="thoracotomy">Right Extrapleural Thoracotomy (Open)</option>
              <option value="thoracoscopic">Thoracoscopic Minimally Invasive Repair (VATS)</option>
              <option value="cervical">Cervical Approach (Cervical Fistulotomy / H-Type)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Thoracoscopy in neonates triggers increased technical difficulty (Modifier -22) justification.
            </p>
          </div>
        </div>

        {/* Procedural Checkboxes */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-teal" /> Multi-Component Procedural Add-Ons
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={rigidBronchoscopy}
                onChange={(e) => setRigidBronchoscopy(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Pre-Repair Rigid Bronchoscopy (CPT 31622)</strong>
                Airway endoscopy prior to incision to rule out proximal fistula &amp; evaluate carina.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={gastrostomyTube}
                onChange={(e) => setGastrostomyTube(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Gastrostomy Tube Enteral Access (CPT 43653)</strong>
                Separate abdominal incision for gastric decompression and long-term nutrition.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={fokerStagedElongation}
                onChange={(e) => setFokerStagedElongation(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Staged Foker Traction Elongation (Mod -58)</strong>
                Long-gap pouch traction with delayed primary anastomosis in subsequent session.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={lowBirthWeightComplex}
                onChange={(e) => setLowBirthWeightComplex(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Low Birth Weight (&lt;2.5kg) / Complex (Mod -22)</strong>
                Documented extreme fragility, carinal adhesion, or extensive mediastinal dissection.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition md:col-span-2">
              <input
                type="checkbox"
                checked={neonatalCriticalCare}
                onChange={(e) => setNeonatalCriticalCare(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Neonatal Critical Care Resuscitation (CPT 99291-25)</strong>
                Perisurgical hemodynamic instability management and non-operative ventilatory support.
              </span>
            </label>
          </div>
        </div>

        {/* Audit Metrics Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-cream/50 border border-gray/15 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Scored RVUs</span>
            <div className="text-2xl font-black text-navy mt-1 font-jakarta">{auditResult.totalRvu}</div>
            <span className="text-[11px] text-gray-400">Work + Practice Expense</span>
          </div>
          <div className="bg-emerald-50/70 border border-emerald-200/50 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">Estimated Allowed</span>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-jakarta">
              ${auditResult.grossValue.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600">Standard Medicare/Payer Baseline</span>
          </div>
          <div className="bg-rose-50/70 border border-rose-200/50 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-rose-800 tracking-wider">At-Risk Revenue Defended</span>
            <div className="text-2xl font-black text-rose-700 mt-1 font-jakarta">
              ${auditResult.atRiskValue.toLocaleString()}
            </div>
            <span className="text-[11px] text-rose-600">Protected Against Bundling</span>
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
            <ShieldAlert className="h-4 w-4 text-teal" /> NCCI Bundling Defenses &amp; Documentation Protocols
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
            <Sparkles className="h-5 w-5 text-teal" /> Request a Comprehensive Pediatric Surgical Audit
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Connect directly with Kiran’s expert pediatric thoracic and neonatal surgery RCM review team. We scrub high-complexity congenital surgical cases, resolve unbundling disputes, and ensure maximum fee schedule capture.
          </p>

          {submitSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span>
                Thank you! Your case audit inquiry has been securely transmitted. Kiran and the specialized pediatric RCM team will contact you promptly.
              </span>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Surgeon / Administrator Name"
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
                placeholder="Children's Hospital / Practice Group"
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
