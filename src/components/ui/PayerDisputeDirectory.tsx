'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  ExternalLink,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  Send,
  Loader2,
  CheckCircle2,
  FileText,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { sendLeadToKiran } from '@/lib/worker';

interface PayerDisputeInfo {
  name: string;
  category: 'Commercial' | 'Medicare Advantage' | 'Medicaid MCO' | 'Medicare MAC';
  payerId: string;
  timelyFilingDays: number;
  level1AppealDeadlineDays: number;
  level2AppealDeadlineDays: number;
  portalUrl: string;
  portalName: string;
  appealsAddress: string;
  appealsFax: string;
  escalationPhone: string;
  disputeNuance: string;
}

const PAYERS: PayerDisputeInfo[] = [
  {
    name: 'UnitedHealthcare (UHC)',
    category: 'Commercial',
    payerId: '87726',
    timelyFilingDays: 90,
    level1AppealDeadlineDays: 180,
    level2AppealDeadlineDays: 60,
    portalUrl: 'https://www.uhcprovider.com',
    portalName: 'UHC Provider Portal (Document Vault)',
    appealsAddress: 'UnitedHealthcare Appeals & Grievances, PO Box 30432, Salt Lake City, UT 84130',
    appealsFax: '(801) 994-1082',
    escalationPhone: '(877) 842-3210',
    disputeNuance: 'Requires formal Smart Edits review before submitting level 1 appeal; attachments must be uploaded via Document Vault.',
  },
  {
    name: 'Aetna',
    category: 'Commercial',
    payerId: '60054',
    timelyFilingDays: 180,
    level1AppealDeadlineDays: 180,
    level2AppealDeadlineDays: 60,
    portalUrl: 'https://www.availity.com',
    portalName: 'Availity Essentials (Aetna Dispute Tool)',
    appealsAddress: 'Aetna Provider Complaints & Appeals, PO Box 14020, Lexington, KY 40512',
    appealsFax: '(859) 455-8650',
    escalationPhone: '(800) 624-0756',
    disputeNuance: 'Formal distinction between "Reconsideration" (code correction/missing records) and "Appeal" (contract or medical necessity denial).',
  },
  {
    name: 'Cigna Healthcare',
    category: 'Commercial',
    payerId: '62308',
    timelyFilingDays: 90,
    level1AppealDeadlineDays: 180,
    level2AppealDeadlineDays: 90,
    portalUrl: 'https://cignaforhcp.cigna.com',
    portalName: 'Cigna for Health Care Professionals',
    appealsAddress: 'Cigna National Appeals Unit, PO Box 188011, Chattanooga, TN 37422',
    appealsFax: '(877) 815-4827',
    escalationPhone: '(800) 882-4462',
    disputeNuance: 'Appeals require Cigna Request for Healthcare Provider Payment Review form as cover sheet to avoid procedural rejections.',
  },
  {
    name: 'Humana',
    category: 'Medicare Advantage',
    payerId: '61101',
    timelyFilingDays: 90,
    level1AppealDeadlineDays: 60,
    level2AppealDeadlineDays: 60,
    portalUrl: 'https://www.availity.com',
    portalName: 'Availity Humana Dispute Management',
    appealsAddress: 'Humana Grievance & Appeal Management, PO Box 14159, Lexington, KY 40512',
    appealsFax: '(800) 949-2961',
    escalationPhone: '(800) 448-6262',
    disputeNuance: 'Medicare Advantage clinical appeals must include signed Appointment of Representative (AOR) or CMS Waiver of Liability form for non-par providers.',
  },
  {
    name: 'Elevance Health (Anthem BCBS)',
    category: 'Commercial',
    payerId: '00380',
    timelyFilingDays: 90,
    level1AppealDeadlineDays: 180,
    level2AppealDeadlineDays: 60,
    portalUrl: 'https://www.availity.com',
    portalName: 'Availity Claim Dispute Engine',
    appealsAddress: 'Anthem Provider Appeals Department, PO Box 105568, Atlanta, GA 30348',
    appealsFax: '(888) 209-7838',
    escalationPhone: '(800) 676-2583',
    disputeNuance: 'Clinical appeals require operative reports and clinical justification explicitly referencing Anthem Medical Policy criteria.',
  },
  {
    name: 'Florida Blue (BCBS FL)',
    category: 'Commercial',
    payerId: '00590',
    timelyFilingDays: 180,
    level1AppealDeadlineDays: 365,
    level2AppealDeadlineDays: 60,
    portalUrl: 'https://www.availity.com',
    portalName: 'Availity Florida Blue Provider Gateway',
    appealsAddress: 'Florida Blue Claims Review, PO Box 45296, Jacksonville, FL 32232',
    appealsFax: '(904) 905-6407',
    escalationPhone: '(800) 727-2227',
    disputeNuance: 'Florida prompt-pay law mandates interest calculation if undisputed appeal is upheld past 45 days.',
  },
  {
    name: 'Novitas Solutions (Medicare MAC JH/JL)',
    category: 'Medicare MAC',
    payerId: '12202',
    timelyFilingDays: 365,
    level1AppealDeadlineDays: 120,
    level2AppealDeadlineDays: 180,
    portalUrl: 'https://www.novitas-solutions.com',
    portalName: 'Novitasphere Portal',
    appealsAddress: 'Novitas Part B Appeals, PO Box 3111, Mechanicsburg, PA 17055',
    appealsFax: '(877) 439-5479',
    escalationPhone: '(855) 252-8782',
    disputeNuance: 'Level 1 is Redetermination (Form CMS-20027); Level 2 is QIC Reconsideration (Q2). Must file within 120 days of RA.',
  },
  {
    name: 'Noridian Healthcare Solutions (MAC JE/JF)',
    category: 'Medicare MAC',
    payerId: '01112',
    timelyFilingDays: 365,
    level1AppealDeadlineDays: 120,
    level2AppealDeadlineDays: 180,
    portalUrl: 'https://www.noridianmedicare.com',
    portalName: 'Noridian Medicare Portal (NMP)',
    appealsAddress: 'Noridian Part B Redeterminations, PO Box 6706, Fargo, ND 58108',
    appealsFax: '(701) 277-7891',
    escalationPhone: '(855) 609-9960',
    disputeNuance: 'Noridian Part B redeterminations must be submitted via NMP portal for instant confirmation and 60-day adjudication tracking.',
  },
];

