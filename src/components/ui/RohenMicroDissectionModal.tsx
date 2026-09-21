'use client';

import React, { useState } from 'react';
import {
  ROHEN_MICRO_DISSECTIONS,
  RohenMicroDissectionProfile,
} from '@/data/rohenMicroDissectionData';
import {
  Layers,
  BookOpen,
  DollarSign,
  ShieldCheck,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Info,
} from 'lucide-react';

interface RohenMicroDissectionModalProps {
  systemId: string;
  isOpen: boolean;
  onClose: () => void;
  onJumpToCode?: (code: string) => void;
}

export default function RohenMicroDissectionModal({
  systemId,
  isOpen,
  onClose,
  onJumpToCode,
}: RohenMicroDissectionModalProps) {
  const [activeTab, setActiveTab] = useState<'planes' | 'rvu' | 'dictation' | 'sovereign'>('planes');

  const profile: RohenMicroDissectionProfile =
    ROHEN_MICRO_DISSECTIONS[systemId] || ROHEN_MICRO_DISSECTIONS['head-neck'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-teal-500/40 rounded-3xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto text-white">
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-mono text-[10px] font-bold uppercase border border-teal-500/30">
                Rohen Atlas 7th Ed. Photographic Study Drill-Down
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {profile.rohenCitation.pages}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {profile.procedureTitle}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Primary CPT: <span className="text-teal-300 font-bold">{profile.rvuEconomics.primaryCpt}</span> • {profile.rohenCitation.dissectionPlates}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Close Dissection Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          {[
            { id: 'planes', label: '1. Surgical Tissue Planes', icon: Layers },
            { id: 'rvu', label: '2. 2026 RVU & CMS Fee Schedule', icon: DollarSign },
            { id: 'dictation', label: '3. Mandatory Operative Dictation', icon: FileText },
            { id: 'sovereign', label: '4. Sovereign Coder Sign-Off', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: SURGICAL TISSUE PLANES */}
        {activeTab === 'planes' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Rohen Plate Anatomy Callout */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="text-teal-300 font-bold flex items-center gap-2 uppercase tracking-wider font-mono text-[11px]">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <span>Anatomical Landmarks Identified in Rohen Dissection Plates</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {profile.rohenCitation.keyFigureLabels.map((label, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Step-by-Step Stratified Planes */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                Sequential Anatomical Dissection Strata (Superficial to Deep)
              </h4>
              <div className="space-y-2.5">
                {profile.tissuePlanes.map((plane) => (
                  <div
                    key={plane.layerNumber}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono font-bold flex items-center justify-center border border-teal-500/40">
                          {plane.layerNumber}
                        </span>
                        <span className="font-bold text-white text-sm">
                          {plane.layerName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
                        Depth: {plane.depthMm}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed pl-8">
                      <strong>Surgical Technique:</strong> {plane.surgicalTechnique}
                    </div>

                    <div className="pl-8 flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-mono">
                      <div className="text-teal-300">
                        <strong>CPT Relevance:</strong> {plane.cptRelevance}
                      </div>
                      <div className="text-slate-500">
                        {plane.anatomicalStructures.join(' • ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RVU & CMS FEE SCHEDULE */}
        {activeTab === 'rvu' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Primary CPT Valuation Card */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-teal-400 font-bold">
                    Primary Procedural CPT Code
                  </span>
                  <div className="text-2xl font-black text-white font-mono">
                    CPT {profile.rvuEconomics.primaryCpt}
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[10px] uppercase text-slate-400">2026 Facility Medicare Fee</span>
                  <div className="text-2xl font-black text-emerald-400">
                    {profile.rvuEconomics.estimatedFacilityMedicarePayment}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {profile.rvuEconomics.cptDescriptor}
              </p>

              {/* RVU Breakdown Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Work RVU</span>
                  <div className="text-base font-bold text-white font-mono">
                    {profile.rvuEconomics.workRvu.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Practice Exp RVU</span>
                  <div className="text-base font-bold text-white font-mono">
                    {profile.rvuEconomics.peRvu.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Malpractice RVU</span>
                  <div className="text-base font-bold text-white font-mono">
                    {profile.rvuEconomics.mpRvu.toFixed(2)}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-teal-500/30 text-center space-y-0.5">
                  <span className="text-[10px] font-mono text-teal-400 uppercase font-bold">Total RVU</span>
                  <div className="text-base font-black text-teal-300 font-mono">
                    {profile.rvuEconomics.totalFacilityRvu.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono pt-1">
                <span>Global Surgical Period: <strong className="text-white">{profile.rvuEconomics.globalPeriod}-Day Package</strong></span>
                <span>MUE Practitioner Limit: <strong className="text-white">{profile.rvuEconomics.mueThreshold} unit(s)</strong></span>
                <span>2026 CF: <strong className="text-white">${profile.rvuEconomics.conversionFactor2026.toFixed(2)}</strong></span>
              </div>
            </div>

            {/* Add-On Codes List */}
            {profile.rvuEconomics.addOnCodes.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Billable Add-On Codes (+Codes) Frequently Omitted by AI
                </h4>
                <div className="space-y-2">
                  {profile.rvuEconomics.addOnCodes.map((addon) => (
                    <div
                      key={addon.code}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-teal-300 mr-2">{addon.code}</span>
                        <span className="text-slate-300">{addon.descriptor}</span>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold shrink-0 text-right">
                        {addon.rvuImpact}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANDATORY OPERATIVE DICTATION */}
        {activeTab === 'dictation' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Required Excerpts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Surgeon Dictation Phrases Required for Medicare RAC Defense
                </h4>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                  Audit-Proof Proof Text
                </span>
              </div>

              <div className="space-y-2.5">
                {profile.requiredDictationExcerpts.map((excerpt, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs italic text-slate-200 font-sans leading-relaxed flex items-start gap-2.5"
                  >
                    <span className="text-teal-400 font-mono font-bold shrink-0 not-italic">
                      #{idx + 1}
                    </span>
                    <span>{excerpt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payer Audit Tripwires */}
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 space-y-2.5 text-xs">
              <div className="text-rose-300 font-bold flex items-center gap-2 uppercase tracking-wider font-mono text-[11px]">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Payer Clearinghouse &amp; RAC Recoupment Tripwires</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-300">
                {profile.payerAuditTripwires.map((trap, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {trap}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 4: SOVEREIGN CODER SIGN-OFF */}
        {activeTab === 'sovereign' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Coder Credential Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-950/60 via-slate-950 to-slate-900 border border-teal-500/40 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-teal-500/30 pb-3">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-teal-400" />
                  <span>The Sovereign Signer Mandate</span>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-900 text-teal-200 border border-teal-700">
                  {profile.sovereignSignerSpec.credential}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="font-bold text-white text-base">
                  {profile.sovereignSignerSpec.title}
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {profile.sovereignSignerSpec.statutoryLiability}
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  Mandatory Pre-Submission Audit Checklist (100% Sign-Off Required)
                </div>
                <div className="space-y-2">
                  {profile.sovereignSignerSpec.verificationChecklist.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 text-xs">
          <div className="text-slate-400 font-mono text-[11px] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-teal-400" />
            <span>Digitalized from Rohen Color Atlas of Anatomy 7th Ed.</span>
          </div>

          <div className="flex items-center gap-3">
            {onJumpToCode && (
              <button
                onClick={() => {
                  onJumpToCode(profile.rvuEconomics.primaryCpt);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-450 text-slate-950 font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-teal-500/20"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Jump to CPT {profile.rvuEconomics.primaryCpt} Console</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Close Dissection Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
