'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  Search,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface FilingRecord {
  name: string;
  stateOrRegion: string;
  category: 'medicaid' | 'medicare' | 'commercial' | 'workers_comp';
  categoryLabel: string;
  initialFilingDays: number;
  initialFilingText: string;
  correctedClaimDays: string;
  appealWindowDays: string;
  urgency: 'high' | 'medium' | 'low';
  slug?: string;
  notes: string;
}

const MATRIX_DATA: FilingRecord[] = [
  {
    name: 'Texas Medicaid (TMHP)',
    stateOrRegion: 'Texas',
    category: 'medicaid',
    categoryLabel: 'State Medicaid',
    initialFilingDays: 95,
    initialFilingText: '95 days from Date of Service',
    correctedClaimDays: '120 days from initial remittance',
    appealWindowDays: '120 days from final denial',
    urgency: 'high',
    slug: 'texas-medicaid',
    notes: 'One of the strictest Medicaid filing limits in the country. Electronic 277 timestamp is vital.',
  },
  {
    name: 'New York Medicaid (eMedNY)',
    stateOrRegion: 'New York',
    category: 'medicaid',
    categoryLabel: 'State Medicaid',
    initialFilingDays: 90,
    initialFilingText: '90 days from Date of Service',
    correctedClaimDays: '30 days from remittance',
    appealWindowDays: '60 days from initial denial',
    urgency: 'high',
    slug: 'new-york-medicaid',
    notes: 'Requires Delay Reason Code (e.g. Code 4 or 8) if submitted beyond 90 days with valid exception.',
  },
  {
    name: 'Florida Medicaid (AHCA)',
    stateOrRegion: 'Florida',
    category: 'medicaid',
    categoryLabel: 'State Medicaid',
    initialFilingDays: 180,
    initialFilingText: '180 days from Date of Service',
    correctedClaimDays: '90 days from EOB',
    appealWindowDays: '90 days from final denial',
    urgency: 'medium',
    slug: 'florida-medicaid',
    notes: 'MMA plans (Sunshine, Simply, Humana Medicaid) enforce independent filing schedules.',
  },
  {
    name: 'California Medi-Cal',
    stateOrRegion: 'California',
    category: 'medicaid',
    categoryLabel: 'State Medicaid',
    initialFilingDays: 180,
    initialFilingText: '180 days (6 months) from DOS',
    correctedClaimDays: '60 days from remittance',
    appealWindowDays: '90 days from denial',
    urgency: 'medium',
    slug: 'california-medicaid',
    notes: 'Over 6 months requires Good Cause justification or primary insurer EOB proof.',
  },
  {
    name: 'Illinois Medicaid (HFS)',
    stateOrRegion: 'Illinois',
    category: 'medicaid',
    categoryLabel: 'State Medicaid',
    initialFilingDays: 180,
    initialFilingText: '180 days from Date of Service',
    correctedClaimDays: '90 days from denial',
    appealWindowDays: '60 days from final remittance',
    urgency: 'medium',
    slug: 'illinois-medicaid',
    notes: 'Strict adherence to HFS 2360 electronic billing handbooks.',
  },
  {
    name: 'Georgia Medicaid',
    stateOrRegion: 'Georgia',
    category: 'medicaid',
    categoryLabel: 'State Medicaid',
    initialFilingDays: 180,
    initialFilingText: '180 days from Date of Service',
    correctedClaimDays: '90 days from remittance',
    appealWindowDays: '90 days from denial',
    urgency: 'medium',
    slug: 'georgia-medicaid',
    notes: 'CareSource, Peach State, and Amerigroup HMO plans enforce contract-specific timelines.',
  },
  {
    name: 'Ohio Medicaid',
    stateOrRegion: 'Ohio',
    category: 'medicaid',
    categoryLabel: 'State Medicaid',
    initialFilingDays: 365,
    initialFilingText: '365 days (1 calendar year)',
    correctedClaimDays: '180 days from EOB',
    appealWindowDays: '180 days from denial',
    urgency: 'low',
    slug: 'ohio-medicaid',
    notes: 'Single Pharmacy Benefit Manager (SPBM) and NextGen central claims clearinghouse.',
  },
  {
    name: 'North Carolina Medicaid',
    stateOrRegion: 'North Carolina',
    category: 'medicaid',
    categoryLabel: 'State Medicaid',
    initialFilingDays: 365,
    initialFilingText: '365 days from Date of Service',
    correctedClaimDays: '180 days from initial remittance',
    appealWindowDays: '90 days from denial',
    urgency: 'low',
    slug: 'north-carolina-medicaid',
    notes: 'Standardized under NC Medicaid Direct and standard prepaid health plans.',
  },
  {
    name: 'Medicare Part B (Fee-for-Service)',
    stateOrRegion: 'National (All MACs)',
    category: 'medicare',
    categoryLabel: 'Federal Medicare',
    initialFilingDays: 365,
    initialFilingText: '365 days (1 calendar year from DOS)',
    correctedClaimDays: '120 days from Remittance (Redetermination)',
    appealWindowDays: '120 days (Level 1) / 180 days (Level 2 QIC)',
    urgency: 'low',
    slug: 'medicare-part-b',
    notes: 'Statutory 1 calendar year rule under ACA § 6404. Strict exception criteria for retro eligibility.',
  },
  {
    name: 'Aetna Commercial',
    stateOrRegion: 'National',
    category: 'commercial',
    categoryLabel: 'Commercial PPO',
    initialFilingDays: 90,
    initialFilingText: '90–120 days per participating contract',
    correctedClaimDays: '180 days from initial denial',
    appealWindowDays: '180 days from date of EOB',
    urgency: 'high',
    slug: 'aetna',
    notes: 'Standard participating provider contract specifies 90 days from DOS. Non-participating is 180–365 days.',
  },
  {
    name: 'UnitedHealthcare (UHC Commercial)',
    stateOrRegion: 'National',
    category: 'commercial',
    categoryLabel: 'Commercial PPO',
    initialFilingDays: 90,
    initialFilingText: '90 days (standard) up to 180 days',
    correctedClaimDays: '180 days from denial',
    appealWindowDays: '180 days from remittance advice',
    urgency: 'high',
    slug: 'unitedhealthcare',
    notes: 'Check specific medical protocol contract; national default is 90 days for commercial network providers.',
  },
  {
    name: 'Cigna / Evernorth',
    stateOrRegion: 'National',
    category: 'commercial',
    categoryLabel: 'Commercial PPO',
    initialFilingDays: 90,
    initialFilingText: '90 days from Date of Service',
    correctedClaimDays: '180 days from denial',
    appealWindowDays: '180 days from denial notification',
    urgency: 'high',
    slug: 'cigna',
    notes: 'Participating contract window is 90 days. Dispute must be filed via Cigna Provider Portal.',
  },
  {
    name: 'Humana Commercial & Medicare Advantage',
    stateOrRegion: 'National',
    category: 'commercial',
    categoryLabel: 'Commercial / MA',
    initialFilingDays: 90,
    initialFilingText: '90–180 days per contract schedule',
    correctedClaimDays: '90 days from denial',
    appealWindowDays: '180 days from date of remittance',
    urgency: 'high',
    slug: 'humana',
    notes: 'Medicare Advantage claims allow up to 365 days under federal rules if contract allows, but commercial is 90d.',
  },
  {
    name: 'Tricare (East & West Regions)',
    stateOrRegion: 'Federal / Military',
    category: 'medicare',
    categoryLabel: 'Military Health',
    initialFilingDays: 365,
    initialFilingText: '365 days from Date of Service',
    correctedClaimDays: '90 days from remittance',
    appealWindowDays: '90 days from initial EOB',
    urgency: 'low',
    slug: 'tricare-east',
    notes: 'Administered by Humana Military (East) and Health Net Federal (West).',
  },
  {
    name: "Workers' Compensation (Florida)",
    stateOrRegion: 'Florida',
    category: 'workers_comp',
    categoryLabel: "Workers' Comp",
    initialFilingDays: 30,
    initialFilingText: '30 days from Date of Service',
    correctedClaimDays: '30 days from denial',
    appealWindowDays: '30 days (Petition for Resolution)',
    urgency: 'high',
    notes: 'Requires DFS-F5-DWC-9 / CMS-1500 form accompanied by clinical notes and work status report.',
  },
];

