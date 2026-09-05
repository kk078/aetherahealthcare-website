'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  Lock,
  ArrowRight,
  Phone,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { PRIMARY_EXPERT_EMAIL, sendLeadToKiran } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

export default function FreePilotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Form fields
  const [contactName, setContactName] = useState('');
  const [practiceName, setPracticeName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialty, setSpecialty] = useState('Cardiology');
  const [providerCount, setProviderCount] = useState('1–2 Solo / Partner');
  const [ehrSystem, setEhrSystem] = useState('Epic');
  const [claimVolume, setClaimVolume] = useState('500–1,500 claims/mo');
  const [bottleneck, setBottleneck] = useState('');
  const [hp, setHp] = useState(''); // anti-spam honeypot

  useEffect(() => {
    const handleOpen = () => {
      setStatus('idle');
      setIsOpen(true);
    };

    window.addEventListener('open-free-pilot-modal', handleOpen);
    return () => window.removeEventListener('open-free-pilot-modal', handleOpen);
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (hp) {
      // Bot detected
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const ok = await sendLeadToKiran('free_50_claim_pilot_application', {
        contactName,
        practiceName,
        email,
        phone,
        specialty,
        providerCount,
        ehrSystem,
        claimVolume,
        bottleneck: bottleneck || 'Not specified',
        source: 'Free Pilot Modal (Global Navbar / Homepage CTA)',
        timestamp: new Date().toISOString(),
      });

      if (ok) {
        setStatus('success');
        trackConversion('pilot');
      } else {
        setStatus('error');
        setErrorMessage('Unable to submit your pilot request right now. Please call us directly at +1 (813) 519-4640.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('A network error occurred. Please call Kiran directly at +1 (813) 519-4640.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pilot-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      onClick={e => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray/20 dark:border-slate-800 overflow-hidden my-8 transition-all">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-navy via-[#0c234b] to-teal p-6 sm:p-8 text-white relative">
          <button
            type="button"
            onClick={closeModal}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-mint"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint/20 text-mint text-xs font-bold uppercase tracking-wider mb-3 border border-mint/30">
            <Sparkles className="h-3.5 w-3.5" /> Zero Obligation · No Setup Fees · 14-Day Trial
          </div>
          <h2 id="pilot-modal-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Claim Your Free 50-Claim Pilot
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
            Test Aethera’s certified AAPC coding, automated clearinghouse scrubbing, and denial overturns on your next 50 claims — with contractual performance targets in writing before you commit.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 max-h-[calc(85vh-160px)] overflow-y-auto">
          {status === 'success' ? (
            <div className="text-center py-8 space-y-5 animate-fade-in">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-navy dark:text-white">
                  50-Claim Pilot Slot Reserved!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-navy dark:text-white">{contactName}</strong>. Kiran and our senior onboarding team have received your request for{' '}
                  <strong className="text-navy dark:text-white">{practiceName || 'your practice'}</strong>.
                </p>
              </div>

              {/* What happens next box */}
              <div className="bg-cream/60 dark:bg-slate-800/60 rounded-2xl p-5 text-left border border-gray/20 dark:border-slate-700 max-w-md mx-auto space-y-3 text-xs">
                <p className="font-bold text-navy dark:text-white uppercase tracking-wider text-[11px]">
                  What happens next within 2 business hours:
                </p>
                <div className="space-y-2 text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal dark:text-mint">1.</span>
                    <span>We countersign a standard mutual NDA and HIPAA Business Associate Agreement (BAA).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal dark:text-mint">2.</span>
                    <span>We securely connect to your clearinghouse or ingest your initial 50-claim test batch.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-teal dark:text-mint">3.</span>
                    <span>You receive a full audit report showing recovered cash lift and clean claim submissions.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 dark:text-slate-400">
                Need immediate coordination? Contact Kiran directly at{' '}
                <a
                  href={`mailto:${PRIMARY_EXPERT_EMAIL}?subject=Urgent:%20Free%2050-Claim%20Pilot%20Intake`}
                  className="font-bold text-teal dark:text-mint underline underline-offset-2"
                >
                  info@aetherahealthcare.com
                </a>{' '}
                or call{' '}
                <a href="tel:+18135194640" className="font-bold text-navy dark:text-white underline">
                  +1 (813) 519-4640
                </a>.
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="inline-flex items-center justify-center px-8 py-3 rounded-xl bg-navy dark:bg-teal text-white font-bold text-sm shadow-md hover:bg-teal dark:hover:bg-teal/80 transition-all"
              >
                Close Window
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Honeypot field for bot protection */}
              <input
                type="text"
                name="website_hp"
                value={hp}
                onChange={e => setHp(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {status === 'error' && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-800 dark:text-red-300 text-xs">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                  <p>{errorMessage}</p>
                </div>
              )}

              {/* Row 1: Contact Name & Practice Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Jane Smith / Practice Admin"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Practice / Clinic Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Specialty Clinic"
                    value={practiceName}
                    onChange={e => setPracticeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@practice.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                  />
                </div>
              </div>

              {/* Row 3: Specialty & Practice Size */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Clinical Specialty
                  </label>
                  <select
                    value={specialty}
                    onChange={e => setSpecialty(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Family Medicine">Family Medicine</option>
                    <option value="Orthopedics">Orthopedic Surgery &amp; Spine</option>
                    <option value="Neurology">Neurology &amp; Sleep Medicine</option>
                    <option value="Pain Management">Pain Management</option>
                    <option value="OB/GYN">OB/GYN &amp; Women&apos;s Health</option>
                    <option value="Medical Oncology">Oncology &amp; Hematology</option>
                    <option value="Dermatology">Dermatology &amp; Mohs</option>
                    <option value="Psychiatry">Psychiatry &amp; Behavioral</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Dental">Dental &amp; Oral Surgery</option>
                    <option value="Other Specialty">Other Specialty</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Number of Clinicians
                  </label>
                  <select
                    value={providerCount}
                    onChange={e => setProviderCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="1 Solo Physician">1 Solo Physician</option>
                    <option value="2–5 Providers">2–5 Providers</option>
                    <option value="6–15 Providers">6–15 Providers</option>
                    <option value="16+ Enterprise Group">16+ Multi-Specialty Group</option>
                  </select>
                </div>
              </div>

              {/* Row 4: EHR System & Monthly Claim Volume */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Current EHR / Billing Software
                  </label>
                  <select
                    value={ehrSystem}
                    onChange={e => setEhrSystem(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="Epic">Epic</option>
                    <option value="eClinicalWorks">eClinicalWorks (eCW)</option>
                    <option value="AthenaHealth">AthenaHealth</option>
                    <option value="NextGen">NextGen</option>
                    <option value="Kareo / Tebra">Kareo / Tebra</option>
                    <option value="AdvancedMD">AdvancedMD</option>
                    <option value="ModMed">Modernizing Medicine (ModMed)</option>
                    <option value="WebPT">WebPT</option>
                    <option value="Cerner / Oracle Health">Cerner / Oracle Health</option>
                    <option value="Other EHR">Other EHR System</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Claims Volume
                  </label>
                  <select
                    value={claimVolume}
                    onChange={e => setClaimVolume(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal"
                  >
                    <option value="Under 500 claims/mo">Under 500 claims / mo</option>
                    <option value="500–1,500 claims/mo">500–1,500 claims / mo</option>
                    <option value="1,500–5,000 claims/mo">1,500–5,000 claims / mo</option>
                    <option value="5,000+ claims/mo">5,000+ claims / mo</option>
                  </select>
                </div>
              </div>

              {/* Optional Bottleneck / Note */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Revenue Bottleneck <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Dealing with high commercial denials, A/R over 45 days, or losing staff..."
                  value={bottleneck}
                  onChange={e => setBottleneck(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-gray/30 dark:border-slate-700 bg-white dark:bg-slate-800 text-navy dark:text-white focus:outline-none focus:ring-2 focus:ring-teal resize-none"
                />
              </div>

              {/* Security & Compliance Badges */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-teal" />
                  <span>HIPAA BAA &amp; Mutual NDA Provided</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Zero Credit Card Required</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileCheck2 className="h-3.5 w-3.5 text-navy dark:text-mint" />
                  <span>Contractual SLAs in Writing</span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-teal hover:bg-navy dark:bg-mint dark:hover:bg-teal text-white dark:text-navy font-extrabold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reserving Pilot Slot...
                  </>
                ) : (
                  <>
                    Activate 50-Claim Free Pilot <ArrowRight className="h-4 w-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
