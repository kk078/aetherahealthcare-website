'use client';
import dynamic from 'next/dynamic';
import { useEffect, useSyncExternalStore } from 'react';
import { MessageSquare } from 'lucide-react';
import { requestOverlay, subscribeOverlays, getOverlay, getServerOverlay } from '@/lib/overlayStore';

const Search = dynamic(() => import('./CommandPalette'), { ssr: false });
const Expert = dynamic(() => import('./CallbackButton'), { ssr: false });
const Pilot = dynamic(() => import('./FreePilotModal'), { ssr: false });
export default function GlobalOverlays() {
  const active = useSyncExternalStore(subscribeOverlays, getOverlay, getServerOverlay);
  useEffect(() => {
    const events = ['open-command-palette', 'open-expert-modal', 'open-free-pilot-modal'];
    const keyboard = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); requestOverlay(new Event('open-command-palette')); } };
    for (const event of events) window.addEventListener(event, requestOverlay);
    window.addEventListener('keydown', keyboard);
    return () => { for (const event of events) window.removeEventListener(event, requestOverlay); window.removeEventListener('keydown', keyboard); };
  }, []);
  return <>
    {active?.kind === 'search' && <Search key={active.key} initialQuery={active.query} initialCategory={active.category} />}
    {active?.kind === 'pilot' && <Pilot key={active.key} initialOpen />}
    {active?.kind === 'expert' ? <Expert key={active.key} initialQuery={active.query} initialMode={active.mode} /> : <button aria-label="Talk to an Expert" onClick={() => requestOverlay(new Event('open-expert-modal'))} className="fixed bottom-6 right-4 z-50 flex items-center gap-2 rounded-full bg-teal text-white shadow-lg px-4 py-3"><MessageSquare className="w-5 h-5" /><span className="hidden sm:inline font-semibold">Talk to an Expert</span></button>}
  </>;
}