type CategoryFilter = 'all' | 'medicaid' | 'commercial' | 'medicare' | 'workers_comp';

export default function TimelyFilingMatrix() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<CategoryFilter>('all');

  const filteredData = useMemo(() => {
    return MATRIX_DATA.filter((item) => {
      if (catFilter !== 'all' && item.category !== catFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.stateOrRegion.toLowerCase().includes(q) ||
          item.initialFilingText.toLowerCase().includes(q) ||
          item.notes.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, catFilter]);

  return (
    <div className="w-full bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden font-inter">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-[#003087] to-teal p-6 text-white">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cream text-xs font-semibold uppercase tracking-wider mb-2">
          <Clock className="h-3.5 w-3.5 text-mint" /> 50-State &amp; Multi-Payer Compliance Rules
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold font-jakarta">
          Multi-Payer Timely Filing &amp; Appeal Deadline Matrix
        </h2>
        <p className="text-xs sm:text-sm text-cream/90 max-w-2xl mt-1">
          Never lose another claim to CARC 29. Compare initial submission cutoffs, corrected claim deadlines,
          and appeal windows across state Medicaid programs, Medicare MACs, and commercial PPOs.
        </p>

        {/* Search & Filter Toolbar */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="h-4 w-4 text-cream/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by state (e.g. Texas, Florida), payer (Aetna, Medi-Cal), or days..."
              className="w-full bg-white/10 text-white placeholder:text-cream/50 text-xs pl-10 pr-4 py-2.5 rounded-xl border border-white/15 focus:outline-none focus:ring-2 focus:ring-mint"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs overflow-x-auto no-scrollbar">
            {[
              { key: 'all', label: 'All Plans' },
              { key: 'commercial', label: 'Commercial PPOs' },
              { key: 'medicaid', label: 'State Medicaid' },
              { key: 'medicare', label: 'Medicare / Federal' },
              { key: 'workers_comp', label: "Workers' Comp" },
            ].map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setCatFilter(f.key as CategoryFilter)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  catFilter === f.key
                    ? 'bg-mint text-navy font-bold shadow-xs'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Matrix Table */}
      <div className="p-6">
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Payer / Program</th>
                <th className="p-3.5">Jurisdiction</th>
                <th className="p-3.5">Initial Claim Filing Limit</th>
                <th className="p-3.5">Corrected Claim Window</th>
                <th className="p-3.5">First-Level Appeal Limit</th>
                <th className="p-3.5 text-right">Calculator Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-navy text-sm">{item.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          item.urgency === 'high'
                            ? 'bg-red-100 text-red-800'
                            : item.urgency === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.initialFilingDays}d Limit
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.notes}</p>
                  </td>

                  <td className="p-3.5 font-semibold text-slate-600">{item.stateOrRegion}</td>

                  <td className="p-3.5">
                    <span className="font-bold text-navy block">{item.initialFilingText}</span>
                    <span className="text-[10px] text-slate-400">Strict cutoff from DOS</span>
                  </td>

                  <td className="p-3.5 text-slate-600 font-medium">{item.correctedClaimDays}</td>

                  <td className="p-3.5 text-slate-600 font-medium">{item.appealWindowDays}</td>

                  <td className="p-3.5 text-right">
                    <Link
                      href={`/tools/timely-filing-calculator?days=${item.initialFilingDays}`}
                      className="inline-flex items-center gap-1 text-teal font-bold hover:underline text-xs"
                    >
                      <span>Calculate →</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Educational Guidance */}
        <div className="mt-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>
              <strong>Aethera SLA Guarantee:</strong> All claims scrubbed and electronically submitted within 24 hours of clinical note sign-off.
            </span>
          </div>

          <Link
            href="/schedule"
            className="text-[#003087] font-bold hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Audit Practice Timely Filing Risks with Kiran</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
