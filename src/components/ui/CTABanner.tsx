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
    <div className={`bg-gradient-to-r from-navy to-teal rounded-2xl py-16 px-8 text-center ${className}`}>
      <h2 className="text-3xl md:text-4xl font-bold text-white font-playfair mb-6">
        {title}
      </h2>
      <Link
        href={href}
        className="bg-mint hover:bg-white text-navy font-bold py-3 px-8 rounded-full transition-colors duration-300 inline-block"
      >
        {buttonText}
      </Link>
    </div>
  );
}