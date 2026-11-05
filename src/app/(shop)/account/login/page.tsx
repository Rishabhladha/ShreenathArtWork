'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { AlertCircle, Lock, Mail, ArrowRight } from 'lucide-react';

function getSafeRedirectUrl(url: string | null, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
    return url;
  }
  return fallback;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeRedirectUrl(searchParams.get('callbackUrl'), '/account/profile');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (res?.error) {
        setError('Invalid email address or password.');
        setSubmitting(false);
      } else {
        // Use hard navigation so the browser immediately sends the new session cookies to the server
        window.location.href = callbackUrl;
      }
    } catch {
      setError('An error occurred during sign in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Collector Portal
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-[#5C554C]">
          View your order history, delivery timelines, and saved artworks.
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        {error && (
          <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs text-[#5C554C]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-baseline">
              <label className="block text-xs text-[#5C554C]">Password</label>
              <Link
                href="/account/forgot-password"
                className="text-[11px] text-[#8A8175] hover:text-[#262320]"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{submitting ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#ECE5DA] text-center text-xs text-[#5C554C]">
          <span>Do not have an account yet? </span>
          <Link
            href="/account/register"
            className="text-[#262320] font-semibold underline hover:text-[#C47820]"
          >
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto p-12 text-center text-xs text-[#8A8175]">
          Loading portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

