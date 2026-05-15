interface SpecialtyBadgeProps {
  name: string;
  className?: string;
}

export default function SpecialtyBadge({ name, className = '' }: SpecialtyBadgeProps) {
  return (
    <span className={`inline-block bg-cream text-teal text-xs font-medium px-3 py-1 rounded-full ${className}`}>
      {name}
    </span>
  );
}