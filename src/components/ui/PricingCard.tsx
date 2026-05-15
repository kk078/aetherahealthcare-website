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
    <div className={`rounded-xl shadow-lg p-8 relative ${isPopular ? 'border-2 border-mint' : 'border border-gray/20'}`}>
      {isPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-mint text-navy text-xs font-bold px-4 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}

      <h3 className="text-2xl font-bold text-navy mb-2">{title}</h3>
      <p className="text-4xl font-bold text-teal mb-4">{price}</p>
      <p className="text-gray mb-6">{description}</p>

      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <span className="text-mint mr-2">✓</span>
            <span className="text-gray">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`w-full py-3 px-6 rounded-full font-medium text-center transition-colors ${
          isPopular
            ? 'bg-mint hover:bg-teal text-navy'
            : 'bg-navy hover:bg-teal text-white'
        }`}
      >
        Get Started
      </Link>
    </div>
  );
}