export default function PayerDisputeDirectory() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPayer, setSelectedPayer] = useState<PayerDisputeInfo>(PAYERS[0]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Lead escalation
  const [providerName, setProviderName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [claimVolume, setClaimVolume] = useState('10–50 Overdue Denials');
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const categories = ['All', 'Commercial', 'Medicare Advantage', 'Medicare MAC'];

  const filteredPayers = useMemo(() => {
    return PAYERS.filter(p => {
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.payerId.toLowerCase().includes(q) ||
        p.portalName.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const copyToClipboard = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEscalationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    try {
      const ok = await sendLeadToKiran('payer_dispute_appeal_escalation', {
        providerName,
        email,
        phone,
        claimVolume,
        targetPayer: selectedPayer.name,
        payerId: selectedPayer.payerId,
        source: 'Payer Dispute & Electronic Appeals Directory (/tools/payer-dispute-directory)',
        submittedAt: new Date().toISOString(),
      });
      if (ok) {
        setFormStatus('success');
      } else {
        setFormStatus('error');
      }
    } catch {
      setFormStatus('error');
    }
  };

  return (
    <div className="space-y-8 font-inter">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray/15 dark:border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray/10 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal/10 text-teal dark:text-mint text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" />
              National Claims Dispute &amp; Escalation Playbook
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-jakarta text-navy dark:text-white">
              Payer Dispute &amp; Electronic Appeals Directory
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Direct escalation pathways, electronic dispute portals, Level 1 &amp; Level 2 statutory deadlines, and appeals addresses across major payers.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search payer or Payer ID (e.g. UHC, 87726)…"
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray/25 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-500 mr-1">Payer Class:</span>
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border ${
                selectedCategory === cat
                  ? 'bg-navy text-white border-navy dark:bg-teal dark:border-teal'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 5 Cols: Payer List */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Major Health Plans ({filteredPayers.length})
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredPayers.map(p => {
              const isSelected = selectedPayer.name === p.name;
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSelectedPayer(p)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isSelected
                      ? 'bg-navy text-white border-navy shadow-md dark:bg-slate-800 dark:border-teal'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-gray/15 dark:border-slate-800 hover:border-teal'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold font-jakarta leading-snug">{p.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      EDI #{p.payerId}
                    </span>
                  </div>
                  <div className={`text-xs flex items-center justify-between ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    <span>{p.category}</span>
                    <span>L1 Deadline: {p.level1AppealDeadlineDays}d</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Selected Payer Escalation Dossier */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray/15 dark:border-slate-800 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-gray/10 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold text-teal dark:text-mint uppercase tracking-wider block mb-1">
                  {selectedPayer.category} • EDI #{selectedPayer.payerId}
                </span>
                <h3 className="text-2xl font-bold font-jakarta text-navy dark:text-white">
                  {selectedPayer.name}
                </h3>
              </div>

              <a
                href={selectedPayer.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal/10 text-teal dark:text-mint text-xs font-bold hover:bg-teal hover:text-white transition"
              >
                <span>Launch Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Appeal Cutoff Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Timely Filing</span>
                <strong className="text-lg font-extrabold text-navy dark:text-white font-mono">
                  {selectedPayer.timelyFilingDays} Days
                </strong>
                <span className="text-[10px] text-slate-400 block">From service date</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Level 1 Appeal</span>
                <strong className="text-lg font-extrabold text-teal font-mono">
                  {selectedPayer.level1AppealDeadlineDays} Days
                </strong>
                <span className="text-[10px] text-slate-400 block">From remit / 835</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Level 2 Review</span>
                <strong className="text-lg font-extrabold text-amber-500 font-mono">
                  {selectedPayer.level2AppealDeadlineDays} Days
                </strong>
                <span className="text-[10px] text-slate-400 block">External cutoff</span>
              </div>
            </div>

            {/* Escalation Coordinates */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4">
                <div>
                  <span className="font-bold text-navy dark:text-white block mb-0.5">Formal Appeals Address:</span>
                  <span className="text-slate-600 dark:text-slate-300 font-mono">{selectedPayer.appealsAddress}</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(selectedPayer.appealsAddress, 'addr')}
                  className="text-teal hover:text-navy p-1"
                >
                  {copiedField === 'addr' ? <Check className="w-4 h-4 text-mint" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-navy dark:text-white block text-[11px]">Provider Relations Phone:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">{selectedPayer.escalationPhone}</span>
                  </div>
                  <Phone className="w-4 h-4 text-teal" />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-navy dark:text-white block text-[11px]">Appeals Dedicated Fax:</span>
                    <span className="text-slate-700 dark:text-slate-300 font-mono">{selectedPayer.appealsFax}</span>
                  </div>
                  <Mail className="w-4 h-4 text-teal" />
                </div>
              </div>
            </div>

            {/* Tactical Dispute Nuance */}
            <div className="p-4 rounded-2xl bg-teal/5 dark:bg-teal/10 border border-teal/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <span className="font-bold text-navy dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal" />
                Adjudication &amp; Dispute Nuance:
              </span>
              <p className="leading-relaxed pl-5">{selectedPayer.disputeNuance}</p>
            </div>

            {/* Overdue Appeal Escalation Form */}
            <div className="border-t border-gray/10 dark:border-slate-800 pt-5 space-y-3">
              <h4 className="text-xs font-bold text-navy dark:text-white uppercase tracking-wider">
                Stalled or Aging Appeals with {selectedPayer.name}?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aethera’s senior denial team steps in with direct payer liaisons to overturn 82%+ of aged denials within 30 days.
              </p>

              {formStatus === 'success' ? (
                <div className="p-3.5 rounded-2xl bg-mint/15 border border-mint/30 text-teal dark:text-mint text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Appeal escalation dispatched directly to Kiran. Our senior claims recovery team will follow up within 2 hours.
                </div>
              ) : (
                <form onSubmit={handleEscalationSubmit} className="space-y-2.5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      required
                      placeholder="Contact Name"
                      value={providerName}
                      onChange={e => setProviderName(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Practice Work Email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="tel"
                      required
                      placeholder="Direct Phone"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                    />
                    <select
                      value={claimVolume}
                      onChange={e => setClaimVolume(e.target.value)}
                      className="px-3.5 py-2 rounded-xl border border-gray/25 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white"
                    >
                      <option value="1–10 Aging Denials">1–10 Aging Denials</option>
                      <option value="10–50 Overdue Denials">10–50 Overdue Denials</option>
                      <option value="50+ Systematic Denials">50+ Systematic Denials ($100k+)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === 'submitting'}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal text-white font-bold hover:bg-navy transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {formStatus === 'submitting' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    Request Immediate Dispute Intervention
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
