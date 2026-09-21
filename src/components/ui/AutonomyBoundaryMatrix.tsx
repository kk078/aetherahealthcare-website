'use client';

import { useState } from 'react';
import {
  Cpu,
  UserCheck,
  Ban,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { AUTONOMY_PHASES, AUTONOMY_LEVELS } from '@/data/autonomyData';

export default function AutonomyBoundaryMatrix() {
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);

  const activePhase = AUTONOMY_PHASES[activePhaseIndex];

  return (
    <div className="space-y-10">
      {/* Levels of Autonomy Header Box */}
      <div className="bg-cream rounded-3xl p-6 sm:p-8 border border-gray/15">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-teal bg-teal/10 px-3 py-1 rounded-full">
            Industry Benchmark
          </span>
          <h3 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mt-2">
            The 4 Levels of Autonomy in Medical Billing
          </h3>
          <p className="text-gray text-xs sm:text-sm mt-2">
            Where other vendors deploy reckless black-box generative models, Aethera operates at Level 3:
            deterministic software precision backed by 100% certified human sign-off.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AUTONOMY_LEVELS.map((lvl) => (
            <div
              key={lvl.level}
              className={`p-5 rounded-2xl border transition-all ${
                lvl.highlight
                  ? 'bg-navy text-white border-mint shadow-lg shadow-mint/10'
                  : 'bg-white text-navy border-gray/20'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                    lvl.highlight ? 'bg-mint text-navy' : 'bg-gray/10 text-gray'
                  }`}
                >
                  {lvl.level}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    lvl.highlight ? 'text-mint' : 'text-slate-500'
                  }`}
                >
                  {lvl.status}
                </span>
              </div>
              <h4
                className={`font-bold text-sm mb-1.5 ${
                  lvl.highlight ? 'text-white' : 'text-navy'
                }`}
              >
                {lvl.title}
              </h4>
              <p
                className={`text-xs leading-relaxed ${
                  lvl.highlight ? 'text-slate-300' : 'text-gray'
                }`}
              >
                {lvl.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Boundary Table / Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray/15 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal bg-teal/10 px-3 py-1 rounded-full">
              Sovereign Trust Boundary
            </span>
            <h3 className="font-jakarta text-2xl sm:text-3xl font-extrabold text-navy tracking-tight mt-2">
              Phase-by-Phase Autonomy Matrix
            </h3>
            <p className="text-gray text-xs sm:text-sm mt-1">
              Select any phase of the revenue cycle to inspect our exact technical and human boundaries.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-cream p-1.5 rounded-2xl border border-gray/10">
            {AUTONOMY_PHASES.map((p, idx) => (
              <button
                key={p.phaseNumber}
                onClick={() => setActivePhaseIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                  activePhaseIndex === idx
                    ? 'bg-navy text-white shadow-sm'
                    : 'text-gray hover:text-navy hover:bg-slate-100'
                }`}
              >
                Phase {p.phaseNumber}
              </button>
            ))}
          </div>
        </div>

        {/* Active Phase Card */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-cream border border-gray/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono font-bold text-teal">PHASE {activePhase.phaseNumber}</div>
              <h4 className="text-xl font-extrabold text-navy font-jakarta mt-0.5">{activePhase.name}</h4>
              <p className="text-xs text-gray mt-1">{activePhase.description}</p>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-xs font-mono bg-white px-3 py-2 rounded-xl border border-gray/20 text-slate-700">
              <Lock className="h-4 w-4 text-teal" />
              <span>{activePhase.auditTrailEvidence}</span>
            </div>
          </div>

          {/* Side by Side Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Deterministic AI Engine */}
            <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
              <div className="flex items-center gap-2.5 text-emerald-900 font-bold text-sm uppercase tracking-wider">
                <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
                  <Cpu className="h-4 w-4" />
                </div>
                <span>What Deterministic AI Automates</span>
              </div>
              <ul className="space-y-2.5 text-xs text-emerald-950">
                {activePhase.deterministicSoftwareAction.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Certified Human Sovereignty */}
            <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-4">
              <div className="flex items-center gap-2.5 text-amber-900 font-bold text-sm uppercase tracking-wider">
                <div className="p-1.5 rounded-lg bg-amber-600 text-white">
                  <UserCheck className="h-4 w-4" />
                </div>
                <span>Certified Human Coder Sovereignty</span>
              </div>
              <ul className="space-y-2.5 text-xs text-amber-950">
                {activePhase.humanCertifiedSignoffAction.map((action, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Hard Guardrail: What AI is mathematically barred from doing */}
          <div className="p-5 rounded-2xl bg-red-50/70 border border-red-200 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-red-600 text-white shrink-0">
              <Ban className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-red-900 uppercase tracking-wider">
                Strict Algorithmic Guardrail
              </p>
              <p className="text-xs text-red-950 mt-1 leading-relaxed font-semibold">
                {activePhase.forbiddenAiAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
