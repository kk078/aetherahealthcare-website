'use client';

import { useEffect, useRef, useState } from 'react';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { askAiAgent, type AssistantMessage } from '@/lib/aiAgent';
import { PRIMARY_EXPERT_EMAIL } from '@/lib/worker';

const GREETING =
  "Hi! I'm Aethera's AI billing assistant. Ask me about timely-filing limits, payer IDs, our services, pricing, or onboarding.";

const SUGGESTIONS = [
  "What's UnitedHealthcare's timely filing limit?",
  'How much does Aethera charge?',
  'Do you bill for cardiology?',
];

let aiMsgCounter = 0;
function makeAiMsg(role: 'user' | 'assistant', content: string): AssistantMessage {
  aiMsgCounter += 1;
  const d = new Date();
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return {
    id: `ai-${aiMsgCounter}`,
    role,
    content,
    timestamp: `${h}:${m}`,
  };
}

/** Turn internal paths, phone, and email in an answer into clickable links. */
function render(text: string) {
  const parts = text.split(/(\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*|\(813\) 519-4640|kirkmar078@gmail\.com|support@aetherahealthcare\.com)/g);
  return parts.map((p, i) => {
    if (/^\/[a-z]/.test(p)) return <a key={i} href={p} className="text-teal underline hover:text-navy">{p}</a>;
    if (p === '(813) 519-4640') return <a key={i} href="tel:+18135194640" className="text-teal underline">{p}</a>;
    if (p === PRIMARY_EXPERT_EMAIL || p === 'support@aetherahealthcare.com') {
      return (
        <a key={i} href={`mailto:${PRIMARY_EXPERT_EMAIL}?subject=Aethera%20Healthcare%20Inquiry`} className="text-teal underline">
          {p}
        </a>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<AssistantMessage[]>(() => [
    {
      id: 'ai-init',
      role: 'assistant',
      content: GREETING,
      timestamp: 'Now',
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, open]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const history = msgs
      .filter(m => m.content !== GREETING)
      .slice(-6)
      .map(m => ({ role: m.role, content: m.content }));

    setMsgs(m => [...m, makeAiMsg('user', q)]);
    setInput('');
    setBusy(true);

    try {
      const response = await askAiAgent(q, history);
      setMsgs(m => [...m, makeAiMsg('assistant', response.text)]);
    } catch {
      setMsgs(m => [
        ...m,
        makeAiMsg('assistant', `I'm having trouble connecting. Call (813) 519-4640 or contact Kiran at ${PRIMARY_EXPERT_EMAIL}.`),
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[22rem] max-w-[calc(100vw-3rem)] overflow-hidden flex flex-col" style={{ height: '32rem', maxHeight: 'calc(100vh - 7rem)' }}>
          <div className="bg-gradient-to-r from-navy to-teal p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-mint" />
              <div>
                <p className="text-white font-bold text-sm leading-none">Aethera AI</p>
                <p className="text-white/70 text-[11px] mt-1">Billing &amp; payer answers · Aethera AI</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white" aria-label="Close"><X className="h-5 w-5" /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream/40">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'bg-navy text-white' : 'bg-white border border-slate-200 text-slate-700'}`}>
                  {m.role === 'assistant' ? render(m.content) : m.content}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-2xl px-3.5 py-2.5 text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /></div>
              </div>
            )}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="text-xs bg-white border border-teal/30 text-teal rounded-full px-3 py-1.5 hover:bg-teal hover:text-white transition-colors">{s}</button>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={e => { e.preventDefault(); send(input); }} className="p-3 border-t border-slate-200 bg-white flex gap-2 shrink-0">
            <input
              value={input} onChange={e => setInput(e.target.value)}
              placeholder="Ask about a payer, service, or pricing…" aria-label="Message"
              className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal"
            />
            <button type="submit" disabled={busy || !input.trim()} className="bg-navy hover:bg-teal disabled:opacity-40 text-white rounded-xl px-3 transition-colors" aria-label="Send">
              <Send className="h-4 w-4" />
            </button>
          </form>
          <p className="text-[11px] text-slate-500 text-center pb-2 px-3 bg-white">Powered by Aethera AI · Routed to {PRIMARY_EXPERT_EMAIL}</p>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2.5 ${open ? 'bg-navy' : 'bg-navy hover:bg-teal'} text-white font-bold p-3 sm:py-3 sm:px-5 rounded-full shadow-xl transition-all duration-300 group`}
        aria-label="Open Aethera AI assistant"
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5 text-mint group-hover:scale-110 transition-transform" />}
        <span className="text-sm hidden sm:inline">{open ? 'Close' : 'Ask Aethera AI'}</span>
      </button>
    </div>
  );
}
