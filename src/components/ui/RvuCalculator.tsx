'use client';

import { useMemo, useState } from 'react';
import { Calculator, Printer, Sparkles, MapPin, TrendingUp, Info } from 'lucide-react';

/**
 * Medicare Physician Fee Schedule payment estimate:
 *   Payment = [(wRVU × GPCIw) + (peRVU × GPCIpe) + (mpRVU × GPCImp)] × Conversion Factor
 * Enhanced with 1-click CPT presets, Geographic GPCI presets, and Commercial Fee Benchmarks.
 */

const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

interface CptPreset {
  code: string;
  name: string;
  category: string;
  wRVU: number;
  peRVU: number;
  mpRVU: number;
}

const CPT_PRESETS: CptPreset[] = [
  { code: '99213', name: 'Office Visit, Est. (Low MDM)', category: 'E/M Primary Care', wRVU: 1.30, peRVU: 1.10, mpRVU: 0.10 },
  { code: '99214', name: 'Office Visit, Est. (Mod MDM)', category: 'E/M Primary Care', wRVU: 1.92, peRVU: 1.54, mpRVU: 0.14 },
  { code: '99215', name: 'Office Visit, Est. (High MDM)', category: 'E/M Primary Care', wRVU: 2.80, peRVU: 2.18, mpRVU: 0.20 },
  { code: '99203', name: 'Office Visit, New (Low MDM)', category: 'E/M New Patient', wRVU: 1.60, peRVU: 1.62, mpRVU: 0.13 },
  { code: '99204', name: 'Office Visit, New (Mod MDM)', category: 'E/M New Patient', wRVU: 2.60, peRVU: 2.45, mpRVU: 0.20 },
  { code: '93000', name: '12-Lead Electrocardiogram', category: 'Cardiology', wRVU: 0.17, peRVU: 0.38, mpRVU: 0.03 },
  { code: '20610', name: 'Arthrocentesis Major Joint', category: 'Orthopedics', wRVU: 0.79, peRVU: 1.48, mpRVU: 0.07 },
  { code: '11102', name: 'Tangential Skin Biopsy Single', category: 'Dermatology', wRVU: 0.65, peRVU: 1.82, mpRVU: 0.06 },
  { code: '90834', name: 'Psychotherapy, 45 Min', category: 'Psychiatry', wRVU: 1.54, peRVU: 1.25, mpRVU: 0.11 },
  { code: '45378', name: 'Diagnostic Colonoscopy', category: 'Gastroenterology', wRVU: 3.69, peRVU: 3.85, mpRVU: 0.34 },
  { code: '66984', name: 'Cataract Surgery w/ IOL', category: 'Ophthalmology', wRVU: 8.56, peRVU: 6.84, mpRVU: 0.75 },
  { code: '97110', name: 'Therapeutic Exercise (15 min)', category: 'Physical Therapy', wRVU: 0.45, peRVU: 0.48, mpRVU: 0.03 },
];

interface GpciPreset {
  name: string;
  state: string;
  w: number;
  pe: number;
  mp: number;
}

const GPCI_PRESETS: GpciPreset[] = [
  { name: 'National Baseline (1.0)', state: 'US Average', w: 1.000, pe: 1.000, mp: 1.000 },
  { name: 'Manhattan, NY', state: 'New York', w: 1.078, pe: 1.284, mp: 1.642 },
  { name: 'Los Angeles, CA', state: 'California', w: 1.053, pe: 1.189, mp: 0.812 },
  { name: 'Miami, FL', state: 'Florida', w: 1.000, pe: 1.042, mp: 1.745 },
  { name: 'Houston, TX', state: 'Texas', w: 1.008, pe: 1.012, mp: 0.941 },
  { name: 'Chicago, IL', state: 'Illinois', w: 1.028, pe: 1.082, mp: 1.285 },
];

function Num({ label, value, onChange, step = 0.01, hint }: { label: string; value: number; onChange: (n: number) => void; step?: number; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-navy mb-1.5">{label}</span>
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full border border-gray/30 rounded-xl px-3.5 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal font-mono text-sm"
      />
      {hint && <span className="block text-xs text-gray mt-1">{hint}</span>}
    </label>
  );
}

