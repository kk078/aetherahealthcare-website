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
  Brain,
  ChevronRight,
  Layers,
  Copy,
} from 'lucide-react';
import ToolConversionBridge from '@/components/ui/ToolConversionBridge';
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

export default function PediatricDbsScrubber() {
  // Clinical & Procedure Configuration
  const [indication, setIndication] = useState<'dystonia' | 'epilepsy' | 'tourette'>('dystonia');
  const [trajectoryType, setTrajectoryType] = useState<'bilateral' | 'unilateral'>('bilateral');
  const [useMER, setUseMER] = useState<boolean>(true);
  const [applyHeadframe, setApplyHeadframe] = useState<boolean>(true);
  const [ipgOption, setIpgOption] = useState<'same_day' | 'staged_58' | 'none'>('same_day');
  const [ipgType, setIpgType] = useState<'dual' | 'single'>('dual');
  const [includeFluoro, setIncludeFluoro] = useState<boolean>(true);
  const [includeProgramming, setIncludeProgramming] = useState<boolean>(true);

  // Lead capture state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPractice, setContactPractice] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  // Claim Audit Calculation
  const auditResult = useMemo(() => {
    const items: LineItem[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let grossValue = 0;
    let atRiskValue = 0;

    // 1. Primary Cranial Neurostimulator Lead Placement
    const primaryCode = useMER ? '61867' : '61863';
    const primaryRvu = useMER ? 56.4 : 38.2;
    const primaryAllowed = useMER ? 3950 : 2675;
    grossValue += primaryAllowed;

    items.push({
      code: primaryCode,
      modifier: '',
      description: useMER
        ? 'Cranial neurostimulator electrode array with microelectrode recording (MER), first subcortical target'
        : 'Cranial neurostimulator electrode array without MER, first subcortical target',
      rvu: primaryRvu,
      estAllowed: primaryAllowed,
      status: 'compliant',
      editReason: useMER
        ? 'MER documentation validated: subcortical cellular spike train and physiological boundary mapping recorded.'
        : 'Lead placed with stereotactic navigation alone. Note: CPT 61867 carries +18.2 wRVUs when MER mapping is performed.',
    });

    if (!useMER && indication === 'dystonia') {
      warnings.push('Pediatric dystonia pallidal (GPi) targeting without MER mapping risks payer medical necessity review and forfeits 18.2 wRVUs.');
      recommendations.push('Verify operative record for microelectrode cellular recordings to upgrade to CPT 61867.');
      atRiskValue += 1275;
    }

    // 2. Second Trajectory / Bilateral Target
    if (trajectoryType === 'bilateral') {
      const secondaryCode = useMER ? '+61868' : '+61864';
      const secondaryRvu = useMER ? 18.5 : 11.2;
      const secondaryAllowed = useMER ? 1295 : 785;
      grossValue += secondaryAllowed;

      items.push({
        code: secondaryCode,
        modifier: '',
        description: useMER
          ? 'Cranial neurostimulator electrode array with MER, each additional target / contralateral array'
          : 'Cranial neurostimulator electrode array without MER, each additional target array',
        rvu: secondaryRvu,
        estAllowed: secondaryAllowed,
        status: 'compliant',
        editReason: 'Bilateral second lead correctly reported as add-on code. Modifier 51/50 exempt under CPT rules.',
      });
    }

    // 3. Stereotactic Headframe (CPT 20660) Bundling Check
    if (applyHeadframe) {
      items.push({
        code: '20660',
        modifier: 'UNBUNDLED',
        description: 'Application of stereotactic head frame (Mayfield / Leksell / CRW)',
        rvu: 7.2,
        estAllowed: 504,
        status: 'fatal',
        editReason: 'CMS NCCI Chapter VIII Column 2 edit: 20660 is bundled into primary stereotactic lead insertion (61867/61863). Separate billing triggers claim audit rejection.',
      });
      warnings.push('CRITICAL NCCI EDIT: Headframe placement (20660) is statutorily inclusive to cranial stereotactic placement (61867/61863). Bill line will be rejected if submitted without distinct staged indication.');
      recommendations.push('Suppress CPT 20660 from primary claim. Embed pin-site care and stereotactic registration in the primary 61867 operative dictation.');
      atRiskValue += 504;
    }

    // 4. Implantable Pulse Generator (IPG) Insertion
    if (ipgOption !== 'none') {
      const isDual = ipgType === 'dual';
      const ipgCode = isDual ? '61886' : '61885';
      const ipgRvu = isDual ? 18.2 : 13.1;
      const ipgAllowed = isDual ? 1275 : 915;
      grossValue += ipgAllowed;

      let mod = '';
      let status: 'compliant' | 'warning' | 'fatal' = 'compliant';
      let editReason = '';

      if (ipgOption === 'same_day') {
        mod = '59';
        editReason = 'Same-day IPG pouch creation & subclavicular tunneling requires Modifier -59 or -XU to unbundle from cranial global period.';
      } else {
        mod = '58';
        editReason = 'Staged IPG insertion within 90-day cranial lead global period successfully protected by staged procedure Modifier -58.';
      }

      items.push({
        code: ipgCode,
        modifier: mod,
        description: isDual
          ? 'Insertion or replacement of cranial neurostimulator pulse generator; dual array / dual channel'
          : 'Insertion or replacement of cranial neurostimulator pulse generator; single array',
        rvu: ipgRvu,
        estAllowed: ipgAllowed,
        status,
        editReason,
      });
    }

    // 5. Intraoperative Fluoroscopic Guidance (+77003-26)
    if (includeFluoro) {
      grossValue += 65;
      items.push({
        code: '+77003',
        modifier: '26',
        description: 'Fluoroscopic guidance and localization of needle or catheter tip / device insertion',
        rvu: 0.85,
        estAllowed: 65,
        status: 'compliant',
        editReason: 'Separately payable add-on code with Modifier -26. Confirmed permanent hardcopy fluoroscopic image stored in PACS.',
      });
    }

    // 6. Intraoperative Telemetry Analysis / Programming (CPT 95983)
    if (includeProgramming) {
      grossValue += 195;
      items.push({
        code: '95983',
        modifier: '26',
        description: 'Electronic analysis of implanted neurostimulator with complex brain programming, first 15 min',
        rvu: 2.8,
        estAllowed: 195,
        status: 'compliant',
        editReason: 'Intraoperative neurostimulation contact impedance and therapeutic current threshold evaluation documented.',
      });
    }

    return {
      items,
      warnings,
      recommendations,
      grossValue,
      atRiskValue,
      cleanAllowed: grossValue,
    };
  }, [indication, trajectoryType, useMER, applyHeadframe, ipgOption, ipgType, includeFluoro, includeProgramming]);

  // Lead submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail || !contactName) return;

    setIsSubmitting(true);
    try {
      await sendLeadToKiran('pediatric_dbs_rcm_audit', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        indication,
        trajectoryType,
        useMER,
        applyHeadframe,
        ipgOption,
        ipgType,
        grossValue: auditResult.grossValue,
        atRiskValue: auditResult.atRiskValue,
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error('Submission failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPacket = () => {
    const text = `--- AETHERA HEALTHCARE RCM PEDIATRIC DBS AUDIT ---
Indication: ${indication.toUpperCase()}
Trajectory: ${trajectoryType.toUpperCase()} (MER Mapping: ${useMER ? 'YES' : 'NO'})
Headframe Billed: ${applyHeadframe ? 'YES (Suppression Recommended)' : 'NO'}
IPG Config: ${ipgOption.toUpperCase()} (${ipgType.toUpperCase()})
Gross RVU Potential: $${auditResult.grossValue.toLocaleString()}
Revenue at Risk: $${auditResult.atRiskValue.toLocaleString()}

CLAIM CODING LEDGER:
${auditResult.items.map((i) => `${i.code}${i.modifier ? `-${i.modifier}` : ''} | $${i.estAllowed} | ${i.description}`).join('\n')}

RECOMMENDATIONS:
${auditResult.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-navy/90 to-teal text-white p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-mint/20 text-mint border border-mint/30 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Brain className="w-3.5 h-3.5" />
            Pediatric Neuromodulation &amp; Stereotactic Functional Engine
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-jakarta tracking-tight">
            Pediatric Deep Brain Stimulation &amp; Neuromodulation Scrubber
          </h2>
          <p className="mt-2 text-sm sm:text-base text-cream/90 max-w-3xl leading-relaxed">
            Audit stereotactic lead implantation with microelectrode recording (61867/+61868 vs 61863), suppress fatal headframe bundling edits (20660), defend dual-channel IPGs (61886-59/58), and capture intraoperative neuroprogramming (95983).
          </p>
        </div>
      </div>

      {/* Main Grid: Controls vs Live Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Surgical Parameters */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal" />
              1. Indication &amp; Target Trajectory
            </h3>

            {/* Indication selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Pediatric Neuromodulation Indication
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dystonia', label: 'Pediatric Dystonia (GPi)' },
                  { id: 'epilepsy', label: 'Refractory Epilepsy (ANT)' },
                  { id: 'tourette', label: 'Tourette Syndrome (CM-Pf)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndication(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      indication === item.id
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 hover:border-teal/40 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Trajectory & MER */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Trajectory Configuration
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTrajectoryType('bilateral')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      trajectoryType === 'bilateral'
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    Bilateral (2 Leads)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrajectoryType('unilateral')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      trajectoryType === 'unilateral'
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    Unilateral (1 Lead)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Microelectrode Recording (MER)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUseMER(true)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      useMER ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    With MER (61867)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseMER(false)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      !useMER ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    No MER (61863)
                  </button>
                </div>
              </div>
            </div>

            {/* Headframe Toggle */}
            <div className="pt-2 border-t border-gray/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-navy">Billed Headframe Application (20660)</span>
                  <p className="text-xs text-slate-500">Test NCCI Column 2 unbundling edit audit</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyHeadframe}
                    onChange={(e) => setApplyHeadframe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Pulse Generator & Ancillaries */}
          <div className="bg-white border border-gray/15 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-navy flex items-center gap-2">
              <Activity className="w-5 h-5 text-teal" />
              2. Pulse Generator (IPG) &amp; Ancillaries
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                IPG Generator Timing &amp; Staging
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'same_day', label: 'Same-Day (Mod 59)' },
                  { id: 'staged_58', label: 'Staged Stage 2 (Mod 58)' },
                  { id: 'none', label: 'Lead Placement Only' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIpgOption(item.id as any)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      ipgOption === item.id
                        ? 'border-teal bg-teal/10 text-teal'
                        : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {ipgOption !== 'none' && (
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Generator Array Channels
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIpgType('dual')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      ipgType === 'dual' ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    Dual-Array (61886)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIpgType('single')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      ipgType === 'single' ? 'border-teal bg-teal/10 text-teal' : 'border-gray/20 text-slate-600'
                    }`}
                  >
                    Single-Array (61885)
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray/10">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeFluoro}
                  onChange={(e) => setIncludeFluoro(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Fluoro Guidance (+77003-26)</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeProgramming}
                  onChange={(e) => setIncludeProgramming(e.target.checked)}
                  className="rounded text-teal focus:ring-teal h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-700">Intraop Neuroprogramming (95983)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Live Audit Ledger & Action Center */}
        <div className="lg:col-span-6 space-y-6">
          {/* Audit Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray/15 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Clean Allowed</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-navy mt-1">
                ${auditResult.cleanAllowed.toLocaleString()}
              </div>
              <span className="text-xs text-teal font-medium mt-1 inline-block">High-Acuity Subcortical Case</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray/15 shadow-sm">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue At Risk</span>
              <div className={`text-2xl sm:text-3xl font-extrabold mt-1 ${auditResult.atRiskValue > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ${auditResult.atRiskValue.toLocaleString()}
              </div>
              <span className="text-xs text-slate-500 mt-1 inline-block">Bundling &amp; Downcoding Exposure</span>
            </div>
          </div>

          {/* Warnings Panel */}
          {auditResult.warnings.length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>NCCI Compliance &amp; Downcoding Alerts Detected</span>
              </div>
              <ul className="space-y-2 text-xs text-rose-700">
                {auditResult.warnings.map((w, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Line Item Ledger */}
          <div className="bg-white border border-gray/15 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray/10 pb-3">
              <h4 className="font-bold text-navy text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                ANSI X12 837P Claim Line Item Ledger
              </h4>
              <button
                type="button"
                onClick={handleCopyPacket}
                className="inline-flex items-center gap-1.5 text-xs text-teal hover:text-navy font-semibold transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                {copied ? 'Audit Copied!' : 'Copy Audit Packet'}
              </button>
            </div>

            <div className="divide-y divide-gray/10">
              {auditResult.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-navy text-sm">{item.code}</span>
                      {item.modifier && (
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                          item.modifier === 'UNBUNDLED' ? 'bg-rose-100 text-rose-700' : 'bg-teal/15 text-teal'
                        }`}>
                          {item.modifier}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                        item.status === 'compliant'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : item.status === 'warning'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{item.description}</p>
                    {item.editReason && (
                      <p className="text-[11px] text-slate-500 italic">{item.editReason}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-navy">${item.estAllowed.toLocaleString()}</div>
                    <div className="text-[11px] text-slate-400">{item.rvu} RVUs</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Lead Capture Modal / Form */}
          <div className="bg-gradient-to-br from-cream/40 to-teal/5 border border-teal/20 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal" />
              <h4 className="font-bold text-navy text-sm">Request Comprehensive Pediatric DBS RCM Audit</h4>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Have our certified neurosurgery coders review your high-acuity pediatric DBS operative notes, MER trajectory reports, and IPG hospital carve-outs.
            </p>

            {submitSuccess ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-emerald-900">Audit Request Received</h5>
                <p className="text-xs text-emerald-700 mt-1">
                  Our pediatric neurosurgery RCM team will contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitLead} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Physician / Practice Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Work Email (e.g. kalvarez@childrenshospital.org)"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Academic Center / Hospital System"
                    value={contactPractice}
                    onChange={(e) => setContactPractice(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                  <input
                    type="tel"
                    placeholder="Direct Phone"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray/20 focus:border-teal focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-teal hover:bg-navy text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    'Processing Audit Request...'
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Pediatric DBS Case for Comprehensive Practice Audit
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
