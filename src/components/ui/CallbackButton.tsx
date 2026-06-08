'use client';

import { useState } from 'react';
import { Phone, Mail, X, MessageSquare, Loader2, CheckCircle } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';

export default function CallbackButton() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', bestTime: '', specialty: '', hp_field: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleRequestCallback = async () => {
    if (!formData.name || !formData.phone) return;
    // Honeypot: silently succeed if bot filled hidden field
    if (formData.hp_field) { setStatus('success'); return; }
    setStatus('submitting');
    try {
      await submitToWorker('callback_request', formData);
      setStatus('success');
      setFormData({ name: '', phone: '', bestTime: '', specialty: '', hp_field: '' });
      setTimeout(() => { setOpen(false); setStatus('idle'); }, 3500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-80 overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-navy to-teal p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-bold text-sm">Talk to a Billing Expert</p>
              <p className="text-white/70 text-xs mt-0.5">Free consultation · No commitment</p>
            </div>
            <button
              onClick={() => { setOpen(false); setStatus('idle'); }}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {status === 'success' ? (
            <div className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-teal mx-auto mb-3" />
              <p className="font-bold text-navy text-base">We&apos;ll call you back shortly!</p>
              <p className="text-sm text-slate-500 mt-1">Expect a call within 2 business hours.</p>
            </div>
          ) : (
            <div className="p-4">
              {/* Quick contact */}
              <div className="flex gap-2 mb-4">
                <a
                  href="tel:+18636940325"
                  className="flex-1 flex items-center justify-center gap-2 bg-teal hover:bg-navy text-white font-semibold py-2.5 px-3 rounded-xl transition-colors text-sm"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
                <a
                  href="mailto:support@aetherahealthcare.com"
                  className="flex-1 flex items-center justify-center gap-2 border-2 border-teal text-teal hover:bg-teal hover:text-white font-semibold py-2.5 px-3 rounded-xl transition-colors text-sm"
                >
                  <Mail className="h-4 w-4" />
                  Email Us
                </a>
              </div>
              <p className="text-center text-xs text-slate-400 mb-1">(863) 694-0325 · support@aetherahealthcare.com</p>
              <div className="flex items-center gap-2 my-3">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400">or request a callback</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              {/* Form */}
              <div className="space-y-3">
                {/* Honeypot — hidden from humans, filled by bots */}
                <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
                  <input type="text" aria-hidden="true" aria-label="Leave empty" tabIndex={-1} autoComplete="off" value={formData.hp_field} onChange={e => setFormData({ ...formData, hp_field: e.target.value })} />
                </div>
                <input
                  type="text"
                  placeholder="Your name *"
                  aria-label="Your name" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone number *"
                  aria-label="Phone number" value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal transition-colors"
                />
                <select
                  aria-label="Your specialty" value={formData.specialty}
                  onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal text-slate-500 transition-colors"
                >
                  <option value="">Your specialty (optional)</option>
                  <option>Hospitalist / Hospital Medicine</option>
                  <option>Internal Medicine</option>
                  <option>Family Medicine</option>
                  <option>Cardiology</option>
                  <option>Orthopedics</option>
                  <option>Psychiatry / Behavioral Health</option>
                  <option>Emergency Medicine</option>
                  <option>Other</option>
                </select>
                <select
                  value={formData.bestTime}
                  onChange={e => setFormData({ ...formData, bestTime: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-teal text-slate text-slate-500 transition-colors"
                >
                  <option value="">Best time to call (optional)</option>
                  <option>Morning (9AM – 12PM ET)</option>
                  <option>Afternoon (12PM – 5PM ET)</option>
                  <option>Evening (5PM – 8PM ET)</option>
                </select>
                {status === 'error' && (
                  <p className="text-red-500 text-xs">Something went wrong — please call us directly at (863) 694-0325.</p>
                )}
                <button
                  onClick={handleRequestCallback}
                  disabled={status === 'submitting' || !formData.name || !formData.phone}
                  className="w-full bg-navy hover:bg-teal disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {status === 'submitting' ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    'Request Callback'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 ${open ? 'bg-navy' : 'bg-teal hover:bg-navy'} text-white font-bold py-3 px-5 rounded-full shadow-xl transition-all duration-300 group`}
        aria-label="Talk to a billing expert"
      >
        {open ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
        )}
        <span className="text-sm">{open ? 'Close' : 'Talk to an Expert'}</span>
      </button>
    </div>
  );
}
