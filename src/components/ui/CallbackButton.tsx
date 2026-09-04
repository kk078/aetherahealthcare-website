'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Phone,
  Mail,
  X,
  MessageSquare,
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { submitToWorker, sendLeadToKiran, PRIMARY_EXPERT_EMAIL } from '@/lib/worker';
import { askGeminiAgent, type AssistantMessage, type AgentAction } from '@/lib/gemini';

const INITIAL_GREETING =
  "Hi! I'm Aethera's AI Revenue Cycle & Practice Specialist. Ask me anything about payer timely filing limits, denial codes (CO-45, PR-204, CO-16), specialty medical billing, or our 3.5%–5.0% performance pricing. You can also connect directly with Kiran for a practice audit.";

const SUGGESTIONS = [
  'How to overturn CO-45 & PR-204?',
  'What is UHC & Medicare timely filing?',
  "What are Aethera's fees & SLAs?",
  'Connect with Kiran for practice audit',
];

type TabMode = 'chat' | 'callback';

let msgCounter = 0;
function makeMsg(role: 'user' | 'assistant', content: string, actions?: AgentAction[]): AssistantMessage {
  msgCounter += 1;
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return {
    id: `msg-${msgCounter}`,
    role,
    content,
    actions,
    timestamp: `${h}:${m}`,
  };
}

