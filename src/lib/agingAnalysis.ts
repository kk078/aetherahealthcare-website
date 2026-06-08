/**
 * Aging-report analysis engine (runs entirely in the browser).
 *
 * PHI SAFETY: parsing happens client-side. Only de-identified AGGREGATES
 * (bucket totals, payer totals, counts) are ever returned/transmitted —
 * never patient rows, names, or DOBs.
 */

export interface BucketSet { b30: number; b60: number; b90: number; b120: number; bOv: number; }

export interface PayerAgg { name: string; balance: number; pct: number; over90: number; over90Pct: number; }

export interface ParsedAggregates {
  buckets: BucketSet;
  totalAR: number;
  charges: number;          // sum of Charges column if present (else 0)
  payers: PayerAgg[];       // top payers by balance
  patientResp: number;      // balance owed by patient (self-pay/guarantor rows)
  rowCount: number;
  matchedColumns: string[]; // which fields we recognized
  ok: boolean;              // true if we could derive a usable aging distribution
}

export interface DenialReason { reason: string; pct: number; value: number; }
export interface TargetGap { label: string; current: string; target: string; impact: number; }
export interface Assignment { focus: string; owner: string; due: string; }
export interface AethSolution { problem: string; service: string; how: string; }

export interface AgingMetrics {
  source: 'upload' | 'manual';
  fileName: string;
  rowCount: number;
  buckets: BucketSet;
  totalAR: number;
  charges: number;
  // KPIs
  dar: number;              // days in A/R (avg age proxy)
  ccr: number;              // clean claim rate %
  cer: number;              // collection efficiency %
  denialRate: number;       // %
  // aging / risk
  atRisk: number;
  recoverable: number;
  uncollectible: number;
  healthScore: number;
  currentDSO: number;
  targetDSO: number;
  over90: number;
  over90Pct: number;
  // denial mgmt
  deniedValue: number;
  denialReasons: DenialReason[];
  writeOffPct: number;
  writeOffValue: number;
  // payer / financial
  payers: PayerAgg[];
  patientRespValue: number;
  patientRespPct: number;
  payerRespValue: number;
  // bridging / action
  targets: TargetGap[];
  assignments: Assignment[];
  solutions: AethSolution[];
  estimatedFields: string[]; // which numbers are benchmark estimates (for labeling)
}

/* ---------------------------------------------------------------- */
/*  Benchmarks                                                       */
/* ---------------------------------------------------------------- */
export interface SpecBench { dso: number; denialRate: number; ccr: number; cer: number; writeOff: number; }
export const SPEC_BENCH: Record<string, SpecBench> = {
  general:     { dso: 52, denialRate: 28, ccr: 78, cer: 92, writeOff: 4 },
  family:      { dso: 50, denialRate: 25, ccr: 80, cer: 93, writeOff: 3.5 },
  internal:    { dso: 50, denialRate: 25, ccr: 80, cer: 93, writeOff: 3.5 },
  cardiology:  { dso: 61, denialRate: 38, ccr: 74, cer: 90, writeOff: 5 },
  orthopedics: { dso: 67, denialRate: 42, ccr: 72, cer: 88, writeOff: 6 },
  dermatology: { dso: 49, denialRate: 24, ccr: 82, cer: 93, writeOff: 3 },
  behavioral:  { dso: 48, denialRate: 22, ccr: 81, cer: 91, writeOff: 4 },
  neurology:   { dso: 58, denialRate: 34, ccr: 75, cer: 90, writeOff: 5 },
  gastro:      { dso: 56, denialRate: 33, ccr: 76, cer: 90, writeOff: 5 },
  oncology:    { dso: 72, denialRate: 45, ccr: 70, cer: 87, writeOff: 6 },
  radiology:   { dso: 55, denialRate: 35, ccr: 75, cer: 90, writeOff: 5 },
  urology:     { dso: 57, denialRate: 32, ccr: 76, cer: 90, writeOff: 5 },
  pediatrics:  { dso: 47, denialRate: 21, ccr: 82, cer: 93, writeOff: 3 },
  pharmacy:    { dso: 46, denialRate: 20, ccr: 83, cer: 94, writeOff: 3 },
  dental:      { dso: 51, denialRate: 26, ccr: 79, cer: 92, writeOff: 4 },
  workerscomp: { dso: 78, denialRate: 48, ccr: 68, cer: 85, writeOff: 7 },
  emergency:   { dso: 44, denialRate: 18, ccr: 84, cer: 92, writeOff: 5 },
  other:       { dso: 52, denialRate: 28, ccr: 78, cer: 92, writeOff: 4 },
};

