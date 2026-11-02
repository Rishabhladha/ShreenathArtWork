'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customOrderSchema } from '@/lib/validators';
import { CheckCircle2, AlertCircle, Sparkles, Send } from 'lucide-react';
import { z } from 'zod';

type CustomOrderFormData = z.infer<typeof customOrderSchema>;

export default function CustomOrderPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomOrderFormData>({
    resolver: zodResolver(customOrderSchema),
  });

  const onSubmit = async (data: CustomOrderFormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/custom-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit commission request');
      }

      setSubmitted(true);
      reset();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Error submitting commission request');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-10">
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Bespoke Artworks
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#262320]">
          Custom Painting Commissions
        </h1>
        <p className="text-sm text-[#5C554C] leading-relaxed max-w-2xl">
          Commission a made-to-order Pichwai or sanctum portrait painted to your custom specifications: exact altar dimensions, specific utsav themes, or gold foil detailing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-[#F4EFE6] border border-[#E2DACD] rounded-sm text-xs text-[#5C554C]">
        <div className="space-y-1">
          <p className="font-semibold text-[#262320]">1. Consultation</p>
          <p>We review your dimensions, reference imagery, and choice of medium with our artists.</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-[#262320]">2. Sketch & Preparation</p>
          <p>The layout and proportions are drafted on primed cloth or wasli paper for your approval.</p>
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-[#262320]">3. Hand Painting & Framing</p>
          <p>Executed with mineral colors, gold leaf, and framed in seasoned teak or rosewood.</p>
        </div>
      </div>

      <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-6">
        {submitted ? (
          <div className="p-8 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-[#2A5C38] mx-auto" />
            <h2 className="font-serif text-2xl font-semibold text-[#262320]">
              Commission Request Submitted
            </h2>
            <p className="text-xs text-[#5C554C] max-w-md mx-auto leading-relaxed">
              Thank you for sharing your requirements. Our master artists will review your dimensions and medium preferences and contact you via phone or WhatsApp within 24 hours.
            </p>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="btn-secondary text-xs py-2 px-4 mt-2"
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="font-serif text-xl font-semibold text-[#262320]">
              Artwork Specifications
            </h2>

            {serverError && (
              <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Full Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
                {errors.name && (
                  <p className="text-[11px] text-[#8C2B2B]">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Mobile Phone *</label>
                <input
                  type="tel"
                  {...register('phone')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  placeholder="10-digit number"
                />
                {errors.phone && (
                  <p className="text-[11px] text-[#8C2B2B]">{errors.phone.message}</p>
                )}
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs text-[#5C554C]">Email Address *</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
                {errors.email && (
                  <p className="text-[11px] text-[#8C2B2B]">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Preferred Medium</label>
                <select
                  {...register('medium')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                >
                  <option value="Natural stone and vegetable pigments on cotton cloth">
                    Natural stone pigments on cotton cloth (Traditional Pichwai)
                  </option>
                  <option value="Stone pigment and pure gold foil on wasli paper">
                    Stone pigment and gold foil on wasli paper (Miniature)
                  </option>
                  <option value="Acrylic and gold dust on canvas">
                    Acrylic and gold dust on canvas (Contemporary Sanctum)
                  </option>
                  <option value="Silver foil on indigo dyed cloth">
                    Silver foil on indigo dyed cloth (Sharad Purnima)
                  </option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Required Dimensions (inches or feet)</label>
                <input
                  type="text"
                  {...register('dimensions')}
                  placeholder="e.g. 36 x 48 inches (Altar space)"
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Estimated Budget (INR)</label>
                <input
                  type="text"
                  {...register('budget')}
                  placeholder="e.g. Rs 25,000 to Rs 40,000"
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Reference Image URL (Optional)</label>
                <input
                  type="url"
                  {...register('referenceImageUrl')}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="block text-xs text-[#5C554C]">
                  Description of Desired Artwork *
                </label>
                <textarea
                  rows={4}
                  {...register('description')}
                  placeholder="Please describe the deity form, shringaar colors, background elements (lotus pond, cows, kadamba trees), and framing preference..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
                {errors.description && (
                  <p className="text-[11px] text-[#8C2B2B]">{errors.description.message}</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs py-3 px-6 flex items-center gap-2 disabled:opacity-60"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Submitting...' : 'Send Commission Request'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

