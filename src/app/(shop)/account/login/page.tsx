'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { AlertCircle, Lock, Mail, ArrowRight, Shield } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { PasswordInput } from '@/components/common/PasswordInput';

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
  const rawCallbackUrl = searchParams.get('callbackUrl');
  const callbackUrl = getSafeRedirectUrl(rawCallbackUrl, PATHS.account.profile);

  const { data: session, status: sessionStatus } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect smoothly
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user) {
      if (session.user.role === 'OWNER' || session.user.role === 'STAFF') {
        window.location.href = PATHS.admin.dashboard;
      } else {
        window.location.href = callbackUrl;
      }
    }
  }, [sessionStatus, session, callbackUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await signIn('credentials', {
        redirect: false,
        email: cleanEmail,
        password,
      });

      if (res?.error) {
        if (res.error === 'EMAIL_NOT_VERIFIED' || res.error.includes('EMAIL_NOT_VERIFIED')) {
          // Trigger OTP dispatch and redirect to verification
          try {
            await fetch('/api/auth/verify-email/send-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: cleanEmail }),
            });
          } catch (err) {
            console.error('Failed to dispatch verification OTP:', err);
          }
          window.location.href = PATHS.account.verifyEmail(cleanEmail, callbackUrl);
          return;
        }

        setError('Invalid email address or password. Please verify your details.');
        setSubmitting(false);
      } else {
        // Inspect role to auto-route administrators to backoffice
        const sessionRes = await fetch('/api/auth/session');
        const sessionData = await sessionRes.json();

        if (
          (sessionData?.user?.role === 'OWNER' || sessionData?.user?.role === 'STAFF') &&
          (!rawCallbackUrl || callbackUrl === PATHS.account.profile)
        ) {
          window.location.href = PATHS.admin.dashboard;
          return;
        }

        window.location.href = callbackUrl;
      }
    } catch {
      setError('An unexpected error occurred during sign in. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans font-medium">
          Collector Portal
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          Sign In to Your Account
        </h1>
        <p className="text-xs text-[#5C554C]">
          View your order history, delivery milestones, and saved artworks.
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-5 shadow-2xs">
        {error && (
          <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-[#5C554C]">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-baseline mb-1">
              <label className="block text-xs font-medium text-[#5C554C]">Password</label>
              <Link
                href={PATHS.account.forgotPassword}
                className="text-[11px] text-[#A85A32] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your account password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
          >
            <Lock className="w-3.5 h-3.5 text-[#DEC99C]" />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-[#ECE5DA] flex flex-col gap-2 text-center text-xs text-[#5C554C]">
          <div>
            <span>Do not have an account yet? </span>
            <Link
              href={PATHS.account.register}
              className="text-[#262320] font-semibold underline hover:text-[#A85A32]"
            >
              Register Here
            </Link>
          </div>
          <div>
            <span>Gallery staff or curator? </span>
            <Link
              href={PATHS.admin.login()}
              className="text-[#A85A32] hover:underline inline-flex items-center gap-1 font-medium"
            >
              <Shield className="w-3 h-3" />
              <span>Admin Portal Login</span>
            </Link>
          </div>
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
