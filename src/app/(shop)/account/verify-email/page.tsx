'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, RotateCw, ShieldCheck } from 'lucide-react';
import { PATHS } from '@/lib/paths';

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';
  const callbackUrl = searchParams.get('callbackUrl') || PATHS.account.profile;

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(
    initialEmail
      ? `A 6-digit verification code has been dispatched to ${initialEmail}. Please check your inbox and spam folder.`
      : null
  );
  const [cooldown, setCooldown] = useState(60);
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);

  // Live countdown timer for resending OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const cleanOtp = otp.trim();
    if (!/^\d{6}$/.test(cleanOtp)) {
      setError('Please enter the 6-digit numeric verification code.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(PATHS.api.auth.verifyEmail.verifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: cleanOtp }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code');
      }

      setVerifiedSuccess(true);
      setMessage('Email verified successfully! Preparing your account...');

      // Smooth redirection to sign-in or destination
      setTimeout(() => {
        window.location.href = callbackUrl.startsWith('/checkout')
          ? PATHS.account.login(callbackUrl)
          : callbackUrl;
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to verify code');
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setResending(true);

    try {
      const res = await fetch(PATHS.api.auth.verifyEmail.sendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch new code');
      }

      setMessage(`A fresh 6-digit code has been dispatched to ${email}.`);
      setCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#262320] text-[#DEC99C] rounded-sm flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans font-medium">
          Patron Verification
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          Verify Your Email
        </h1>
        <p className="text-xs text-[#5C554C]">
          Authenticating your Nathdwara sacred art collector account.
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-5 shadow-2xs">
        {verifiedSuccess ? (
          <div className="p-6 bg-[#EBF5EE] border border-[#B7D8BD] rounded-sm text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-[#2A5C38] mx-auto" />
            <p className="font-serif text-base font-semibold text-[#2A5C38]">
              Email Verified Successfully
            </p>
            <p className="text-xs text-[#5C554C]">
              Your account is active. Redirecting you to your destination...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && !error && (
              <div className="p-3 bg-[#FAF7EE] border border-[#DEC99C] rounded-sm text-xs text-[#7A4B1A] flex items-start gap-2">
                <Mail className="w-4 h-4 shrink-0 mt-0.5 text-[#A85A32]" />
                <span>{message}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#5C554C]">Account Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[#5C554C]">
                    6-Digit Verification Code
                  </label>
                  <span className="text-[10px] text-[#8A8175]">Valid for 10 min</span>
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-3 py-2.5 text-center font-mono text-xl tracking-[0.4em] bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320] font-bold"
                  placeholder="------"
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
              >
                <span>{loading ? 'Verifying Code...' : 'Verify Email & Continue'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-3 border-t border-[#ECE5DA] flex items-center justify-between text-xs text-[#5C554C]">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || resending}
                className="text-[#A85A32] hover:underline disabled:text-[#8A8175] disabled:no-underline flex items-center gap-1 font-medium"
              >
                <RotateCw className={`w-3 h-3 ${resending ? 'animate-spin' : ''}`} />
                <span>
                  {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}
                </span>
              </button>

              <Link
                href={PATHS.account.login(callbackUrl)}
                className="text-[#262320] hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto p-12 text-center text-xs text-[#8A8175]">
          Loading verification portal...
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
