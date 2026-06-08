'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, CheckCircle, Phone, Download, AlertCircle, TrendingUp,
  ShieldCheck, FileText, UploadCloud, Lock, FileSpreadsheet, X,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FadeIn from '@/components/ui/FadeIn';
import SectionHeader from '@/components/ui/SectionHeader';
import AgingReport from '@/components/ui/AgingReport';
import { submitToWorker } from '@/lib/worker';
import {
  decodeBuffer, parseDelimited, rowsToAggregates, computeMetrics,
  type ParsedAggregates, type ManualOverrides,
} from '@/lib/agingAnalysis';

const SPECIALTIES: Record<string, string> = {
  general: 'General / Multi-Specialty', family: 'Family Medicine', internal: 'Internal Medicine',
  cardiology: 'Cardiology', orthopedics: 'Orthopedic Surgery', dermatology: 'Dermatology',
  behavioral: 'Psychiatry / Behavioral', neurology: 'Neurology', gastro: 'Gastroenterology',
  oncology: 'Oncology / Hematology', radiology: 'Radiology / Imaging', urology: 'Urology',
  pediatrics: 'Pediatrics', pharmacy: 'Pharmacy', dental: 'Dental',
  workerscomp: "Workers' Compensation", emergency: 'Emergency / Urgent Care', other: 'Other',
};

const fmt = (n: number) => '$' + Math.round(n).toLocaleString();

interface Bucket { key: 'b30' | 'b60' | 'b90' | 'b120' | 'bOv'; label: string; max: number; }
const BUCKETS: Bucket[] = [
  { key: 'b30', label: '0–30 Days', max: 500000 },
  { key: 'b60', label: '31–60 Days', max: 300000 },
  { key: 'b90', label: '61–90 Days', max: 200000 },
  { key: 'b120', label: '91–120 Days', max: 150000 },
  { key: 'bOv', label: '120+ Days', max: 150000 },
];

interface Profile {
  firstName: string; lastName: string; practiceName: string; specialty: string;
  providerCount: string; claimVolume: string; billingSituation: string; ehr: string;
  phone: string; email: string; challenge: string;
}

// Best-effort PDF -> rows (text reconstruction). Returns [] on any failure.
async function parsePdfToRows(file: File): Promise<string[][]> {
  try {
    const pdfjs: any = await import('pdfjs-dist');
    try {
      pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();
    } catch { /* fall through; pdfjs may use a fake worker */ }
    const data = await file.arrayBuffer();
    const doc = await pdfjs.getDocument({ data }).promise;
    const rows: string[][] = [];
    for (let pg = 1; pg <= doc.numPages; pg++) {
      const page = await doc.getPage(pg);
      const content = await page.getTextContent();
      const byLine = new Map<number, { x: number; s: string }[]>();
      for (const it of content.items as any[]) {
        const y = Math.round(it.transform[5]);
        const x = it.transform[4];
        if (!byLine.has(y)) byLine.set(y, []);
        byLine.get(y)!.push({ x, s: it.str });
      }
      const ys = Array.from(byLine.keys()).sort((a, b) => b - a);
      for (const y of ys) {
        const parts = byLine.get(y)!.sort((a, b) => a.x - b.x);
        const cells: string[] = [];
        let prevX = -1;
        for (const p of parts) {
          if (prevX >= 0 && p.x - prevX > 24) cells.push(p.s);
          else if (cells.length) cells[cells.length - 1] += ' ' + p.s;
          else cells.push(p.s);
          prevX = p.x;
        }
        if (cells.length) rows.push(cells.map((c) => c.trim()));
      }
    }
    return rows;
  } catch {
    return [];
  }
}

