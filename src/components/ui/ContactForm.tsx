'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { CheckCircle, AlertCircle, Loader2, Calendar, MessageSquare } from 'lucide-react';
import { submitToWorker } from '@/lib/worker';

const WEB3FORMS_KEY = 'b1e9389e-b14d-4e6a-84eb-e4708fcb39f4';

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

  async function submitToWeb3Forms(data: Record<string, unknown>, subject: string) {
    const payload = {
      access_key: WEB3FORMS_KEY,
      subject,
      from_name: (data.name as string) || (data.practiceContact as string) || 'Website Visitor',
      botcheck: '',
      ...data,
    };
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!result.success) throw new Error(result.message || 'Submission failed');
  }

  const onMessageSubmit = async (data: any) => {
    // Honeypot: silently succeed if bot filled the hidden field
    if (data.hp_field) { setStatus('success'); messageForm.reset(); return; }
    setStatus('submitting');
    setErrorMsg('');
    try {
      await submitToWeb3Forms(data, `New Contact Inquiry – ${data.name} (${data.specialty})`);
      submitToWorker('contact_message', data);
      setStatus('success');
      messageForm.reset();
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'Something went wrong. Please try again or call us directly.');
    }
  };

  const onScheduleSubmit = async (data: any) => {
    // Honeypot: silently succeed if bot filled the hidden field
    if (data.hp_field) { setStatus('success'); scheduleForm.reset(); return; }
    setStatus('submitting');
    setErrorMsg('');
    try {
      await submitToWeb3Forms(data, `Consultation Request – ${data.practiceContact} (${data.practiceSpecialty})`);
      submitToWorker('consultation_request', data);
      setStatus('success');
      scheduleForm.reset();
    } catch (e: any) {
      setStatus('error');
      setErrorMsg(e.message || 'Something went wrong. Please try again or call us directly.');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-16 w-16 text-teal mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-navy mb-3">
          {activeTab === 'message' ? 'Message Sent!' : 'Consultation Request Received!'}
        </h3>
        <p className="text-gray mb-6 max-w-md mx-auto">
          {activeTab === 'message'
            ? 'Thank you for reaching out. Our team will respond to support@aetherahealthcare.com within 1 business day.'
            : "We'll reach out within 1 business day to confirm your consultation time. Check your email for a confirmation."}
        </p>
        <button
          onClick={() => { setStatus('idle'); setActiveTab('message'); }}
          className="bg-mint hover:bg-teal text-navy font-bold py-2 px-6 rounded-full transition-colors"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex rounded-xl border border-gray/20 p-1 mb-8 bg-cream/50">
        <button
          type="button"
          onClick={() => { setActiveTab('message'); setStatus('idle'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'message' ? 'bg-navy text-white shadow' : 'text-gray hover:text-navy'
          }`}
        >
          <MessageSquare className="h-4 w-4" /> Send a Message
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('schedule'); setStatus('idle'); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all ${
            activeTab === 'schedule' ? 'bg-navy text-white shadow' : 'text-gray hover:text-navy'
          }`}
        >
          <Calendar className="h-4 w-4" /> Schedule Consultation
        </button>
      </div>

      {/* SEND MESSAGE FORM */}
      {activeTab === 'message' && (
        <form onSubmit={messageForm.handleSubmit(onMessageSubmit)} className="space-y-6">
          {/* Honeypot — hidden from humans, filled by bots */}
          <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
            <input type="text" aria-hidden="true" aria-label="Leave empty" tabIndex={-1} autoComplete="off" {...messageForm.register('hp_field')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray mb-2">Full Name *</label>
              <input
                aria-label="Full Name" {...messageForm.register('name', { required: 'Name is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${messageForm.formState.errors.name ? 'border-red-500' : 'border-gray/20'}`}
                placeholder="Dr. Jane Smith"
              />
              {messageForm.formState.errors.name && <p className="text-red-500 text-sm mt-1">{messageForm.formState.errors.name.message as string}</p>}
            </div>
            <div>
              <label className="block text-gray mb-2">Practice / Organization *</label>
              <input
                aria-label="Practice or Organization" {...messageForm.register('practice', { required: 'Practice is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${messageForm.formState.errors.practice ? 'border-red-500' : 'border-gray/20'}`}
                placeholder="Smith Medical Associates"
              />
              {messageForm.formState.errors.practice && <p className="text-red-500 text-sm mt-1">{messageForm.formState.errors.practice.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray mb-2">Email Address *</label>
              <input
                type="email"
                aria-label="Email Address" {...messageForm.register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${messageForm.formState.errors.email ? 'border-red-500' : 'border-gray/20'}`}
                placeholder="dr.smith@example.com"
              />
              {messageForm.formState.errors.email && <p className="text-red-500 text-sm mt-1">{messageForm.formState.errors.email.message as string}</p>}
            </div>
            <div>
              <label className="block text-gray mb-2">Phone Number *</label>
              <input
                type="tel"
                aria-label="Phone Number" {...messageForm.register('phone', { required: 'Phone is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${messageForm.formState.errors.phone ? 'border-red-500' : 'border-gray/20'}`}
                placeholder="(555) 123-4567"
              />
              {messageForm.formState.errors.phone && <p className="text-red-500 text-sm mt-1">{messageForm.formState.errors.phone.message as string}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray mb-2">Medical Specialty *</label>
            <select
              aria-label="Medical Specialty" {...messageForm.register('specialty', { required: 'Specialty is required' })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${messageForm.formState.errors.specialty ? 'border-red-500' : 'border-gray/20'}`}
            >
              <option value="">Select your specialty</option>
              {specialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {messageForm.formState.errors.specialty && <p className="text-red-500 text-sm mt-1">{messageForm.formState.errors.specialty.message as string}</p>}
          </div>

          <div>
            <label className="block text-gray mb-2">Message *</label>
            <textarea
              rows={5}
              aria-label="Message" {...messageForm.register('message', { required: 'Message is required' })}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${messageForm.formState.errors.message ? 'border-red-500' : 'border-gray/20'}`}
              placeholder="Tell us about your practice and how we can help..."
            />
            {messageForm.formState.errors.message && <p className="text-red-500 text-sm mt-1">{messageForm.formState.errors.message.message as string}</p>}
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-mint hover:bg-teal disabled:opacity-60 text-navy font-bold py-3 px-6 rounded-full transition-colors duration-300 flex items-center justify-center gap-2"
          >
            {status === 'submitting' ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
            ) : 'Send Message'}
          </button>
        </form>
      )}

      {/* SCHEDULE CONSULTATION FORM */}
      {activeTab === 'schedule' && (
        <form onSubmit={scheduleForm.handleSubmit(onScheduleSubmit)} className="space-y-6">
          {/* Honeypot — hidden from humans, filled by bots */}
          <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
            <input type="text" aria-hidden="true" aria-label="Leave empty" tabIndex={-1} autoComplete="off" {...scheduleForm.register('hp_field')} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray mb-2">Your Name *</label>
              <input
                aria-label="Contact Name" {...scheduleForm.register('practiceContact', { required: 'Name is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${scheduleForm.formState.errors.practiceContact ? 'border-red-500' : 'border-gray/20'}`}
                placeholder="Dr. Jane Smith"
              />
              {scheduleForm.formState.errors.practiceContact && <p className="text-red-500 text-sm mt-1">{scheduleForm.formState.errors.practiceContact.message as string}</p>}
            </div>
            <div>
              <label className="block text-gray mb-2">Practice Name *</label>
              <input
                aria-label="Practice Name" {...scheduleForm.register('practiceName', { required: 'Practice is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${scheduleForm.formState.errors.practiceName ? 'border-red-500' : 'border-gray/20'}`}
                placeholder="Smith Medical Associates"
              />
              {scheduleForm.formState.errors.practiceName && <p className="text-red-500 text-sm mt-1">{scheduleForm.formState.errors.practiceName.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray mb-2">Email Address *</label>
              <input
                type="email"
                aria-label="Email Address" {...scheduleForm.register('scheduleEmail', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
                })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${scheduleForm.formState.errors.scheduleEmail ? 'border-red-500' : 'border-gray/20'}`}
                placeholder="dr.smith@example.com"
              />
              {scheduleForm.formState.errors.scheduleEmail && <p className="text-red-500 text-sm mt-1">{scheduleForm.formState.errors.scheduleEmail.message as string}</p>}
            </div>
            <div>
              <label className="block text-gray mb-2">Phone Number *</label>
              <input
                type="tel"
                aria-label="Phone Number" {...scheduleForm.register('schedulePhone', { required: 'Phone is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${scheduleForm.formState.errors.schedulePhone ? 'border-red-500' : 'border-gray/20'}`}
                placeholder="(555) 123-4567"
              />
              {scheduleForm.formState.errors.schedulePhone && <p className="text-red-500 text-sm mt-1">{scheduleForm.formState.errors.schedulePhone.message as string}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray mb-2">Medical Specialty *</label>
              <select
                aria-label="Medical Specialty" {...scheduleForm.register('practiceSpecialty', { required: 'Specialty is required' })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${scheduleForm.formState.errors.practiceSpecialty ? 'border-red-500' : 'border-gray/20'}`}
              >
                <option value="">Select specialty</option>
                {specialties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {scheduleForm.formState.errors.practiceSpecialty && <p className="text-red-500 text-sm mt-1">{scheduleForm.formState.errors.practiceSpecialty.message as string}</p>}
            </div>
            <div>
              <label className="block text-gray mb-2">Preferred Time Slot *</label>
              <select
                aria-label="Preferred Time" {...scheduleForm.register('preferredTime', { required: 'Please select a time' })}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${scheduleForm.formState.errors.preferredTime ? 'border-red-500' : 'border-gray/20'}`}
              >
                <option value="">Select a time</option>
                {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              {scheduleForm.formState.errors.preferredTime && <p className="text-red-500 text-sm mt-1">{scheduleForm.formState.errors.preferredTime.message as string}</p>}
            </div>
          </div>

          <div>
            <label className="block text-gray mb-2">What would you like to discuss? (optional)</label>
            <textarea
              rows={3}
              aria-label="Consultation Notes" {...scheduleForm.register('consultationNotes')}
              className="w-full px-4 py-3 border border-gray/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal"
              placeholder="e.g. Denial rates, AR backlog, transitioning from in-house billing…"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 text-sm">{errorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-mint hover:bg-teal disabled:opacity-60 text-navy font-bold py-3 px-6 rounded-full transition-colors duration-300 flex items-center justify-center gap-2"
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
