import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export default function TopContactBar() {
  return (
    <div className="fixed top-0 w-full z-50 h-8 bg-[#003087] text-white text-xs flex items-center justify-center gap-4 md:gap-8 px-4">
      <span className="hidden md:inline text-white/60">Serving physicians, hospitalists &amp; group practices nationwide</span>
      <a
        href="tel:+18636940325"
        className="flex items-center gap-1.5 hover:text-[#60A5FA] transition-colors font-semibold tracking-wide"
      >
        <Phone className="h-3 w-3 flex-shrink-0" />
        (863) 694-0325
      </a>
      <a
        href="mailto:support@aetherahealthcare.com"
        className="flex items-center gap-1.5 hover:text-[#60A5FA] transition-colors"
      >
        <Mail className="h-3 w-3 flex-shrink-0" />
        support@aetherahealthcare.com
      </a>
      <Link prefetch={false}
        href="/free-assessment"
        className="hidden sm:inline-flex items-center gap-1 bg-white hover:bg-[#F0F4FB] text-[#003087] font-bold px-3 py-0.5 rounded-full transition-colors text-xs"
      >
        Free Assessment
      </Link>
    </div>
  );
}
