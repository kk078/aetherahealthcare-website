interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  specialty: string;
}

export default function TestimonialCard({
  quote,
  author,
  role,
  specialty,
}: TestimonialCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-8 border border-gray/10">
      <div className="text-teal text-5xl mb-4">"</div>
      <p className="text-gray mb-6 italic">{quote}</p>
      <div className="border-t border-gray/10 pt-6">
        <p className="font-bold text-navy">{author}</p>
        <p className="text-gray text-sm">{role}</p>
        <p className="text-teal text-sm">{specialty}</p>
      </div>
    </div>
  );
}