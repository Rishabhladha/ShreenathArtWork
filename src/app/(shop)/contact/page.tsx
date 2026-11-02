'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactSchema } from '@/lib/validators';
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2, AlertCircle } from 'lucide-react';
import { z } from 'zod';

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to submit message');
      }

      setSubmitted(true);
      reset();
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
      {/* Page Title */}
      <div className="border-b border-[#E2DACD] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Nathdwara Gallery
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-semibold text-[#262320]">
          Contact Us
        </h1>
        <p className="text-sm text-[#5C554C] max-w-2xl leading-relaxed">
          Reach out for inquiries regarding current paintings, frame customizations, safe transit packaging, or to schedule a visit to our workshop in Nathdwara.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information & Map Card */}
        <div className="space-y-8">
          <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-6">
            <h2 className="font-serif text-xl font-semibold text-[#262320]">
              SHREENATH ART WORK
            </h2>

            <div className="space-y-4 text-xs sm:text-sm text-[#5C554C]">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#8A8175] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#262320]">Gallery Location</p>
                  <p className="mt-0.5">Opposite Temple Gate, Nathdwara, Rajasthan 313301, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#8A8175] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#262320]">Phone and WhatsApp</p>
                  <p className="mt-0.5">
                    <a
                      href="https://wa.me/919079901405"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#262320] font-semibold hover:text-[#C47820]"
                    >
                      9079901405
                    </a>{' '}
                    (Direct gallery line)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#8A8175] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#262320]">Email Address</p>
                  <p className="mt-0.5">
                    <a
                      href="mailto:shreenathartwork@gmail.com"
                      className="text-[#262320] hover:text-[#C47820]"
                    >
                      shreenathartwork@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#8A8175] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#262320]">Visiting Hours</p>
                  <p className="mt-0.5">Monday to Sunday: 9:00 AM to 8:30 PM</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="https://wa.me/919079901405"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2 px-4"
              >
                Chat on WhatsApp
              </a>
              <a
                href="tel:9079901405"
                className="btn-secondary text-xs py-2 px-4"
              >
                Call Gallery
              </a>
            </div>
          </div>

          {/* Clean Map Link (No heavy iframe on first paint) */}
          <div className="p-6 bg-[#F4EFE6] border border-[#E2DACD] rounded-sm space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#262320]">
              Finding the Gallery
            </h3>
            <p className="text-xs text-[#5C554C] leading-relaxed">
              We are situated right across the main gate of the historic temple in Nathdwara. We encourage visiting collectors to message us in advance so we can assist with parking and directions.
            </p>
            <div>
              <a
                href="https://maps.google.com/?q=Nathdwara+Rajasthan+313301"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Open in Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-6">
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-semibold text-[#262320]">
              Send an Inquiry
            </h2>
            <p className="text-xs text-[#5C554C]">
              Fill in your details below and our curator will reply within 24 hours.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-[#2A5C38] mx-auto" />
              <h3 className="font-serif text-lg font-semibold text-[#262320]">
                Message Received
              </h3>
              <p className="text-xs text-[#5C554C] max-w-sm mx-auto">
                Thank you for contacting SHREENATH ART WORK. We have saved your inquiry and our gallery team will respond shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="btn-secondary text-xs py-2 px-4 mt-2"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Your Name *</label>
                <input
                  type="text"
                  {...register('name')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  placeholder="Full name"
                />
                {errors.name && (
                  <p className="text-[11px] text-[#8C2B2B]">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">Email Address *</label>
                  <input
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="text-[11px] text-[#8C2B2B]">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">Phone (Optional)</label>
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
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Subject *</label>
                <input
                  type="text"
                  {...register('subject')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  placeholder="e.g. Inquiring about Kamal Talai Pichwai"
                />
                {errors.subject && (
                  <p className="text-[11px] text-[#8C2B2B]">{errors.subject.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Your Message *</label>
                <textarea
                  rows={4}
                  {...register('message')}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  placeholder="Provide details about the artwork, dimensions, or questions you have..."
                />
                {errors.message && (
                  <p className="text-[11px] text-[#8C2B2B]">{errors.message.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

