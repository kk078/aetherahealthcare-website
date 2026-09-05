import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getAllPayers, getPayer } from '@/lib/payers';
import {
  Hash,
  Clock,
  RotateCcw,
  Phone,
  Printer,
  Globe,
  ExternalLink,
  Network,
  MapPin,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileCheck,
  FileText,
  ShieldCheck,
  Layers
} from 'lucide-react';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPayers().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPayer(slug);
  if (!p) return { title: 'Payer Not Found' };
  return {
    title: { absolute: `${p.name} — Payer ID, Timely Filing & EDI Routing | Aethera Healthcare Solutions` },
    description: `${p.name}: clearinghouse payer ID ${p.claimLogicId || p.payerId || '(varies)'}, timely filing ${p.timelyFiling || 'varies'}, appeals, ClaimLogic EDI capabilities, and provider portal. A free AR reference from Aethera Healthcare Solutions.`,
  };
}

function Field({
  icon: Icon,
  label,
  value,
  note,
}: {
  icon: React.ElementType;
  label: string;
  value: string | null;
  note?: string | null;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray/10">
      <Icon className="h-5 w-5 text-teal shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray">{label}</p>
        <p className="text-navy font-medium">
          {value || <span className="text-gray italic font-normal">Varies — confirm via portal / clearinghouse</span>}
        </p>
        {note && <p className="text-xs text-gray mt-0.5">{note}</p>}
      </div>
    </div>
  );
}