export default function FreeAssessmentClient() {
  const [p, setP] = useState<Profile>({
    firstName: '', lastName: '', practiceName: '', specialty: 'general',
    providerCount: '', claimVolume: '', billingSituation: '', ehr: '',
    phone: '', email: '', challenge: '',
  });
  const [b, setB] = useState<Record<string, number>>({ b30: 120000, b60: 80000, b90: 50000, b120: 35000, bOv: 45000 });
  const [agg, setAgg] = useState<ParsedAggregates | null>(null);
  const [fileName, setFileName] = useState('');
  const [uploadState, setUploadState] = useState<'idle' | 'parsing' | 'done' | 'error'>('idle');
  const [uploadErr, setUploadErr] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showOv, setShowOv] = useState(false);
  const [ov, setOv] = useState<{ ccr: string; denialRate: string; cer: string; monthlyCharges: string }>({ ccr: '', denialRate: '', cer: '', monthlyCharges: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onP = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setP((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const setBucket = (k: string, v: number) => setB((prev) => ({ ...prev, [k]: v }));
  const loadExample = () => { clearUpload(); setB({ b30: 150000, b60: 95000, b90: 65000, b120: 45000, bOv: 55000 }); };

  function clearUpload() {
    setAgg(null); setFileName(''); setUploadState('idle'); setUploadErr('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleFile(file: File) {
    setUploadState('parsing'); setFileName(file.name); setUploadErr('');
    try {
      const ext = (file.name.toLowerCase().split('.').pop() || '');
      let rows: string[][] = [];
      if (ext === 'xlsx' || ext === 'xls') {
        const XLSX: any = await import('xlsx');
        const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' }) as string[][];
      } else if (ext === 'pdf') {
        rows = await parsePdfToRows(file);
      } else {
        const text = decodeBuffer(await file.arrayBuffer());
        rows = parseDelimited(text);
      }
      const clean = rows.map((r) => (r || []).map((c) => String(c ?? '')));
      const a = rowsToAggregates(clean);
      if (!a.ok) {
        setUploadState('error');
        setUploadErr('We couldn’t detect aging columns in that file. Try a CSV or Excel export of your A/R aging — or enter your buckets manually below.');
        setAgg(null);
        return;
      }
      setAgg(a);
      setB({
        b30: Math.max(0, Math.round(a.buckets.b30)), b60: Math.max(0, Math.round(a.buckets.b60)),
        b90: Math.max(0, Math.round(a.buckets.b90)), b120: Math.max(0, Math.round(a.buckets.b120)),
        bOv: Math.max(0, Math.round(a.buckets.bOv)),
      });
      setUploadState('done');
    } catch {
      setUploadState('error');
      setUploadErr('We couldn’t read that file. Please try a CSV or Excel export, or enter your numbers manually.');
      setAgg(null);
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f);
  }

  // diagnostics from the (possibly upload-filled) buckets
  const r = useMemo(() => {
    const b30 = b.b30, b60 = b.b60, b90 = b.b90, b120 = b.b120, bOv = b.bOv;
    const total = b30 + b60 + b90 + b120 + bOv;
    const risk = b90 * 0.40 + b120 * 0.60 + bOv * 0.85;
    const recoverable = b30 * 0.04 + b60 * 0.15 + b90 * 0.28 + b120 * 0.35 + bOv * 0.45;
    const health = Math.min(98, Math.max(35, Math.round(((b30 + b60 * 0.8 + b90 * 0.5) / (total || 1)) * 100)));
    const currDSO = Math.round(30 + ((b90 + b120 + bOv) / (total || 1)) * 60);
    const targDSO = Math.round(30 + ((b120 + bOv) / (total || 1)) * 12);
    return { total, risk, recoverable, health, currDSO, targDSO };
  }, [b]);

  const overrides: ManualOverrides = useMemo(() => {
    const num = (s: string) => { const n = parseFloat(s.replace(/[^0-9.]/g, '')); return isFinite(n) ? n : undefined; };
    return { ccr: num(ov.ccr), cer: num(ov.cer), denialRate: num(ov.denialRate), monthlyCharges: num(ov.monthlyCharges) };
  }, [ov]);

  const metrics = useMemo(() => {
    const source: 'upload' | 'manual' = agg ? 'upload' : 'manual';
    const aggregate: ParsedAggregates = agg ?? {
      buckets: { b30: b.b30, b60: b.b60, b90: b.b90, b120: b.b120, bOv: b.bOv },
      totalAR: r.total, charges: 0, payers: [], patientResp: 0, rowCount: 0, matchedColumns: [], ok: true,
    };
    return computeMetrics(aggregate, p.specialty, source, fileName, overrides);
  }, [agg, b, r.total, p.specialty, fileName, overrides]);

  const healthColor = r.health < 50 ? '#ef4444' : r.health < 75 ? '#f59e0b' : '#16a34a';
  const ARC = 141.4;
  const filled = (r.health / 100) * ARC;
  const specLabel = SPECIALTIES[p.specialty] || SPECIALTIES.general;
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.firstName.trim() || !p.lastName.trim() || !p.practiceName.trim() || !p.email.trim() || !p.phone.trim()) {
      setErrorMsg('Please complete the required fields (name, practice, email, phone).'); return;
    }
    setStatus('submitting'); setErrorMsg('');
    try {
      await submitToWorker('gap', {
        firstName: p.firstName.trim(), lastName: p.lastName.trim(), email: p.email.trim(), phone: p.phone.trim(),
        practiceName: p.practiceName.trim(), specialty: specLabel,
        providerCount: p.providerCount, monthlyClaims: p.claimVolume, claimVolume: p.claimVolume,
        currentBilling: p.billingSituation, ehr: p.ehr, daysInAr: String(metrics.dar),
        denialRate: String(Math.round(metrics.denialRate)) + '%', challenge: p.challenge,
        answers: {
          aging: b, totalAR: Math.round(r.total), atRiskRevenue: Math.round(metrics.atRisk),
          recoverable: Math.round(metrics.recoverable), arHealthScore: r.health,
          currentDSO: r.currDSO, targetDSO: r.targDSO,
          providerCount: p.providerCount, claimVolume: p.claimVolume, billingSituation: p.billingSituation,
          ehr: p.ehr, challenge: p.challenge, agingSource: metrics.source, fileName,
          metrics, // full de-identified analysis (no PHI)
        },
      });
      setStatus('success');
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
    } catch {
      setStatus('error'); setErrorMsg('Something went wrong sending your report. Please call us at +1 (863) 694-0325.');
    }
  };

  const inputCls = 'w-full border border-gray/30 rounded-lg px-4 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal text-sm';

  return (
    <div className="min-h-screen flex flex-col">
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #ar-report, #ar-report * { visibility: visible !important; }
          #ar-report { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; box-shadow: none !important; border: none !important; }
          .no-print { display: none !important; }
          @page { margin: 12mm; }
        }
      `}</style>

      <div className="no-print"><Navbar /></div>

      {/* Hero */}
      <section className="no-print pt-24 pb-12 md:pt-32 md:pb-16 bg-gradient-to-br from-navy to-teal relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint/10 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <FadeIn>
            <span className="inline-block bg-mint/20 border border-mint/40 text-mint text-sm font-semibold px-4 py-1.5 rounded-full mb-5">
              Free Live A/R Gap Analysis · Upload &amp; Analyze
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-playfair mb-5 leading-tight">
              Build Your A/R Analysis Report — Free
            </h1>
            <p className="text-xl text-cream max-w-3xl mx-auto">
              Upload your A/R aging report (or enter your numbers) and instantly get a full revenue diagnostic —
              KPIs, denial breakdown, payer bottlenecks and a recovery action plan — emailed to you and downloadable as a PDF.
            </p>
          </FadeIn>
          <FadeIn delay={0.25}>
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {['Upload CSV / Excel / PDF', 'Parsed in your browser', 'PHI never leaves your device', 'Emailed + PDF'].map((bdg) => (
                <span key={bdg} className="bg-white/15 border border-white/30 text-white px-4 py-1.5 rounded-full text-sm font-medium">✓ {bdg}</span>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* STEP 1: practice profile */}
      <section className="no-print py-12 md:py-16 bg-cream" id="analyze">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="STEP 1 · YOUR PRACTICE"
            title="Tell us about your practice"
            description="The more accurate your details, the sharper your report. We sign an NDA before accessing any live data."
          />
          <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* left: profile */}
            <div className="bg-white rounded-2xl p-7 border border-gray/10 shadow-sm space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-navy mb-1">First Name *</label>
                  <input id="firstName" required aria-label="First Name" name="firstName" value={p.firstName} onChange={onP} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-navy mb-1">Last Name *</label>
                  <input id="lastName" required aria-label="Last Name" name="lastName" value={p.lastName} onChange={onP} className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="practiceName" className="block text-sm font-semibold text-navy mb-1">Practice / Group Name *</label>
                <input id="practiceName" required aria-label="Practice Name" name="practiceName" value={p.practiceName} onChange={onP} placeholder="Central Valley Medical Group" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="specialty" className="block text-sm font-semibold text-navy mb-1">Primary Specialty *</label>
                  <select id="specialty" required aria-label="Specialty" name="specialty" value={p.specialty} onChange={onP} className={inputCls}>
                    {Object.entries(SPECIALTIES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="providerCount" className="block text-sm font-semibold text-navy mb-1">Number of Providers</label>
                  <select id="providerCount" aria-label="Number of Providers" name="providerCount" value={p.providerCount} onChange={onP} className={inputCls}>
                    <option value="">Select</option>
                    {['1', '2–5', '6–10', '11–20', '21+'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="claimVolume" className="block text-sm font-semibold text-navy mb-1">Monthly Claim Volume</label>
                  <select id="claimVolume" aria-label="Monthly Claim Volume" name="claimVolume" value={p.claimVolume} onChange={onP} className={inputCls}>
                    <option value="">Select</option>
                    {['Under 200', '200–500', '500–1,000', '1,000–2,000', '2,000+'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="billingSituation" className="block text-sm font-semibold text-navy mb-1">Current Billing</label>
                  <select id="billingSituation" aria-label="Current Billing Situation" name="billingSituation" value={p.billingSituation} onChange={onP} className={inputCls}>
                    <option value="">Select</option>
                    {['In-house billing staff', 'Another billing company', 'Mixed (in-house + outsourced)', 'Physician bills personally'].map((v) => <option key={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="ehr" className="block text-sm font-semibold text-navy mb-1">Current EHR / PM System</label>
                <input id="ehr" aria-label="EHR System" name="ehr" value={p.ehr} onChange={onP} placeholder="e.g. Epic, athenahealth, eClinicalWorks, Kareo…" className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-navy mb-1">Phone *</label>
                  <input id="phone" required type="tel" aria-label="Phone Number" name="phone" value={p.phone} onChange={onP} className={inputCls} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-navy mb-1">Work Email *</label>
                  <input id="email" required type="email" aria-label="Email Address" name="email" value={p.email} onChange={onP} placeholder="you@yourpractice.com" className={inputCls} />
                </div>
              </div>
              <div>
                <label htmlFor="challenge" className="block text-sm font-semibold text-navy mb-1">Biggest Billing Challenge (optional)</label>
                <textarea id="challenge" aria-label="Biggest Billing Challenge" name="challenge" value={p.challenge} onChange={onP} rows={3}
                  placeholder="e.g. High denial rates, slow A/R, staff turnover, switching billing companies…" className={inputCls + ' resize-none'} />
              </div>
            </div>

            {/* right: upload + aging + preview + submit */}
            <div className="space-y-6">
              {/* upload */}
              <div className="bg-white rounded-2xl p-7 border border-gray/10 shadow-sm">
                <h3 className="text-lg font-bold text-navy mb-1">Step 2 · Your A/R Aging</h3>
                <p className="text-gray text-xs mb-4">Upload your aging report for a full, data-driven analysis — or set the buckets manually below.</p>

                {uploadState === 'done' && agg ? (
                  <div className="rounded-xl border border-mint/40 bg-mint/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <FileSpreadsheet className="h-5 w-5 text-teal mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-navy break-all">{fileName}</p>
                          <p className="text-xs text-gray">{agg.rowCount.toLocaleString()} claim lines parsed · {agg.payers.length} payers · {fmt(agg.totalAR)} total A/R</p>
                        </div>
                      </div>
                      <button type="button" onClick={clearUpload} aria-label="Remove uploaded file" className="text-gray hover:text-red-600"><X className="h-4 w-4" /></button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    onClick={() => fileRef.current?.click()}
                    role="button" tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); }}
                    className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${dragOver ? 'border-teal bg-teal/5' : 'border-gray/30 hover:border-teal/60'}`}
                  >
                    <UploadCloud className="h-8 w-8 text-teal mx-auto mb-2" />
                    <p className="text-sm font-semibold text-navy">{uploadState === 'parsing' ? 'Reading your report…' : 'Drop your aging report here, or click to upload'}</p>
                    <p className="text-xs text-gray mt-1">CSV · TSV · Excel (.xlsx/.xls) · PDF</p>
                    <p className="text-[11px] text-teal mt-2 flex items-center justify-center"><Lock className="h-3 w-3 mr-1" /> Parsed in your browser — patient data never leaves your device</p>
                    <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,.xlsx,.xls,.pdf,text/csv,text/plain,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf" className="hidden" aria-label="Upload aging report" onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); }} />
                  </div>
                )}
                {uploadErr && <p className="text-xs text-red-600 mt-2">{uploadErr}</p>}

                {/* manual sliders (also reflect uploaded values) */}
                <div className="mt-5 pt-5 border-t border-gray/10">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-navy">{agg ? 'Parsed aging (editable)' : 'Or enter your A/R aging'}</p>
                    {!agg && <button type="button" onClick={loadExample} className="text-xs font-semibold text-teal hover:text-navy">Load example</button>}
                  </div>
                  <div className="space-y-4">
                    {BUCKETS.map((bk) => (
                      <div key={bk.key}>
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor={bk.key} className="text-sm font-semibold text-navy">{bk.label}</label>
                          <span className={`text-sm font-bold ${bk.key === 'bOv' ? 'text-red-600' : 'text-teal'}`}>{fmt(b[bk.key])}</span>
                        </div>
                        <input id={bk.key} type="range" min={0} max={Math.max(bk.max, b[bk.key])} step={5000} value={b[bk.key]}
                          aria-label={`${bk.label} accounts receivable`} onChange={(e) => setBucket(bk.key, Number(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-cream accent-teal" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* optional overrides */}
                <div className="mt-5 pt-4 border-t border-gray/10">
                  <button type="button" onClick={() => setShowOv((s) => !s)} className="text-xs font-semibold text-teal hover:text-navy">
                    {showOv ? '− Hide' : '+ Know your numbers?'} (optional: clean-claim rate, denial rate, collections)
                  </button>
                  {showOv && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label htmlFor="ov-ccr" className="block text-xs font-semibold text-navy mb-1">Clean Claim Rate %</label>
                        <input id="ov-ccr" inputMode="decimal" value={ov.ccr} onChange={(e) => setOv((o) => ({ ...o, ccr: e.target.value }))} placeholder="e.g. 82" className={inputCls} />
                      </div>
                      <div>
                        <label htmlFor="ov-den" className="block text-xs font-semibold text-navy mb-1">Denial Rate %</label>
                        <input id="ov-den" inputMode="decimal" value={ov.denialRate} onChange={(e) => setOv((o) => ({ ...o, denialRate: e.target.value }))} placeholder="e.g. 12" className={inputCls} />
                      </div>
                      <div>
                        <label htmlFor="ov-cer" className="block text-xs font-semibold text-navy mb-1">Net Collection %</label>
                        <input id="ov-cer" inputMode="decimal" value={ov.cer} onChange={(e) => setOv((o) => ({ ...o, cer: e.target.value }))} placeholder="e.g. 94" className={inputCls} />
                      </div>
                      <div>
                        <label htmlFor="ov-chg" className="block text-xs font-semibold text-navy mb-1">Monthly Charges $</label>
                        <input id="ov-chg" inputMode="decimal" value={ov.monthlyCharges} onChange={(e) => setOv((o) => ({ ...o, monthlyCharges: e.target.value }))} placeholder="e.g. 250000" className={inputCls} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* live preview */}
              <div className="bg-navy rounded-2xl p-7 text-white shadow-sm">
                <h3 className="text-lg font-bold font-playfair mb-4">Live Preview</h3>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-white/10 rounded-xl p-3.5"><p className="text-[11px] text-cream/70 mb-0.5">Total Outstanding A/R</p><p className="text-xl font-bold text-white">{fmt(r.total)}</p></div>
                  <div className="bg-white/10 rounded-xl p-3.5"><p className="text-[11px] text-cream/70 mb-0.5">At-Risk Revenue</p><p className="text-xl font-bold text-red-300">{fmt(r.risk)}</p></div>
                  <div className="bg-white/10 rounded-xl p-3.5"><p className="text-[11px] text-cream/70 mb-0.5">Recoverable w/ Aethera</p><p className="text-xl font-bold text-mint">{fmt(r.recoverable)}</p></div>
                  <div className="bg-white/10 rounded-xl p-3.5"><p className="text-[11px] text-cream/70 mb-0.5">A/R Health Score</p><p className="text-xl font-bold" style={{ color: healthColor }}>{r.health}%</p></div>
                </div>
                <div className="flex flex-col items-center mb-4">
                  <svg viewBox="0 0 120 72" className="w-full max-w-[200px]" role="img" aria-label={`A/R health score ${r.health} percent`}>
                    <path d="M 15 65 A 45 45 0 0 1 105 65" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="11" strokeLinecap="round" />
                    <path d="M 15 65 A 45 45 0 0 1 105 65" fill="none" stroke={healthColor} strokeWidth="11" strokeLinecap="round" strokeDasharray={`${filled} ${ARC}`} style={{ transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease' }} />
                    <text x="60" y="56" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18" fill="#ffffff">{r.health}%</text>
                    <text x="60" y="68" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="600" fontSize="6.5" fill="rgba(255,255,255,0.6)" letterSpacing="1">A/R HEALTH SCORE</text>
                  </svg>
                </div>
                <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3 text-sm">
                  <div><span className="text-cream/70">Your DSO</span> <span className="font-bold text-white ml-1">{r.currDSO} days</span></div>
                  <ArrowRight className="h-4 w-4 text-mint" />
                  <div><span className="text-cream/70">Aethera target</span> <span className="font-bold text-mint ml-1">{r.targDSO} days</span></div>
                </div>
              </div>

              {/* submit */}
              <div className="bg-white rounded-2xl p-6 border border-gray/10 shadow-sm">
                <button type="submit" disabled={status === 'submitting'}
                  className="w-full bg-teal hover:bg-navy text-white font-bold py-3.5 px-8 rounded-full transition-colors duration-300 flex items-center justify-center disabled:opacity-60">
                  {status === 'submitting' ? 'Generating your report…' : (<>Generate My Report &amp; Email It <ArrowRight className="h-5 w-5 ml-2" /></>)}
                </button>
                {errorMsg && <p className="text-center text-red-600 text-sm mt-3">{errorMsg}</p>}
                <p className="text-xs text-gray text-center mt-3">
                  We’ll email a copy and show it on-screen to download. By submitting you agree to our{' '}
                  <Link prefetch={false} href="/compliance/privacy-policy" className="text-teal hover:underline">Privacy Policy</Link>. We never share your data.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* REPORT */}
      {status === 'success' && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-mint/10 border border-mint/40 rounded-2xl p-5">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-9 w-9 text-teal flex-shrink-0" />
                <div>
                  <p className="font-bold text-navy">Your report is ready — and on its way to {p.email}.</p>
                  <p className="text-gray text-sm">Download a PDF copy below, or keep this page for your records.</p>
                </div>
              </div>
              <button type="button" onClick={() => window.print()} className="bg-teal hover:bg-navy text-white font-bold py-3 px-6 rounded-full transition-colors flex items-center whitespace-nowrap">
                <Download className="h-5 w-5 mr-2" /> Download PDF
              </button>
            </div>

            <div id="ar-report" ref={reportRef} className="bg-white rounded-2xl border border-gray/15 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-br from-navy to-teal text-white px-8 py-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-mint text-xs font-semibold tracking-wide uppercase mb-1">Aethera Healthcare Solutions</p>
                    <h2 className="text-2xl md:text-3xl font-bold font-playfair leading-tight">A/R Gap Analysis Report</h2>
                  </div>
                  <FileText className="h-9 w-9 text-mint flex-shrink-0" />
                </div>
                <p className="text-cream/80 text-sm mt-3">Prepared for <strong className="text-white">{p.practiceName}</strong> · {reportDate}</p>
              </div>

              <div className="px-8 py-7">
                <h3 className="text-sm font-bold text-teal uppercase tracking-wide mb-3">Practice Profile</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-7 text-sm">
                  {[
                    ['Contact', `${p.firstName} ${p.lastName}`], ['Specialty', specLabel],
                    ['Providers', p.providerCount || '—'], ['Monthly Claims', p.claimVolume || '—'],
                    ['Current Billing', p.billingSituation || '—'], ['EHR / PM System', p.ehr || '—'],
                  ].map(([k, v]) => (
                    <div key={k}><p className="text-gray text-xs mb-0.5">{k}</p><p className="text-navy font-semibold">{v}</p></div>
                  ))}
                </div>

                <h3 className="text-sm font-bold text-teal uppercase tracking-wide mb-3">Headline Numbers</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-xl p-4 bg-cream border border-gray/10"><p className="text-xs text-gray mb-1">Total Outstanding A/R</p><p className="text-2xl font-bold text-navy">{fmt(r.total)}</p></div>
                  <div className="rounded-xl p-4 bg-red-50 border border-red-100"><p className="text-xs text-gray mb-1">At-Risk Revenue</p><p className="text-2xl font-bold text-red-600">{fmt(r.risk)}</p></div>
                  <div className="rounded-xl p-4 bg-mint/15 border border-mint/30"><p className="text-xs text-gray mb-1">Recoverable with Aethera</p><p className="text-2xl font-bold text-teal">{fmt(r.recoverable)}</p></div>
                  <div className="rounded-xl p-4 bg-cream border border-gray/10"><p className="text-xs text-gray mb-1">A/R Health Score</p><p className="text-2xl font-bold" style={{ color: healthColor }}>{r.health}%</p></div>
                </div>
                <div className="flex items-center justify-between bg-navy rounded-xl px-5 py-4 text-white mb-2">
                  <div><span className="text-cream/70 text-sm">Current DSO</span><p className="text-xl font-bold">{r.currDSO} days</p></div>
                  <ArrowRight className="h-5 w-5 text-mint" />
                  <div className="text-right"><span className="text-cream/70 text-sm">Aethera Target DSO</span><p className="text-xl font-bold text-mint">{r.targDSO} days</p></div>
                </div>

                {/* mandatory sections */}
                <AgingReport m={metrics} />

                <div className="bg-cream rounded-xl p-5 border border-gray/10 mt-8">
                  <h4 className="font-bold text-navy mb-1">Recommended next step</h4>
                  <p className="text-gray text-sm">A senior Aethera specialist will review these figures against your live A/R data and walk you through this recovery plan — no cost, no obligation. We typically respond within one business day.</p>
                </div>

                <p className="text-[11px] text-gray/70 mt-6 leading-relaxed">
                  Figures derived from {metrics.source === 'upload' ? 'your uploaded aging report' : 'the values you entered'}; items marked “est.” use {specLabel.toLowerCase()} benchmarks and are confirmed against your live data during intake.
                  © {new Date().getFullYear()} Aethera Healthcare Solutions · +1 (863) 694-0325 · support@aetherahealthcare.com
                </p>
              </div>
            </div>

            <div className="no-print text-center mt-8">
              <Link href="/" prefetch={false} className="inline-flex items-center text-teal font-semibold hover:text-navy transition-colors">← Return to homepage</Link>
            </div>
          </div>
        </section>
      )}

      {/* trust (hidden once report shows) */}
      {status !== 'success' && (
        <>
          <section className="no-print py-12 md:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: <AlertCircle className="h-6 w-6" />, title: 'Find the leak', desc: 'Aged A/R quietly drifts into write-offs. Your report quantifies exactly how much is at risk — bucket by bucket and payer by payer.' },
                  { icon: <TrendingUp className="h-6 w-6" />, title: "See what's recoverable", desc: 'Not all aged A/R is lost. We estimate what disciplined re-submission and appeals can realistically claw back.' },
                  { icon: <ShieldCheck className="h-6 w-6" />, title: 'Get an action plan', desc: 'Target closures, staff assignments and timeframes — plus exactly how Aethera fixes each gap.' },
                ].map((c, i) => (
                  <FadeIn key={i} delay={i * 0.1}>
                    <div className="bg-cream rounded-xl p-6 border border-gray/10 h-full">
                      <div className="text-teal mb-3">{c.icon}</div>
                      <h3 className="font-bold text-navy mb-2">{c.title}</h3>
                      <p className="text-gray text-sm">{c.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
          <section className="no-print py-12 bg-cream">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white rounded-2xl px-6 py-5 border border-gray/10 shadow-sm">
                <div className="flex items-center text-navy"><Phone className="h-5 w-5 text-teal mr-2" /><span className="font-bold">Prefer to talk it through?</span></div>
                <a href="tel:+18636940325" className="text-teal font-semibold hover:text-navy transition-colors">+1 (863) 694-0325</a>
                <span className="text-gray text-sm">Mon–Fri, 9 AM–6 PM EST</span>
              </div>
            </div>
          </section>
        </>
      )}

      <div className="no-print"><Footer /></div>
    </div>
  );
}
