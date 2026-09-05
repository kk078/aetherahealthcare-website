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
  Layers,
  Copy,
  Sliders,
  ShieldCheck,
  Scissors,
  Users,
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

export default function AdultRetroperitonealSarcomaScrubber() {
  // Surgical Parameters
  const [tumorSize, setTumorSize] = useState<'under5' | '5to10' | 'over10'>('over10');
  const [includeNephrectomy, setIncludeNephrectomy] = useState<boolean>(true);
  const [includeAdrenalectomy, setIncludeAdrenalectomy] = useState<boolean>(true);
  const [includeColectomy, setIncludeColectomy] = useState<boolean>(true);
  const [includeVascularReconstruction, setIncludeVascularReconstruction] = useState<boolean>(true);
  const [coSurgeonMod62, setCoSurgeonMod62] = useState<boolean>(true);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live Audit Ledger Engine
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Retroperitoneal Tumor Excision (CPT 49203 / 49204 / 49205)
    let tumorCode = '49205';
    let tumorRvu = 47.2;
    let tumorFee = 3450;
    let sizeLabel = 'greater than 10.0 cm maximum dimension';

    if (tumorSize === 'under5') {
      tumorCode = '49203';
      tumorRvu = 22.8;
      tumorFee = 1650;
      sizeLabel = 'less than 5.0 cm maximum dimension';
    } else if (tumorSize === '5to10') {
      tumorCode = '49204';
      tumorRvu = 31.5;
      tumorFee = 2280;
      sizeLabel = '5.1 to 10.0 cm maximum dimension';
    }

    // Co-surgeon modifier adjustment (Modifier -62 pays 62.5% of standard allowable)
    const primaryAllowed = coSurgeonMod62 ? Math.round(tumorFee * 0.625) : tumorFee;
    grossValue += primaryAllowed;

    items.push({
      code: tumorCode,
      modifier: coSurgeonMod62 ? '62' : '',
      description: `Excision or destruction, open, intra-abdominal / retroperitoneal tumors; ${sizeLabel}${
        coSurgeonMod62 ? ' [Modifier -62: Surgical Oncology Co-Surgeon]' : ''
      }`,
      rvu: coSurgeonMod62 ? tumorRvu * 0.625 : tumorRvu,
      estAllowed: primaryAllowed,
      status: 'compliant',
      editReason: 'Primary en-bloc compartment resection benchmarked to tumor dimensions and surgical margin clearance.',
    });

    if (coSurgeonMod62) {
      recommendations.push(
        'Submit synchronized operative reports for both surgical oncology and vascular/urologic co-surgeons with matching Modifier -62.'
      );
    }

    // 2. Contiguous En-Bloc Radical Nephrectomy (CPT 50240-59)
    if (includeNephrectomy) {
      const nephRvu = 29.8;
      const nephFee = 2150;
      grossValue += nephFee;
      items.push({
        code: '50240',
        modifier: '59',
        description: 'Nephrectomy, radical; en-bloc removal of kidney, Gerota’s fascia, and perinephric fat',
        rvu: nephRvu,
        estAllowed: nephFee,
        status: 'compliant',
        editReason: 'En-bloc resection required due to parenchymal tumor invasion. Modifier -59 unbundles from primary retroperitoneal mass.',
      });
      atRiskValue += nephFee;
      recommendations.push(
        'Pathology report MUST confirm direct renal capsular invasion or gross vascular encasement to overturn CPT 50240 bundling edits.'
      );
    }

    // 3. Contiguous Adrenalectomy (CPT 60540-59)
    if (includeAdrenalectomy) {
      const adrRvu = 25.6;
      const adrFee = 1890;
      grossValue += adrFee;
      items.push({
        code: '60540',
        modifier: '59',
        description: 'Adrenalectomy, complete excision of adrenal gland; en-bloc contiguous clearance',
        rvu: adrRvu,
        estAllowed: adrFee,
        status: 'compliant',
        editReason: 'Ipsilateral adrenalectomy performed in continuity with retroperitoneal sarcoma mass.',
      });
      atRiskValue += adrFee;
    }

    // 4. Segmental Hemicolectomy (CPT 44140-59)
    if (includeColectomy) {
      const colRvu = 27.4;
      const colFee = 1980;
      grossValue += colFee;
      items.push({
        code: '44140',
        modifier: '59',
        description: 'Colectomy, partial; with anastomosis (en-bloc contiguous mesocolic resection)',
        rvu: colRvu,
        estAllowed: colFee,
        status: 'compliant',
        editReason: 'Segmental resection of colon and mesentery required to achieve microscopic negative margins.',
      });
      atRiskValue += colFee;
    }

    // 5. Major Vascular Reconstruction: IVC Replacement (CPT 35281)
    if (includeVascularReconstruction) {
      const vascRvu = 39.0;
      const vascFee = 2820;
      grossValue += vascFee;
      items.push({
        code: '35281',
        modifier: '59',
        description: 'Repair blood vessel with other than vein; intra-abdominal (inferior vena cava PTFE graft replacement)',
        rvu: vascRvu,
        estAllowed: vascFee,
        status: 'compliant',
        editReason: 'Reconstruction of IVC following circumferential oncologic resection for cavocaval sarcoma encasement.',
      });
      atRiskValue += vascFee;
      recommendations.push(
        'Ensure vascular surgeon operative note details cross-clamp times, systemic heparinization, and PTFE ringed graft diameter for CPT 35281.'
      );
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
    };
  }, [
    tumorSize,
    includeNephrectomy,
    includeAdrenalectomy,
    includeColectomy,
    includeVascularReconstruction,
    coSurgeonMod62,
  ]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('adult_retroperitoneal_sarcoma_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        tumorSize,
        includeNephrectomy,
        includeAdrenalectomy,
        includeColectomy,
        includeVascularReconstruction,
        coSurgeonMod62,
        grossValue: auditResult.grossValue,
        atRiskValue: auditResult.atRiskValue,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Lead submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPacket = () => {
    const text = `--- AETHERA HEALTHCARE ADULT RETROPERITONEAL SARCOMA RCM AUDIT PACKET ---
Tumor Size Tier: ${tumorSize.toUpperCase()}
En-Bloc Radical Nephrectomy (50240-59): ${includeNephrectomy ? 'YES' : 'NO'}
Contiguous Adrenalectomy (60540-59): ${includeAdrenalectomy ? 'YES' : 'NO'}
Segmental Colectomy (44140-59): ${includeColectomy ? 'YES' : 'NO'}
IVC Vascular Reconstruction (35281-59): ${includeVascularReconstruction ? 'YES' : 'NO'}
Co-Surgeon Modifier -62: ${coSurgeonMod62 ? 'YES' : 'NO'}
Gross Clean Allowed: $${auditResult.grossValue.toLocaleString()}
Revenue At Risk: $${auditResult.atRiskValue.toLocaleString()}

CODING BREAKDOWN:
${auditResult.items.map((i) => `${i.code}${i.modifier ? `-${i.modifier}` : ''} | RVU: ${i.rvu.toFixed(1)} | $${i.estAllowed.toLocaleString()} | ${i.description}`).join('\n')}

AUDIT DEFENSE RECOMMENDATIONS:
${auditResult.recommendations.map((r, idx) => `${idx + 1}. ${r}`).join('\n')}
${auditResult.warnings.map((w, idx) => `! WARNING ${idx + 1}: ${w}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1c1917] via-[#292524] to-[#047857] text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Surgical Oncology &amp; Sarcoma Multivisceral Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Adult Retroperitoneal Sarcoma &amp; Multivisceral Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Eliminate catastrophic multivisceral unbundling clawbacks on complex retroperitoneal sarcoma resections. Defend radical tumor clearance (49203–49205), en-bloc nephrectomy (50240-59), contiguous adrenalectomy (60540-59), colectomy (44140-59), and IVC vascular reconstruction (35281-59).
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Configurations */}
        <div className="lg:col-span-6 space-y-6">
          {/* Tumor Size Sizing */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Sliders className="w-5 h-5 text-teal" />
              1. Retroperitoneal Mass Sizing Tier
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Maximum Dimension of Retroperitoneal Tumor
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'under5', label: '< 5.0 cm (49203)' },
                  { id: '5to10', label: '5.1–10 cm (49204)' },
                  { id: 'over10', label: '> 10.0 cm (49205)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTumorSize(item.id as any)}
                    className={`py-3 px-2 text-xs font-bold rounded-xl border text-center transition-all ${
                      tumorSize === item.id
                        ? 'bg-navy text-white border-navy shadow-sm'
                        : 'bg-cream/40 text-navy/80 border-gray/20 hover:bg-cream'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Co-Surgeon Modifier -62 Toggle */}
            <div className="pt-1">
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={coSurgeonMod62}
                  onChange={(e) => setCoSurgeonMod62(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Dual-Attending Co-Surgeon (Modifier -62)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Surgical Oncologist and Urologic/Vascular Surgeon co-performing radical compartment clearance.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Multivisceral Organ Clearance */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              2. Multivisceral Resections &amp; Vascular Grafting
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeNephrectomy}
                  onChange={(e) => setIncludeNephrectomy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">En-Bloc Radical Nephrectomy (50240-59)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Resection of kidney and Gerota’s fascia for direct parenchymal tumor involvement (+$2,150).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeAdrenalectomy}
                  onChange={(e) => setIncludeAdrenalectomy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Contiguous Adrenalectomy (60540-59)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Complete adrenal clearance for superior retroperitoneal tumor margin (+$1,890).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeColectomy}
                  onChange={(e) => setIncludeColectomy(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">Segmental Colectomy &amp; Anastomosis (44140-59)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Partial resection of colon and mesentery adherent to anterior sarcoma surface (+$1,980).
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-cream/30 hover:bg-cream/60 rounded-xl cursor-pointer transition-colors border border-gray/10">
                <input
                  type="checkbox"
                  checked={includeVascularReconstruction}
                  onChange={(e) => setIncludeVascularReconstruction(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray/30 text-teal focus:ring-teal"
                />
                <div>
                  <span className="text-xs font-bold text-navy block">IVC Vascular Replacement Graft (35281-59)</span>
                  <span className="text-[11px] text-slate-500 leading-snug">
                    Circumferential resection of inferior vena cava with ringed PTFE prosthetic tube graft (+$2,820).
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Scoreboard & Audit Ledger */}
        <div className="lg:col-span-6 space-y-6">
          {/* Revenue Scoreboard */}
          <div className="bg-[#1c1917] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase text-cream/70 font-semibold tracking-wider">Gross Clean Allowed</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-mint font-jakarta mt-1">
                  ${auditResult.grossValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-cream/60 mt-0.5">Primary + Multivisceral + Vascular</p>
              </div>
              <div>
                <p className="text-xs uppercase text-amber-300 font-semibold tracking-wider">Revenue At Risk</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-jakarta mt-1">
                  ${auditResult.atRiskValue.toLocaleString()}
                </p>
                <p className="text-[11px] text-amber-200/80 mt-0.5">Vulnerable to contiguous unbundling edits</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center">
              <span className="text-xs text-cream/80 font-medium">
                Tumor Tier: {tumorSize.toUpperCase()} {coSurgeonMod62 ? '| Co-Surgeon Mod -62' : ''}
              </span>
              <button
                type="button"
                onClick={handleCopyPacket}
                className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-cream px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Copied Packet!' : 'Copy Claim Audit Packet'}
              </button>
            </div>
          </div>

          {/* Live CPT Ledger */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                Sarcoma Multivisceral Ledger
              </h3>
              <span className="text-xs bg-mint/20 text-navy font-semibold px-2 py-0.5 rounded-full border border-mint/40">
                {auditResult.items.length} Billable Codes
              </span>
            </div>

            <div className="divide-y divide-gray/10 max-h-72 overflow-y-auto pr-1">
              {auditResult.items.map((item, idx) => (
                <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-navy bg-cream px-1.5 py-0.5 rounded text-[11px]">
                        {item.code}{item.modifier ? `-${item.modifier}` : ''}
                      </span>
                      <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1 rounded">
                        {item.rvu.toFixed(1)} RVU
                      </span>
                      <span className="text-slate-700 font-medium">{item.description}</span>
                    </div>
                    {item.editReason && (
                      <p className="text-[11px] text-slate-500 italic pl-1 border-l-2 border-teal/40">
                        {item.editReason}
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-navy whitespace-nowrap text-right">
                    ${item.estAllowed.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scrubbers & Warnings */}
          {(auditResult.warnings.length > 0 || auditResult.recommendations.length > 0) && (
            <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Payer Scrubber &amp; Audit Defenses
              </h3>

              {auditResult.warnings.map((w, idx) => (
                <div key={idx} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}

              {auditResult.recommendations.map((r, idx) => (
                <div key={idx} className="p-3 bg-teal/5 border border-teal/20 rounded-xl flex items-start gap-2.5 text-xs text-navy/90">
                  <CheckCircle2 className="w-4 h-4 text-teal shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Lead Capture Form */}
          <div className="bg-cream/50 border border-gray/20 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-teal" />
              Request Sarcoma Multivisceral RCM Audit
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Get an expert revenue cycle evaluation of your retroperitoneal sarcoma cases, contiguous nephrectomy/adrenalectomy unbundling defenses, and IVC vascular reconstruction claims.
            </p>

            {submitSuccess ? (
              <div className="p-4 bg-mint/20 border border-mint/40 rounded-xl text-center">
                <CheckCircle2 className="w-8 h-8 text-teal mx-auto mb-2" />
                <p className="text-sm font-bold text-navy">Audit Request Received</p>
                <p className="text-xs text-slate-600 mt-1">
                  Our surgical oncology RCM team will review your multivisceral operative notes and reach out within 1 business day.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Surgeon / Administrator *"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:outline-none focus:border-teal"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email *"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:outline-none focus:border-teal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Cancer Center / Sarcoma Practice"
                    value={contactPractice}
                    onChange={(e) => setContactPractice(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:outline-none focus:border-teal"
                  />
                  <input
                    type="tel"
                    placeholder="Direct Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:outline-none focus:border-teal"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal hover:bg-teal/90 text-white font-bold text-xs py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Sending Request...' : 'Get Free Retroperitoneal Sarcoma Audit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
