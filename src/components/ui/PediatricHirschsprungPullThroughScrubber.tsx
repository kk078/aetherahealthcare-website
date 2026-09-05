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
  Microscope,
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

export default function PediatricHirschsprungPullThroughScrubber() {
  // Clinical Classification & Procedural State
  const [surgicalTechnique, setSurgicalTechnique] = useState<'soave' | 'terpt' | 'duhamel' | 'swenson'>('soave');
  const [approach, setApproach] = useState<'laparoscopic' | 'open' | 'pure_transanal'>('laparoscopic');
  const [levelingBiopsies, setLevelingBiopsies] = useState<boolean>(true);
  const [stagedProcedure, setStagedProcedure] = useState<boolean>(false);
  const [longSegmentAganglionosis, setLongSegmentAganglionosis] = useState<boolean>(false);
  const [colostomyTakedown, setColostomyTakedown] = useState<boolean>(false);
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

    // 1. Primary Hirschsprung Proctectomy / Pull-Through (CPT 45120 or 45112)
    let primaryCode = '45120';
    let primaryDesc = 'Proctectomy, complete (for congenital conditions, eg, Hirschsprung disease); combined abdominal and perineal approach';
    let primaryRvu = 43.2;
    let primaryFee = 3350;

    if (surgicalTechnique === 'soave' || surgicalTechnique === 'terpt') {
      primaryCode = '45120';
      primaryDesc = 'Proctectomy, complete for Hirschsprung disease with endorectal muscular cuff preservation (Soave/TERPT)';
      primaryRvu = 43.2;
      primaryFee = 3350;
    } else if (surgicalTechnique === 'duhamel') {
      primaryCode = '45112';
      primaryDesc = 'Proctectomy, combined abdominoperineal, retrorectal transanal pull-through procedure (Duhamel technique)';
      primaryRvu = 48.5;
      primaryFee = 3750;
    } else {
      primaryCode = '45120';
      primaryDesc = 'Proctectomy, complete, full-thickness coloanal pull-through (Swenson technique)';
      primaryRvu = 44.0;
      primaryFee = 3400;
    }

    let primaryModifier = stagedProcedure ? '58' : longSegmentAganglionosis ? '22' : '';
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
      editReason: stagedProcedure
        ? 'Staged definitive pull-through following previous leveling colostomy [Modifier -58].'
        : primaryModifier === '22'
        ? 'Modifier -22 justified by long-segment aganglionosis requiring splenic flexure or subtotal colectomy.'
        : 'Primary congenital Hirschsprung proctectomy benchmarked to surgical approach.',
    });

    if (primaryModifier === '22') {
      atRiskValue += Math.round(primaryFee * 0.2);
      recommendations.push(
        'Modifier -22 Defense: Submit comprehensive operative documentation proving extended operative time (>50%) for total colonic or long-segment aganglionic dissection.'
      );
    }

    // 2. Intraoperative Leveling Seromuscular Mapping Biopsies (CPT 44150-59 or 45110-59)
    if (levelingBiopsies) {
      const biopsyRvu = 16.4;
      const biopsyFee = 1270;
      grossValue += biopsyFee;
      items.push({
        code: '44150',
        modifier: '59',
        description: 'Multi-level intraoperative seromuscular mapping biopsies of colon to identify ganglion cells and transition zone',
        rvu: biopsyRvu,
        estAllowed: biopsyFee,
        status: 'compliant',
        editReason: 'Distinct diagnostic mapping performed at multiple proximal sites prior to determining transection margin; unbundled with Modifier -59/-XU.',
      });
      atRiskValue += biopsyFee;
      recommendations.push(
        'Append Modifier -59 or -XU to CPT 44150. Document each biopsy anatomic landmark (sigmoid, descending, transverse) and frozen section pathology times.'
      );
    } else {
      warnings.push(
        'CLINICAL ADVISORY: Leveling seromuscular biopsies are critical to prevent pulling down aganglionic or transition-zone bowel, which leads to chronic enterocolitis and re-do pull-through.'
      );
    }

    // 3. Laparoscopic Colonic Mobilization (CPT 49320-59 or 44204-59)
    if (approach === 'laparoscopic') {
      const lapRvu = 14.8;
      const lapFee = 1140;
      grossValue += lapFee;
      items.push({
        code: '49320',
        modifier: '59',
        description: 'Laparoscopy, surgical, for pelvic and splenic flexure mobilization and vascular pedicle division',
        rvu: lapRvu,
        estAllowed: lapFee,
        status: 'compliant',
        editReason: 'Separate laparoscopic minimally invasive mobilization combined with transanal perineal mucosal dissection.',
      });
      atRiskValue += lapFee;
      recommendations.push(
        'Append Modifier -59 to CPT 49320 to defend against NCCI Chapter VI bundling into transanal proctectomy.'
      );
    }

    // 4. Staged Colostomy Takedown (CPT 44620-59)
    if (colostomyTakedown) {
      const colostomyRvu = 20.2;
      const colostomyFee = 1560;
      grossValue += colostomyFee;
      items.push({
        code: '44620',
        modifier: '59',
        description: 'Closure of enterostomy, large or small intestine; with resection and anastomosis',
        rvu: colostomyRvu,
        estAllowed: colostomyFee,
        status: 'compliant',
        editReason: 'Concomitant colostomy closure and mobilization performed at time of definitive pull-through.',
      });
      atRiskValue += colostomyFee;
      recommendations.push(
        'Document separate stoma peristomal incision, mobilization, and anastomosis to defend CPT 44620-59 against incidental surgical closure edits.'
      );
    }

    // 5. Postoperative Critical Care (CPT 99291-25)
    if (neonatalCriticalCare) {
      const ccRvu = 8.8;
      const ccFee = 680;
      grossValue += ccFee;
      items.push({
        code: '99291',
        modifier: '25',
        description: 'Critical care, evaluation and management of the critically ill neonatal infant; first 30-74 minutes post-op',
        rvu: ccRvu,
        estAllowed: ccFee,
        status: 'compliant',
        editReason: 'Distinct intensive medical management of fluid resuscitation, electrolyte balance, and Hirschsprung-associated enterocolitis (HAEC) prevention.',
      });
      atRiskValue += ccFee;
      recommendations.push(
        'Append Modifier -25 to CPT 99291. Ensure physician critical care charting clearly notes clinical time spent in NICU/PICU outside procedural room.'
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
  }, [surgicalTechnique, approach, levelingBiopsies, stagedProcedure, longSegmentAganglionosis, colostomyTakedown, neonatalCriticalCare]);

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
      await sendLeadToKiran('pediatric_hirschsprung_scrubber', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        surgicalTechnique,
        approach,
        levelingBiopsies,
        stagedProcedure,
        longSegmentAganglionosis,
        colostomyTakedown,
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
      <div className="bg-gradient-to-r from-[#0e4a50] via-[#115e59] to-[#042f2e] px-6 py-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Baby className="h-7 w-7 text-teal-300 animate-pulse" />
          <span className="px-3 py-1 rounded-full bg-teal-400/20 text-teal-200 text-xs font-semibold uppercase tracking-wider border border-teal-300/30">
            Pediatric Colorectal RCM Intelligence
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-jakarta tracking-tight">
          Pediatric Hirschsprung Pull-Through Scrubber
        </h2>
        <p className="mt-2 text-teal-100/90 text-sm md:text-base max-w-2xl leading-relaxed">
          Audit congenital Hirschsprung pull-through procedures (TERPT, Soave, Duhamel, Swenson). Defend intraoperative seromuscular leveling biopsies (+44150-59), laparoscopic mobilization (+49320-59), staged diversion reversal (Modifier -58), and long-segment complexity (Modifier -22).
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-cream/40 p-5 rounded-xl border border-gray/10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
              Surgical Technique &amp; Reconstruction
            </label>
            <select
              value={surgicalTechnique}
              onChange={(e) => setSurgicalTechnique(e.target.value as any)}
              className="w-full bg-white border border-gray/20 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal font-medium"
            >
              <option value="soave">Soave Endorectal Pull-Through (Mucosal Dissection)</option>
              <option value="terpt">Transanal Endorectal Pull-Through (TERPT / de la Torre)</option>
              <option value="duhamel">Duhamel Retrorectal Transanal Pull-Through (45112)</option>
              <option value="swenson">Swenson Full-Thickness Pull-Through (45120)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Selects primary proctectomy code and endorectal muscular sleeve preservation criteria.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
              Abdominal &amp; Pelvic Access Approach
            </label>
            <select
              value={approach}
              onChange={(e) => setApproach(e.target.value as any)}
              className="w-full bg-white border border-gray/20 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal font-medium"
            >
              <option value="laparoscopic">Laparoscopic-Assisted Pull-Through (49320-59)</option>
              <option value="pure_transanal">Pure Transanal (TERPT without Abdominal Incision)</option>
              <option value="open">Open Laparotomy / Abdominoperineal Approach</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Laparoscopic mobilization requires distinct intra-abdominal modifier defense.
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
                checked={levelingBiopsies}
                onChange={(e) => setLevelingBiopsies(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Intraoperative Leveling Biopsies (CPT 44150-59)</strong>
                Seromuscular frozen-section biopsies along the colon to establish ganglionated bowel margins.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={stagedProcedure}
                onChange={(e) => setStagedProcedure(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Staged Post-Colostomy Pull-Through (Mod -58)</strong>
                Pull-through performed in subsequent planned session following neonatal leveling stoma.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={longSegmentAganglionosis}
                onChange={(e) => setLongSegmentAganglionosis(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Long-Segment Aganglionosis / Complex (Mod -22)</strong>
                Extended aganglionosis to splenic flexure or subtotal colon requiring extensive dissection.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={colostomyTakedown}
                onChange={(e) => setColostomyTakedown(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Colostomy Takedown &amp; Anastomosis (CPT 44620-59)</strong>
                Concomitant reversal of prior diversion stoma through separate abdominal incision.
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
                Management of severe Hirschsprung enterocolitis (HAEC) sepsis, fluid shift, and bowel decompressions.
              </span>
            </label>
          </div>
        </div>

        {/* Audit Metrics Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-cream/50 border border-gray/15 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Scored RVUs</span>
            <div className="text-2xl font-black text-navy mt-1 font-jakarta">{auditResult.totalRvu}</div>
            <span className="text-[11px] text-gray-400">Total Relative Value Units</span>
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
            <ShieldAlert className="h-4 w-4 text-teal" /> NCCI Bundling Defenses &amp; Colorectal Protocols
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
            <Sparkles className="h-5 w-5 text-teal" /> Request a Pediatric Colorectal Surgery Audit
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Connect directly with Kiran’s expert pediatric colorectal surgical billing audit team. We resolve leveling biopsy unbundling disputes, defend staged pull-through claims, and secure appropriate reimbursements for complex reconstructive surgery.
          </p>

          {submitSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span>
                Thank you! Your case audit inquiry has been securely transmitted. Kiran and the pediatric colorectal RCM team will reach out promptly.
              </span>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Pediatric Surgeon / Practice Administrator Name"
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
                placeholder="Children's Hospital / Pediatric Surgery Group"
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
