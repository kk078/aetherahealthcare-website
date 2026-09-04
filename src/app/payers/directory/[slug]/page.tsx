import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getAllPayers, getPayer } from '@/lib/payers';
import { Hash, Clock, RotateCcw, Phone, Printer, Globe, ExternalLink, Network, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPayers().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getPayer(slug);
  if (!p) return { title: 'Payer Not Found' };
  return {
    title: { absolute: `${p.name} — Payer ID, Timely Filing & Claims | Aethera Healthcare Solutions` },
    description: `${p.name}: payer ID ${p.payerId || '(varies by plan)'}, timely filing ${p.timelyFiling || 'varies'}, appeals, claims routing, clearinghouses, and provider portal. A free AR reference from Aethera Healthcare Solutions.`,
  };
}

function Field({ icon: Icon, label, value, note }: { icon: React.ElementType; label: string; value: string | null; note?: string | null }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray/10">
      <Icon className="h-5 w-5 text-teal shrink-0 mt-0.5" />
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray">{label}</p>
        <p className="text-navy font-medium">{value || <span className="text-gray italic font-normal">Varies — confirm via portal / clearinghouse</span>}</p>
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
          <span className="inline-block mt-3 text-xs font-semibold uppercase tracking-wide text-navy bg-mint rounded px-2.5 py-1">{p.type}</span>
          {p.aka && p.aka.length > 0 && (
            <p className="text-cream/90 text-sm mt-3">Also covers: {p.aka.join(', ')}</p>
          )}
        </div>
      </section>

      <section className="py-12 bg-cream flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray/15 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <Field icon={Hash} label="Payer ID" value={p.payerId} note={p.payerIdNote} />
              <Field icon={Clock} label="Timely Filing Limit (TFL)" value={p.timelyFiling} />
              <Field icon={RotateCcw} label="Appeal Window" value={p.appeal} />
              <Field icon={Network} label="Clearinghouse" value={p.clearinghouse} />
              <Field icon={Phone} label="Provider Services" value={p.providerPhone} />
              <Field icon={Printer} label="Claims Fax" value={p.fax} />
              <Field icon={MapPin} label="Claims Address" value={p.claimsAddress} />
              <Field icon={Globe} label="Provider Portal" value={p.portalUrl} />
            </div>

            {(p.portalUrl || p.website) && (
              <div className="flex flex-wrap gap-3 mt-6">
                {p.portalUrl && (
                  <a href={p.portalUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-teal hover:bg-navy text-white font-semibold py-2.5 px-5 rounded-full text-sm transition-colors">
                    Provider Portal <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {p.website && (
                  <a href={p.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 border-2 border-teal text-teal hover:bg-teal hover:text-white font-semibold py-2.5 px-5 rounded-full text-sm transition-colors">
                    Payer Website <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {p.notes && <p className="text-sm text-gray mt-6 leading-relaxed">{p.notes}</p>}

            <div className="flex items-start gap-2 mt-6 pt-5 border-t border-gray/10">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-gray">
                Values vary by plan, region, and contract and can change. Confirm in the payer portal or with your clearinghouse before filing.
                {p.verified && <> Last verified {p.verified}.</>}
              </p>
            </div>
          </div>

          {/* Conversion */}
          <div className="mt-8 bg-navy rounded-2xl p-6 md:p-8 text-center">
            <h2 className="text-xl font-bold text-white mb-2">Stop chasing {p.name} denials and TFLs</h2>
            <p className="text-gray text-sm mb-5 max-w-xl mx-auto">
              Aethera&apos;s AR team works {p.name} every day — payer rules, appeals, and clean-claim submission, handled.
            </p>
            <Link href="/free-assessment" className="inline-block bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full text-sm transition-colors">
              Get a Free Assessment
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
