'use client';

import { useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { CheckCircle, AlertCircle, Loader2, Calendar, MessageSquare } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';
import { trackConversion } from '@/lib/gtag';

const specialties = [
  'Primary Care', 'Cardiology', 'Dermatology', 'Endocrinology',
  'Gastroenterology', 'Neurology', 'Orthopedics', 'Pediatrics',
  'Psychiatry', 'Surgery', 'Urology', 'Other',
];

const timeSlots = [
  'Monday 9AM–12PM', 'Monday 1PM–5PM',
  'Tuesday 9AM–12PM', 'Tuesday 1PM–5PM',
  'Wednesday 9AM–12PM', 'Wednesday 1PM–5PM',
  'Thursday 9AM–12PM', 'Thursday 1PM–5PM',
  'Friday 9AM–12PM', 'Friday 1PM–5PM',
];

type Tab = 'message' | 'schedule';
type Status = 'idle' | 'submitting' | 'success' | 'error';

export default function ContactForm() {
  const [activeTab, setActiveTab] = useState<Tab>('message');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const messageForm = useForm();
  const scheduleForm = useForm();

  const onMessageSubmit = async (data: FieldValues) => {
    // Honeypot: silently succeed if bot filled the hidden field
    if (data.hp_field) { setStatus('success'); messageForm.reset(); return; }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const ok = await submitToWorker('contact_message', {
        ...data,
        subject: `New Contact Inquiry – ${data.name || 'Visitor'} (${data.specialty || 'General'})`,
      });
      if (!ok) {
        throw new Error('Unable to send message right now. Please call us directly at (813) 519-4640.');
      }
      trackConversion('contact');
      setStatus('success');
      messageForm.reset();
    } catch (e: unknown) {
      setStatus('error');
      const err = e instanceof Error ? e.message : 'Something went wrong. Please try again or refresh the page.';
      setErrorMsg(err);
    }
  };

  const onScheduleSubmit = async (data: FieldValues) => {
    // Honeypot: silently succeed if bot filled the hidden field
    if (data.hp_field) { setStatus('success'); scheduleForm.reset(); return; }
    setStatus('submitting');
    setErrorMsg('');
    try {
      const ok = await submitToWorker('consultation_request', {
        ...data,
        subject: `Consultation Request – ${data.practiceContact || 'Visitor'} (${data.practiceSpecialty || 'General'})`,
      });
      if (!ok) {
        throw new Error('Unable to book consultation right now. Please call us directly at (813) 519-4640.');
      }
      trackConversion('contact');
      setStatus('success');
      scheduleForm.reset();
    } catch (e: unknown) {
      setStatus('error');
      const err = e instanceof Error ? e.message : 'Something went wrong. Please try again or refresh the page.';
      setErrorMsg(err);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full px-4 py-3 rounded-xl border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-teal/30 dark:focus:ring-mint/30 bg-white dark:bg-[#071322] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm sm:text-base font-normal ${
      hasError
        ? 'border-red-500 dark:border-red-400 ring-1 ring-red-500/20'
        : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 focus:border-teal dark:focus:border-mint'
    }`;

  const labelClass = 'block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5';

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-teal dark:text-mint mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-navy dark:text-white mb-3">
          {activeTab === 'message' ? 'Message Sent!' : 'Consultation Request Received!'}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto leading-relaxed text-sm sm:text-base">
          {activeTab === 'message'
            ? 'Thank you for reaching out. Our team will reply to the email you provided within 1 business day.'
            : "We'll reach out within 1 business day to confirm your consultation time. Check your email for a confirmation."}
        </p>
        <button
          onClick={() => { setStatus('idle'); setActiveTab('message'); }}
          className="bg-mint hover:bg-teal text-navy font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex rounded-xl border border-slate-200 dark:border-slate-700/80 p-1 mb-8 bg-slate-100/90 dark:bg-[#061220] transition-colors">
        <button
          type="button"
          onClick={() => { setActiveTab('message'); setStatus('idle'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'message'
              ? 'bg-white dark:bg-[#0c2445] text-navy dark:text-mint shadow-sm border border-slate-200/60 dark:border-mint/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Send a Message
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('schedule'); setStatus('idle'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
            activeTab === 'schedule'
              ? 'bg-white dark:bg-[#0c2445] text-navy dark:text-mint shadow-sm border border-slate-200/60 dark:border-mint/30'
              : 'text-slate-600 dark:text-slate-400 hover:text-navy dark:hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" /> Schedule Consultation
        </button>
      </div>

      {/* SEND MESSAGE FORM */}
      {activeTab === 'message' && (
        <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="space-y-5">
          {/* Honeypot — hidden from humans, filled by bots */}
          <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
            <input type="text" aria-hidden="true" aria-label="Leave empty" tabIndex={-1} autoComplete="off" {...messageForm.register('hp_field')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Full Name *</label>
              <input
                aria-label="Full Name"
                {...messageForm.register('name', { required: 'Name is required' })}
                className={inputClass(!!messageForm.formState.errors.name)}
                placeholder="Dr. Jane Smith"
              />
              {messageForm.formState.errors.name && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{messageForm.formState.errors.name.message as string}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Practice / Organization *</label>
              <input
                aria-label="Practice or Organization"
                {...messageForm.register('practice', { required: 'Practice is required' })}
                className={inputClass(!!messageForm.formState.errors.practice)}
                placeholder="Smith Medical Associates"
              />
              {messageForm.formState.errors.practice && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{messageForm.formState.errors.practice.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                type="email"
                aria-label="Email Address"
                {...messageForm.register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
                className={inputClass(!!messageForm.formState.errors.email)}
                placeholder="dr.smith@example.com"
              />
              {messageForm.formState.errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{messageForm.formState.errors.email.message as string}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input
                type="tel"
                aria-label="Phone Number"
                {...messageForm.register('phone', { required: 'Phone is required' })}
                className={inputClass(!!messageForm.formState.errors.phone)}
                placeholder="(555) 123-4567"
              />
              {messageForm.formState.errors.phone && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{messageForm.formState.errors.phone.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Medical Specialty *</label>
            <select
              aria-label="Medical Specialty"
              {...messageForm.register('specialty', { required: 'Specialty is required' })}
              className={inputClass(!!messageForm.formState.errors.specialty)}
            >
              <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select your specialty</option>
              {specialties.map(s => (
                <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                  {s}
                </option>
              ))}
            </select>
            {messageForm.formState.errors.specialty && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{messageForm.formState.errors.specialty.message as string}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Message *</label>
            <textarea
              rows={5}
              aria-label="Message"
              {...messageForm.register('message', { required: 'Message is required' })}
              className={inputClass(!!messageForm.formState.errors.message)}
              placeholder="Tell us about your practice and how we can help..."
            />
            {messageForm.formState.errors.message && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{messageForm.formState.errors.message.message as string}</p>
            )}
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-700 dark:text-red-200 text-sm">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-mint hover:bg-emerald-400 disabled:opacity-60 text-navy font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            {status === 'submitting' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
            ) : 'Send Message'}
          </button>
        </form>
      )}

      {/* SCHEDULE CONSULTATION FORM */}
      {activeTab === 'schedule' && (
        <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-5">
          {/* Honeypot — hidden from humans, filled by bots */}
          <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
            <input type="text" aria-hidden="true" aria-label="Leave empty" tabIndex={-1} autoComplete="off" {...scheduleForm.register('hp_field')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Your Name *</label>
              <input
                aria-label="Contact Name"
                {...scheduleForm.register('practiceContact', { required: 'Name is required' })}
                className={inputClass(!!scheduleForm.formState.errors.practiceContact)}
                placeholder="Dr. Jane Smith"
              />
              {scheduleForm.formState.errors.practiceContact && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{scheduleForm.formState.errors.practiceContact.message as string}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Practice Name *</label>
              <input
                aria-label="Practice Name"
                {...scheduleForm.register('practiceName', { required: 'Practice is required' })}
                className={inputClass(!!scheduleForm.formState.errors.practiceName)}
                placeholder="Smith Medical Associates"
              />
              {scheduleForm.formState.errors.practiceName && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{scheduleForm.formState.errors.practiceName.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Email Address *</label>
              <input
                type="email"
                aria-label="Email Address"
                {...scheduleForm.register('scheduleEmail', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
                className={inputClass(!!scheduleForm.formState.errors.scheduleEmail)}
                placeholder="dr.smith@example.com"
              />
              {scheduleForm.formState.errors.scheduleEmail && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{scheduleForm.formState.errors.scheduleEmail.message as string}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input
                type="tel"
                aria-label="Phone Number"
                {...scheduleForm.register('schedulePhone', { required: 'Phone is required' })}
                className={inputClass(!!scheduleForm.formState.errors.schedulePhone)}
                placeholder="(555) 123-4567"
              />
              {scheduleForm.formState.errors.schedulePhone && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{scheduleForm.formState.errors.schedulePhone.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Medical Specialty *</label>
              <select
                aria-label="Medical Specialty"
                {...scheduleForm.register('practiceSpecialty', { required: 'Specialty is required' })}
                className={inputClass(!!scheduleForm.formState.errors.practiceSpecialty)}
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select specialty</option>
                {specialties.map(s => (
                  <option key={s} value={s} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {s}
                  </option>
                ))}
              </select>
              {scheduleForm.formState.errors.practiceSpecialty && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{scheduleForm.formState.errors.practiceSpecialty.message as string}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Preferred Time Slot *</label>
              <select
                aria-label="Preferred Time"
                {...scheduleForm.register('preferredTime', { required: 'Please select a time' })}
                className={inputClass(!!scheduleForm.formState.errors.preferredTime)}
              >
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select a time</option>
                {timeSlots.map(t => (
                  <option key={t} value={t} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {t}
                  </option>
                ))}
              </select>
              {scheduleForm.formState.errors.preferredTime && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1.5 font-medium">{scheduleForm.formState.errors.preferredTime.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>What would you like to discuss? (optional)</label>
            <textarea
              rows={3}
              aria-label="Consultation Notes"
              {...scheduleForm.register('consultationNotes')}
              className={inputClass(false)}
              placeholder="e.g. Denial rates, AR backlog, transitioning from in-house billing…"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 rounded-xl p-4">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-700 dark:text-red-200 text-sm">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-mint hover:bg-emerald-400 disabled:opacity-60 text-navy font-bold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
          >
            {status === 'submitting' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Booking…</>
            ) : 'Book 30-Minute Consultation'}
          </button>
        </form>
      )}
    </div>
  );
}
