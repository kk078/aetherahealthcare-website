'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Building2,
  Search,
  ArrowRight,
  Printer,
  Sparkles,
} from 'lucide-react';
import AnimatedCounter from '@/components/ui/AnimatedCounter';

type PeriodMode = '30d' | 'q1' | 'ytd';
type TabView = 'overview' | 'claims' | 'denials' | 'payers';
type ClaimFilter = 'all' | 'paid' | 'pending' | 'appeal';

interface ClaimRow {
  id: string;
  patientId: string;
  dos: string;
  payer: string;
  cpt: string;
  billed: number;
  paid: number;
  status: 'paid' | 'pending' | 'appeal';
  statusLabel: string;
  auditTrail: string;
  resolutionNote?: string;
}

const SAMPLE_CLAIMS: ClaimRow[] = [
  {
    id: 'CLM-98241',
    patientId: 'PT-4091',
    dos: 'May 12, 2026',
    payer: 'Blue Cross Blue Shield FL',
    cpt: '99214, 20610-25',
    billed: 420.0,
    paid: 348.5,
    status: 'paid',
    statusLabel: 'Paid in Full',
    auditTrail: 'EDI 837P transmitted 05/12 18:20 -> 277CA Accepted 05/12 21:04 -> 835 ERA EFT #49102 posted 05/22.',
    resolutionNote: 'Modifier 25 validated against clinical note; clean first-pass adjudication.',
  },
  {
    id: 'CLM-98242',
    patientId: 'PT-8821',
    dos: 'May 14, 2026',
    payer: 'UnitedHealthcare',
    cpt: '93000, 93010',
    billed: 295.0,
    paid: 242.0,
    status: 'paid',
    statusLabel: 'Paid',
    auditTrail: 'Scrubbed for NCCI mutually exclusive edits -> 837P transmitted 05/15 -> Paid via Optum ERA.',
    resolutionNote: 'Diagnostic telemetry interpretation split correctly.',
  },
  {
    id: 'CLM-98243',
    patientId: 'PT-1094',
    dos: 'May 18, 2026',
    payer: 'Aetna Commercial',
    cpt: '17000, 17003',
    billed: 580.0,
    paid: 0.0,
    status: 'appeal',
    statusLabel: 'Under Appeal (Won)',
    auditTrail: 'Initial denial CO-16 (Missing clinical note pointer) -> Overturned via Level 1 appeal in 48h.',
    resolutionNote: 'Submitted path report + dermoscopy photos via Availity. Payer issued $512.40 check.',
  },
  {
    id: 'CLM-98244',
    patientId: 'PT-6612',
    dos: 'May 20, 2026',
    payer: 'Medicare Part B (First Coast)',
    cpt: '99204, 99490',
    billed: 340.0,
    paid: 278.4,
    status: 'paid',
    statusLabel: 'Paid',
    auditTrail: 'CCM 20+ minute clinical care plan verified -> 837P batch transmitted -> ERA auto-reconciled.',
    resolutionNote: 'Chronic Care Management initial enrollment on file.',
  },
  {
    id: 'CLM-98245',
    patientId: 'PT-3389',
    dos: 'May 22, 2026',
    payer: 'Humana Medicare Advantage',
    cpt: '99215',
    billed: 265.0,
    paid: 0.0,
    status: 'pending',
    statusLabel: 'Pending Payer Review',
    auditTrail: 'Pre-scrubbed clean -> 277CA Accepted -> In final payer adjudication cycle (Day 6).',
    resolutionNote: 'High medical decision-making complexity documented with medication changes.',
  },
  {
    id: 'CLM-98246',
    patientId: 'PT-7741',
    dos: 'May 24, 2026',
    payer: 'Cigna / Evernorth',
    cpt: '90837, +90833',
    billed: 310.0,
    paid: 268.0,
    status: 'paid',
    statusLabel: 'Paid',
    auditTrail: 'Time-based psychotherapy code linked to qualifying E/M -> 835 posted.',
    resolutionNote: 'Psychiatric diagnostic evaluation requirement verified.',
  },
];

