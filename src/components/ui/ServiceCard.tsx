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
    <div className="group bg-white rounded-xl shadow-md p-6 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-gray/10 hover:border-mint/30 flex flex-col justify-between h-full">
      <div>
        <div className="text-teal mb-4 transform group-hover:scale-110 group-hover:text-mint transition-all duration-300 origin-left inline-block">
          {icon}
        </div>
        <h3 className="text-xl font-bold text-navy mb-2 font-jakarta group-hover:text-teal transition-colors duration-200">
          {title}
        </h3>
        <p className="text-gray mb-4 leading-relaxed text-sm">{description}</p>
      </div>
      <Link
        prefetch={false}
        href={href}
        className="text-teal font-semibold flex items-center group-hover:text-mint transition-colors duration-200 text-sm mt-2"
      >
        Learn more{' '}
        <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1.5 transition-transform duration-200" />
      </Link>
    </div>
  );
}