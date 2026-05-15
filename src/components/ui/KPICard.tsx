interface KPICardProps {
  value: string;
  label: string;
}

export default function KPICard({ value, label }: KPICardProps) {
  return (
    <div className="text-center">
      <p className="text-2xl md:text-3xl font-bold text-navy">{value}</p>
      <p className="text-gray mt-1">{label}</p>
    </div>
  );
}