export default async function PayerDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getPayer(slug);
  if (!p) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: p.name,
    alternateName: p.aka,
    url: p.website || undefined,
    telephone: p.providerPhone || undefined,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="pt-20 pb-10 bg-gradient-to-br from-navy to-teal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/payers/directory" className="inline-flex items-center text-cream/80 hover:text-white text-sm mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Payer Directory
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-white font-jakarta">{p.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-navy bg-mint rounded px-2.5 py-1">
              {p.type}
            </span>
            {p.parStatus && (
              <span className={`text-xs font-semibold px-2.5 py-1 rounded ${
                p.parStatus === 'Par'
                  ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-400/30'
                  : 'bg-white/10 text-white border border-white/20'
              }`}>
                {p.parStatus === 'Par' ? 'ClaimLogic Participating (Par)' : 'Non-Participating'}
              </span>
            )}
            {p.enrollmentRequired !== null && p.enrollmentRequired !== undefined && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white/10 text-cream border border-white/20">
                {p.enrollmentRequired ? 'EDI Enrollment Required' : 'Instant 837 Submission'}
              </span>
            )}
          </div>
          {p.aka && p.aka.length > 0 && (
            <p className="text-cream/90 text-sm mt-3">Also covers / subsidiaries: {p.aka.join(', ')}</p>
          )}
        </div>
      </section>

      <section className="py-12 bg-cream flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Main Clearinghouse & AR Profile Card */}
          <div className="bg-white rounded-2xl border border-gray/15 p-6 md:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-navy font-jakarta mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-teal" /> Core Payer &amp; Clearinghouse Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <Field
                icon={Hash}
                label="Electronic Payer ID"
                value={p.claimLogicId || p.payerId}
                note={p.payerIdNote || (p.claimLogicId ? `Verified ClaimLogic Clearinghouse ID: ${p.claimLogicId}` : null)}
              />
              <Field icon={Clock} label="Timely Filing Limit (TFL)" value={p.timelyFiling} />
              <Field icon={RotateCcw} label="Appeal Window" value={p.appeal} />
              <Field
                icon={Network}
                label="Clearinghouse Gateway"
                value={p.clearinghouse || 'ClaimLogic / Availity Gateway'}
              />
              <Field icon={Phone} label="Provider Services" value={p.providerPhone} />
              <Field icon={Printer} label="Claims Fax" value={p.fax} />
              <Field icon={MapPin} label="Claims Address" value={p.claimsAddress} />
              <Field icon={Globe} label="Provider Portal" value={p.portalUrl} />
            </div>

            {(p.portalUrl || p.website) && (
              <div className="flex flex-wrap gap-3 mt-6">
                {p.portalUrl && (
                  <a
                    href={p.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-teal hover:bg-navy text-white font-semibold py-2.5 px-5 rounded-full text-sm transition-colors"
                  >
                    Provider Portal <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {p.website && (
                  <a
                    href={p.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 border-2 border-teal text-teal hover:bg-teal hover:text-white font-semibold py-2.5 px-5 rounded-full text-sm transition-colors"
                  >
                    Payer Website <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {p.notes && <p className="text-sm text-gray mt-6 leading-relaxed bg-cream/60 p-4 rounded-xl">{p.notes}</p>}
          </div>

          {/* Clearinghouse EDI Capabilities Section */}
          {p.ediCapabilities && (
            <div className="bg-white rounded-2xl border border-gray/15 p-6 md:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-navy font-jakarta mb-2 flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-teal" /> ClaimLogic EDI Clearinghouse Capabilities
              </h2>
              <p className="text-xs text-gray mb-6">
                Direct ANSI X12 electronic transaction support verified for {p.name}.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {[
                  { label: '837P Professional Claims', active: p.ediCapabilities.professional },
                  { label: '837I Hospital Claims', active: p.ediCapabilities.hospital },
                  { label: '837D Dental Claims', active: p.ediCapabilities.dental },
                  { label: '835 ERA Electronic Remittance', active: p.ediCapabilities.era },
                  { label: '270/271 Real-Time Eligibility', active: p.ediCapabilities.eligibility },
                  { label: '276/277 Claim Status Inquiry', active: p.ediCapabilities.claimStatus },
                  { label: 'Secondary Claim Submission', active: p.ediCapabilities.secondary },
                  { label: "Worker's Compensation EDI", active: p.ediCapabilities.workersComp },
                  { label: 'Electronic Attachments (PWK)', active: p.ediCapabilities.attachments },
                ].map(item => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                      item.active
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-semibold'
                        : 'bg-slate-50 border-slate-100 text-slate-400 font-normal'
                    }`}
                  >
                    {item.active ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-slate-300 shrink-0" />
                    )}
                    <span className="leading-snug">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternate Clearinghouse IDs Table (if multiple exist in ClaimLogic) */}
          {p.claimLogicMatches && p.claimLogicMatches.length > 1 && (
            <div className="bg-white rounded-2xl border border-gray/15 p-6 md:p-8 shadow-xs">
              <h2 className="text-lg font-bold text-navy font-jakarta mb-2 flex items-center gap-2">
                <Layers className="h-5 w-5 text-teal" /> Associated Clearinghouse Payer IDs
              </h2>
              <p className="text-xs text-gray mb-4">
                ClaimLogic maintains dedicated routing IDs for specific transaction lines or subsidiaries under {p.name}.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray/20 text-gray uppercase tracking-wider font-semibold">
                      <th className="pb-2.5">Clearinghouse Name</th>
                      <th className="pb-2.5">Electronic Payer ID</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5">Enrollment</th>
                      <th className="pb-2.5">Supported Services</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray/10">
                    {p.claimLogicMatches.map((m, i) => (
                      <tr key={i} className="hover:bg-cream/40">
                        <td className="py-2.5 font-medium text-navy pr-3">{m.name}</td>
                        <td className="py-2.5 font-mono font-bold text-teal pr-3">{m.id}</td>
                        <td className="py-2.5 pr-3">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            m.par === 'Par' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {m.par}
                          </span>
                        </td>
                        <td className="py-2.5 pr-3 text-slate-600">
                          {m.enrollment ? 'Required' : 'None'}
                        </td>
                        <td className="py-2.5 text-slate-700">
                          <div className="flex flex-wrap gap-1">
                            {m.services.map(s => (
                              <span key={s} className="px-1.5 py-0.5 rounded bg-gray/10 text-[10px] font-medium">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Cross-Tool Actions */}
          <div className="bg-white rounded-2xl border border-gray/15 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-navy uppercase tracking-wider mb-3">
              Resolution Tools for {p.name} Claims
            </h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link
                prefetch={false}
                href="/tools/appeal-letter-generator"
                className="p-3 rounded-xl border border-gray/15 hover:border-teal hover:bg-cream/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <FileText className="h-4 w-4 text-teal mb-1.5" />
                  <p className="font-bold text-navy text-xs">Appeal Letter Generator</p>
                  <p className="text-[11px] text-gray mt-0.5">Generate statutory ERISA/ACA appeal citations.</p>
                </div>
                <span className="text-[11px] font-bold text-teal mt-2 inline-block">Draft Appeal &rarr;</span>
              </Link>

              <Link
                prefetch={false}
                href="/tools/timely-filing-matrix"
                className="p-3 rounded-xl border border-gray/15 hover:border-teal hover:bg-cream/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <Clock className="h-4 w-4 text-teal mb-1.5" />
                  <p className="font-bold text-navy text-xs">50-State Timely Filing Matrix</p>
                  <p className="text-[11px] text-gray mt-0.5">Check state Medicaid and commercial deadlines.</p>
                </div>
                <span className="text-[11px] font-bold text-teal mt-2 inline-block">Check Matrix &rarr;</span>
              </Link>

              <Link
                prefetch={false}
                href="/tools/ncci-claim-scrubber"
                className="p-3 rounded-xl border border-gray/15 hover:border-teal hover:bg-cream/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <CheckCircle2 className="h-4 w-4 text-teal mb-1.5" />
                  <p className="font-bold text-navy text-xs">CMS NCCI Claim Scrubber</p>
                  <p className="text-[11px] text-gray mt-0.5">Prevent bundling denials before filing.</p>
                </div>
                <span className="text-[11px] font-bold text-teal mt-2 inline-block">Scrub CPT Codes &rarr;</span>
              </Link>
            </div>
          </div>

          {/* Verification Disclaimer */}
          <div className="flex items-start gap-2 pt-2">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray leading-relaxed">
              Values vary by plan, line of business, and provider agreement. Confirm in the payer portal or through ClaimLogic
              before submitting electronic claims.
              {p.verified && <> Last verified {p.verified}.</>}
            </p>
          </div>

          {/* Practice SLA & Audit Conversion Banner */}
          <div className="bg-navy rounded-3xl p-6 md:p-8 text-center text-white shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold font-jakarta mb-2">
              Tired of Chasing {p.name} Denials &amp; Delayed Payments?
            </h2>
            <p className="text-cream/80 text-sm mb-6 max-w-xl mx-auto leading-relaxed">
              Aethera&apos;s billing specialists work {p.name} every day — handling EDI clearinghouse rejects, prior
              authorizations, payment posting, and 30-day AR aging recovery.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                prefetch={false}
                href="/free-assessment"
                className="bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full text-sm transition-colors shadow-xs"
              >
                Get a Free Practice Assessment
              </Link>
              <Link
                prefetch={false}
                href="/tools/practice-proposal-wizard"
                className="border-2 border-white/40 hover:border-white text-white font-bold py-3 px-6 rounded-full text-sm transition-colors"
              >
                Build Practice Proposal
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
