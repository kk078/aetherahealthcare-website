'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  Printer,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Download,
  Building2,
} from 'lucide-react';
import { PRIMARY_EXPERT_EMAIL } from '@/lib/worker';

interface ItemizedService {
  id: string;
  serviceType: string;
  cptCode: string;
  description: string;
  provider: string;
  estimatedFee: number;
}

interface GfePreset {
  name: string;
  serviceDescription: string;
  primaryDiagnosis: string;
  items: Omit<ItemizedService, 'id'>[];
}

const PRESETS: Record<string, GfePreset> = {
  colonoscopy: {
    name: 'Diagnostic Colonoscopy Workup',
    serviceDescription: 'Diagnostic Colonoscopy with biopsy of polyps',
    primaryDiagnosis: 'K63.5 - Polyp of colon',
    items: [
      {
        serviceType: 'Primary Procedure',
        cptCode: '45380',
        description: 'Colonoscopy, flexible, with biopsy, single or multiple',
        provider: 'Primary Gastroenterologist',
        estimatedFee: 650,
      },
      {
        serviceType: 'Facility Fee',
        cptCode: '0490',
        description: 'Ambulatory Surgical Center (ASC) facility fee',
        provider: 'Metropolitan Endoscopy Pavilion',
        estimatedFee: 1100,
      },
      {
        serviceType: 'Anesthesia',
        cptCode: '00812',
        description: 'Anesthesia for lower intestinal endoscopic procedures',
        provider: 'Associated Anesthesia Care LLC',
        estimatedFee: 480,
      },
      {
        serviceType: 'Pathology / Lab',
        cptCode: '88305',
        description: 'Surgical pathology, gross and microscopic examination',
        provider: 'Apex Reference Pathology Labs',
        estimatedFee: 220,
      },
    ],
  },
  knee_arthroscopy: {
    name: 'Outpatient Knee Arthroscopy',
    serviceDescription: 'Arthroscopic meniscectomy of medial compartment',
    primaryDiagnosis: 'M23.22 - Derangement of meniscus due to old tear, right knee',
    items: [
      {
        serviceType: 'Primary Procedure',
        cptCode: '29881',
        description: 'Arthroscopy, knee, surgical; with meniscectomy (medial or lateral)',
        provider: 'Attending Orthopedic Surgeon',
        estimatedFee: 1850,
      },
      {
        serviceType: 'Facility Fee',
        cptCode: '0360',
        description: 'Outpatient Surgical Operating Room & Recovery Suite',
        provider: 'SurgiCenter Ortho Institute',
        estimatedFee: 2400,
      },
      {
        serviceType: 'Anesthesia',
        cptCode: '00140',
        description: 'Anesthesia for procedures on knee joint and popliteal space',
        provider: 'Regional Anesthesia Group',
        estimatedFee: 750,
      },
      {
        serviceType: 'Medical Device / DME',
        cptCode: 'L1832',
        description: 'Knee orthosis, adjustable ROM joint with condylar pads',
        provider: 'ActiveMotion DME Solutions',
        estimatedFee: 320,
      },
    ],
  },
  cardiac_workup: {
    name: 'Comprehensive Cardiology Workup',
    serviceDescription: 'New patient complex cardiac evaluation with multimodality imaging',
    primaryDiagnosis: 'I20.9 - Angina pectoris, unspecified',
    items: [
      {
        serviceType: 'E&M Clinical Evaluation',
        cptCode: '99205',
        description: 'Office or other outpatient visit for evaluation and management, high complexity',
        provider: 'Consulting Cardiologist',
        estimatedFee: 380,
      },
      {
        serviceType: 'Diagnostic Imaging',
        cptCode: '93306',
        description: 'Echocardiography, transthoracic, real-time with spectral and color Doppler',
        provider: 'Cardiovascular Diagnostic Center',
        estimatedFee: 540,
      },
      {
        serviceType: 'Cardiovascular Function',
        cptCode: '93015',
        description: 'Cardiovascular stress test using maximal or submaximal treadmill',
        provider: 'Cardiovascular Diagnostic Center',
        estimatedFee: 290,
      },
      {
        serviceType: 'Diagnostic ECG',
        cptCode: '93000',
        description: 'Electrocardiogram, routine ECG with at least 12 leads; with interpretation',
        provider: 'Consulting Cardiologist',
        estimatedFee: 75,
      },
    ],
  },
};

