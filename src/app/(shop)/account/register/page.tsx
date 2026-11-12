'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/lib/validators';
import { AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { PasswordInput } from '@/components/common/PasswordInput';
import { z } from 'zod';

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const res = await fetch('/api/account/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Failed to register account');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/account/login');
      }, 2000);
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Collector Portal
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          Create an Account
        </h1>
        <p className="text-xs text-[#5C554C]">
          Save delivery addresses, track devotional painting orders, and manage wishlist items.
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        {serverError && (
          <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {success ? (
          <div className="p-6 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2A5C38] mx-auto" />
            <p className="font-serif text-base font-semibold text-[#262320]">
              Account Created Successfully
            </p>
            <p className="text-xs text-[#5C554C]">
              Redirecting you to the sign in portal...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Full Name *</label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="Your full name"
              />
              {errors.name && (
                <p className="text-[11px] text-[#8C2B2B]">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Email Address *</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="name@example.com"
              />
              {errors.email && (
                <p className="text-[11px] text-[#8C2B2B]">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Mobile Phone (Optional)</label>
              <input
                type="tel"
                {...register('phone')}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="10-digit number"
              />
              {errors.phone && (
                <p className="text-[11px] text-[#8C2B2B]">{errors.phone.message}</p>
              )}
            </div>

            <PasswordInput
              label="Password (min 8 characters) *"
              {...register('password')}
              error={errors.password?.message}
              placeholder="Create a strong password"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creating Account...' : 'Register'}</span>
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-[#ECE5DA] text-center text-xs text-[#5C554C]">
          <span>Already registered? </span>
          <Link
            href="/account/login"
            className="text-[#262320] font-semibold underline hover:text-[#C47820]"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