const DENIAL_ITEMS = [
  {
    claimId: 'CLM-97810',
    payer: 'Aetna',
    code: 'CARC 16 / N290',
    rootCause: 'Missing rendering provider taxonomy on box 24J',
    actionTaken: 'Taxonomy corrected in master EHR profile, 837P resubmitted',
    status: 'Overturned & Collected',
    recovered: '$1,240.00',
    daysToResolve: '4 days',
  },
  {
    claimId: 'CLM-97844',
    payer: 'UnitedHealthcare',
    code: 'CARC 197',
    rootCause: 'Prior auth number omitted by hospital scheduler',
    actionTaken: 'Retrieved retrospective authorization approval from CoverMyMeds & appealed',
    status: 'Overturned & Collected',
    recovered: '$3,850.00',
    daysToResolve: '9 days',
  },
  {
    claimId: 'CLM-97902',
    payer: 'BCBS Florida',
    code: 'CARC 97',
    rootCause: 'Bundling claim line: CPT 20610 bundled into 99214',
    actionTaken: 'Appealed with separate anatomical site chart note & Modifier 25 validation',
    status: 'Overturned & Collected',
    recovered: '$415.00',
    daysToResolve: '6 days',
  },
  {
    claimId: 'CLM-98011',
    payer: 'Humana',
    code: 'CARC 29',
    rootCause: 'Payer claimed untimely submission past 90 days',
    actionTaken: 'Extracted clearinghouse 277 EDI timestamp proving first submission at Day 14',
    status: 'Overturned & Collected',
    recovered: '$890.00',
    daysToResolve: '7 days',
  },
];

const PAYER_STATS = [
  { name: 'Medicare Part B', cleanRate: '99.4%', daysToPay: '12.4 days', collectionRate: '98.8%', volume: '$148,200' },
  { name: 'BCBS Florida', cleanRate: '98.8%', daysToPay: '15.8 days', collectionRate: '97.6%', volume: '$124,500' },
  { name: 'Aetna Commercial', cleanRate: '98.1%', daysToPay: '14.9 days', collectionRate: '96.9%', volume: '$86,100' },
  { name: 'UnitedHealthcare', cleanRate: '97.6%', daysToPay: '17.2 days', collectionRate: '96.2%', volume: '$92,400' },
  { name: 'Cigna / Evernorth', cleanRate: '98.4%', daysToPay: '16.1 days', collectionRate: '97.1%', volume: '$42,300' },
];

