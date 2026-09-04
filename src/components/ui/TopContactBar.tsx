import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';

export default function TopContactBar() {
  return (
    <div id="top-contact-bar" className="fixed top-0 w-full z-50 h-8 bg-[#003087] text-white text-xs flex items-center justify-center gap-4 md:gap-8 px-4 no-print">
      <span className="hidden md:inline text-white/85">Serving physicians, hospitalists &amp; group practices nationwide</span>
      <a
        href="tel:+18135194640"
        className="flex items-center gap-1.5 hover:text-[#93C5FD] transition-colors font-semibold tracking-wide"
      >
        <Phone className="h-3 w-3 flex-shrink-0" />
        (813) 519-4640
      </a>
      <a
        href="mailto:kirkmar078@gmail.com?subject=Aethera%20Healthcare%20Inquiry"
        className="flex items-center gap-1.5 hover:text-[#93C5FD] transition-colors"
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