// Industry denial root-cause mix (% of denied claims).
export const DENIAL_MIX: { reason: string; pct: number }[] = [
  { reason: 'Missing / invalid prior authorization', pct: 24 },
  { reason: 'Eligibility / coverage issues', pct: 22 },
  { reason: 'Coding errors / medical necessity', pct: 20 },
  { reason: 'Coordination of benefits (COB)', pct: 14 },
  { reason: 'Timely filing', pct: 10 },
  { reason: 'Credentialing / provider enrollment', pct: 10 },
];

/* ---------------------------------------------------------------- */
/*  Decoding + delimited parsing                                    */
/* ---------------------------------------------------------------- */
export function decodeBuffer(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  // UTF-16 LE BOM
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) {
    return new TextDecoder('utf-16le').decode(bytes.subarray(2));
  }
  // UTF-16 BE BOM
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) {
    return new TextDecoder('utf-16be').decode(bytes.subarray(2));
  }
  // Heuristic: many NUL bytes among first 200 => UTF-16 LE without BOM
  let nul = 0;
  const probe = Math.min(bytes.length, 400);
  for (let i = 0; i < probe; i++) if (bytes[i] === 0) nul++;
  if (nul > probe * 0.2) return new TextDecoder('utf-16le').decode(bytes);
  // UTF-8 BOM
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder('utf-8').decode(bytes.subarray(3));
  }
  return new TextDecoder('utf-8').decode(bytes);
}

function detectDelimiter(headerLine: string): string {
  const counts: Record<string, number> = {
    '\t': (headerLine.match(/\t/g) || []).length,
    ',': (headerLine.match(/,/g) || []).length,
    ';': (headerLine.match(/;/g) || []).length,
    '|': (headerLine.match(/\|/g) || []).length,
  };
  let best = ',', bestN = -1;
  for (const d of Object.keys(counts)) if (counts[d] > bestN) { bestN = counts[d]; best = d; }
  return best;
}

// Minimal CSV/TSV line splitter that respects double-quotes.
function splitLine(line: string, delim: string): string[] {
  const out: string[] = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (q) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else q = false; }
      else cur += ch;
    } else {
      if (ch === '"') q = true;
      else if (ch === delim) { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

export function parseDelimited(text: string): string[][] {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.length > 0);
  if (!lines.length) return [];
  const delim = detectDelimiter(lines[0]);
  return lines.map((l) => splitLine(l, delim));
}

/* ---------------------------------------------------------------- */
/*  Column mapping + aggregation                                    */
/* ---------------------------------------------------------------- */
const norm = (s: string) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

function toNum(v: string): number {
  if (v == null) return 0;
  let s = String(v).trim();
  if (!s) return 0;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/[$,\s]/g, '');
  if (s.endsWith('-')) { neg = true; s = s.slice(0, -1); }
  const n = parseFloat(s);
  if (!isFinite(n)) return 0;
  return neg ? -n : n;
}

interface ColMap {
  payer: number; balance: number; charges: number; agingDays: number;
  b30: number; b60: number; b90: number; b120: number; bOv: number;
  patientResp: number;
}

function mapColumns(header: string[]): ColMap {
  const H = header.map(norm);
  const find = (re: RegExp) => H.findIndex((h) => re.test(h));
  return {
    payer: find(/payer name|insurance|carrier|plan name|payer$/),
    balance: find(/^balance$|outstanding|ar balance|amount due|open balance|total balance/),
    charges: find(/^charges$|billed|total charge|charge amount/),
    agingDays: find(/aging days|days aging|age days|^age$/),
    b30: find(/^current$|0 30|0to30|0 ?- ?30|1 30/),
    b60: find(/31 60|30 60/),
    b90: find(/61 90|60 90/),
    b120: find(/91 120|90 120/),
    bOv: find(/^120$|^120 |over ?120|^121|120 plus|120 over|120 and/),
    patientResp: find(/patient resp|patient balance|self pay|guarantor|patient portion/),
  };
}

