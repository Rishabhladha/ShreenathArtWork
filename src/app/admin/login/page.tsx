'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield, Lock, AlertCircle } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(
    urlError === 'unauthorized'
      ? 'Access restricted to gallery administrator and staff accounts.'
      : null
  );
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
        setError('Invalid admin credentials. Please verify your email and password.');
        setSubmitting(false);
      } else {
        // Use hard navigation so the browser immediately sends the new session cookies to the server
        window.location.href = callbackUrl;
      }
    } catch {
      setError('An unexpected error occurred during admin authentication.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#262320] text-[#FAF6EF] rounded-sm flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <span className="text-[10px] uppercase tracking-widest text-[#8A8175] font-sans font-semibold">
            Restricted Access
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#262320]">
            Gallery Admin Portal
          </h1>
          <p className="text-xs text-[#5C554C]">
            SHREENATH ART WORK, Nathdwara
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
              <label className="block text-xs text-[#5C554C]">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                placeholder="owner@shreenathartwork.com"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Password</label>
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
              <span>{submitting ? 'Authenticating...' : 'Sign In to Management'}</span>
            </button>
          </form>
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
          Loading admin portal...
        </div>
      }
    >
      <AdminLoginForm />
    </Suspense>
  );
}

