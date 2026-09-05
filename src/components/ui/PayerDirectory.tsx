'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Clock,
  Hash,
  ArrowRight,
  Building2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Filter,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  FileCheck2,
  FileSpreadsheet,
  X
} from 'lucide-react';
import type { Payer } from '@/lib/payers';
import {
  type ClaimLogicPayer,
  type CompactPayerTuple,
  decodePayerTuple,
  CLAIM_LOGIC_TYPES
} from '@/lib/claimLogic';

interface UnifiedPayer {
  name: string;
  id: string;
  type: string;
  par: boolean;
  enrollment: boolean;
  auto: boolean;
  status: boolean;
  dental: boolean;
  eligibility: boolean;
  encounters: boolean;
  hospital: boolean;
  professional: boolean;
  era: boolean;
  secondary: boolean;
  wc: boolean;
  att: boolean;
  curatedSlug: string | null;
  curatedPayer?: Payer;
}

const PAGE_SIZE = 24;

export default function PayerDirectory({
  payers,
  types,
}: {
  payers: Payer[];
  types: string[];
}) {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [parFilter, setParFilter] = useState<'all' | 'par' | 'non-par'>('all');
  const [enrollmentFilter, setEnrollmentFilter] = useState<'all' | 'required' | 'none'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'curated'>('all');
  const [page, setPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedPayer, setSelectedPayer] = useState<UnifiedPayer | null>(null);

  // Full ClaimLogic dataset state
  const [claimLogicLoaded, setClaimLogicLoaded] = useState(false);
  const [claimLogicPayers, setClaimLogicPayers] = useState<UnifiedPayer[]>([]);

  // Build curated map for fast slug and data lookup
  const curatedMap = useMemo(() => {
    const map = new Map<string, Payer>();
    payers.forEach(p => {
      map.set(p.slug, p);
      if (p.payerId) map.set(p.payerId.toLowerCase(), p);
      if (p.claimLogicId) map.set(p.claimLogicId.toLowerCase(), p);
    });
    return map;
  }, [payers]);

  // Transform initial 229 curated payers into UnifiedPayers
  const initialCuratedUnified = useMemo<UnifiedPayer[]>(() => {
    return payers.map(p => ({
      name: p.name,
      id: p.claimLogicId || p.payerId || 'Varies',
      type: p.type,
      par: p.parStatus === 'Par',
      enrollment: !!p.enrollmentRequired,
      auto: !!p.ediCapabilities?.auto,
      status: !!p.ediCapabilities?.claimStatus,
      dental: !!p.ediCapabilities?.dental,
      eligibility: !!p.ediCapabilities?.eligibility,
      encounters: false,
      hospital: !!p.ediCapabilities?.hospital,
      professional: p.ediCapabilities?.professional ?? true,
      era: !!p.ediCapabilities?.era,
      secondary: !!p.ediCapabilities?.secondary,
      wc: !!p.ediCapabilities?.workersComp,
      att: !!p.ediCapabilities?.attachments,
      curatedSlug: p.slug,
      curatedPayer: p,
    }));
  }, [payers]);

  // Load complete 10,641 ClaimLogic database in background
  useEffect(() => {
    let active = true;
    fetch('/data/claimlogic_payers.json')
      .then(res => res.json())
      .then((data: CompactPayerTuple[]) => {
        if (!active || !Array.isArray(data)) return;
        const decoded: UnifiedPayer[] = data.map(tuple => {
          const c = decodePayerTuple(tuple);
          const matchedPayer = c.curatedSlug ? curatedMap.get(c.curatedSlug) : undefined;
          return {
            ...c,
            curatedSlug: c.curatedSlug || null,
            curatedPayer: matchedPayer,
          };
        });
        setClaimLogicPayers(decoded);
        setClaimLogicLoaded(true);
      })
      .catch(err => {
        console.warn('Could not load ClaimLogic dataset in background:', err);
      });
    return () => {
      active = false;
    };
  }, [curatedMap]);

  // Dataset to search
  const activeDataset = useMemo(() => {
    if (viewMode === 'curated') {
      return initialCuratedUnified;
    }
    if (claimLogicLoaded && claimLogicPayers.length > 0) {
      return claimLogicPayers;
    }
    return initialCuratedUnified;
  }, [viewMode, claimLogicLoaded, claimLogicPayers, initialCuratedUnified]);

  // Filtered dataset
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return activeDataset.filter(p => {
      // Search needle
      if (needle) {
        const hay = `${p.name} ${p.id} ${p.type} ${p.curatedPayer?.aka?.join(' ') || ''}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      // Type filter
      if (type && p.type.toLowerCase() !== type.toLowerCase()) {
        return false;
      }

      // Par status
      if (parFilter === 'par' && !p.par) return false;
      if (parFilter === 'non-par' && p.par) return false;

      // Enrollment
      if (enrollmentFilter === 'required' && !p.enrollment) return false;
      if (enrollmentFilter === 'none' && p.enrollment) return false;

      // Service filters
      if (serviceFilter === 'era' && !p.era) return false;
      if (serviceFilter === 'eligibility' && !p.eligibility) return false;
      if (serviceFilter === 'status' && !p.status) return false;
      if (serviceFilter === 'professional' && !p.professional) return false;
      if (serviceFilter === 'hospital' && !p.hospital) return false;
      if (serviceFilter === 'dental' && !p.dental) return false;
      if (serviceFilter === 'wc' && !p.wc) return false;
      if (serviceFilter === 'att' && !p.att) return false;

      return true;
    });
  }, [activeDataset, q, type, parFilter, enrollmentFilter, serviceFilter]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [q, type, parFilter, enrollmentFilter, serviceFilter, viewMode]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedResults = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function handleCopy(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!id || id === 'Varies') return;
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Top Banner: Status & View Mode */}
      <div className="bg-white rounded-2xl border border-gray/15 p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-teal"></span>
            </span>
            <div>
              <p className="text-sm font-bold text-navy flex items-center gap-1.5">
                ClaimLogic EDI Clearinghouse Network
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal/10 text-teal">
                  {claimLogicLoaded ? `${claimLogicPayers.length.toLocaleString()} Payers Active` : 'Loading 10,600+ Payers…'}
                </span>
              </p>
              <p className="text-xs text-gray">
                Real-time electronic payer IDs, par statuses, enrollment requirements &amp; transaction capabilities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-cream/70 p-1 rounded-xl border border-gray/10 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'all'
                  ? 'bg-navy text-white shadow-sm'
                  : 'text-gray hover:text-navy'
              }`}
            >
              All Clearinghouse Payers ({claimLogicLoaded ? claimLogicPayers.length.toLocaleString() : '10,641'})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('curated')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'curated'
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-gray hover:text-navy'
              }`}
            >
              Curated AR Playbooks ({payers.length})
            </button>
          </div>
        </div>

        {/* Search & Main Filter Controls */}
        <div className="mt-4 pt-4 border-t border-gray/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3">
          <div className="lg:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray" />
            <input
              type="search"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search by payer name or electronic ID (e.g. 60054, SHP76, 27516, Aetna)..."
              aria-label="Search payers"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray/25 rounded-xl text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray hover:text-navy"
              >
                Clear
              </button>
            )}
          </div>

          <div className="lg:col-span-3">
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              aria-label="Filter by payer type"
              className="w-full py-2.5 px-3 text-sm border border-gray/25 rounded-xl text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
            >
              <option value="">All Categories ({CLAIM_LOGIC_TYPES.length})</option>
              {CLAIM_LOGIC_TYPES.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={parFilter}
              onChange={e => setParFilter(e.target.value as any)}
              aria-label="Filter by participation status"
              className="w-full py-2.5 px-3 text-sm border border-gray/25 rounded-xl text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
            >
              <option value="all">Par &amp; Non-Par</option>
              <option value="par">Par Only (Participating)</option>
              <option value="non-par">Non-Par Only</option>
            </select>
          </div>

          <div className="lg:col-span-2">
            <select
              value={enrollmentFilter}
              onChange={e => setEnrollmentFilter(e.target.value as any)}
              aria-label="Filter by enrollment requirement"
              className="w-full py-2.5 px-3 text-sm border border-gray/25 rounded-xl text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
            >
              <option value="all">All Enrollments</option>
              <option value="required">Enrollment Required</option>
              <option value="none">No Enrollment Needed</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Chips: EDI Services */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-gray font-semibold mr-1 flex items-center gap-1">
            <Filter className="h-3 w-3 text-teal" /> EDI Capabilities:
          </span>
          {[
            { key: 'all', label: 'All Services' },
            { key: 'era', label: '835 Remittance (ERA)' },
            { key: 'eligibility', label: '270/271 Real-Time Eligibility' },
            { key: 'status', label: '276/277 Claim Status' },
            { key: 'professional', label: '837P Professional' },
            { key: 'hospital', label: '837I Hospital' },
            { key: 'dental', label: '837D Dental' },
            { key: 'wc', label: "Worker's Comp" },
            { key: 'att', label: 'Attachments' },
          ].map(chip => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setServiceFilter(chip.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                serviceFilter === chip.key
                  ? 'bg-navy text-white shadow-xs'
                  : 'bg-cream text-slate-700 hover:bg-teal/10 hover:text-teal border border-gray/15'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm text-gray">
        <p>
          Showing <span className="font-bold text-navy">{filtered.length.toLocaleString()}</span> payor{filtered.length === 1 ? '' : 's'}
          {q ? ` matching “${q}”` : ''}
          {type ? ` in ${type}` : ''}
          {parFilter !== 'all' ? ` · ${parFilter === 'par' ? 'Participating' : 'Non-Participating'}` : ''}
          {serviceFilter !== 'all' ? ` · with ${serviceFilter.toUpperCase()}` : ''}
        </p>
        <p className="text-xs">
          Page {page} of {totalPages}
        </p>
      </div>

      {/* Grid of Payer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedResults.map((p, idx) => (
          <div
            key={`${p.id}-${p.name}-${idx}`}
            onClick={() => setSelectedPayer(p)}
            className="group bg-white rounded-2xl border border-gray/15 p-5 hover:shadow-lg hover:border-teal/40 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Header: Name & Type */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-bold text-navy text-base leading-snug truncate group-hover:text-teal transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-teal bg-teal/10 rounded px-2 py-0.5">
                      {p.type}
                    </span>
                    {p.par ? (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Par
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        Non-Par
                      </span>
                    )}
                    {p.enrollment ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                        Enrollment Req.
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal/5 text-teal border border-teal/20">
                        Instant Route
                      </span>
                    )}
                  </div>
                </div>
                <Building2 className="h-5 w-5 text-gray/30 shrink-0 mt-0.5 group-hover:text-teal transition-colors" />
              </div>

              {/* Electronic Payer ID Badge with 1-Click Copy */}
              <div className="mt-3 bg-cream/70 rounded-xl p-2.5 border border-gray/15 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray block">
                    Electronic Payer ID
                  </span>
                  <span className="font-mono text-sm font-bold text-navy">
                    {p.id}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={e => handleCopy(p.id, e)}
                  title="Copy Electronic Payer ID"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-teal hover:text-white text-navy border border-gray/20 transition-all shadow-xs"
                >
                  {copiedId === p.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-600" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-gray" /> Copy ID
                    </>
                  )}
                </button>
              </div>

              {/* Supported Electronic Transactions Matrix */}
              <div className="mt-3 pt-3 border-t border-gray/10">
                <span className="text-[10px] font-bold text-gray uppercase tracking-wider block mb-1.5">
                  EDI Capabilities
                </span>
                <div className="flex flex-wrap gap-1">
                  {p.professional && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-navy/5 text-navy border border-navy/10">
                      837P Professional
                    </span>
                  )}
                  {p.hospital && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-navy/5 text-navy border border-navy/10">
                      837I Hospital
                    </span>
                  )}
                  {p.era && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-teal/10 text-teal border border-teal/20">
                      835 Remittance
                    </span>
                  )}
                  {p.eligibility && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-mint/20 text-teal border border-mint/40">
                      270/271 Eligibility
                    </span>
                  )}
                  {p.status && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      276/277 Status
                    </span>
                  )}
                  {p.dental && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      837D Dental
                    </span>
                  )}
                  {p.wc && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      Worker&apos;s Comp
                    </span>
                  )}
                  {p.att && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                      Attachments
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-4 pt-3 border-t border-gray/10 flex items-center justify-between text-xs">
              {p.curatedSlug ? (
                <Link
                  prefetch={false}
                  href={`/payers/directory/${p.curatedSlug}`}
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center text-teal font-bold hover:text-navy transition-colors"
                >
                  Explore AR Playbook <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              ) : (
                <button
                  type="button"
                  className="text-gray font-semibold hover:text-navy flex items-center gap-1"
                >
                  View EDI Specs <ArrowRight className="h-3 w-3" />
                </button>
              )}
              <span className="text-[11px] text-gray">ClaimLogic Gateway</span>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray/15 p-8">
          <HelpCircle className="h-10 w-10 text-gray/40 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-navy mb-1">No payers found matching your filters</h3>
          <p className="text-sm text-gray max-w-md mx-auto mb-6">
            We couldn&apos;t find any records matching “{q}”. Try searching by standard Payer ID or resetting your filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setQ('');
              setType('');
              setParFilter('all');
              setEnrollmentFilter('all');
              setServiceFilter('all');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy text-white hover:bg-teal transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray/15">
          <p className="text-xs text-gray">
            Showing {(page - 1) * PAGE_SIZE + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()} payers
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray/25 text-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-xs font-semibold text-navy">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray/25 text-navy disabled:opacity-40 disabled:cursor-not-allowed hover:bg-cream transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Slide-over / Modal for Complete Clearinghouse Profile */}
      {selectedPayer && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedPayer(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative border border-gray/20 animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPayer(null)}
              className="absolute right-5 top-5 p-2 rounded-full text-gray hover:text-navy hover:bg-cream transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-8">
              <span className="text-xs font-bold uppercase tracking-widest text-teal bg-teal/10 px-2.5 py-1 rounded-full inline-block mb-2">
                {selectedPayer.type} Payer Profile
              </span>
              <h2 className="text-2xl font-bold text-navy font-jakarta">{selectedPayer.name}</h2>
              <p className="text-xs text-gray mt-1">
                Clearinghouse Network: ClaimLogic Clearinghouse Master · Real-time EDI Gateway
              </p>
            </div>

            {/* Payer ID Highlights */}
            <div className="mt-6 bg-cream/70 rounded-2xl p-4 border border-gray/15 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray font-semibold block uppercase">Electronic Payer ID</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-xl font-extrabold text-navy">{selectedPayer.id}</span>
                  <button
                    type="button"
                    onClick={e => handleCopy(selectedPayer.id, e)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-navy text-white hover:bg-teal transition-colors"
                  >
                    {copiedId === selectedPayer.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div>
                <span className="text-xs text-gray font-semibold block uppercase">Clearinghouse Par Status</span>
                <div className="flex items-center gap-2 mt-1">
                  {selectedPayer.par ? (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      <CheckCircle2 className="h-4 w-4" /> Participating (Par)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                      <XCircle className="h-4 w-4" /> Non-Participating
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pre-enrollment Requirement Notice */}
            <div className="mt-4 p-4 rounded-xl border bg-slate-50 border-slate-200">
              <p className="text-xs font-bold text-navy uppercase tracking-wider mb-1">
                EDI Pre-Enrollment Guidance
              </p>
              <p className="text-sm text-slate-700 leading-relaxed">
                {selectedPayer.enrollment
                  ? 'Pre-enrollment is required before transmitting electronic claims or receiving 835 ERA files through ClaimLogic. Aethera handles clearinghouse credentialing and provider enrollment packets end-to-end.'
                  : 'No EDI pre-enrollment is required for basic 837 claim submission through ClaimLogic. Claims route immediately using the electronic payer ID.'}
              </p>
            </div>

            {/* 11-Point Electronic Transaction Grid */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileCheck2 className="h-4 w-4 text-teal" /> Supported EDI Transaction Sets
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {[
                  { label: '837P Professional Claims', active: selectedPayer.professional },
                  { label: '837I Hospital Claims', active: selectedPayer.hospital },
                  { label: '837D Dental Claims', active: selectedPayer.dental },
                  { label: '835 ERA Remittance Advice', active: selectedPayer.era },
                  { label: '270/271 Real-Time Eligibility', active: selectedPayer.eligibility },
                  { label: '276/277 Claim Status Inquiry', active: selectedPayer.status },
                  { label: 'Secondary Claim Routing', active: selectedPayer.secondary },
                  { label: 'Encounter Submissions', active: selectedPayer.encounters },
                  { label: "Worker's Comp Billing", active: selectedPayer.wc },
                  { label: 'Automotive / PIP Claims', active: selectedPayer.auto },
                  { label: 'Electronic Attachments (PWK)', active: selectedPayer.att },
                ].map(item => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 p-2 rounded-xl border ${
                      item.active
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900 font-semibold'
                        : 'bg-slate-50 border-slate-100 text-slate-400 font-normal'
                    }`}
                  >
                    {item.active ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-slate-300 shrink-0" />
                    )}
                    <span className="leading-snug">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curated Payer Playbook Link (if available) */}
            {selectedPayer.curatedPayer && (
              <div className="mt-6 p-4 rounded-2xl bg-teal/5 border border-teal/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-teal uppercase tracking-wide">
                    Curated Clinical AR Playbook Available
                  </p>
                  <p className="text-sm font-semibold text-navy mt-0.5">
                    Timely Filing: {selectedPayer.curatedPayer.timelyFiling || 'Plan specific'} · Appeal: {selectedPayer.curatedPayer.appeal || 'Standard'}
                  </p>
                </div>
                <Link
                  prefetch={false}
                  href={`/payers/directory/${selectedPayer.curatedSlug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal hover:bg-navy text-white font-bold text-xs transition-colors shrink-0 shadow-xs"
                >
                  Open Dedicated Playbook <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-6 pt-6 border-t border-gray/15 flex flex-wrap items-center justify-between gap-3">
              <a
                href="/free-assessment"
                className="inline-flex items-center gap-1.5 bg-navy hover:bg-teal text-white font-bold py-2.5 px-5 rounded-full text-xs transition-colors"
              >
                Request Free Revenue Cycle Audit
              </a>
              <button
                type="button"
                onClick={() => setSelectedPayer(null)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-gray hover:text-navy border border-gray/20 hover:border-navy transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
