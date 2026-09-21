'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  P2P_SCENARIOS,
  P2PScenario,
  P2PDialogueTurn,
} from '@/data/physicianP2PSimulatorData';
import {
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Building,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  Scale,
  Award,
  Activity,
  Mic,
} from 'lucide-react';

interface SelectedChoice {
  turnIndex: number;
  optionId: string;
  tone: 'passive' | 'aggressive' | 'sovereign';
  text: string;
  feedback: string;
  citation: string;
}

export default function PhysicianP2PSimulator() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('p2p-spine-fusion');
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [userChoices, setUserChoices] = useState<SelectedChoice[]>([]);
  const [authorityScore, setAuthorityScore] = useState<number>(50);
  const [callEnded, setCallEnded] = useState<boolean>(false);
  const [callOutcome, setCallOutcome] = useState<'approved' | 'denied' | 'terminated' | 'in_progress'>('in_progress');
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showCertificationModal, setShowCertificationModal] = useState<boolean>(false);
  const [activeSpeaker, setActiveSpeaker] = useState<'payer' | 'physician' | 'none'>('none');

  const scenario: P2PScenario =
    P2P_SCENARIOS.find((s) => s.id === selectedScenarioId) || P2P_SCENARIOS[0];

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = (text: string, isPayer: boolean) => {
    if (!audioEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = isPayer ? 0.95 : 1.1;

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      // Pick suitable voice if available
      const englishVoices = voices.filter((v) => v.lang.startsWith('en'));
      if (englishVoices.length > 1) {
        utterance.voice = isPayer ? englishVoices[0] : englishVoices[1];
      }
    }

    utterance.onstart = () => {
      setIsPlayingAudio(true);
      setActiveSpeaker(isPayer ? 'payer' : 'physician');
    };

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setActiveSpeaker('none');
    };

    utterance.onerror = () => {
      setIsPlayingAudio(false);
      setActiveSpeaker('none');
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleScenarioChange = (id: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
    setActiveSpeaker('none');
    setSelectedScenarioId(id);
    setCurrentTurnIndex(0);
    setUserChoices([]);
    setAuthorityScore(50);
    setCallEnded(false);
    setCallOutcome('in_progress');
  };

  const handleSelectOption = (option: NonNullable<P2PDialogueTurn['options']>[number]) => {
    const newChoice: SelectedChoice = {
      turnIndex: currentTurnIndex,
      optionId: option.id,
      tone: option.tone,
      text: option.text,
      feedback: option.feedback,
      citation: option.statutoryCitation,
    };

    const newScore = Math.max(0, Math.min(100, authorityScore + option.authorityScoreDelta));
    setAuthorityScore(newScore);

    const updatedChoices = [...userChoices, newChoice];
    setUserChoices(updatedChoices);

    // Speak user's choice
    speakText(option.text, false);

    if (option.tone === 'aggressive') {
      setCallEnded(true);
      setCallOutcome('terminated');
      return;
    }

    if (option.tone === 'passive') {
      setCallEnded(true);
      setCallOutcome('denied');
      return;
    }

    // Sovereign branch: check if there's a next turn
    const nextTurn = currentTurnIndex + 1;
    if (nextTurn < scenario.dialogueScript.length) {
      setCurrentTurnIndex(nextTurn);
      // Automatically speak the next payer turn after slight delay
      setTimeout(() => {
        const nextPayerTurn = scenario.dialogueScript[nextTurn];
        if (nextPayerTurn && nextPayerTurn.speaker === 'payer') {
          speakText(nextPayerTurn.statement, true);
        }
      }, 1200);
    } else {
      // Completed all sovereign turns -> Approved!
      setCallEnded(true);
      setCallOutcome('approved');
    }
  };

  const handleResetCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentTurnIndex(0);
    setUserChoices([]);
    setAuthorityScore(50);
    setCallEnded(false);
    setCallOutcome('in_progress');
    setIsPlayingAudio(false);
    setActiveSpeaker('none');
  };

  return (
    <section
      id="physician-p2p-simulator"
      className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80 scroll-mt-20"
    >
      {/* Section Header */}
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-700/50 text-teal-300 text-xs font-mono uppercase tracking-wider mb-4">
          <PhoneCall className="w-3.5 h-3.5 text-teal-400" />
          Interactive Statutory Rebuttal & Simulation Engine
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Physician Peer-to-Peer (P2P) Audio/Script Simulator
        </h2>
        <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed">
          Payer medical directors read from rigid internal scripts (MCG, InterQual) to pressure attending surgeons into accepting prior-auth denials. Rehearse real-time statutory rebuttals under CMS-4201-F, the Two-Midnight Rule, and ERISA § 502 to overturn denials in under 8 minutes.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {P2P_SCENARIOS.map((item) => {
          const isSelected = item.id === selectedScenarioId;
          return (
            <button
              key={item.id}
              onClick={() => handleScenarioChange(item.id)}
              className={`p-4 rounded-xl text-left transition-all border ${
                isSelected
                  ? 'bg-slate-900 border-teal-500 shadow-lg shadow-teal-950/50 ring-1 ring-teal-500'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="text-[11px] font-mono text-teal-400 uppercase tracking-wider mb-1">
                {item.specialty}
              </div>
              <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
              <div className="text-xs font-mono text-slate-400 mb-1 flex items-center justify-between">
                <span>{item.cptOrHcpcs}</span>
                <span className="text-rose-400 font-bold">{item.atRiskRevenue.split(' ')[0]}</span>
              </div>
              <div className="text-[11px] text-slate-400 line-clamp-1">{item.payerName}</div>
            </button>
          );
        })}
      </div>

      {/* Call Telemetry HUD Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 mb-8 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Side: Call Profile */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-700/60 text-rose-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              RECORDING ACTIVE
            </span>
            <span className="text-xs font-mono text-slate-400">
              P2P Case: <strong className="text-white">{scenario.cptOrHcpcs}</strong>
            </span>
          </div>

          <div className="text-sm font-bold text-white flex items-center gap-2 mt-1">
            <Building className="w-4 h-4 text-teal-400" />
            <span>{scenario.payerName}</span>
            <span className="text-xs font-normal text-slate-400">({scenario.payerAlgorithm})</span>
          </div>

          <div className="text-xs text-slate-300">
            <strong className="text-amber-300">Reviewer: </strong> {scenario.initialDirectorName} •{' '}
            <span className="text-rose-400 font-semibold">{scenario.initialDirectorBoard}</span>
          </div>
        </div>

        {/* Center: Audio Waveform Animation & Speaker State */}
        <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1">
            {[0.4, 0.8, 1.2, 0.6, 1.4, 0.9, 0.5].map((scale, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isPlayingAudio
                    ? activeSpeaker === 'payer'
                      ? 'bg-rose-400 h-6 animate-pulse'
                      : 'bg-teal-400 h-6 animate-pulse'
                    : 'bg-slate-700 h-2'
                }`}
                style={{
                  height: isPlayingAudio ? `${scale * 16}px` : '6px',
                }}
              />
            ))}
          </div>

          <div className="text-xs font-mono">
            {isPlayingAudio ? (
              <span
                className={activeSpeaker === 'payer' ? 'text-rose-400 font-bold' : 'text-teal-400 font-bold'}
              >
                {activeSpeaker === 'payer' ? 'Payer Reviewer Speaking' : 'Attending Surgeon Speaking'}
              </span>
            ) : (
              <span className="text-slate-400">Awaiting Verbal Input</span>
            )}
          </div>

          {/* Mute/Unmute toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={audioEnabled ? 'Mute Audio Simulation' : 'Enable Audio Simulation'}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4 text-teal-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>

        {/* Right Side: Authority Score & Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[11px] font-mono uppercase text-slate-400">Statutory Authority</div>
            <div className="text-xl font-mono font-extrabold text-teal-400">
              {authorityScore}%
            </div>
          </div>
          <button
            onClick={handleResetCall}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Restart Call Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Dialogue Transcript & Response Decision Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left / Center: Interactive Call Timeline (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Historical Turns & Current Turn */}
          {scenario.dialogueScript.map((turn, tIndex) => {
            if (tIndex > currentTurnIndex && !callEnded) return null;

            const isCurrentTurn = tIndex === currentTurnIndex;
            const chosenOption = userChoices.find((c) => c.turnIndex === tIndex);

            return (
              <div key={tIndex} className="space-y-4 animate-fade-in">
                {/* Payer Director Statement Bubble */}
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-950 border border-rose-700/60 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-mono text-rose-400 font-bold uppercase">
                        {turn.speakerTitle} • {turn.speakerAffiliation}
                      </div>
                      <button
                        onClick={() => speakText(turn.statement, true)}
                        className="text-xs font-mono text-slate-400 hover:text-teal-400 flex items-center gap-1"
                      >
                        <Volume2 className="w-3.5 h-3.5" /> Replay Audio
                      </button>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-sans">
                      &ldquo;{turn.statement}&rdquo;
                    </p>
                    {turn.statutoryContext && (
                      <div className="text-[11px] font-mono text-amber-400/90 bg-amber-950/20 p-2 rounded-lg border border-amber-800/30">
                        Payer Strategy Insight: {turn.statutoryContext}
                      </div>
                    )}
                  </div>
                </div>

                {/* If user already made a choice on this turn, render the chosen response */}
                {chosenOption && (
                  <div
                    className={`p-5 rounded-2xl border ml-6 sm:ml-12 ${
                      chosenOption.tone === 'sovereign'
                        ? 'bg-teal-950/30 border-teal-600/60 text-slate-100'
                        : chosenOption.tone === 'aggressive'
                        ? 'bg-rose-950/40 border-rose-600/60 text-slate-200'
                        : 'bg-amber-950/30 border-amber-600/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-mono font-bold uppercase flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            chosenOption.tone === 'sovereign' ? 'bg-teal-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>Attending Physician Rebuttal ({chosenOption.tone.toUpperCase()})</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {chosenOption.citation}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed mb-3">&ldquo;{chosenOption.text}&rdquo;</p>
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono">
                      <strong className="text-teal-300">Debrief: </strong>
                      <span className="text-slate-300">{chosenOption.feedback}</span>
                    </div>
                  </div>
                )}

                {/* If it's the current turn and call not ended, display the tactical option cards */}
                {isCurrentTurn && !callEnded && turn.options && (
                  <div className="space-y-3 pt-2">
                    <div className="text-xs font-mono uppercase tracking-wider text-teal-400 font-bold flex items-center gap-1.5">
                      <Activity className="w-4 h-4" />
                      Select Physician Verbal Rebuttal:
                    </div>
                    {turn.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full p-4 rounded-xl text-left transition-all border ${
                          opt.tone === 'sovereign'
                            ? 'bg-slate-900/90 border-teal-500/70 hover:border-teal-400 hover:bg-slate-850 hover:shadow-lg hover:shadow-teal-950/40 ring-1 ring-teal-500/30'
                            : opt.tone === 'aggressive'
                            ? 'bg-slate-950/60 border-rose-900/50 hover:border-rose-700 hover:bg-rose-950/20'
                            : 'bg-slate-950/60 border-amber-900/50 hover:border-amber-700 hover:bg-amber-950/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-xs font-mono font-bold uppercase px-2 py-0.5 rounded ${
                              opt.tone === 'sovereign'
                                ? 'bg-teal-500/20 text-teal-300'
                                : opt.tone === 'aggressive'
                                ? 'bg-rose-950 text-rose-300'
                                : 'bg-amber-950 text-amber-300'
                            }`}
                          >
                            {opt.label}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            Authority: {opt.authorityScoreDelta > 0 ? `+${opt.authorityScoreDelta}` : opt.authorityScoreDelta}%
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          &ldquo;{opt.text}&rdquo;
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Call Outcome Resolution Banner */}
          {callEnded && (
            <div
              className={`p-6 rounded-2xl border shadow-2xl animate-fade-in ${
                callOutcome === 'approved'
                  ? 'bg-teal-950/30 border-teal-500/70'
                  : 'bg-rose-950/30 border-rose-700/70'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  {callOutcome === 'approved' ? (
                    <div className="p-3 rounded-xl bg-teal-500 text-slate-950 font-bold">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-rose-600 text-white font-bold">
                      <PhoneOff className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {callOutcome === 'approved'
                        ? 'OVERTURN GRANTED: Prior Authorization Released'
                        : callOutcome === 'terminated'
                        ? 'CALL TERMINATED: Escalated to 60-Day Administrative Grievance'
                        : 'DENIAL UPHELD: Revenue Lost to Corporate Policy'}
                    </h3>
                    <div className="text-xs font-mono text-slate-400 mt-0.5">
                      {callOutcome === 'approved'
                        ? `Auth Number: ${scenario.successfulResolution.authorizationNumber}`
                        : 'Reviewer closed verbal reconsideration queue.'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleResetCall}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Replay Call
                </button>
              </div>

              {callOutcome === 'approved' ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-teal-800/40 text-xs text-slate-200 leading-relaxed font-mono">
                    <strong className="text-teal-300">Reversal Basis: </strong>
                    {scenario.successfulResolution.reversalBasis}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
                    <div className="text-xs text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                      <Award className="w-4 h-4" />
                      <span>{scenario.successfulResolution.physicianRoi}</span>
                    </div>
                    <button
                      onClick={() => setShowCertificationModal(true)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      Generate P2P Call Certification Dossier
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="text-rose-400 font-bold">Post-Mortem: </span>
                  Failing to invoke binding statutory preemption (CMS-4201-F, Two-Midnight Rule) allows payer medical directors to default to proprietary commercial criteria. Click &ldquo;Replay Call&rdquo; to test the Sovereign Statutory path.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Case Dossier & P2P Quick Rules (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Revenue at Risk Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="text-xs font-mono uppercase text-slate-400 mb-1">Financial Exposure</div>
            <div className="text-2xl font-bold text-rose-400 mb-2">
              {scenario.atRiskRevenue}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {scenario.denialBasis}
            </p>
          </div>

          {/* Governing Authority Card */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="text-xs font-mono uppercase text-teal-400 font-bold flex items-center gap-1.5">
              <Scale className="w-4 h-4" />
              Binding Statutory Anchor:
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-mono">
              {scenario.governingStatute}
            </p>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
              <span className="text-amber-300 font-bold">Rule of Engagement: </span>
              Always confirm reviewer NPI and specialty board certification on record. Non-matched reviewers trigger mandatory external peer review rights under 42 CFR § 422.566.
            </div>
          </div>

          {/* P2P Golden Rules Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="text-xs font-mono uppercase text-amber-400 font-bold">
              3 Sovereign Rules for P2P Calls:
            </div>
            <ul className="space-y-2 text-xs text-slate-300 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold mt-0.5">1.</span>
                <span><strong>Never Argue Pain Alone:</strong> Payer algorithms do not calculate empathy. Only cite objective millimeter measurements, FFR indices, or lab values.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold mt-0.5">2.</span>
                <span><strong>Invoke CMS-4201-F:</strong> Medicare Advantage plans cannot apply criteria more restrictive than Traditional Medicare LCDs/NCDs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold mt-0.5">3.</span>
                <span><strong>Demand Real-Time Auth Number:</strong> Do not accept &ldquo;we will send a letter in 7-10 business days.&rdquo; Demand verbal authorization code before disconnecting.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* P2P Call Certification Modal */}
      {showCertificationModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-5 h-5 text-teal-400" />
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Physician Peer-to-Peer Verbal Reversal Dossier
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Authorization Number: {scenario.successfulResolution.authorizationNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCertificationModal(false)}
                  className="text-slate-400 hover:text-white text-sm font-mono px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  Close [ESC]
                </button>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-3 mb-6 leading-relaxed">
                <div>
                  <span className="text-teal-400 font-bold">CASE: </span>
                  {scenario.title} ({scenario.cptOrHcpcs})
                </div>
                <div>
                  <span className="text-teal-400 font-bold">PAYER / HEALTH PLAN: </span>
                  {scenario.payerName}
                </div>
                <div>
                  <span className="text-teal-400 font-bold">MEDICAL REVIEWER: </span>
                  {scenario.initialDirectorName} ({scenario.initialDirectorBoard})
                </div>
                <div>
                  <span className="text-teal-400 font-bold">STATUTORY BASIS INVOKED: </span>
                  {scenario.governingStatute}
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-teal-400 font-bold">VERBAL OVERTURN SUMMARY: </span>
                  <p className="font-sans text-xs text-slate-200 mt-1">
                    {scenario.successfulResolution.reversalBasis}
                  </p>
                </div>
                <div className="border-t border-slate-800 pt-3">
                  <span className="text-amber-400 font-bold">CERTIFICATION SEAL: </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Certified for clinical chart integration pursuant to False Claims Act (31 U.S.C. § 3729) safe harbor documentation standards.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs font-mono text-emerald-400">
                {scenario.successfulResolution.physicianRoi}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `PEER-TO-PEER OVERTURN CONFIRMATION\nCase: ${scenario.title}\nAuth: ${scenario.successfulResolution.authorizationNumber}\nReviewer: ${scenario.initialDirectorName}\nStatute: ${scenario.governingStatute}\nReversal Basis: ${scenario.successfulResolution.reversalBasis}`
                  );
                  alert('P2P Reversal Summary copied to clipboard!');
                }}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
