'use client';

import { requestOverlay } from '@/lib/overlayStore';
import type { ButtonHTMLAttributes } from 'react';
export default function PilotTrigger(props: ButtonHTMLAttributes<HTMLButtonElement>) { return <button {...props} onClick={() => requestOverlay(new Event('open-free-pilot-modal'))} />; }
