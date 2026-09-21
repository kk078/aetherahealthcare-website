'use client';

import React, { useState, useMemo } from 'react';
import {
  CLINICAL_LEDGER_SCENARIOS,
  ClinicalLedgerScenario,
  LedgerBlock,
} from '@/data/cryptographicLedgerData';
import {
  ShieldCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Database,
  Cpu,
  Layers,
  Fingerprint,
  Download,
  FileCode,
  Check,
  XCircle,
  Copy,
} from 'lucide-react';

export default function CryptographicAuditLedger() {
  const [activeScenarioId, setActiveScenarioId] = useState<string>('spine-arthrodesis');
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number>(3); // Default to Sovereign Gate
  const [isTampered, setIsTampered] = useState<boolean>(false);
  const [auditPacketOpen, setAuditPacketOpen] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const activeScenario: ClinicalLedgerScenario = useMemo(() => {
    return (
      CLINICAL_LEDGER_SCENARIOS.find((s) => s.id === activeScenarioId) ||
      CLINICAL_LEDGER_SCENARIOS[0]
    );
  }, [activeScenarioId]);

  const activeBlock: LedgerBlock = useMemo(() => {
    return activeScenario.blocks[selectedBlockIndex] || activeScenario.blocks[0];
  }, [activeScenario, selectedBlockIndex]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getStageIcon = (stageType: LedgerBlock['stageType']) => {
    switch (stageType) {
      case 'intake':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'algorithmic':
        return <Cpu className="w-4 h-4 text-indigo-400" />;
      case 'policy':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'human_sovereign':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'edi_output':
        return <FileCode className="w-4 h-4 text-teal-400" />;
    }
  };

  return (
    <section id="cryptographic-audit-ledger" className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/3 w-[800px] h-[500px] bg-teal-500/10 blur-[180px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[400px] bg-cyan-500/10 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-xs font-semibold uppercase tracking-wider">
            <Fingerprint className="w-3.5 h-3.5 text-teal-400" />
            Sequential SHA-256 Merkle Ledger • CMS RAC Defense Engine
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Cryptographic Audit Trail &amp; Chain of Custody
          </h2>
          <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
            In federal audits under 31 U.S.C. § 3729, black-box AI cannot provide legal proof of intent.
            Every clinical ingestion, algorithmic NCCI check, and credentialed human sign-off is sequentially hashed into an immutable cryptographic ledger.
          </p>
        </div>

        {/* Scenario Selector & Controls Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-bold mr-2">
              Select Audit Case:
            </span>
            {CLINICAL_LEDGER_SCENARIOS.map((scen) => (
              <button
                key={scen.id}
                onClick={() => {
                  setActiveScenarioId(scen.id);
                  setIsTampered(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  activeScenarioId === scen.id
                    ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white'
                }`}
              >
                <span>{scen.title.split(' ')[0]} {scen.title.split(' ')[1]}</span>
                <span className="text-[10px] opacity-75 font-mono">({scen.cptCodes[0]})</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {/* Tamper Simulation Toggle */}
            <button
              onClick={() => setIsTampered(!isTampered)}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                isTampered
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-lg shadow-rose-900/30 ring-1 ring-rose-500'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:border-slate-600'
              }`}
              title="Simulate autonomous AI code hallucination or unauthorized mutation"
            >
              {isTampered ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Tamper Test: ACTIVE (Broken Hash)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Simulate AI Tampering</span>
                </>
              )}
            </button>

            {/* Generate Legal Evidence Packet Button */}
            <button
              onClick={() => setAuditPacketOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 text-xs font-bold transition-all flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              <span>1-Click RAC Defense Packet</span>
            </button>
          </div>
        </div>

        {/* Tamper Alert Banner (Shows when tampering simulation is active) */}
        {isTampered && (
          <div className="bg-rose-950/70 border border-rose-500/60 rounded-2xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-rose-900/50 border border-rose-500/40 text-rose-400 mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5 flex-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-200 uppercase tracking-wider font-mono text-sm">
                    Cryptographic Hash Mismatch Detected • Chain of Custody Severed
                  </span>
                  <span className="bg-rose-900 text-rose-200 font-mono text-[10px] px-2 py-0.5 rounded">
                    Block #{activeScenario.tamperedState.tamperedBlockIndex} Invalidation
                  </span>
                </div>
                <p className="text-rose-300 leading-relaxed">
                  <strong>Simulated Malicious Mutation:</strong> An autonomous AI or unverified script attempted to alter{' '}
                  <span className="font-mono underline font-bold">{activeScenario.tamperedState.tamperedField}</span> from{' '}
                  <span className="text-white font-mono bg-slate-900/80 px-1.5 py-0.5 rounded">{activeScenario.tamperedState.originalValue}</span> to{' '}
                  <span className="text-rose-300 font-mono bg-rose-900/80 px-1.5 py-0.5 rounded">{activeScenario.tamperedState.mutatedValue}</span>.
                </p>
                <div className="text-slate-300 pt-1 font-mono text-[11px]">
                  <strong>Sovereign Gate Defense:</strong> {activeScenario.tamperedState.failureReason}
                </div>
              </div>
              <button
                onClick={() => setIsTampered(false)}
                className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 rounded-lg text-[11px] font-mono font-bold text-white transition-colors"
              >
                Reset Ledger
              </button>
            </div>
          </div>
        )}

        {/* Visual Sequential Blockchain Track (Blocks 0 to 4) */}
        <div className="relative">
          {/* Horizontal Line connecting blocks on desktop */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
            {activeScenario.blocks.map((block, idx) => {
              const isSelected = selectedBlockIndex === idx;
              const isTamperedBlock = isTampered && idx >= activeScenario.tamperedState.tamperedBlockIndex;

              return (
                <div
                  key={block.blockNumber}
                  onClick={() => setSelectedBlockIndex(idx)}
                  className={`cursor-pointer rounded-2xl p-4 border transition-all relative text-left ${
                    isSelected
                      ? isTamperedBlock
                        ? 'bg-rose-950/60 border-rose-500 shadow-lg shadow-rose-950/50 ring-2 ring-rose-500'
                        : 'bg-teal-950/40 border-teal-400 shadow-xl shadow-teal-950/60 ring-2 ring-teal-400'
                      : isTamperedBlock
                      ? 'bg-slate-900/90 border-rose-900/80 opacity-75 hover:opacity-100 hover:border-rose-700'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  {/* Block Header Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold">
                      {getStageIcon(block.stageType)}
                      <span className={isTamperedBlock ? 'text-rose-400' : 'text-slate-300'}>
                        Block #{block.blockNumber}
                      </span>
                    </div>
                    {isTamperedBlock ? (
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-rose-900/80 text-rose-300 border border-rose-700 flex items-center gap-1">
                        <XCircle className="w-2.5 h-2.5" />
                        Broken
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        Valid
                      </span>
                    )}
                  </div>

                  {/* Stage Title */}
                  <h4 className="text-xs font-bold text-white tracking-tight mb-2 line-clamp-2 h-8">
                    {block.blockName}
                  </h4>

                  {/* Hash Snippet */}
                  <div className="bg-slate-950/90 p-2 rounded-lg font-mono text-[10px] text-slate-400 border border-slate-800/80 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Hash:</span>
                      <span className={isTamperedBlock ? 'text-rose-400 font-bold' : 'text-teal-300'}>
                        {isTamperedBlock
                          ? '0xBAD_HASH...'
                          : `${block.blockHash.slice(0, 8)}...${block.blockHash.slice(-4)}`}
                      </span>
                    </div>
                  </div>

                  {/* Indicator Arrow for active block */}
                  {isSelected && (
                    <div className="hidden lg:block absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-teal-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Block Detailed Inspection View */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEFT COLUMN: Block Metadata & Cryptographic Ledger Headers (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                    {getStageIcon(activeBlock.stageType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                        Ledger Block #{activeBlock.blockNumber} Details
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                        {activeBlock.stageType.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                      {activeBlock.blockName}
                    </h3>
                  </div>
                </div>

                <div className="text-right font-mono text-xs text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(activeBlock.timestamp).toUTCString()}</span>
                </div>
              </div>

              {/* Summary Description */}
              <p className="text-slate-300 text-sm leading-relaxed">
                {activeBlock.summary}
              </p>

              {/* Cryptographic Hashes Panel */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs space-y-3">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Cryptographic Chain Signatures (SHA-256 HMAC)</span>
                  <span className="text-[10px] text-teal-400 lowercase">hardware enclave verified</span>
                </div>

                {/* Previous Hash */}
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px]">PREVIOUS BLOCK HASH (Parent Pointer)</div>
                  <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 flex items-center justify-between truncate">
                    <span className="truncate">{activeBlock.previousHash}</span>
                    <button
                      onClick={() => handleCopy(activeBlock.previousHash)}
                      className="ml-2 text-slate-500 hover:text-slate-300"
                      title="Copy Previous Hash"
                    >
                      {copiedHash === activeBlock.previousHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Current Block Hash */}
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px]">CURRENT BLOCK HASH (Header + Data + Nonce)</div>
                  <div className={`px-3 py-1.5 rounded-lg border flex items-center justify-between truncate ${
                    isTampered && selectedBlockIndex >= activeScenario.tamperedState.tamperedBlockIndex
                      ? 'bg-rose-950/50 border-rose-700 text-rose-300 font-bold'
                      : 'bg-teal-950/40 border-teal-700/60 text-teal-300'
                  }`}>
                    <span className="truncate">
                      {isTampered && selectedBlockIndex >= activeScenario.tamperedState.tamperedBlockIndex
                        ? '0xDEADBEEF948172901cfa448102459c044810b4f30a91176bc025531 (INVALID)'
                        : activeBlock.blockHash}
                    </span>
                    <button
                      onClick={() => handleCopy(activeBlock.blockHash)}
                      className="ml-2 text-slate-500 hover:text-slate-300"
                      title="Copy Block Hash"
                    >
                      {copiedHash === activeBlock.blockHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Merkle Root */}
                <div className="space-y-1">
                  <div className="text-slate-500 text-[10px]">MERKLE TREE ROOT PROOF</div>
                  <div className="bg-slate-900/90 px-3 py-1.5 rounded-lg text-slate-400 border border-slate-800 flex items-center justify-between truncate">
                    <span className="truncate">{activeBlock.merkleRoot}</span>
                    <button
                      onClick={() => handleCopy(activeBlock.merkleRoot)}
                      className="ml-2 text-slate-500 hover:text-slate-300"
                      title="Copy Merkle Root"
                    >
                      {copiedHash === activeBlock.merkleRoot ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Regulatory Citation */}
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <div className="text-slate-300">
                  <span className="font-bold text-white mr-1.5">Governing Regulation:</span>
                  <span className="font-mono text-teal-300">{activeBlock.regulatoryCitation}</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Stage Technical Details & Sovereign Human Seal (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Technical Audit Properties Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span>Enclave Telemetry &amp; Parameters</span>
                  <span className="text-[10px] text-teal-400">US-EAST-1</span>
                </div>

                <div className="space-y-3">
                  {activeBlock.technicalDetails.map((detail, idx) => (
                    <div key={idx} className="flex flex-col space-y-0.5 text-xs">
                      <span className="text-slate-400 font-mono text-[11px]">{detail.label}</span>
                      <span className="font-semibold text-slate-100 font-sans">{detail.value}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 font-mono flex items-center justify-between">
                  <span>Hardware Isolation:</span>
                  <span className="text-slate-300">Nitro Enclaves (Zero Operator Access)</span>
                </div>
              </div>

              {/* Certified Human Sovereign Seal (Prominent Card) */}
              <div className="bg-gradient-to-br from-teal-950/50 via-slate-900 to-slate-950 border border-teal-500/40 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-teal-500/10 blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between border-b border-teal-500/30 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-teal-300">
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>The Sovereign Gatekeeper Seal</span>
                  </div>
                  <span className="font-mono text-[10px] bg-teal-900/60 text-teal-200 border border-teal-700/60 px-2 py-0.5 rounded">
                    Certified Human Signer
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="font-bold text-white text-sm">
                    {activeScenario.humanSigner.name}
                  </div>
                  <div className="font-mono text-teal-300 text-[11px]">
                    {activeScenario.humanSigner.credential}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {activeScenario.humanSigner.licenseJurisdiction}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-teal-500/20 text-xs italic text-slate-300 leading-relaxed font-sans">
                  &ldquo;{activeScenario.humanSigner.auditStatement}&rdquo;
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                  <span>Sign-Off Timestamp:</span>
                  <span className="text-slate-200">{new Date(activeScenario.humanSigner.timestamp).toUTCString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RAC Audit Defense Evidence Modal / Drawer */}
        {auditPacketOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">CMS RAC Audit Defense Packet</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Safe-Harbor Certificate under 31 U.S.C. § 3729
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAuditPacketOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Certificate Body */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-3 font-mono">
                  <span className="text-slate-400">Audit Packet ID:</span>
                  <span className="text-teal-300 font-bold">RAC-2026-AETH-09418</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Encounter Title:</span>
                    <span className="text-white font-bold text-right">{activeScenario.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Encounter Billed Amount:</span>
                    <span className="text-white font-mono font-bold">{activeScenario.totalBilledAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reported Service Codes:</span>
                    <span className="text-teal-300 font-mono">{activeScenario.cptCodes.join(' • ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sovereign Reviewing Coder:</span>
                    <span className="text-white font-semibold">{activeScenario.humanSigner.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">License / Registration:</span>
                    <span className="text-slate-300 font-mono">{activeScenario.humanSigner.credential}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sequential Chain Integrity:</span>
                    <span className="text-emerald-400 font-bold font-mono">5/5 Blocks Verified (Zero Tampering)</span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-[10px] space-y-1">
                  <div className="text-slate-500">ROOT MERKLE AUDIT ANCHOR</div>
                  <div className="text-teal-300 break-all">{activeScenario.blocks[4].merkleRoot}</div>
                </div>

                <div className="text-[11px] text-slate-400 leading-relaxed italic border-t border-slate-800 pt-3">
                  &ldquo;This certificate provides conclusive forensic proof that all reported service lines and modifier claims were adjudicated with certified human clinical verification. No unverified probabilistic generative model was permitted to submit claims autonomously.&rdquo;
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setAuditPacketOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close Viewer
                </button>
                <button
                  onClick={() => {
                    alert('Audit defense packet verification token copied to clipboard.');
                    setAuditPacketOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-450 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Safe-Harbor Packet (.PDF)</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
