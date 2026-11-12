'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  KeyRound,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { PasswordInput } from '@/components/common/PasswordInput';

type ResetStep = 'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<ResetStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [devCodeHint, setDevCodeHint] = useState<string | null>(null);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(PATHS.api.auth.resetPassword.sendOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      if (data.devOtp) {
        setDevCodeHint(data.devOtp);
      }

      setStep('OTP');
      setResendCooldown(60);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error sending verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otp.trim();

    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the full 6-digit numeric verification code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(PATHS.api.auth.resetPassword.verifyOtp, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid verification code.');
      }

      setStep('NEW_PASSWORD');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch(PATHS.api.auth.resetPassword.reset, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to reset password.');
      }

      setStep('SUCCESS');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      {/* Title Header */}
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans font-medium">
          Account Security & Recovery
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          {step === 'SUCCESS' ? 'Password Updated' : 'Reset Your Password'}
        </h1>
        <p className="text-xs text-[#5C554C]">
          {step === 'EMAIL' && 'Enter your registered email to receive a 6-digit verification code.'}
          {step === 'OTP' && `Enter the 6-digit verification code sent to ${email}.`}
          {step === 'NEW_PASSWORD' && 'Create a strong, new password for your collector account.'}
          {step === 'SUCCESS' && 'Your account security credentials have been updated.'}
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-5 shadow-2xs">
        {/* Error Notification */}
        {error && (
          <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Development helper banner when testing without live Resend domain */}
        {devCodeHint && step === 'OTP' && (
          <div className="p-3 bg-[#EAF0F6] border border-[#BFD5E9] rounded-sm text-xs text-[#1D4E89] flex items-center justify-between">
            <span>Dev Verification Code: <strong className="font-mono text-sm">{devCodeHint}</strong></span>
            <button
              type="button"
              onClick={() => setOtp(devCodeHint)}
              className="text-[11px] underline font-medium hover:text-[#11325D]"
            >
              Auto-fill
            </button>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 'EMAIL' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#5C554C]">
                Registered Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{loading ? 'Dispatching Code...' : 'Send 6-Digit OTP Code'}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                href={PATHS.account.login()}
                className="text-xs text-[#8A8175] hover:text-[#262320] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[#5C554C]">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('EMAIL');
                    setError(null);
                  }}
                  className="text-[11px] text-[#A85A32] hover:underline"
                >
                  Change Email
                </button>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                autoFocus
              />
              <p className="text-[11px] text-[#8A8175] text-center">
                Code is valid for 10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{loading ? 'Verifying Code...' : 'Verify Code & Proceed'}</span>
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => setStep('EMAIL')}
                className="text-[#8A8175] hover:text-[#262320] flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || loading}
                onClick={() => handleSendOtp()}
                className="text-[#A85A32] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend Code'}
                </span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Enter New Password with Eye Toggle */}
        {step === 'NEW_PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <PasswordInput
              label="New Password (min 8 characters) *"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              autoFocus
            />

            <PasswordInput
              label="Confirm New Password *"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
            />

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{loading ? 'Updating Password...' : 'Save New Password & Sign In'}</span>
            </button>
          </form>
        )}

        {/* STEP 4: Success Screen */}
        {step === 'SUCCESS' && (
          <div className="space-y-4 text-center py-2">
            <div className="w-12 h-12 bg-[#EAF3EB] text-[#2A5C38] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-lg font-semibold text-[#262320]">
                Password Reset Successfully
              </h2>
              <p className="text-xs text-[#5C554C] leading-relaxed">
                Your account password has been updated. You can now securely sign in to your collector portal.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href={PATHS.account.login()}
                className="btn-primary w-full text-xs py-3 flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ShieldCheck className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