export default function InteractivePortalDemo() {
  const [period, setPeriod] = useState<PeriodMode>('30d');
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [claimFilter, setClaimFilter] = useState<ClaimFilter>('all');
  const [selectedClaim, setSelectedClaim] = useState<ClaimRow | null>(null);
  const [searchClaim, setSearchClaim] = useState('');

  const filteredClaims = SAMPLE_CLAIMS.filter((c) => {
    if (claimFilter !== 'all' && c.status !== claimFilter) return false;
    if (searchClaim) {
      const q = searchClaim.toLowerCase();
      return (
        c.id.toLowerCase().includes(q) ||
        c.patientId.toLowerCase().includes(q) ||
        c.payer.toLowerCase().includes(q) ||
        c.cpt.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div id="live-portal-sandbox" className="w-full bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden text-slate-100 font-inter">
      {/* Chrome Top Header */}
      <div className="bg-slate-950/80 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
        {/* Practice identity */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#003087] flex items-center justify-center font-bold text-white text-xs">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-white tracking-wide">portal.aetherahealthcare.com</p>
              <p className="text-[10px] text-slate-400">Tampa Bay Multi-Specialty Clinic · Live Client Sandbox</p>
            </div>
          </div>
        </div>

        {/* Live sync & Period toggles */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live 24h EDI Sync
          </span>

          <div className="inline-flex p-0.5 rounded-lg bg-slate-800 border border-slate-700 text-xs font-medium">
            <button
              type="button"
              onClick={() => setPeriod('30d')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                period === '30d' ? 'bg-[#003087] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Last 30 Days
            </button>
            <button
              type="button"
              onClick={() => setPeriod('q1')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                period === 'q1' ? 'bg-[#003087] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Q1 2026
            </button>
            <button
              type="button"
              onClick={() => setPeriod('ytd')}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                period === 'ytd' ? 'bg-[#003087] text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              YTD
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex items-center justify-between overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-[#003087] text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Executive KPIs
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('claims')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'claims'
                ? 'bg-[#003087] text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Claims Stream ({SAMPLE_CLAIMS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('denials')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'denials'
                ? 'bg-[#003087] text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <span>Denial Resolution Center</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              +$6,395
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'payers'
                ? 'bg-[#003087] text-white shadow-sm'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Payer Scorecards
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 text-xs">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
          <Link
            href="/free-assessment"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm text-xs"
          >
            <span>Get Live Portal for My Practice</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Main Interactive Body */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* ================= OVERVIEW TAB ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top 6 KPI Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Net Collected</span>
                  <DollarSign className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white">
                  ${period === '30d' ? '384,250' : period === 'q1' ? '1,120,400' : '2,490,100'}
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 mt-1 block">
                  +14.8% vs pre-Aethera
                </span>
              </div>

              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Clean Claim Rate</span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white">
                  98.6%
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 mt-1 block">
                  Target: 95%+ (Contractual)
                </span>
              </div>

              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Days in AR</span>
                  <Clock className="h-4 w-4 text-teal-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white">
                  24.8 days
                </div>
                <span className="text-[11px] font-semibold text-teal-400 mt-1 block">
                  Industry average: 42.5d
                </span>
              </div>

              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Denial Rate</span>
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white">
                  2.4%
                </div>
                <span className="text-[11px] font-semibold text-amber-400 mt-1 block">
                  Down from 11.2%
                </span>
              </div>

              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Appeals Won</span>
                  <ShieldCheck className="h-4 w-4 text-purple-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white">
                  82.4%
                </div>
                <span className="text-[11px] font-semibold text-purple-400 mt-1 block">
                  $48.6k recovered
                </span>
              </div>

              <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-1 text-xs">
                  <span>Total Claims</span>
                  <FileText className="h-4 w-4 text-blue-400" />
                </div>
                <div className="text-xl sm:text-2xl font-bold font-jakarta text-white">
                  <AnimatedCounter to={period === '30d' ? 1842 : period === 'q1' ? 5410 : 12480} />
                </div>
                <span className="text-[11px] font-semibold text-blue-400 mt-1 block">
                  100% audited
                </span>
              </div>
            </div>

            {/* Aging Buckets Visualization */}
            <div className="bg-slate-850 p-5 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Accounts Receivable (A/R) Aging Bucket Breakdown</h3>
                  <p className="text-xs text-slate-400">Total Active AR: $184,200 · 92% resolved within 60 days</p>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-medium">
                  Zero Claims in 120+ Abandonment
                </span>
              </div>

              {/* Progress visual bar */}
              <div className="w-full h-4 rounded-full overflow-hidden flex bg-slate-800 mb-4">
                <div style={{ width: '74%' }} className="bg-emerald-500 h-full" title="0-30 Days: 74%" />
                <div style={{ width: '18%' }} className="bg-teal-500 h-full" title="31-60 Days: 18%" />
                <div style={{ width: '6%' }} className="bg-blue-500 h-full" title="61-90 Days: 6%" />
                <div style={{ width: '1.5%' }} className="bg-amber-500 h-full" title="91-120 Days: 1.5%" />
                <div style={{ width: '0.5%' }} className="bg-red-500 h-full" title="120+ Days: 0.5%" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>0–30 Days</span>
                  </div>
                  <p className="text-lg font-bold text-white">$136,308</p>
                  <p className="text-[11px] text-slate-400">74.0% of total A/R</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-teal-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                    <span>31–60 Days</span>
                  </div>
                  <p className="text-lg font-bold text-white">$33,156</p>
                  <p className="text-[11px] text-slate-400">18.0% of total A/R</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-blue-400" />
                    <span>61–90 Days</span>
                  </div>
                  <p className="text-lg font-bold text-white">$11,052</p>
                  <p className="text-[11px] text-slate-400">6.0% (Appeals queue)</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    <span>91–120 Days</span>
                  </div>
                  <p className="text-lg font-bold text-white">$2,763</p>
                  <p className="text-[11px] text-slate-400">1.5% (Expedited review)</p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                    <span className="h-2 w-2 rounded-full bg-red-400" />
                    <span>120+ Days</span>
                  </div>
                  <p className="text-lg font-bold text-white">$921</p>
                  <p className="text-[11px] text-slate-400">0.5% (Near zero)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= CLAIMS STREAM TAB ================= */}
        {activeTab === 'claims' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filter toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-850 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchClaim}
                  onChange={(e) => setSearchClaim(e.target.value)}
                  placeholder="Filter by Claim ID, Payer, CPT or Patient ID…"
                  className="bg-transparent border-none text-xs text-white placeholder:text-slate-500 focus:outline-none w-full"
                />
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                {(['all', 'paid', 'pending', 'appeal'] as ClaimFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setClaimFilter(f)}
                    className={`px-2.5 py-1 rounded-md capitalize transition-colors ${
                      claimFilter === f
                        ? 'bg-[#003087] text-white font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f === 'appeal' ? 'Under Appeal' : f}
                  </button>
                ))}
              </div>
            </div>

            {/* Claims Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Claim ID</th>
                    <th className="p-3">DOS</th>
                    <th className="p-3">Payer</th>
                    <th className="p-3">CPT Code(s)</th>
                    <th className="p-3">Billed</th>
                    <th className="p-3">Paid</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Audit Trail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {filteredClaims.map((claim) => (
                    <tr
                      key={claim.id}
                      onClick={() => setSelectedClaim(selectedClaim?.id === claim.id ? null : claim)}
                      className="hover:bg-slate-800/60 cursor-pointer transition-colors"
                    >
                      <td className="p-3 font-mono text-white font-semibold">{claim.id}</td>
                      <td className="p-3">{claim.dos}</td>
                      <td className="p-3 font-medium text-slate-200">{claim.payer}</td>
                      <td className="p-3 font-mono text-teal-400">{claim.cpt}</td>
                      <td className="p-3 font-mono">${claim.billed.toFixed(2)}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">${claim.paid.toFixed(2)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            claim.status === 'paid'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : claim.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                          }`}
                        >
                          {claim.statusLabel}
                        </span>
                      </td>
                      <td className="p-3 text-right text-slate-400 hover:text-white">
                        <span className="underline text-[11px]">Inspect →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected Claim Audit Drawer */}
            {selectedClaim && (
              <div className="bg-slate-850 p-4 rounded-xl border border-teal-500/40 animate-in fade-in duration-150 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{selectedClaim.id}</span>
                    <span className="text-slate-400">({selectedClaim.patientId})</span>
                    <span className="text-teal-400 font-semibold">{selectedClaim.payer}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedClaim(null)}
                    className="text-slate-400 hover:text-white text-xs underline"
                  >
                    Close
                  </button>
                </div>
                <div className="space-y-1.5 text-slate-300">
                  <p><strong className="text-slate-400">Tamper-Evident EDI Audit Log:</strong> {selectedClaim.auditTrail}</p>
                  <p><strong className="text-slate-400">Certified Biller Note:</strong> {selectedClaim.resolutionNote}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= DENIAL RESOLUTION TAB ================= */}
        {activeTab === 'denials' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Active Denial Appeal &amp; Recovery Feed</h3>
                <p className="text-xs text-slate-400">
                  Aethera handles 100% of appeals within 48 hours of 835 remittance receipt.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Recovered This Period</span>
                <span className="text-xl font-extrabold text-emerald-400 font-jakarta">+$6,395.00</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DENIAL_ITEMS.map((item, idx) => (
                <div key={idx} className="bg-slate-850 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">{item.claimId} · {item.payer}</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] border border-emerald-500/20">
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px]">
                      {item.code}
                    </span>
                    <span className="text-slate-400 line-clamp-1">{item.rootCause}</span>
                  </div>

                  <p className="bg-slate-900 p-2 rounded text-slate-300 border border-slate-800 text-[11px]">
                    <strong className="text-teal-400">Action: </strong> {item.actionTaken}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                    <span>Turnaround: {item.daysToResolve}</span>
                    <span className="font-bold text-emerald-400">Recovered: {item.recovered}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= PAYERS TAB ================= */}
        {activeTab === 'payers' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-slate-850 p-4 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-white mb-1">Contracted Payer Performance Benchmarks</h3>
              <p className="text-xs text-slate-400">
                Track how quickly each commercial and government plan pays your practice, and where underpayments cluster.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Insurance Payer</th>
                    <th className="p-3">Clean-Claim Rate</th>
                    <th className="p-3">Avg Payment Window</th>
                    <th className="p-3">Net Collection %</th>
                    <th className="p-3 text-right">Volume Adjudicated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {PAYER_STATS.map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50">
                      <td className="p-3 font-semibold text-white flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-teal-400" />
                        <span>{p.name}</span>
                      </td>
                      <td className="p-3 font-bold text-emerald-400">{p.cleanRate}</td>
                      <td className="p-3">{p.daysToPay}</td>
                      <td className="p-3 font-semibold text-slate-200">{p.collectionRate}</td>
                      <td className="p-3 font-mono font-bold text-right text-white">{p.volume}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Conversion Strip */}
        <div className="bg-gradient-to-r from-[#003087] to-teal-900/80 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="font-bold text-white text-sm flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="h-4 w-4 text-emerald-300" />
              <span>Bring This 24/7 Command Center to Your Practice</span>
            </h4>
            <p className="text-xs text-slate-200">
              Included free with all Aethera billing plans. 3.5%–5.0% performance pricing. Zero setup fees.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/schedule"
              className="border border-white/40 hover:bg-white/10 text-white font-semibold text-xs px-4 py-2 rounded-xl transition-colors whitespace-nowrap"
            >
              Book 15-Min Demo
            </Link>
            <Link
              href="/free-assessment"
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl transition-colors shadow-md whitespace-nowrap"
            >
              Start Free 50-Claim Pilot
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
