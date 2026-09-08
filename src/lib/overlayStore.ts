'use client';
import type { SearchCategory } from './searchIndex';
export type OverlaySurface = { kind: 'search' | 'expert' | 'pilot'; key: number; query?: string; category?: SearchCategory; mode?: 'chat' | 'callback' };
let active: OverlaySurface | null = null;
let sequence = 0;
const listeners = new Set<() => void>();
/** Keep activation until the lazy overlay host hydrates, including the first click. */
export function requestOverlay(event: Event) {
  const detail = (event as CustomEvent).detail;
  const key = ++sequence;
  if (event.type === 'open-command-palette') active = { kind: 'search', key, query: detail?.query, category: detail?.category };
  else if (event.type === 'open-expert-modal') active = { kind: 'expert', key, query: detail?.initialQuery, mode: detail?.mode };
  else if (event.type === 'open-free-pilot-modal') active = { kind: 'pilot', key };
  else return;
  listeners.forEach(listener => listener());
}
export const getOverlay = () => active;
export const getServerOverlay = () => null;
export function subscribeOverlays(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
