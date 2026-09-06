'use client';

import ContactForm from '@/components/ui/ContactForm';

export default function ContactTabs() {
  return (
    <div className="bg-white dark:bg-[#0c1f38] rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700/80 transition-colors duration-200">
      <ContactForm />
    </div>
  );
}