export function rowsToAggregates(rows: string[][]): ParsedAggregates {
  const empty: ParsedAggregates = {
    buckets: { b30: 0, b60: 0, b90: 0, b120: 0, bOv: 0 }, totalAR: 0, charges: 0,
    payers: [], patientResp: 0, rowCount: 0, matchedColumns: [], ok: false,
  };
  if (!rows.length) return empty;

  // Find the header row: the first row that maps at least a balance or bucket col.
  let hIdx = 0; let cols = mapColumns(rows[0]);
  for (let i = 0; i < Math.min(rows.length, 8); i++) {
    const c = mapColumns(rows[i]);
    if (c.balance >= 0 || c.bOv >= 0 || c.b30 >= 0) { hIdx = i; cols = c; break; }
  }
  const hasBuckets = cols.b30 >= 0 || cols.b60 >= 0 || cols.b90 >= 0 || cols.b120 >= 0 || cols.bOv >= 0;
  const matched: string[] = [];
  (Object.keys(cols) as (keyof ColMap)[]).forEach((k) => { if (cols[k] >= 0) matched.push(k); });

  const buckets: BucketSet = { b30: 0, b60: 0, b90: 0, b120: 0, bOv: 0 };
  let totalBal = 0, charges = 0, patientResp = 0, rowCount = 0;
  const payerMap = new Map<string, { bal: number; over90: number }>();

  for (let i = hIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 2) continue;
    const bal = cols.balance >= 0 ? toNum(r[cols.balance]) : 0;
    let rowOver90 = 0;
    if (hasBuckets) {
      const v30 = cols.b30 >= 0 ? toNum(r[cols.b30]) : 0;
      const v60 = cols.b60 >= 0 ? toNum(r[cols.b60]) : 0;
      const v90 = cols.b90 >= 0 ? toNum(r[cols.b90]) : 0;
      const v120 = cols.b120 >= 0 ? toNum(r[cols.b120]) : 0;
      const vOv = cols.bOv >= 0 ? toNum(r[cols.bOv]) : 0;
      buckets.b30 += v30; buckets.b60 += v60; buckets.b90 += v90; buckets.b120 += v120; buckets.bOv += vOv;
      rowOver90 = v90 + v120 + vOv;
    } else if (cols.agingDays >= 0) {
      const age = toNum(r[cols.agingDays]);
      if (age <= 30) buckets.b30 += bal; else if (age <= 60) buckets.b60 += bal;
      else if (age <= 90) buckets.b90 += bal; else if (age <= 120) buckets.b120 += bal; else buckets.bOv += bal;
      if (age > 90) rowOver90 = bal;
    }
    totalBal += bal;
    if (cols.charges >= 0) charges += toNum(r[cols.charges]);
    rowCount++;

    const payerName = cols.payer >= 0 ? (r[cols.payer] || '').trim() : '';
    if (payerName) {
      const cur = payerMap.get(payerName) || { bal: 0, over90: 0 };
      cur.bal += bal; cur.over90 += rowOver90; payerMap.set(payerName, cur);
    }
    // patient responsibility
    if (cols.patientResp >= 0) patientResp += toNum(r[cols.patientResp]);
    else if (/self ?pay|patient|guarantor/i.test(payerName)) patientResp += bal;
  }

  const totalAR = hasBuckets ? (buckets.b30 + buckets.b60 + buckets.b90 + buckets.b120 + buckets.bOv) : totalBal;
  const denom = totalAR || 1;
  const payers: PayerAgg[] = Array.from(payerMap.entries())
    .map(([name, v]) => ({ name, balance: v.bal, pct: (v.bal / denom) * 100, over90: v.over90, over90Pct: v.bal ? (v.over90 / v.bal) * 100 : 0 }))
    .filter((p) => p.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 6);

  const ok = rowCount > 0 && (Math.abs(totalAR) > 0);
  return { buckets, totalAR, charges, payers, patientResp, rowCount, matchedColumns: matched, ok };
}

/* ---------------------------------------------------------------- */
/*  Metric computation                                              */
/* ---------------------------------------------------------------- */
export interface ManualOverrides { ccr?: number; cer?: number; denialRate?: number; monthlyCharges?: number; }

const clampPct = (n: number) => Math.max(0, Math.min(100, n));

