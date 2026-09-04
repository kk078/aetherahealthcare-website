import Link from 'next/link';

interface CTABannerProps {
  title: string;
  buttonText: string;
  href: string;
  className?: string;
}

export default function CTABanner({
  title,
  buttonText,
  href,
  className = '',
}: CTABannerProps) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center shadow-xl ${className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-mint/15 to-transparent pointer-events-none" />
      <div className="relative z-10">
        <h2 className="text-3xl md:text-4xl font-bold text-white font-jakarta mb-6 tracking-tight">
          {title}
        </h2>
        <Link
          prefetch={false}
          href={href}
          className="btn-shimmer bg-mint hover:bg-white text-navy font-bold py-3.5 px-8 rounded-full transition-all duration-300 inline-block shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
}