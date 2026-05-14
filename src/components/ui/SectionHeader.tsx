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
    <div className={`text-center max-w-3xl mx-auto mb-16 ${className}`}>
      <p className="text-teal font-medium uppercase tracking-wider text-sm mb-2">
        {label}
      </p>
      <h2 className="text-3xl md:text-4xl font-bold text-navy font-playfair mb-4">
        {title}
      </h2>
      <p className="text-gray text-lg">
        {description}
      </p>
    </div>
  );
}