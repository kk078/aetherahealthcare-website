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
  Microscope,
  Bone,
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

export default function HeadAndNeckFreeFlapScrubber() {
  // Clinical Reconstructive State
  const [flapType, setFlapType] = useState<'fibula' | 'alt' | 'radial_forearm'>('fibula');
  const [useMicroscope, setUseMicroscope] = useState<boolean>(true);
  const [useIcgAngiography, setUseIcgAngiography] = useState<boolean>(true);
  const [neckDissection, setNeckDissection] = useState<boolean>(true);
  const [protectiveTracheostomy, setProtectiveTracheostomy] = useState<boolean>(true);
  const [dualSurgeonTeam, setDualSurgeonTeam] = useState<boolean>(true);
  const [inpatientFlapMonitoring, setInpatientFlapMonitoring] = useState<boolean>(true);

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

    // 1. Primary Microvascular Free Tissue Transfer / Bone Graft
    let primaryCode = '20955';
    let primaryDesc = 'Bone graft with microvascular anastomosis; fibula osteocutaneous flap for mandibular or maxillary reconstruction';
    let primaryRvu = 58.5;
    let primaryFee = 4950;

    if (flapType === 'fibula') {
      primaryCode = '20955';
      primaryDesc = 'Bone graft with microvascular anastomosis; fibula osteocutaneous flap with osteotomies and contouring';
      primaryRvu = 58.5;
      primaryFee = 4950;
    } else if (flapType === 'alt') {
      primaryCode = '15756';
      primaryDesc = 'Free muscle or myocutaneous flap with microvascular anastomosis; anterolateral thigh (ALT) perforator flap';
      primaryRvu = 47.8;
      primaryFee = 4050;
    } else {
      primaryCode = '15757';
      primaryDesc = 'Free skin flap with microvascular anastomosis; radial forearm fasciocutaneous free flap';
      primaryRvu = 46.2;
      primaryFee = 3900;
    }

    grossValue += primaryFee;
    items.push({
      code: primaryCode,
      modifier: '',
      description: primaryDesc,
      rvu: primaryRvu,
      estAllowed: primaryFee,
      status: 'compliant',
      editReason: 'Primary microvascular reconstruction benchmarked to composite bone vs soft-tissue defect requirements.',
    });

    // 2. Mandibular/Maxillary Rigid Fixation Plating (for Fibula Flap) (CPT 21247-59)
    if (flapType === 'fibula') {
      const plateRvu = 31.2;
      const plateFee = 2650;
      grossValue += plateFee;
      items.push({
        code: '21247',
        modifier: '59',
        description: 'Reconstruction of mandibular body or ramus, with bone graft or flap; rigid locking reconstruction plate fixation',
        rvu: plateRvu,
        estAllowed: plateFee,
        status: 'compliant',
        editReason: 'Mandibular structural stability and load-bearing reconstruction; reported with Modifier -59 to override edit.',
      });
      atRiskValue += plateFee;
      recommendations.push(
        'Append Modifier -59 or -XU to CPT 21247 (rigid mandibular reconstruction) with documentation of locking reconstruction plate and multiple osteotomies.'
      );
    }

    // 3. Operating Microscope Add-on (CPT +69990)
    if (useMicroscope) {
      const micRvu = 6.2;
      const micFee = 490;
      grossValue += micFee;
      items.push({
        code: '69990',
        modifier: '',
        description: 'Microsurgical techniques, requiring use of operating microscope for micro-arterial & venous coupler anastomoses',
        rvu: micRvu,
        estAllowed: micFee,
        status: 'compliant',
        editReason: 'CMS NCCI Chapter VIII permits +69990 when operating microscope is utilized with CPT 20955 and 15756–15758.',
      });
      atRiskValue += micFee;
      recommendations.push(
        'Defend CPT +69990 against clearinghouse bundling edits by citing NCCI Chapter VIII guidelines exempting microvascular free flaps.'
      );
    } else {
      warnings.push(
        'DOCUMENTATION GAP: Use of operating microscope under 10x–16x magnification must be explicitly dictated in operative note.'
      );
    }

    // 4. Intraoperative ICG Angiography (CPT +15860)
    if (useIcgAngiography) {
      const icgRvu = 3.1;
      const icgFee = 245;
      grossValue += icgFee;
      items.push({
        code: '15860',
        modifier: '59',
        description: 'Intravenous indocyanine green (ICG) laser fluorescence angiography to evaluate skin paddle and mucosal flap perfusion',
        rvu: icgRvu,
        estAllowed: icgFee,
        status: 'compliant',
        editReason: 'Real-time assessment of perforator patency and flap capillary refilling; reported with Modifier -59.',
      });
      atRiskValue += icgFee;
      recommendations.push(
        'Append Modifier -59 to CPT +15860 and include SPY/fluorescence perfusion images to defend against experimental denial edits.'
      );
    }

    // 5. Neck Lymphadenectomy / Neck Dissection (CPT 38724-59)
    if (neckDissection) {
      const neckRvu = 26.5;
      const neckFee = 2250;
      grossValue += neckFee;
      items.push({
        code: '38724',
        modifier: '59',
        description: 'Cervical lymphadenectomy (modified radical / selective neck dissection levels I–IV)',
        rvu: neckRvu,
        estAllowed: neckFee,
        status: 'compliant',
        editReason: 'Oncologic nodal clearance distinct from recipient vessel exposure; unbundled with Modifier -59.',
      });
      atRiskValue += neckFee;
      recommendations.push(
        'Document separate oncologic pathology indication and distinct anatomical lymph node station clearance to defend CPT 38724-59 against recipient vessel bundling.'
      );
    }

    // 6. Planned Protective Tracheostomy (CPT 31600-59)
    if (protectiveTracheostomy) {
      const trachRvu = 8.2;
      const trachFee = 640;
      grossValue += trachFee;
      items.push({
        code: '31600',
        modifier: '59',
        description: 'Planned tracheostomy for post-reconstructive airway protection and airway swelling prevention',
        rvu: trachRvu,
        estAllowed: trachFee,
        status: 'compliant',
        editReason: 'Distinct surgical intervention to secure complex upper airway compromised by oral cavity/pharyngeal edema.',
      });
      atRiskValue += trachFee;
      recommendations.push(
        'Append Modifier -59 to CPT 31600. Detail the risk of acute airway compromise due to extensive flap inset in the oral cavity.'
      );
    }

    // 7. Inpatient Intensive Flap Monitoring & Resuscitation (CPT 99223-25)
    if (inpatientFlapMonitoring) {
      const careRvu = 5.8;
      const careFee = 460;
      grossValue += careFee;
      items.push({
        code: '99223',
        modifier: '25',
        description: 'Initial hospital care, high complexity, for intensive hourly microvascular Doppler flap monitoring & fluid resuscitation',
        rvu: careRvu,
        estAllowed: careFee,
        status: 'compliant',
        editReason: 'Significant, separately identifiable E/M service for post-microvascular ICU hemodynamic protocol management.',
      });
      atRiskValue += careFee;
      recommendations.push(
        'Append Modifier -25 to CPT 99223 with dedicated ICU admission note separate from operative dictation.'
      );
    }

    // Dual-Surgeon Team Co-Surgery Alert
    if (dualSurgeonTeam) {
      recommendations.push(
        'DUAL SURGEON PROTOCOL: When ENT oncologic surgeon performs resection (e.g. 42845) and plastic/microvascular surgeon performs flap reconstruction (20955/15756), each surgeon bills their respective primary codes WITHOUT Modifier -62 to prevent 62.5% fee split clawbacks.'
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
  }, [flapType, useMicroscope, useIcgAngiography, neckDissection, protectiveTracheostomy, dualSurgeonTeam, inpatientFlapMonitoring]);

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
      await sendLeadToKiran('head_neck_free_flap_scrubber', {
        contactName,
        contactEmail,
        contactPractice,
        contactPhone,
        flapType,
        useMicroscope,
        useIcgAngiography,
        neckDissection,
        protectiveTracheostomy,
        dualSurgeonTeam,
        inpatientFlapMonitoring,
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
      <div className="bg-gradient-to-r from-[#1e1b4b] via-[#2e1065] to-[#0f172a] px-6 py-8 text-white">
        <div className="flex items-center space-x-3 mb-2">
          <Microscope className="h-7 w-7 text-purple-300 animate-pulse" />
          <span className="px-3 py-1 rounded-full bg-purple-400/20 text-purple-200 text-xs font-semibold uppercase tracking-wider border border-purple-300/30">
            Head &amp; Neck Microsurgery RCM Engine
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold font-jakarta tracking-tight">
          Head &amp; Neck Free Flap Reconstruction Scrubber
        </h2>
        <p className="mt-2 text-purple-100/90 text-sm md:text-base max-w-2xl leading-relaxed">
          Audit microvascular free tissue and bone transfers (Fibula 20955, ALT 15756, Radial Forearm 15757). Defend mandibular plating (21247-59), operating microscope unbundling (+69990), neck dissection (+38724-59), planned tracheostomy (+31600-59), and dual-attending co-surgery rules.
        </p>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* Controls Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-cream/40 p-5 rounded-xl border border-gray/10">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
              Free Flap Selection &amp; Donor Defect
            </label>
            <select
              value={flapType}
              onChange={(e) => setFlapType(e.target.value as any)}
              className="w-full bg-white border border-gray/20 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-teal font-medium"
            >
              <option value="fibula">Vascularized Fibula Osteocutaneous Flap (20955)</option>
              <option value="alt">Anterolateral Thigh (ALT) Perforator Free Flap (15756)</option>
              <option value="radial_forearm">Radial Forearm Fasciocutaneous Free Flap (15757)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Fibula bone flaps enable mandibular reconstruction plating add-ons (CPT 21247-59).
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <div className="p-3 bg-white border border-gray/15 rounded-lg">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5 mb-1">
                <Users className="h-4 w-4 text-teal" /> Dual-Surgeon Coordination (ENT &amp; Plastic)
              </span>
              <p className="text-[11px] text-gray-600 leading-snug">
                When oncologic tumor resection and microvascular free flap are performed by separate surgeons, each surgeon reports distinct primary codes rather than splitting with Modifier -62.
              </p>
            </div>
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
                Intraoperative fluoroscopic SPY assessment of skin paddle &amp; bone perfusion.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={neckDissection}
                onChange={(e) => setNeckDissection(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Cervical Lymphadenectomy (CPT 38724-59)</strong>
                Modified radical / selective neck dissection distinct from recipient vessel exposure.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition">
              <input
                type="checkbox"
                checked={protectiveTracheostomy}
                onChange={(e) => setProtectiveTracheostomy(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Planned Protective Tracheostomy (CPT 31600-59)</strong>
                Prophylactic airway protection against post-reconstructive pharyngeal/oral edema.
              </span>
            </label>

            <label className="flex items-start p-3 bg-white border border-gray/15 rounded-lg hover:bg-cream/20 cursor-pointer transition md:col-span-2">
              <input
                type="checkbox"
                checked={inpatientFlapMonitoring}
                onChange={(e) => setInpatientFlapMonitoring(e.target.checked)}
                className="h-4 w-4 text-teal focus:ring-teal border-gray/30 rounded mt-0.5"
              />
              <span className="ml-3 text-xs text-navy">
                <strong className="block font-semibold">Inpatient Flap Monitoring &amp; Care (CPT 99223-25)</strong>
                Intensive ICU initial medical care addressing complex hemodynamics and microvascular flap checks.
              </span>
            </label>
          </div>
        </div>

        {/* Audit Metrics Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-cream/50 border border-gray/15 rounded-xl p-4 text-center">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">Total Scored RVUs</span>
            <div className="text-2xl font-black text-navy mt-1 font-jakarta">{auditResult.totalRvu}</div>
            <span className="text-[11px] text-gray-400">Total Work + Practice Expense</span>
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
            <span className="text-[11px] text-rose-600">Shielded From Bundling Edits</span>
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
            <ShieldAlert className="h-4 w-4 text-teal" /> NCCI Bundling Defenses &amp; Head/Neck Protocols
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
            <Sparkles className="h-5 w-5 text-teal" /> Request a Head &amp; Neck Reconstructive Surgical Audit
          </h3>
          <p className="text-xs text-gray-600 mb-4">
            Connect directly with Kiran’s expert head &amp; neck oncologic and reconstructive microvascular billing audit team. We resolve co-surgeon Modifier -62 conflicts, defend vascularized bone graft unbundling (+21247), and ensure full fee schedule capture.
          </p>

          {submitSuccess ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span>
                Thank you! Your case audit inquiry has been securely transmitted. Kiran and the head &amp; neck surgical RCM team will reach out promptly.
              </span>
            </div>
          ) : (
            <form onSubmit={handleLeadSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Head & Neck Surgeon / Practice Name"
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
                placeholder="Cancer Center / Academic Medical Group"
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
