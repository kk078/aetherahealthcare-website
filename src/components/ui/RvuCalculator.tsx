'use client';

import { useMemo, useState } from 'react';
import { Calculator } from 'lucide-react';

/**
 * Medicare Physician Fee Schedule payment estimate:
 *   Payment = [(wRVU × GPCIw) + (peRVU × GPCIpe) + (mpRVU × GPCImp)] × Conversion Factor
 * The user supplies the RVU components for their CPT/HCPCS code (from the public
 * CMS MPFS Relative Value File), so this tool needs no licensed code tables.
 */

const money = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Num({ label, value, onChange, step = 0.01, hint }: { label: string; value: number; onChange: (n: number) => void; step?: number; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-navy mb-1.5">{label}</span>
      <input type="number" min={0} step={step} value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        className="w-full border border-gray/30 rounded-xl px-3.5 py-2.5 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal" />
      {hint && <span className="block text-xs text-gray mt-1">{hint}</span>}
    </label>
  );
}

export default function RvuCalculator() {
  const [wRVU, setWRVU] = useState(1.6);
  const [peRVU, setPeRVU] = useState(1.2);
  const [mpRVU, setMpRVU] = useState(0.12);
  const [gpciW, setGpciW] = useState(1.0);
  const [gpciPe, setGpciPe] = useState(1.0);
  const [gpciMp, setGpciMp] = useState(1.0);
  const [cf, setCf] = useState(33.40);

  const { totalRVU, payment } = useMemo(() => {
    const totalRVU = wRVU * gpciW + peRVU * gpciPe + mpRVU * gpciMp;
    return { totalRVU, payment: totalRVU * cf };
  }, [wRVU, peRVU, mpRVU, gpciW, gpciPe, gpciMp, cf]);

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-2xl border border-gray/15 p-6 shadow-sm">
        <h2 className="font-jakarta text-lg font-bold text-navy mb-1 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-teal" /> RVU components
        </h2>
        <p className="text-sm text-gray mb-5">Enter the RVU values for your CPT/HCPCS code from the CMS Physician Fee Schedule Relative Value File.</p>

        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Num label="Work RVU" value={wRVU} onChange={setWRVU} />
          <Num label="Practice Expense RVU" value={peRVU} onChange={setPeRVU} hint="Facility or non-facility" />
          <Num label="Malpractice RVU" value={mpRVU} onChange={setMpRVU} />
        </div>

        <p className="text-xs font-bold tracking-widest text-gray uppercase mb-3">Locality adjustment (GPCI)</p>
        <div className="grid sm:grid-cols-3 gap-4 mb-6">
          <Num label="Work GPCI" value={gpciW} onChange={setGpciW} step={0.001} hint="1.000 = national" />
          <Num label="PE GPCI" value={gpciPe} onChange={setGpciPe} step={0.001} />
          <Num label="MP GPCI" value={gpciMp} onChange={setGpciMp} step={0.001} />
        </div>

        <Num label="Medicare conversion factor ($)" value={cf} onChange={setCf} step={0.0001}
          hint="Default is the CY2026 non-QP factor ($33.40; QP is $33.57). Update to the current CMS conversion factor for the year you’re estimating." />
      </div>

      <div className="lg:sticky lg:top-24 h-fit bg-navy rounded-2xl p-6 text-white shadow-sm">
        <p className="text-xs font-bold tracking-[0.14em] text-cream/70 uppercase mb-2">Adjusted total RVU</p>
        <p className="font-jakarta text-2xl font-extrabold mb-5">{totalRVU.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="text-xs font-bold tracking-[0.14em] text-cream/70 uppercase mb-2">Estimated Medicare allowed</p>
        <p className="font-jakarta text-5xl font-extrabold leading-none text-mint">{money(payment)}</p>
        <div className="mt-5 pt-5 border-t border-white/15 text-xs text-cream/70 leading-relaxed">
          Payment = [(wRVU×GPCIw) + (peRVU×GPCIpe) + (mpRVU×GPCImp)] × CF. Non-facility PE RVUs give the office rate;
          facility PE RVUs give the hospital rate. Estimation only — verify against the current CMS fee schedule.
        </div>
      </div>
    </div>
  );
}
