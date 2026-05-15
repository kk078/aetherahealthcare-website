'use client';

import { useForm } from 'react-hook-form';

const specialties = [
  'Primary Care',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Surgery',
  'Urology',
  'Other',
];

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data: any) => {
    console.log(data);
    // Here you would typically send the data to your backend
    alert('Thank you for your message! We will contact you soon.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-gray mb-2">
            Full Name
          </label>
          <input
            id="name"
            {...register('name', { required: 'Name is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${
              errors.name ? 'border-red-500' : 'border-gray/20'
            }`}
            placeholder="Dr. Jane Smith"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="practice" className="block text-gray mb-2">
            Practice/Organization
          </label>
          <input
            id="practice"
            {...register('practice', { required: 'Practice is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${
              errors.practice ? 'border-red-500' : 'border-gray/20'
            }`}
            placeholder="Smith Medical Associates"
          />
          {errors.practice && (
            <p className="text-red-500 text-sm mt-1">{errors.practice.message as string}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="email" className="block text-gray mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Invalid email address',
              },
            })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${
              errors.email ? 'border-red-500' : 'border-gray/20'
            }`}
            placeholder="dr.smith@example.com"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message as string}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-gray mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            {...register('phone', { required: 'Phone is required' })}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${
              errors.phone ? 'border-red-500' : 'border-gray/20'
            }`}
            placeholder="(555) 123-4567"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm mt-1">{errors.phone.message as string}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="specialty" className="block text-gray mb-2">
          Medical Specialty
        </label>
        <select
          id="specialty"
          {...register('specialty', { required: 'Specialty is required' })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${
            errors.specialty ? 'border-red-500' : 'border-gray/20'
          }`}
        >
          <option value="">Select your specialty</option>
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty}
            </option>
          ))}
        </select>
        {errors.specialty && (
          <p className="text-red-500 text-sm mt-1">{errors.specialty.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-gray mb-2">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          {...register('message', { required: 'Message is required' })}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal ${
            errors.message ? 'border-red-500' : 'border-gray/20'
          }`}
          placeholder="Tell us about your practice and how we can help..."
        ></textarea>
        {errors.message && (
          <p className="text-red-500 text-sm mt-1">{errors.message.message as string}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-mint hover:bg-teal text-navy font-bold py-3 px-6 rounded-full transition-colors duration-300"
      >
        Send Message
      </button>
    </form>
  );
}