export function computeMetrics(
  agg: ParsedAggregates,
  specialtyKey: string,
  source: 'upload' | 'manual',
  fileName: string,
  ov: ManualOverrides = {}
): AgingMetrics {
  const bench = SPEC_BENCH[specialtyKey] || SPEC_BENCH.general;
  const b = agg.buckets;
  const total = agg.totalAR || (b.b30 + b.b60 + b.b90 + b.b120 + b.bOv);
  const denom = total || 1;
  const over90 = b.b90 + b.b120 + b.bOv;
  const over90Pct = (over90 / denom) * 100;

  const atRisk = b.b90 * 0.40 + b.b120 * 0.60 + b.bOv * 0.85;
  const recoverable = b.b30 * 0.04 + b.b60 * 0.15 + b.b90 * 0.28 + b.b120 * 0.35 + b.bOv * 0.45;
  const uncollectible = b.b90 * 0.10 + b.b120 * 0.25 + b.bOv * 0.50;
  const healthScore = Math.min(98, Math.max(35, Math.round(((b.b30 + b.b60 * 0.8 + b.b90 * 0.5) / denom) * 100)));
  const dar = Math.round((b.b30 * 15 + b.b60 * 45 + b.b90 * 75 + b.b120 * 105 + b.bOv * 150) / denom) || bench.dso;
  const currentDSO = Math.round(30 + (over90 / denom) * 60);
  const targetDSO = Math.round(30 + ((b.b120 + b.bOv) / denom) * 12);

  const estimated: string[] = [];
  const ccr = ov.ccr != null ? clampPct(ov.ccr) : (estimated.push('ccr'), bench.ccr);
  const denialRate = ov.denialRate != null ? clampPct(ov.denialRate) : (estimated.push('denialRate'), bench.denialRate);
  const cer = ov.cer != null ? clampPct(ov.cer) : (estimated.push('cer'), bench.cer);

  // Denial $: based on annualized charges (file charges, or override monthly*12, or AR proxy).
  const chargeBase = ov.monthlyCharges ? ov.monthlyCharges * 12 : (agg.charges > 0 ? agg.charges : total * 3);
  const deniedValue = (denialRate / 100) * chargeBase;
  const denialReasons: DenialReason[] = DENIAL_MIX.map((d) => ({ reason: d.reason, pct: d.pct, value: deniedValue * (d.pct / 100) }));
  const writeOffPct = bench.writeOff; estimated.push('writeOff');
  const writeOffValue = (writeOffPct / 100) * chargeBase;

  const patientRespValue = agg.patientResp > 0 ? agg.patientResp : (estimated.push('patientResp'), total * 0.10);
  const patientRespPct = (patientRespValue / denom) * 100;
  const payerRespValue = Math.max(0, total - patientRespValue);

  const targets: TargetGap[] = [
    { label: 'Bring 90+ day A/R below 15% of total', current: `${over90Pct.toFixed(0)}%`, target: '15%', impact: Math.max(0, over90 - 0.15 * total) },
    { label: 'Lift Clean Claim Rate to 95%+', current: `${ccr.toFixed(0)}%`, target: '95%', impact: ((95 - ccr) / 100) * (chargeBase / 12) },
    { label: `Cut Days in A/R to ≤ 35`, current: `${dar} days`, target: '35 days', impact: 0 },
    { label: 'Recover the aged 120+ balance', current: `$${Math.round(b.bOv).toLocaleString()}`, target: 'collected', impact: b.bOv * 0.45 },
  ];

  const assignments: Assignment[] = [
    { focus: '120+ day claims (highest write-off risk)', owner: 'Senior A/R Recovery Specialist', due: '30 days' },
    { focus: '91–120 day claims', owner: 'A/R Follow-up Specialist', due: '45 days' },
    { focus: 'Denied / rejected claims (appeals)', owner: 'Denials Analyst', due: 'Ongoing, 14-day SLA' },
    { focus: 'Top payer bottleneck escalation', owner: 'Payer Relations Lead', due: '21 days' },
    { focus: 'Patient-responsibility balances', owner: 'Patient Collections Specialist', due: '30 days' },
  ];

  const solutions: AethSolution[] = [
    { problem: `${over90Pct.toFixed(0)}% of A/R aged past 90 days`, service: 'Aged A/R Recovery & Appeals', how: 'Dedicated specialists work your oldest claims first with structured re-submission and payer appeals before they hit write-off.' },
    { problem: `~${denialRate.toFixed(0)}% denial rate`, service: 'Denial Management & Root-Cause Prevention', how: 'We categorize every denial, appeal recoverable ones, and fix the upstream cause (auth, eligibility, coding) so they stop recurring.' },
    { problem: `Clean claim rate around ${ccr.toFixed(0)}%`, service: 'Front-End Scrubbing & Eligibility Verification', how: 'Pre-submission claim scrubbing and real-time eligibility checks push first-pass acceptance toward 95%+.' },
    { problem: 'Specific payers delaying payment', service: 'Payer-Specific Follow-Up & Contract Escalation', how: 'We track each payer’s behavior and escalate systemic delays, including underpayment recovery against contracted rates.' },
    { problem: 'Revenue leaking to write-offs', service: 'Coding, Credentialing & Charge Capture', how: 'Certified coders and credentialing support close the operational gaps that turn into avoidable write-offs.' },
    { problem: 'Patient balances going uncollected', service: 'Patient Collections & Statements', how: 'Clear statements, digital payment options, and respectful follow-up recover patient-responsibility dollars.' },
  ];

  return {
    source, fileName, rowCount: agg.rowCount,
    buckets: b, totalAR: total, charges: agg.charges,
    dar, ccr, cer, denialRate,
    atRisk, recoverable, uncollectible, healthScore, currentDSO, targetDSO, over90, over90Pct,
    deniedValue, denialReasons, writeOffPct, writeOffValue,
    payers: agg.payers, patientRespValue, patientRespPct, payerRespValue,
    targets, assignments, solutions,
    estimatedFields: estimated,
  };
}
