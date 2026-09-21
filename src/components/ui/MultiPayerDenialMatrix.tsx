'use client';

import React, { useState } from 'react';
import {
  PAYER_ARCHETYPES,
  DENIAL_DEFENSE_PROFILES,
  PayerArchetype,
  DenialDefenseProfile,
} from '@/data/multiPayerDenialData';
import {
  ShieldAlert,
  Building,
  Scale,
  FileCheck2,
  Copy,
  Check,
  ChevronRight,
  PhoneCall,
  AlertOctagon,
  Bot,
  UserCheck,
} from 'lucide-react';

export default function MultiPayerDenialMatrix() {
  const [selectedPayerId, setSelectedPayerId] = useState<string>('medicare-advantage');
  const [selectedProfileId, setSelectedProfileId] = useState<string>('ma-spine-arthrodesis');
  const [showReconsiderationModal, setShowReconsiderationModal] = useState<boolean>(false);
  const [copiedBrief, setCopiedBrief] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'strategy' | 'p2p' | 'legal'>('strategy');

  const selectedPayer: PayerArchetype =
    PAYER_ARCHETYPES.find((p) => p.id === selectedPayerId) || PAYER_ARCHETYPES[0];

  const availableProfiles = DENIAL_DEFENSE_PROFILES.filter(
    (p) => p.payerId === selectedPayerId
  );

  // If selected profile is not in available profiles, default to the first one available
  const activeProfile: DenialDefenseProfile =
    availableProfiles.find((p) => p.id === selectedProfileId) ||
    availableProfiles[0] ||
    DENIAL_DEFENSE_PROFILES[0];

  const handlePayerChange = (payerId: string) => {
    setSelectedPayerId(payerId);
    const firstMatch = DENIAL_DEFENSE_PROFILES.find((p) => p.payerId === payerId);
    if (firstMatch) {
      setSelectedProfileId(firstMatch.id);
    }
  };

  const handleCopyReconsideration = () => {
    const briefText = `FORMAL STATUTORY RECONSIDERATION & EXPEDITED APPEAL
RE: Procedure: ${activeProfile.procedureTitle} (CPT ${activeProfile.cptCode})
Denial Reference: CARC ${activeProfile.carcCode} / RARC ${activeProfile.rarcCode}
Governing Statute: ${selectedPayer.governingStatute}
Statutory Legal Basis: ${activeProfile.statutoryLegalBasis}

${activeProfile.reconsiderationExcerpts
  .map((sec) => `${sec.sectionHeading}\n${sec.text}`)
  .join('\n\n')}

SOVEREIGN HUMAN CODING & CLINICAL ATTESTATION:
Under penalty of perjury pursuant to the False Claims Act (31 U.S.C. § 3729) and applicable state insurance statutes, the undersigned certified coding professional (AAPC/AHIMA) certifies that the attached medical record has been independently reviewed and substantiates all criteria required for full reimbursement. Immediate reversal of denial is demanded.`;

    navigator.clipboard.writeText(briefText);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  return (
    <section
      id="multi-payer-denial-matrix"
      className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[500px] bg-rose-500/5 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[500px] bg-teal-500/5 blur-[180px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-700/50 text-rose-300 text-xs font-mono uppercase tracking-wider mb-4">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          Payer Algorithmic Denial Counter-Measures
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Multi-Payer Prior Authorization & Denial Defense Matrix
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
          Payers deploy black-box algorithms (nH Predict, PXDX, Carelon, ClaimCheck) that batch-deny complex procedures. Autonomous AI coders cannot overturn automated algorithmic denials. Only certified human specialists invoking statutory mandates (CMS-4201-F, ERISA § 502, ACA § 2719) recover at-risk revenue.
        </p>
      </div>

      {/* Payer Archetype Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {PAYER_ARCHETYPES.map((payer) => {
          const isSelected = payer.id === selectedPayerId;
          return (
            <button
              key={payer.id}
              onClick={() => handlePayerChange(payer.id)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-950/50 ring-1 ring-teal-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                    isSelected ? 'bg-teal-500/20 text-teal-300 font-bold' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {payer.category}
                </span>
                <Building className={`w-4 h-4 ${isSelected ? 'text-teal-400' : 'text-slate-500'}`} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1 line-clamp-1">{payer.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{payer.description}</p>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Appeal: {payer.statutoryAppealWindowDays}d</span>
                <span className="text-teal-400 font-semibold flex items-center gap-1">
                  View Cases <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Governing Statute Banner */}
      <div className="mb-8 p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Scale className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-teal-400">
              Active Regulatory & Statutory Authority:
            </div>
            <div className="text-sm font-semibold text-slate-200 mt-0.5">
              {selectedPayer.governingStatute}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono text-slate-400">Payer AI Bots:</span>
          <div className="flex flex-wrap gap-1.5">
            {selectedPayer.commonAlgorithms.map((algo) => (
              <span
                key={algo}
                className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50 text-rose-300 text-[11px] font-mono flex items-center gap-1"
              >
                <Bot className="w-3 h-3 text-rose-400" />
                {algo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Procedure Selector & Active Denial Defense Case */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Procedures Available for this Payer */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
            <span>High-Denial Surgical Encounters</span>
            <span className="text-teal-400 font-bold">{availableProfiles.length} Profiles</span>
          </div>

          {availableProfiles.map((profile) => {
            const isSelected = profile.id === activeProfile.id;
            return (
              <button
                key={profile.id}
                onClick={() => setSelectedProfileId(profile.id)}
                className={`w-full p-4 rounded-xl text-left transition-all border ${
                  isSelected
                    ? 'bg-slate-900 border-teal-500 shadow-md shadow-teal-950/40 ring-1 ring-teal-500'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 text-xs font-mono font-bold">
                    CPT {profile.cptCode}
                  </span>
                  <span className="text-xs font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-800/40">
                    {profile.carcCode}
                  </span>
                </div>
                <div className="text-sm font-semibold text-white mb-1 line-clamp-2">
                  {profile.procedureTitle}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1">
                  <span>{profile.specialty}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: In-Depth Denial Anatomy & Defense Dossier */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            {/* Header of Active Profile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono font-bold">
                    CPT {activeProfile.cptCode}
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Specialty: {activeProfile.specialty}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {activeProfile.procedureTitle}
                </h3>
              </div>
              <div className="text-right shrink-0 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="text-[11px] font-mono uppercase text-slate-400">Financial Exposure</div>
                <div className="text-sm font-mono font-bold text-rose-400">
                  {activeProfile.financialImpactPerCase}
                </div>
              </div>
            </div>

            {/* Denial Codes Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-6">
              <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
                <div className="text-[11px] font-mono text-rose-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Primary CARC: {activeProfile.carcCode}
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {activeProfile.carcDescription}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
                <div className="text-[11px] font-mono text-amber-400 font-bold uppercase mb-1 flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  Remittance RARC: {activeProfile.rarcCode}
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {activeProfile.rarcDescription}
                </p>
              </div>
            </div>

            {/* Algorithmic Trigger Callout */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 mb-6">
              <div className="flex items-center gap-2 text-xs font-mono text-rose-400 uppercase tracking-wider font-bold mb-1.5">
                <Bot className="w-4 h-4 text-rose-400" />
                Payer Algorithmic Denial Mechanism:
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {activeProfile.algorithmicTriggerMechanism}
              </p>
            </div>

            {/* Defense Tabs: Strategy vs Peer-to-Peer vs Legal Reconsideration */}
            <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
              <button
                onClick={() => setActiveTab('strategy')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'strategy'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                Sovereign Human Defense
              </button>
              <button
                onClick={() => setActiveTab('p2p')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'p2p'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                Peer-to-Peer (P2P) Battle Card
              </button>
              <button
                onClick={() => setActiveTab('legal')}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all border-b-2 flex items-center gap-1.5 ${
                  activeTab === 'legal'
                    ? 'border-teal-400 text-teal-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-4 h-4" />
                Statutory Authority
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'strategy' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-teal-950/20 border border-teal-800/40">
                  <div className="text-xs font-mono uppercase text-teal-400 font-bold mb-1.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-teal-400" />
                    Human Sovereign Specialist Playbook:
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {activeProfile.humanDefenseStrategy}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-1">
                    Applicable Statutory Ground:
                  </div>
                  <p className="text-xs text-slate-300">{activeProfile.statutoryLegalBasis}</p>
                </div>
              </div>
            )}

            {activeTab === 'p2p' && (
              <div className="space-y-3">
                <div className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold mb-1 flex items-center gap-2">
                  <PhoneCall className="w-4 h-4" />
                  Direct Talking Points for Surgeon / Attending Physician:
                </div>
                {activeProfile.peerToPeerTalkingPoints.map((point, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-teal-950 text-teal-400 border border-teal-700/60 text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'legal' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <div className="text-xs font-mono uppercase text-teal-400 font-bold mb-2 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-teal-400" />
                    Statutory Rule & Case Precedent:
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mb-4">
                    {activeProfile.statutoryLegalBasis}
                  </p>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
                    <span className="text-amber-400 font-bold">OIG Compliance Flag: </span>
                    {selectedPayer.auditPrevalence}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Full Statutory Appeal Dossier Ready</span>
            </div>
            <button
              onClick={() => setShowReconsiderationModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-950/50"
            >
              <FileCheck2 className="w-4 h-4" />
              Generate Reconsideration Appeal Brief
            </button>
          </div>
        </div>
      </div>

      {/* Reconsideration Appeal Brief Modal */}
      {showReconsiderationModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Formal Statutory Reconsideration Appeal Brief
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    CPT {activeProfile.cptCode} • {activeProfile.procedureTitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowReconsiderationModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Close [ESC]
              </button>
            </div>

            {/* Appeal Text Container */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-4 mb-6 leading-relaxed">
              <div className="border-b border-slate-800 pb-3">
                <div className="text-teal-400 font-bold">
                  TO: {selectedPayer.name} - Appeals & Grievance Department
                </div>
                <div>FROM: Aethera Sovereign Clinical Appeals & Regulatory Defense Unit</div>
                <div>DATE: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                <div className="text-rose-400">
                  RE: Reversal of Denial CARC {activeProfile.carcCode} / RARC {activeProfile.rarcCode}
                </div>
                <div>STATUTORY REGULATION: {selectedPayer.governingStatute}</div>
              </div>

              {activeProfile.reconsiderationExcerpts.map((sec, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="text-teal-300 font-bold uppercase tracking-wider">
                    {sec.sectionHeading}
                  </div>
                  <div className="text-slate-300 font-sans text-xs sm:text-sm pl-2 border-l-2 border-slate-800">
                    {sec.text}
                  </div>
                </div>
              ))}

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                <div className="text-amber-300 font-bold uppercase">
                  SOVEREIGN HUMAN CERTIFIED SIGNER ATTESTATION:
                </div>
                <div>
                  Under penalty of perjury pursuant to the False Claims Act (31 U.S.C. § 3729), the
                  undersigned CPC / CPMA certified coder attests that operative documentation,
                  imaging records, and pathology reports have been personally audited and satisfy all
                  CMS and statutory requirements.
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Scale className="w-3.5 h-3.5 text-teal-400" />
                <span>Statutory 60-180 Day Filing Enforced</span>
              </div>
              <button
                onClick={handleCopyReconsideration}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                {copiedBrief ? (
                  <>
                    <Check className="w-4 h-4 text-slate-950" />
                    Copied to Clipboard
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-950" />
                    Copy Formal Appeal Brief
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
