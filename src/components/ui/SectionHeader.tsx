import React from 'react';

interface SectionHeaderProps {
  label: string;
  title: string;
  description: string;
  className?: string;
}

export default function SectionHeader({
  label,
  title,
  description,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`text-center max-w-3xl mx-auto mb-14 ${className}`}>
      <p className="text-[#003087] text-xs font-bold uppercase tracking-[0.12em] mb-3">
        {label}
      </p>
      <h2 className="text-3xl md:text-[44px] font-bold text-[#1d1d1f] font-playfair mb-4 leading-[1.1]">
        {title}
      </h2>
      <p className="text-[#6e6e73] text-lg leading-relaxed">
        {description}
      </p>
    </div>
  );
}