export default function GoodFaithEstimateGenerator() {
  const [patientName, setPatientName] = useState('Jane Doe');
  const [patientDob, setPatientDob] = useState('1982-04-15');
  const [serviceDescription, setServiceDescription] = useState(PRESETS.colonoscopy.serviceDescription);
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState(PRESETS.colonoscopy.primaryDiagnosis);
  const [dateOfService, setDateOfService] = useState('2026-09-22');
  const [practiceName, setPracticeName] = useState('Aethera Medical Practice Network');
  const [practiceNpi, setPracticeNpi] = useState('1942857193');
  const [practicePhone, setPracticePhone] = useState('(813) 519-4640');
  const [items, setItems] = useState<ItemizedService[]>(
    PRESETS.colonoscopy.items.map((item, idx) => ({ ...item, id: `item-${idx + 1}` }))
  );

  const totalEstimate = items.reduce((acc, curr) => acc + (Number(curr.estimatedFee) || 0), 0);

  const applyPreset = (key: string) => {
    const p = PRESETS[key];
    if (!p) return;
    setServiceDescription(p.serviceDescription);
    setPrimaryDiagnosis(p.primaryDiagnosis);
    setItems(p.items.map((item, idx) => ({ ...item, id: `item-${Date.now()}-${idx}` })));
  };

  const addItem = () => {
    const newItem: ItemizedService = {
      id: `item-${Date.now()}`,
      serviceType: 'Secondary Service',
      cptCode: '99214',
      description: 'Follow-up or ancillary evaluation',
      provider: practiceName,
      estimatedFee: 150,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ItemizedService, value: string | number) => {
    setItems(
      items.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Controls (Hidden on Print) */}
      <div className="bg-white rounded-2xl p-6 border border-gray/20 shadow-sm print:hidden space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray/10 pb-4">
          <div>
            <div className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4" />
              <span>CMS No Surprises Act (45 CFR § 149.610) Compliance</span>
            </div>
            <h2 className="text-xl font-bold text-navy mt-1">Configure Good Faith Estimate (GFE)</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">1-Click Presets:</span>
            <button
              type="button"
              onClick={() => applyPreset('colonoscopy')}
              className="px-2.5 py-1.5 rounded-lg bg-cream text-navy hover:bg-teal hover:text-white transition-colors text-xs font-semibold border border-gray/20"
            >
              Colonoscopy
            </button>
            <button
              type="button"
              onClick={() => applyPreset('knee_arthroscopy')}
              className="px-2.5 py-1.5 rounded-lg bg-cream text-navy hover:bg-teal hover:text-white transition-colors text-xs font-semibold border border-gray/20"
            >
              Knee Arthroscopy
            </button>
            <button
              type="button"
              onClick={() => applyPreset('cardiac_workup')}
              className="px-2.5 py-1.5 rounded-lg bg-cream text-navy hover:bg-teal hover:text-white transition-colors text-xs font-semibold border border-gray/20"
            >
              Cardiology Workup
            </button>
          </div>
        </div>

        {/* Patient & Provider Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Patient Full Name</label>
            <input
              type="text"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray/25 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Patient Date of Birth</label>
            <input
              type="date"
              value={patientDob}
              onChange={e => setPatientDob(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray/25 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Scheduled Date of Service</label>
            <input
              type="date"
              value={dateOfService}
              onChange={e => setDateOfService(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray/25 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Primary ICD-10 Code</label>
            <input
              type="text"
              value={primaryDiagnosis}
              onChange={e => setPrimaryDiagnosis(e.target.value)}
              placeholder="e.g. K63.5 - Polyp of colon"
              className="w-full px-3 py-2 text-sm border border-gray/25 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Billing Entity / Practice Name</label>
            <input
              type="text"
              value={practiceName}
              onChange={e => setPracticeName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray/25 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Billing Provider NPI</label>
            <input
              type="text"
              value={practiceNpi}
              onChange={e => setPracticeNpi(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray/25 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
            <input
              type="text"
              value={practicePhone}
              onChange={e => setPracticePhone(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray/25 rounded-xl text-navy focus:outline-none focus:ring-2 focus:ring-teal"
            />
          </div>
        </div>

        {/* Itemized Services Table Editor */}
        <div className="space-y-3 pt-4 border-t border-gray/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy">Itemized Expected Services &amp; Co-Provider Charges</h3>
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1 text-xs font-bold text-teal hover:text-navy transition-colors bg-teal/10 px-2.5 py-1.5 rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" /> Add Service Line
            </button>
          </div>

          <div className="space-y-2.5">
            {items.map(item => (
              <div
                key={item.id}
                className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-cream/40 rounded-xl border border-gray/15 items-center text-xs"
              >
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={item.serviceType}
                    onChange={e => updateItem(item.id, 'serviceType', e.target.value)}
                    placeholder="Service Type"
                    className="w-full px-2 py-1.5 bg-white border border-gray/20 rounded-lg text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={item.cptCode}
                    onChange={e => updateItem(item.id, 'cptCode', e.target.value)}
                    placeholder="CPT / HCPCS"
                    className="w-full px-2 py-1.5 bg-white border border-gray/20 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Clinical Description"
                    className="w-full px-2 py-1.5 bg-white border border-gray/20 rounded-lg text-slate-800"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={item.provider}
                    onChange={e => updateItem(item.id, 'provider', e.target.value)}
                    placeholder="Provider / Entity"
                    className="w-full px-2 py-1.5 bg-white border border-gray/20 rounded-lg text-slate-800"
                  />
                </div>
                <div className="sm:col-span-1">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                    <input
                      type="number"
                      value={item.estimatedFee}
                      onChange={e => updateItem(item.id, 'estimatedFee', parseFloat(e.target.value) || 0)}
                      placeholder="Fee"
                      className="w-full pl-5 pr-2 py-1.5 bg-white border border-gray/20 rounded-lg text-slate-800 font-bold text-right"
                    />
                  </div>
                </div>
                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length <= 1}
                    className="text-slate-400 hover:text-red-500 disabled:opacity-30 p-1.5 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray/10">
          <div className="text-sm font-semibold text-slate-600">
            Total Good Faith Estimate:{' '}
            <strong className="text-xl font-bold text-navy ml-1">${totalEstimate.toLocaleString()}</strong>
          </div>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy hover:bg-teal text-white font-bold text-sm transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print / Export Formal GFE
          </button>
        </div>
      </div>

      {/* FORMAL PRINTABLE GOOD FAITH ESTIMATE DOCUMENT */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 border border-gray/20 shadow-md print:shadow-none print:border-none print:p-0 space-y-6 font-sans text-slate-800">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b-2 border-navy pb-6">
          <div>
            <div className="inline-block px-3 py-1 bg-navy text-white text-[11px] font-bold uppercase tracking-wider rounded mb-2 print:border print:border-navy">
              CMS Statutory Form
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight">GOOD FAITH ESTIMATE</h1>
            <p className="text-xs text-slate-500 mt-1">
              For Healthcare Items &amp; Services — Established under 45 CFR § 149.610
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1 text-xs">
            <p className="font-bold text-slate-900 text-sm">{practiceName}</p>
            <p className="text-slate-600">Billing NPI: {practiceNpi}</p>
            <p className="text-slate-600">Direct Contact: {practicePhone}</p>
            <p className="text-slate-600">Date Generated: {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}</p>
          </div>
        </div>

        {/* Patient Identification Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl bg-cream/50 border border-gray/20 text-xs">
          <div>
            <span className="text-slate-500 font-semibold block">Patient Name</span>
            <span className="font-bold text-navy text-sm">{patientName}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Patient Date of Birth</span>
            <span className="font-semibold text-slate-800">{patientDob}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Anticipated Service Date</span>
            <span className="font-semibold text-slate-800">{dateOfService}</span>
          </div>
          <div>
            <span className="text-slate-500 font-semibold block">Primary Diagnosis (ICD-10)</span>
            <span className="font-semibold text-slate-800 font-mono">{primaryDiagnosis}</span>
          </div>
        </div>

        {/* Service Scope Summary */}
        <div className="text-xs space-y-1">
          <span className="text-slate-500 font-semibold uppercase tracking-wider block">Primary Reason for Treatment / Scope:</span>
          <p className="text-sm font-medium text-slate-900">{serviceDescription}</p>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-navy text-white">
                <th className="py-2.5 px-3 font-semibold rounded-l">Service Role</th>
                <th className="py-2.5 px-3 font-semibold">CPT / HCPCS</th>
                <th className="py-2.5 px-3 font-semibold">Description of Items &amp; Services</th>
                <th className="py-2.5 px-3 font-semibold">Service Provider / Facility</th>
                <th className="py-2.5 px-3 font-semibold text-right rounded-r">Expected Charge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray/15">
              {items.map((item, idx) => (
                <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream/20'}>
                  <td className="py-3 px-3 font-semibold text-navy">{item.serviceType}</td>
                  <td className="py-3 px-3 font-mono text-teal font-bold">{item.cptCode}</td>
                  <td className="py-3 px-3 text-slate-700">{item.description}</td>
                  <td className="py-3 px-3 text-slate-600">{item.provider}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900">${Number(item.estimatedFee).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-navy font-bold text-sm bg-cream/40">
                <td colSpan={4} className="py-3 px-3 text-navy">
                  Total Estimated Out-of-Pocket / Self-Pay Cost:
                </td>
                <td className="py-3 px-3 text-right text-navy text-base font-extrabold">
                  ${totalEstimate.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Statutory Disclaimers & Federal Dispute Resolution Rights */}
        <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-xs space-y-2 text-slate-700">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>MANDATORY STATUTORY NOTICE UNDER THE NO SURPRISES ACT</span>
          </div>
          <p className="leading-relaxed">
            This Good Faith Estimate shows the costs of items and services that are reasonably expected for your healthcare
            needs for an item or service. The estimate is based on information known at the time the estimate was created.
          </p>
          <p className="leading-relaxed">
            The Good Faith Estimate does not include any unknown or unexpected costs that may arise during treatment. You
            could be charged more if complications or special circumstances occur. If this happens, federal law allows you to
            dispute (appeal) the bill.
          </p>
          <div className="pt-2 border-t border-amber-200 space-y-1 text-[11px] text-slate-600">
            <p>
              <strong>Your Right to Dispute:</strong> If you are billed for <strong>$400 or more</strong> than this Good
              Faith Estimate from any single provider, you have the right to dispute the bill through the federal
              Patient-Provider Dispute Resolution (PPDR) process.
            </p>
            <p>
              You must start the dispute process within <strong>120 calendar days</strong> of the date on the original bill.
              There is a small administrative fee to use the dispute process. If the Selected Dispute Resolution (SDR) entity
              agrees with you, you will only have to pay the amount on this Good Faith Estimate.
            </p>
            <p>
              For questions or more information about your right to a Good Faith Estimate, visit{' '}
              <a
                href="https://www.cms.gov/nosurprises"
                target="_blank"
                rel="noreferrer"
                className="text-teal font-semibold underline"
              >
                www.cms.gov/nosurprises
              </a>{' '}
              or call the No Surprises Help Desk at <strong>1-800-985-3059</strong>.
            </p>
          </div>
        </div>

        {/* Provider Sign-off Block */}
        <div className="grid grid-cols-2 gap-8 pt-6 border-t border-gray/20 text-xs">
          <div>
            <div className="h-10 border-b border-slate-400" />
            <p className="mt-1 font-semibold text-slate-600">Authorized Provider / Clinic Billing Officer Signature</p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-400" />
            <p className="mt-1 font-semibold text-slate-600">Patient / Responsible Party Acknowledgment Signature</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-[10px] text-slate-400 text-center pt-4 border-t border-gray/10">
          Generated via Aethera Healthcare Solutions Compliance Suite · Strictly adheres to 45 CFR § 149.610 · Direct inquiries to {PRIMARY_EXPERT_EMAIL}
        </div>
      </div>

      {/* Practice Onboarding CTA Banner (Hidden on Print) */}
      <div className="rounded-2xl bg-gradient-to-r from-navy via-navy to-teal p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 print:hidden">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-bold">Automate No Surprises Act &amp; Front-End Billing for Your Practice</h3>
          <p className="text-white/80 text-xs sm:text-sm max-w-xl">
            Aethera provides integrated front-end eligibility verification, automated Good Faith Estimates, and transparent self-pay workflows that eliminate patient billing complaints and maintain 100% federal audit compliance.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
          <Link
            href="/free-assessment"
            className="px-5 py-2.5 rounded-xl bg-teal hover:bg-white hover:text-navy text-white font-bold text-xs transition-colors shadow-sm text-center"
          >
            Get Free Practice Audit
          </Link>
          <a
            href={`mailto:${PRIMARY_EXPERT_EMAIL}?subject=No%20Surprises%20Act%20Audit%20Consultation`}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors text-center border border-white/20"
          >
            Email Kiran Directly
          </a>
        </div>
      </div>
    </div>
  );
}
