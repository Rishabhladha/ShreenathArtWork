'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { Shield, Lock, AlertCircle, ArrowRight, UserCheck, LogOut, Info } from 'lucide-react';
import { PATHS } from '@/lib/paths';
import { PasswordInput } from '@/components/common/PasswordInput';

function getSafeRedirectUrl(url: string | null, fallback: string): string {
  if (!url) return fallback;
  if (url.startsWith('/') && !url.startsWith('//') && !url.startsWith('/\\')) {
    return url;
  }
  return fallback;
}

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = getSafeRedirectUrl(searchParams.get('callbackUrl'), PATHS.admin.dashboard);
  const urlError = searchParams.get('error');

  const { data: session, status: sessionStatus } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    urlError === 'unauthorized'
      ? 'Access restricted. This account does not have administrator privileges (requires OWNER or STAFF role).'
      : null
  );
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated as an administrator, navigate to dashboard
  useEffect(() => {
    if (sessionStatus === 'authenticated' && session?.user) {
      if (session.user.role === 'OWNER' || session.user.role === 'STAFF') {
        window.location.href = callbackUrl;
      }
    }
  }, [sessionStatus, session, callbackUrl]);

  const isCustomerLoggedIn =
    sessionStatus === 'authenticated' &&
    session?.user &&
    session.user.role !== 'OWNER' &&
    session.user.role !== 'STAFF';

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
        setError('Invalid email address or password. Please verify your administrator credentials.');
        setSubmitting(false);
        return;
      }

      // Hard redirect to admin dashboard. The server-side layout and page
      // verify OWNER/STAFF role from the fresh cookie directly.
      window.location.href = callbackUrl;
    } catch {
      setError('An unexpected technical error occurred during admin authentication.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#262320] text-[#FAF6EF] rounded-sm flex items-center justify-center mx-auto shadow-xs">
            <Shield className="w-6 h-6 text-[#DEC99C]" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#8A8175] font-sans font-semibold">
            Gallery Management
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#262320]">
            Administrator Portal
          </h1>
          <p className="text-xs text-[#5C554C]">
            SHREENATH ART WORK, Nathdwara
          </p>
        </div>

        <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-5 shadow-sm">
          {/* Active Customer Session Notice */}
          {isCustomerLoggedIn && (
            <div className="p-3.5 bg-[#FAF1E8] border border-[#DEC99C] rounded-sm text-xs text-[#7A4B1A] space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#A85A32]" />
                <div>
                  <p className="font-semibold text-[#262320]">
                    Signed in as Customer ({session.user.email})
                  </p>
                  <p className="text-[11px] text-[#5C554C] mt-0.5">
                    To access backoffice management, please sign in with an authorized OWNER or STAFF account below.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-[#DEC99C]/60 flex items-center justify-between text-[11px]">
                <Link
                  href={PATHS.account.profile}
                  className="text-[#A85A32] hover:underline font-medium"
                >
                  Go to Customer Account
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ redirect: false })}
                  className="text-[#8C2B2B] hover:underline font-medium flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#5C554C]">Admin Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="owner@shreenathartwork.com"
              />
            </div>

            <PasswordInput
              label="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter administrator password"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60 shadow-xs"
            >
              <Lock className="w-3.5 h-3.5 text-[#DEC99C]" />
              <span>{submitting ? 'Authenticating Privileges...' : 'Sign In to Management'}</span>
            </button>
          </form>

          <div className="pt-3 border-t border-[#ECE5DA] text-center text-[11px] text-[#7A7165]">
            <span>Need customer support or tracking? </span>
            <Link href={PATHS.trackOrder()} className="text-[#A85A32] underline hover:text-[#8F4824]">
              Track an order
            </Link>
            <span> • </span>
            <Link href={PATHS.account.login()} className="text-[#A85A32] underline hover:text-[#8F4824]">
              Customer login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto p-12 text-center text-xs text-[#8A8175]">
          Loading administrator portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}
