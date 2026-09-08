'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
export default function DeliveryNotice() {
  const [show, setShow] = useState(false);
  useEffect(() => { const fail = () => setShow(true); window.addEventListener('lead-delivery-failed', fail); return () => window.removeEventListener('lead-delivery-failed', fail); }, []);
  if (!show) return null;
  return <div role="alert" className="fixed top-4 inset-x-4 mx-auto max-w-lg z-[120] surface-card border border-red-400 rounded-xl shadow-xl p-4"><p>We couldn’t confirm that your request was saved. Please retry; duplicate retries are protected. You can also <Link href="/schedule/" className="underline font-bold">schedule a meeting</Link>.</p><button className="underline mt-2" onClick={() => setShow(false)}>Dismiss</button></div>;
}
