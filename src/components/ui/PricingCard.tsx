import Link from 'next/link';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  href: string;
}

export default function PricingCard({
  title,
  price,
  description,
  features,
  isPopular = false,
  href,
}: PricingCardProps) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-8 relative flex flex-col justify-between h-full bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 ${
        isPopular ? 'border-2 border-mint ring-2 ring-mint/30 shadow-mint/10' : 'border border-gray/15 hover:border-teal/30'
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-mint text-navy text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap shadow-md tracking-wide uppercase">
          Most Popular
        </div>
      )}

      <div>
        <h3 className="text-2xl font-bold text-navy mb-2 font-jakarta">{title}</h3>
        <p className="text-3xl font-extrabold text-teal mb-3 font-jakarta">{price}</p>
        <p className="text-slate-500 text-sm mb-6 min-h-[2.5rem] leading-relaxed">{description}</p>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm">
              <span className="text-teal font-bold mr-2.5 shrink-0">✓</span>
              <span className="text-slate-700 leading-snug">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        prefetch={false}
        href={href}
        className={`btn-shimmer mt-auto block w-full py-3 px-6 rounded-full font-bold text-center text-sm transition-all duration-200 shadow-sm hover:shadow-md ${
          isPopular
            ? 'bg-mint hover:bg-teal hover:text-white text-navy'
            : 'bg-navy hover:bg-teal text-white'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}