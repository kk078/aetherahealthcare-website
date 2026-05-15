import React from 'react';
import { CheckCircle, Users, DollarSign, Clock } from 'lucide-react';

export default function SocialProofBar() {
  const stats = [
    { icon: <Users className="h-5 w-5" />, value: '500+', label: 'Practices Served' },
    { icon: <DollarSign className="h-5 w-5" />, value: '$12M+', label: 'Revenue Recovered' },
    { icon: <CheckCircle className="h-5 w-5" />, value: '95%+', label: 'Clean Claim Rate' },
    { icon: <Clock className="h-5 w-5" />, value: '<30', label: 'Avg. Days in AR' },
  ];

  return (
    <div className="bg-white dark:bg-navy border-b border-gray/10 dark:border-gray/20 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center">
              <div className="text-teal dark:text-mint mr-2">
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-bold text-navy dark:text-cream">{stat.value}</p>
                <p className="text-xs text-gray dark:text-cream">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}