export default function CallbackButton() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabMode>('chat');

  // AI Chat state
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [
    {
      id: 'msg-init',
      role: 'assistant',
      content: INITIAL_GREETING,
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Callback form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialty: '',
    bestTime: '',
    notes: '',
    hp_field: '',
  });
  const [callbackStatus, setCallbackStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  // Auto-scroll chat on updates
  useEffect(() => {
    if (activeTab === 'chat' && chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, activeTab, open]);

  // Handle sending message to Gemini Agent
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || isThinking) return;

    const userMsg = makeMsg('user', query);
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsThinking(true);

    try {
      const historyForApi = newHistory
        .filter(m => m.content !== INITIAL_GREETING)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await askGeminiAgent(query, historyForApi);
      const botMsg = makeMsg('assistant', response.text, response.actions);
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        makeMsg(
          'assistant',
          "I encountered a temporary connection issue. You can reach our senior billing desk directly at (813) 519-4640 or request a callback with Kiran.",
          [
            {
              type: 'escalate_kiran',
              title: 'Connect with Kiran Directly',
              data: { email: PRIMARY_EXPERT_EMAIL, phone: '(813) 519-4640' },
            },
          ]
        ),
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  // Switch to callback tab with pre-filled context
  const handleEscalateToCallback = (contextNote?: string) => {
    setActiveTab('callback');
    if (contextNote) {
      setFormData(prev => ({
        ...prev,
        notes: prev.notes ? `${prev.notes}\n${contextNote}` : contextNote,
      }));
    } else if (messages.length > 1 && !formData.notes) {
      const recentUserQueries = messages
        .filter(m => m.role === 'user')
        .map(m => m.content)
        .slice(-2)
        .join('; ');
      if (recentUserQueries) {
        setFormData(prev => ({
          ...prev,
          notes: `Visitor inquired about: ${recentUserQueries}`,
        }));
      }
    }
  };

  // Callback form submission
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim());
  const canSubmit = Boolean(formData.name.trim() && formData.phone.trim() && emailValid);

  const handleRequestCallback = async () => {
    if (!canSubmit) return;
    // Honeypot check
    if (formData.hp_field) {
      setCallbackStatus('success');
      return;
    }

    setCallbackStatus('submitting');

    const historyForLead = messages
      .filter(m => m.content !== INITIAL_GREETING)
      .map(m => ({ role: m.role, content: m.content }));

    const leadPayload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      specialty: formData.specialty,
      bestTime: formData.bestTime,
      message: formData.notes.trim() || 'Requested callback via Talk to an Expert widget',
      routeTo: PRIMARY_EXPERT_EMAIL,
    };

    const ok = await sendLeadToKiran('callback_request', leadPayload, historyForLead);

    if (!ok) {
      // Fallback direct attempt
      await submitToWorker('callback_request', leadPayload);
    }

    setCallbackStatus('success');
    setFormData({ name: '', phone: '', email: '', specialty: '', bestTime: '', notes: '', hp_field: '' });
    setTimeout(() => {
      setCallbackStatus('idle');
      setOpen(false);
    }, 4000);
  };

  // Render markdown-like text with bold, bullet points, and links
  const renderMessageContent = (text: string) => {
    const lines = text.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1" />;
          if (line.startsWith('### ')) {
            return <h4 key={idx} className="font-bold text-navy text-sm pt-1">{line.replace('### ', '')}</h4>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className="text-teal font-bold shrink-0">•</span>
                <span>{renderFormattedInline(line.replace(/^[-*]\s+/, ''))}</span>
              </div>
            );
          }
          return <p key={idx}>{renderFormattedInline(line)}</p>;
        })}
      </div>
    );
  };

  const renderFormattedInline = (line: string) => {
    // Replace markdown bold, links, code, and direct routes
    const parts = line.split(/(\*\*.*?\*\*|`.*?`|\/[a-z0-9-]+|kirkmar078@gmail\.com|support@aetherahealthcare\.com|\(813\) 519-4640)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1 py-0.5 bg-slate-100 rounded text-teal font-mono text-[11px]">{part.slice(1, -1)}</code>;
      }
      if (/^\/[a-z]/.test(part)) {
        return (
          <a key={i} href={part} className="text-teal font-medium underline hover:text-navy transition-colors">
            {part}
          </a>
        );
      }
      if (part === PRIMARY_EXPERT_EMAIL || part === 'support@aetherahealthcare.com') {
        return (
          <a
            key={i}
            href={`mailto:${PRIMARY_EXPERT_EMAIL}?subject=Aethera%20Healthcare%20Inquiry%20from%20Expert%20Chat`}
            className="text-teal font-medium underline hover:text-navy transition-colors"
          >
            {part}
          </a>
        );
      }
      if (part === '(813) 519-4640') {
        return (
          <a key={i} href="tel:+18135194640" className="text-teal font-medium underline hover:text-navy transition-colors">
            {part}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Render Agentic Action Cards inside message stream
  const renderActionCard = (action: AgentAction, idx: number) => {
    if (action.type === 'denial_tool') {
      const d = action.data;
      return (
        <div key={idx} className="mt-2.5 p-3 rounded-xl bg-teal/5 border border-teal/20 text-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-teal mb-1">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>{action.title}</span>
          </div>
          <p className="text-slate-600 mb-2 font-medium">{String(d.label)}</p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <a
              href="/tools/denial-code-lookup"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-teal/30 text-teal hover:bg-teal hover:text-white rounded-lg font-semibold transition-colors text-[11px]"
            >
              Lookup in Guide <ExternalLink className="h-3 w-3" />
            </a>
            <button
              onClick={() => handleEscalateToCallback(`Need help with CARC ${String(d.code)}: ${String(d.label)}`)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-navy hover:bg-teal text-white rounded-lg font-semibold transition-colors text-[11px]"
            >
              Ask Kiran to Appeal <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      );
    }

    if (action.type === 'timely_filing') {
      const p = action.data;
      return (
        <div key={idx} className="mt-2.5 p-3 rounded-xl bg-mint/20 border border-mint/40 text-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-navy mb-1">
            <Clock className="h-4 w-4 text-teal shrink-0" />
            <span>{action.title}</span>
          </div>
          <p className="text-slate-700"><strong>Deadline:</strong> {String(p.timelyFiling)}</p>
          <p className="text-slate-600 text-[11px] mt-0.5"><strong>Appeals:</strong> {String(p.appeal)}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <a
              href="/tools/timely-filing"
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-teal/30 text-teal hover:bg-teal hover:text-white rounded-lg font-semibold transition-colors text-[11px]"
            >
              View 229+ Payer Directory <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      );
    }

    if (action.type === 'roi_estimate') {
      const r = action.data;
      return (
        <div key={idx} className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-800 mb-1">
            <TrendingUp className="h-4 w-4 shrink-0" />
            <span>{action.title}</span>
          </div>
          <p className="text-slate-700">
            Estimated Annual Cash Recovery Lift: <strong className="text-navy text-sm font-bold">${Number(r.annualLift).toLocaleString()}</strong>
          </p>
          <p className="text-slate-500 text-[11px] mt-0.5">
            Based on average 8% unbilled collection recovery and reducing A/R to {String(r.targetDaysInAr)}.
          </p>
          <div className="mt-2">
            <button
              onClick={() => handleEscalateToCallback(`Practice volume ~$${Number(r.monthlyVolume).toLocaleString()}/mo — requesting recovery audit.`)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-navy hover:bg-teal text-white rounded-lg font-semibold transition-colors text-xs"
            >
              Schedule Claim Audit with Kiran <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      );
    }

    if (action.type === 'escalate_kiran') {
      return (
        <div key={idx} className="mt-2.5 p-3 rounded-xl bg-navy/5 border border-navy/15 text-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-navy mb-1">
            <UserCheck className="h-4 w-4 text-teal shrink-0" />
            <span>Direct Partner Escalation</span>
          </div>
          <p className="text-slate-600 mb-2">
            Kiran &amp; senior billing leadership personally review practice audits and answer complex billing questions.
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleEscalateToCallback()}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-navy hover:bg-teal text-white rounded-lg font-semibold transition-colors text-[11px]"
            >
              Request Callback
            </button>
            <a
              href={`mailto:${PRIMARY_EXPERT_EMAIL}?subject=Aethera%20Healthcare%20Inquiry%20from%20Website&body=Hi%20Kiran,%20I'd%20like%20to%20discuss%20our%20practice%20billing...`}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-white border border-slate-300 hover:border-teal text-slate-700 hover:text-teal rounded-lg font-semibold transition-colors text-[11px]"
            >
              <Mail className="h-3 w-3" /> Email Kiran
            </a>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[24rem] sm:w-[26rem] max-w-[calc(100vw-2rem)] overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-200" style={{ height: '36rem', maxHeight: 'calc(100vh - 5.5rem)' }}>
          {/* Header */}
          <div className="bg-gradient-to-r from-navy via-navy to-teal p-3.5 sm:p-4 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="relative p-1.5 rounded-lg bg-white/10 border border-white/20">
                  <Sparkles className="h-4 w-4 text-mint" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-navy animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-sm leading-none">Talk to an Expert</p>
                    <span className="bg-mint/20 text-mint text-[10px] font-semibold px-1.5 py-0.5 rounded border border-mint/30">
                      Agentic AI
                    </span>
                  </div>
                  <p className="text-white/70 text-[11px] mt-1">Live RCM Answers · Routed to Kiran</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex rounded-xl bg-white/10 p-1 mt-3 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'chat' ? 'bg-white text-navy shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" /> AI Expert Chat
              </button>
              <button
                onClick={() => setActiveTab('callback')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all ${
                  activeTab === 'callback' ? 'bg-white text-navy shadow-sm' : 'text-white/80 hover:text-white'
                }`}
              >
                <Phone className="h-3.5 w-3.5" /> Request Callback
              </button>
            </div>
          </div>

          {/* TAB 1: AI EXPERT CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-cream/40">
              {/* Message scroll container */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-3.5 space-y-3">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        m.role === 'user'
                          ? 'bg-navy text-white rounded-br-none'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                      }`}
                    >
                      {m.role === 'assistant' ? renderMessageContent(m.content) : m.content}
                      {m.actions && m.actions.length > 0 && (
                        <div className="space-y-2 mt-1">
                          {m.actions.map((act, idx) => renderActionCard(act, idx))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 text-right ${m.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                        {m.timestamp}
                      </p>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 text-slate-500 text-xs flex items-center gap-2 shadow-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-teal" />
                      <span>Analyzing RCM rules…</span>
                    </div>
                  </div>
                )}

                {/* Suggestions shown when chat is fresh */}
                {messages.length === 1 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-1">
                      Suggested questions:
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {SUGGESTIONS.map(s => (
                        <button
                          key={s}
                          onClick={() => handleSendMessage(s)}
                          className="text-left text-xs bg-white hover:bg-teal/10 border border-slate-200 hover:border-teal/40 text-slate-700 hover:text-navy rounded-xl p-2 transition-all flex items-center justify-between group shadow-2xs"
                        >
                          <span>{s}</span>
                          <ArrowRight className="h-3 w-3 text-slate-400 group-hover:text-teal group-hover:translate-x-0.5 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-slate-200 bg-white shrink-0">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about denial codes, payers, fees…"
                    aria-label="Message Aethera Expert AI"
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal"
                  />
                  <button
                    type="submit"
                    disabled={isThinking || !input.trim()}
                    className="bg-navy hover:bg-teal disabled:opacity-40 text-white rounded-xl px-3 py-2 transition-colors shrink-0"
                    aria-label="Send"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-0.5">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Grounded in 229+ Payers &amp; CARCs
                  </span>
                  <button
                    onClick={() => handleEscalateToCallback()}
                    className="text-teal hover:text-navy font-semibold underline underline-offset-2"
                  >
                    Speak to Kiran
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REQUEST CALLBACK & DIRECT CONNECT */}
          {activeTab === 'callback' && (
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {callbackStatus === 'success' ? (
                <div className="py-10 text-center space-y-3">
                  <div className="w-14 h-14 bg-mint/20 text-teal rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-teal" />
                  </div>
                  <h4 className="text-lg font-bold text-navy">Callback Request Dispatched!</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                    Thank you! Your request and inquiry notes have been routed directly to Kiran (
                    <strong className="text-navy">{PRIMARY_EXPERT_EMAIL}</strong>). Expect a follow-up or call within 2 business hours.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Quick Connect Bar */}
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href="tel:+18135194640"
                      className="flex items-center justify-center gap-1.5 bg-teal hover:bg-navy text-white font-semibold py-2 px-3 rounded-xl transition-colors text-xs text-center"
                    >
                      <Phone className="h-3.5 w-3.5" /> Call (813) 519-4640
                    </a>
                    <a
                      href={`mailto:${PRIMARY_EXPERT_EMAIL}?subject=Talk%20to%20an%20Expert%20-%20Aethera%20Healthcare&body=Hello%20Kiran,%0A%0AI%20am%20interested%20in%20discussing%20our%20practice%20billing...`}
                      className="flex items-center justify-center gap-1.5 border border-teal text-teal hover:bg-teal hover:text-white font-semibold py-2 px-3 rounded-xl transition-colors text-xs text-center"
                    >
                      <Mail className="h-3.5 w-3.5" /> Email Kiran Directly
                    </a>
                  </div>

                  <p className="text-center text-[11px] text-slate-500">
                    Direct lead routing: <strong>{PRIMARY_EXPERT_EMAIL}</strong>
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] font-medium text-slate-400">or request a callback</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {/* Form */}
                  <div className="space-y-2.5">
                    {/* Honeypot hidden input */}
                    <div style={{ position: 'absolute', left: '-9999px', top: 'auto', width: '1px', height: '1px', overflow: 'hidden' }} aria-hidden="true">
                      <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.hp_field}
                        onChange={e => setFormData({ ...formData, hp_field: e.target.value })}
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Your name *"
                      aria-label="Your name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal transition-colors"
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="tel"
                        placeholder="Phone number *"
                        aria-label="Phone number"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal transition-colors"
                      />
                      <input
                        type="email"
                        placeholder="Email address *"
                        aria-label="Email address"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        aria-label="Your specialty"
                        value={formData.specialty}
                        onChange={e => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal text-slate-600 transition-colors"
                      >
                        <option value="">Specialty (optional)</option>
                        <option>Hospitalist / Inpatient</option>
                        <option>Cardiology</option>
                        <option>Internal Medicine</option>
                        <option>Family Medicine</option>
                        <option>Orthopedics</option>
                        <option>Psychiatry / Behavioral</option>
                        <option>Urgent Care</option>
                        <option>Other</option>
                      </select>

                      <select
                        aria-label="Best time to call"
                        value={formData.bestTime}
                        onChange={e => setFormData({ ...formData, bestTime: e.target.value })}
                        className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal text-slate-600 transition-colors"
                      >
                        <option value="">Best time (optional)</option>
                        <option>Morning (9AM – 12PM ET)</option>
                        <option>Afternoon (12PM – 5PM ET)</option>
                        <option>Evening (5PM – 8PM ET)</option>
                      </select>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="Billing questions or current A/R backlog context…"
                      aria-label="Notes"
                      value={formData.notes}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-teal transition-colors resize-none"
                    />

                    {callbackStatus === 'error' && (
                      <p className="text-red-500 text-[11px]">
                        Something went wrong. Please call directly at (813) 519-4640 or email {PRIMARY_EXPERT_EMAIL}.
                      </p>
                    )}

                    <button
                      onClick={handleRequestCallback}
                      disabled={callbackStatus === 'submitting' || !canSubmit}
                      className="w-full bg-navy hover:bg-teal disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-colors text-xs flex items-center justify-center gap-2 shadow-sm"
                    >
                      {callbackStatus === 'submitting' ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispatching to Kiran…
                        </>
                      ) : (
                        'Request Callback with Senior Expert'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main trigger button pinned bottom-right */}
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 ${
          open ? 'bg-navy' : 'bg-teal hover:bg-navy'
        } text-white font-bold p-3 sm:py-3 sm:px-5 rounded-full shadow-2xl transition-all duration-300 group hover:shadow-teal/25 hover:shadow-lg relative`}
        aria-label="Talk to an Expert - AI & Human Billing Specialist"
      >
        <div className="relative">
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <>
              <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-mint rounded-full ring-2 ring-teal animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-mint rounded-full ring-2 ring-teal" />
            </>
          )}
        </div>
        <div className="hidden sm:flex flex-col items-start text-left leading-none">
          <span className="text-xs font-medium text-white/80">AI &amp; Billing Experts</span>
          <span className="text-sm font-bold mt-0.5">{open ? 'Close' : 'Talk to an Expert'}</span>
        </div>
      </button>
    </div>
  );
}
