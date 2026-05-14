import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export default function ServiceCard({
  icon,
  title,
  description,
  href,
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300 border border-gray/10">
      <div className="text-teal mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-navy mb-2">{title}</h3>
      <p className="text-gray mb-4">{description}</p>
      <Link
        href={href}
        className="text-teal font-medium flex items-center hover:text-mint transition-colors"
      >
        Learn more <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}