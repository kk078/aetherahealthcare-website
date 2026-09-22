'use client';

import { useState, type ReactNode } from 'react';
import { admissionReview, clfsPhaseInFloor, convertNdc, drugBillingUnits, scenarioCost, sha256, verifyDemoRecord } from '@/lib/autonomyCalculations';
import { SAMPLE_CODES, SOURCES, type SourceKey } from '@/data/autonomyReferences';

const fieldClass = 'mt-2 block w-full rounded-lg border border-slate-400 bg-white px-3 py-2.5 text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-teal-700';
const buttonClass = 'rounded-lg bg-teal-800 px-4 py-3 font-semibold text-white hover:bg-teal-900 disabled:opacity-50';
function number(value: string) { return value.trim() ? Number(value) : NaN; }
function calculate<T,>(fn: () => T): { value: T; error?: never } | { error: string; value?: never } {
  try { return { value: fn() }; } catch (error) { return { error: error instanceof Error ? error.message : 'Check the inputs.' }; }
}
function Field({ label, value, set, min = 0, max, step = 'any' }: { label: string; value: string; set: (value: string) => void; min?: number; max?: number; step?: string }) {
  return <label className="block text-sm font-medium">{label}<input className={fieldClass} type="number" min={min} max={max} step={step} value={value} onChange={e => set(e.target.value)} /></label>;
}
function Card({ id, title, children, source }: { id: string; title: string; children: ReactNode; source?: SourceKey }) {
  return <section id={id} className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm sm:p-8"><h3 className="mb-4 text-2xl font-semibold text-slate-950">{title}</h3>{children}{source && <a className="mt-6 block text-sm font-semibold text-teal-800 underline underline-offset-4" href={SOURCES[source].url}>{SOURCES[source].label} ↗</a>}</section>;
}
function Result({ children }: { children: ReactNode }) { return <div aria-live="polite" className="mt-5 rounded-lg bg-slate-100 p-4 text-sm leading-relaxed">{children}</div>; }
const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function DrugTool() {
  const [dose, setDose] = useState('325'), [supply, setSupply] = useState('400'), [unit, setUnit] = useState('10');
  const result = calculate(() => drugBillingUnits(number(dose), number(supply), number(unit)));
  return <Card id="drug-waste-engine" title="Drug billing-unit reconciliation" source="drugs"><p className="mb-5 text-sm leading-relaxed">Illustration for an eligible, separately payable Medicare Part B drug from a single-dose container. Enter the labeled supply actually opened and the amount administered; the remainder is assumed discarded. Confirm the HCPCS unit and applicable setting.</p><div className="grid gap-4 sm:grid-cols-3"><Field label="Administered (mg)" value={dose} set={setDose} min={0.001} /><Field label="Opened supply (mg)" value={supply} set={setSupply} min={0.001} /><Field label="mg per billing unit" value={unit} set={setUnit} min={0.001} /></div><Result>{result.error ?? <><strong>Administered: {result.value!.administeredUnits} units · Discarded: {result.value!.discardedUnits} units · Total: {result.value!.totalUnits} units</strong><p className="mt-2">Physical remainder: {Number(result.value!.discardedMg.toFixed(6))} mg. Modifier example: {result.value!.modifier}. Waste included in a rounded administered unit is not billed again. A JZ example can include sub-unit waste already included in that rounding.</p></>}</Result></Card>;
}
function NdcTool() {
  const [ndc, setNdc] = useState('50242-061-01');
  const result = calculate(() => convertNdc(ndc));
  return <Card id="code-anatomy" title="10-digit NDC to 11-digit billing format" source="avastin"><p className="mb-5 text-sm">Preserve the label’s original segment boundaries. Padding changes the format; it does not validate a drug, strength, package or coverage.</p><label className="text-sm font-medium">Original hyphenated NDC<input className={fieldClass} value={ndc} onChange={e => setNdc(e.target.value)} maxLength={20} /></label><Result>{result.error ?? <strong>11-digit format: {result.value}</strong>}</Result></Card>;
}
function AdmissionTool() {
  const [order, setOrder] = useState(false), [rationale, setRationale] = useState(false), [nights, setNights] = useState('0');
  const result = calculate(() => admissionReview(order, number(nights), rationale));
  return <Card id="two-midnight-arbiter" title="Inpatient documentation checkpoint" source="admission"><p className="mb-5 text-sm">A review prompt for the two-midnight framework. These three inputs cannot decide inpatient coverage or replace the full clinical record.</p><div className="space-y-4"><label className="flex items-center gap-3"><input type="checkbox" checked={order} onChange={e => setOrder(e.target.checked)} />Valid practitioner admission order is present</label><label className="flex items-center gap-3"><input type="checkbox" checked={rationale} onChange={e => setRationale(e.target.checked)} />Clinical rationale is documented</label><Field label="Expected hospital midnights" value={nights} set={setNights} max={365} step="1" /></div><Result>{result.error ?? <><strong>{result.value!.status}</strong><p className="mt-2">{result.value!.detail}</p></>}</Result></Card>;
}
function ClfsTool() {
  const [rate, setRate] = useState('100'), [year, setYear] = useState('2026');
  const result = calculate(() => clfsPhaseInFloor(number(rate), number(year)));
  return <Card id="clfs-pama-arbiter" title="CLFS phase-in floor illustration" source="clfs"><p className="mb-5 text-sm">For an existing test subject to the phase-in provision: no reduction in 2026; a maximum 15% reduction per year in 2027–2029. This is a floor illustration, not a projected fee schedule or PAMA reporting determination.</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Prior-year payment rate ($)" value={rate} set={setRate} min={0.01} /><label className="text-sm font-medium">Payment year<select aria-label="Payment year" className={fieldClass} value={year} onChange={e => setYear(e.target.value)}>{[2026, 2027, 2028, 2029].map(y => <option key={y}>{y}</option>)}</select></label></div><Result>{result.error ?? <strong>Maximum reduction: {result.value!.reduction * 100}% · Illustrative floor: ${result.value!.floor.toFixed(4)}</strong>}</Result><p className="mt-3 text-xs">Use the immediately preceding year’s rate for each successive year. Verify the published test-specific rate and any exceptions.</p></Card>;
}
function CostTool() {
  const [claims, setClaims] = useState('1000'), [allowed, setAllowed] = useState('100'), [denial, setDenial] = useState('10'), [recovery, setRecovery] = useState('50'), [rework, setRework] = useState('10');
  const result = calculate(() => scenarioCost(number(claims), number(allowed), number(denial), number(recovery), number(rework)));
  return <Card id="specialty-clawback-calculator" title="Build your own denial-cost scenario"><p className="mb-5 text-sm">All defaults are hypothetical inputs, not industry benchmarks or Aethera performance claims. Enter your own validated annual data. No vendor improvement, savings or ROI is assumed.</p><div className="grid gap-4 sm:grid-cols-2"><Field label="Annual claims" value={claims} set={setClaims} step="1" max={10000000} /><Field label="Average allowed amount ($)" value={allowed} set={setAllowed} /><Field label="Initial denials (%)" value={denial} set={setDenial} max={100} /><Field label="Recovery of denied dollars (%)" value={recovery} set={setRecovery} max={100} /><Field label="Rework cost per denied claim ($)" value={rework} set={setRework} /></div><Result>{result.error ?? <><strong>Illustrative annual cost: {money(result.value!.total)}</strong><p>{result.value!.denied.toLocaleString('en-US')} expected denied claims · Unrecovered allowed dollars: {money(result.value!.unrecovered)} · Rework: {money(result.value!.rework)}</p></>}</Result><p className="mt-3 text-xs leading-relaxed">Formula: claims × denial fraction × [average allowed × (1 − recovery fraction) + rework cost]. Assumes a uniform allowed amount and one rework cost per initial denial; excludes collection timing, repeat denials and implementation costs.</p></Card>;
}
function HashTool() {
  const [payload, setPayload] = useState('DEMO ONLY | service: example | units: 40');
  const [hash, setHash] = useState(''), [status, setStatus] = useState('No digest created.'), [busy, setBusy] = useState(false);
  async function run(seal: boolean) {
    setBusy(true);
    try {
      if (seal) { setHash(await sha256(payload)); setStatus('Digest created. Edit the example, then verify it.'); }
      else { setStatus(await verifyDemoRecord(payload, hash) ? 'Match: the example matches the saved digest.' : 'Mismatch: the example changed after the digest was created.'); }
    } catch { setStatus('SHA-256 is unavailable in this browser. Use a secure HTTPS connection.'); }
    finally { setBusy(false); }
  }
  async function download() {
    setBusy(true);
    try {
      const matches = await verifyDemoRecord(payload, hash);
      const blob = new Blob([JSON.stringify({ purpose: 'Educational demonstration only; not a legal attestation, signature or audit certificate.', algorithm: 'SHA-256', payload, savedDigest: hash, matches }, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'aethera-hash-demonstration.json'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus(`Demonstration downloaded. Verification: ${matches ? 'match' : 'mismatch'}.`);
    } catch { setStatus('Could not verify or download the demonstration.'); } finally { setBusy(false); }
  }
  return <Card id="cryptographic-audit-ledger" title="Try a real SHA-256 digest"><p className="mb-5 text-sm leading-relaxed">This browser-only example detects changes relative to a saved digest. It is not an immutable ledger, identity check, timestamp authority, digital signature or proof that a claim is accurate. Do not enter patient information.</p><label className="text-sm font-medium">Demonstration text<textarea className={fieldClass} rows={3} maxLength={1000} disabled={busy} value={payload} onChange={e => { setPayload(e.target.value); setStatus('Text changed. Verify against the saved digest.'); }} /></label><div className="mt-4 flex flex-wrap gap-3"><button className={buttonClass} disabled={busy} onClick={() => void run(true)}>Create digest</button><button className={buttonClass} disabled={!hash || busy} onClick={() => void run(false)}>Verify text</button><button className={buttonClass} disabled={!hash || busy} onClick={() => void download()}>Download JSON example</button></div>{hash && <p className="mt-4 break-all font-mono text-xs" aria-label="Saved SHA-256 digest">{hash}</p>}<Result>{status}</Result></Card>;
}
function CodeTool() {
  const [query, setQuery] = useState('');
  const matches = SAMPLE_CODES.filter(item => `${item.code} ${item.system} ${item.meaning} ${item.review}`.toLowerCase().includes(query.toLowerCase().trim()));
  return <Card id="code-explorer" title="Selected code and package examples"><p className="mb-5 text-sm">Seven educational entries. This is not a complete CPT, HCPCS, CDT or NDC directory and does not validate a claim.</p><label className="text-sm font-medium">Search selected examples<input type="search" className={fieldClass} value={query} onChange={e => setQuery(e.target.value)} /></label><p className="mt-3 text-sm" aria-live="polite">{matches.length} of {SAMPLE_CODES.length} examples</p><ul className="mt-4 divide-y divide-slate-200">{matches.map(item => <li key={item.code} className="py-4"><p className="font-semibold">{item.code} <span className="text-sm font-normal">· {item.system}</span></p><p className="mt-1 text-sm">{item.meaning}</p><p className="mt-2 text-sm text-slate-600">{item.review}</p><a href={SOURCES[item.source].url} className="mt-2 inline-block text-sm text-teal-800 underline">Source: {SOURCES[item.source].label}</a></li>)}</ul>{!matches.length && <p>No example matches. Consult the applicable authoritative code set.</p>}</Card>;
}
export default function AutonomyLearningTools() {
  return <div className="grid items-start gap-6 lg:grid-cols-2"><DrugTool /><NdcTool /><AdmissionTool /><ClfsTool /><CostTool /><HashTool /><div className="lg:col-span-2"><CodeTool /></div></div>;
}
