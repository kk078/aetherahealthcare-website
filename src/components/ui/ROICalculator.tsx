'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { TrendingUp, DollarSign, Calculator, ArrowRight } from 'lucide-react';

const specialtyDefaults: Record<string, { avgClaim: number; volume: number; denialRate: number; cleanRate: number }> = {
  'Family Medicine': { avgClaim: 165, volume: 420, denialRate: 11, cleanRate: 84 },
  'Cardiology': { avgClaim: 380, volume: 310, denialRate: 14, cleanRate: 81 },
  'Orthopedic Surgery': { avgClaim: 620, volume: 220, denialRate: 13, cleanRate: 82 },
  'Dermatology': { avgClaim: 290, volume: 480, denialRate: 12, cleanRate: 85 },
  'Psychiatry / Behavioral Health': { avgClaim: 180, volume: 350, denialRate: 10, cleanRate: 86 },
  'Internal Medicine': { avgClaim: 195, volume: 390, denialRate: 11, cleanRate: 85 },
  'Gastroenterology': { avgClaim: 510, volume: 260, denialRate: 13, cleanRate: 83 },
  'Neurology': { avgClaim: 310, volume: 290, denialRate: 12, cleanRate: 84 },
  'Urology': { avgClaim: 420, volume: 280, denialRate: 12, cleanRate: 84 },
  'Other': { avgClaim: 280, volume: 350, denialRate: 12, cleanRate: 84 },
};

function fmt(n: number) {
  const rounded = Math.round(n);
  const str = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return '$' + str;
}

function fmtNum(n: number) {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function ROICalculator() {
  const [specialty, setSpecialty] = useState('Family Medicine');
  const [volume, setVolume] = useState(420);
  const [avgClaim, setAvgClaim] = useState(165);
  const [denialRate, setDenialRate] = useState(11);
  const [cleanRate, setCleanRate] = useState(84);

  function handleSpecialtyChange(s: string) {
    setSpecialty(s);
    const d = specialtyDefaults[s] || specialtyDefaults['Other'];
    setVolume(d.volume);
    setAvgClaim(d.avgClaim);
    setDenialRate(d.denialRate);
    setCleanRate(d.cleanRate);
  }

  const results = useMemo(() => {
    const currentMonthly = volume * avgClaim * (1 - denialRate / 100) * (cleanRate / 100);
    const projectedMonthly = volume * avgClaim * 0.96 * 0.975;
    const monthlyGain = Math.max(0, projectedMonthly - currentMonthly);
    const annualGain = monthlyGain * 12;
    const aetheraFee = projectedMonthly * 0.06;
    const netAnnualGain = annualGain - aetheraFee * 12;
    const roi = aetheraFee > 0 ? ((netAnnualGain / (aetheraFee * 12)) * 100) : 0;
    return { currentMonthly, projectedMonthly, monthlyGain, annualGain, aetheraFee, netAnnualGain, roi };
  }, [volume, avgClaim, denialRate, cleanRate]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      {/* Inputs */}
      <div className="bg-cream rounded-2xl p-8 border border-gray/10">
        <div className="flex items-center mb-6">
          <Calculator className="h-6 w-6 text-teal mr-3" />
          <h3 className="text-xl font-bold text-navy">Your Practice Details</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-navy mb-2">Medical Specialty</label>
            <select
              aria-label="Medical Specialty"
              value={specialty}
              onChange={e => handleSpecialtyChange(e.target.value)}
              className="w-full border border-gray/30 rounded-lg px-4 py-3 text-navy bg-white focus:outline-none focus:ring-2 focus:ring-teal"
            >
              {Object.keys(specialtyDefaults).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Monthly Claim Volume: <span className="text-teal">{fmtNum(volume)} claims</span>
            </label>
            <input
              type="range" min={50} max={2000} step={10} aria-label="Monthly Claim Volume" value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              className="w-full accent-teal"
            />
            <div className="flex justify-between text-xs text-gray mt-1"><span>50</span><span>2,000</span></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Average Claim Value: <span className="text-teal">${avgClaim}</span>
            </label>
            <input
              type="range" min={50} max={2000} step={5} aria-label="Average Claim Value" value={avgClaim}
              onChange={e => setAvgClaim(Number(e.target.value))}
              className="w-full accent-teal"
            />
            <div className="flex justify-between text-xs text-gray mt-1"><span>$50</span><span>$2,000</span></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Current Denial Rate: <span className="text-red-500">{denialRate}%</span>
            </label>
            <input
              type="range" min={0} max={30} step={1} aria-label="Current Denial Rate" value={denialRate}
              onChange={e => setDenialRate(Number(e.target.value))}
              className="w-full accent-teal"
            />
            <div className="flex justify-between text-xs text-gray mt-1"><span>0%</span><span>30%</span></div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-navy mb-2">
              Current Clean Claim Rate: <span className="text-teal">{cleanRate}%</span>
            </label>
            <input
              type="range" min={50} max={100} step={1} aria-label="Current Clean Claim Rate" value={cleanRate}
              onChange={e => setCleanRate(Number(e.target.value))}
              className="w-full accent-teal"
            />
            <div className="flex justify-between text-xs text-gray mt-1"><span>50%</span><span>100%</span></div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-navy rounded-2xl p-8 text-white">
        <div className="flex items-center mb-6">
          <TrendingUp className="h-6 w-6 text-mint mr-3" />
          <h3 className="text-xl font-bold">Your Revenue Projection</h3>
        </div>

        <div className="space-y-5">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-gray">Current Monthly Revenue</p>
              <p className="text-2xl font-bold text-white">{fmt(results.currentMonthly)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray">With Aethera</p>
              <p className="text-2xl font-bold text-mint">{fmt(results.projectedMonthly)}</p>
            </div>
          </div>

          <div className="bg-white/10 rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray">Monthly Revenue Gain</span>
              <span className="font-bold text-mint">+{fmt(results.monthlyGain)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray">Annual Revenue Gain</span>
              <span className="font-bold text-mint">+{fmt(results.annualGain)}</span>
            </div>
            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-sm text-gray">Est. Aethera Fee (6%/mo)</span>
              <span className="font-bold text-white">−{fmt(results.aetheraFee)}/mo</span>
            </div>
          </div>

          <div className="bg-mint/20 border border-mint/40 rounded-xl p-5">
            <p className="text-sm text-mint mb-1">Net Annual Gain After Fees</p>
            <p className="text-4xl font-bold text-mint">{fmt(results.netAnnualGain)}</p>
            <p className="text-sm text-gray mt-1">Estimated ROI: <span className="text-white font-semibold">{Math.round(results.roi)}%</span></p>
          </div>

          <p className="text-xs text-gray/60 leading-relaxed">
            Projections based on Aethera's target benchmarks: 96% net collection rate, 97.5% clean claim rate. Actual results vary by practice.
          </p>

          {results.netAnnualGain > 0 && (
            <Link prefetch={false}
              href="/free-assessment"
              className="flex items-center justify-center w-full bg-mint hover:bg-white text-navy font-bold py-3 px-6 rounded-full transition-colors duration-300 mt-2"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Claim Your Free Assessment
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