export default function RvuCalculator() {
  const [selectedPreset, setSelectedPreset] = useState<string>('99214');
  const [selectedLocality, setSelectedLocality] = useState<string>('National Baseline (1.0)');

  const [wRVU, setWRVU] = useState(1.92);
  const [peRVU, setPeRVU] = useState(1.54);
  const [mpRVU, setMpRVU] = useState(0.14);
  const [gpciW, setGpciW] = useState(1.0);
  const [gpciPe, setGpciPe] = useState(1.0);
  const [gpciMp, setGpciMp] = useState(1.0);
  const [cf, setCf] = useState(33.40);

  const applyCptPreset = (preset: CptPreset) => {
    setSelectedPreset(preset.code);
    setWRVU(preset.wRVU);
    setPeRVU(preset.peRVU);
    setMpRVU(preset.mpRVU);
  };

  const applyLocalityPreset = (loc: GpciPreset) => {
    setSelectedLocality(loc.name);
    setGpciW(loc.w);
    setGpciPe(loc.pe);
    setGpciMp(loc.mp);
  };

  const { totalRVU, payment, comm125, comm140, comm160 } = useMemo(() => {
    const totalRVU = wRVU * gpciW + peRVU * gpciPe + mpRVU * gpciMp;
    const payment = totalRVU * cf;
    return {
      totalRVU,
      payment,
      comm125: payment * 1.25,
      comm140: payment * 1.40,
      comm160: payment * 1.60,
    };
  }, [wRVU, peRVU, mpRVU, gpciW, gpciPe, gpciMp, cf]);

  return (
    <div className="space-y-6">
      {/* 1-Click CPT Presets Toolbar */}
      <div className="bg-white rounded-2xl border border-gray/15 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-teal" />
            <h3 className="font-jakarta text-sm font-bold text-navy uppercase tracking-wider">
              Quick CPT Presets (CMS Relative Value File)
            </h3>
          </div>
          <span className="text-xs text-gray font-mono">Select to auto-populate components</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CPT_PRESETS.map((p) => (
            <button
              key={p.code}
              type="button"
              onClick={() => applyCptPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                selectedPreset === p.code
                  ? 'bg-teal text-white shadow-sm ring-2 ring-teal/30'
                  : 'bg-cream text-navy hover:bg-teal/10 border border-gray/10'
              }`}
            >
              <span className="font-mono font-bold">{p.code}</span>
              <span className="text-gray/80 hidden sm:inline">({p.name.split(' ')[0]})</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive inputs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray/15 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-jakarta text-lg font-bold text-navy flex items-center gap-2">
              <Calculator className="h-5 w-5 text-teal" /> RVU Components & Geographic Adjustments
            </h2>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray hover:text-navy px-2.5 py-1.5 rounded-lg border border-gray/20 hover:border-navy transition-colors print:hidden"
            >
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </button>
          </div>

          {/* Locality GPCI Selector */}
          <div className="p-4 bg-teal/5 border border-teal/15 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-teal" />
              <span className="text-xs font-bold text-navy uppercase tracking-wider">
                Geographic Practice Cost Index (GPCI) Presets
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {GPCI_PRESETS.map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => applyLocalityPreset(loc)}
                  className={`text-left p-2 rounded-lg text-xs transition-all border ${
                    selectedLocality === loc.name
                      ? 'bg-white border-teal shadow-xs font-bold text-navy'
                      : 'bg-white/60 border-transparent hover:bg-white text-gray'
                  }`}
                >
                  <p className="font-medium text-navy">{loc.name}</p>
                  <p className="text-[10px] text-gray font-mono">w:{loc.w.toFixed(2)} pe:{loc.pe.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <Num label="Work RVU (wRVU)" value={wRVU} onChange={setWRVU} hint="Physician clinical work" />
            <Num label="Practice Expense (peRVU)" value={peRVU} onChange={setPeRVU} hint="Facility or non-facility" />
            <Num label="Malpractice (mpRVU)" value={mpRVU} onChange={setMpRVU} hint="Professional liability" />
          </div>

          <div className="pt-2 border-t border-gray/10">
            <p className="text-xs font-bold tracking-widest text-gray uppercase mb-3">Custom Locality GPCI Overrides</p>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              <Num label="Work GPCI (w)" value={gpciW} onChange={setGpciW} step={0.001} hint="1.000 = national avg" />
              <Num label="PE GPCI (pe)" value={gpciPe} onChange={setGpciPe} step={0.001} hint="Rent & staff index" />
              <Num label="MP GPCI (mp)" value={gpciMp} onChange={setGpciMp} step={0.001} hint="Malpractice index" />
            </div>
          </div>

          <div className="pt-2 border-t border-gray/10">
            <Num
              label="Medicare Conversion Factor ($)"
              value={cf}
              onChange={setCf}
              step={0.0001}
              hint="Default is the CY2026 CMS Conversion Factor ($33.40). Update as needed for statutory budget adjustments."
            />
          </div>
        </div>

        {/* Right Col: Output Card & Commercial Multipliers */}
        <div className="space-y-4">
          <div className="bg-navy rounded-2xl p-6 text-white shadow-md">
            <p className="text-xs font-bold tracking-[0.14em] text-cream/70 uppercase mb-1">Adjusted Total RVU</p>
            <p className="font-jakarta text-2xl font-extrabold mb-5 font-mono">
              {totalRVU.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>

            <p className="text-xs font-bold tracking-[0.14em] text-cream/70 uppercase mb-1">Estimated Medicare Allowed</p>
            <p className="font-jakarta text-4xl sm:text-5xl font-extrabold leading-none text-mint mb-4">
              {money(payment)}
            </p>

            <div className="pt-4 border-t border-white/15 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs text-cream/90 font-semibold mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-mint" /> Commercial Payer Benchmarks
              </div>
              <div className="flex justify-between items-center text-xs py-1 px-2.5 rounded-lg bg-white/10">
                <span className="text-cream/80">Conservative PPO (125%):</span>
                <span className="font-mono font-bold text-white">{money(comm125)}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 px-2.5 rounded-lg bg-white/10">
                <span className="text-cream/80">Standard In-Network (140%):</span>
                <span className="font-mono font-bold text-mint">{money(comm140)}</span>
              </div>
              <div className="flex justify-between items-center text-xs py-1 px-2.5 rounded-lg bg-white/10">
                <span className="text-cream/80">Top-Tier / OON (160%):</span>
                <span className="font-mono font-bold text-white">{money(comm160)}</span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-white/10 text-[11px] text-cream/60 leading-relaxed flex items-start gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>
                Formula: [(wRVU×GPCIw) + (peRVU×GPCIpe) + (mpRVU×GPCImp)] × CF. Non-facility PE RVUs reflect in-office rates.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
