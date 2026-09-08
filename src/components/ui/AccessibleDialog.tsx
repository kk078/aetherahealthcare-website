'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { useRef, type ReactNode } from 'react';

/** Shared modal semantics, focus containment, Escape, and focus restoration. */
export default function AccessibleDialog({ open, onClose, title, className, children }: {
  open: boolean; onClose: () => void; title: string; className: string; children: ReactNode;
}) {
  const trigger = useRef<HTMLElement | null>(null);
  return <Dialog.Root open={open} onOpenChange={value => { if (!value) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm z-[99]" />
      <Dialog.Content aria-describedby={undefined} className={className}
        onOpenAutoFocus={() => { trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }}
        onCloseAutoFocus={event => { event.preventDefault(); if (trigger.current?.isConnected) trigger.current.focus(); }}>
        <Dialog.Title className="sr-only">{title}</Dialog.Title>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
