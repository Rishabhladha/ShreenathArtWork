'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate brief network delay
    await new Promise((r) => setTimeout(r, 600));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Account Recovery
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          Reset Your Password
        </h1>
        <p className="text-xs text-[#5C554C]">
          Enter your registered email address to receive password reset assistance.
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="w-10 h-10 bg-[#E8F0E6] text-[#2B5E26] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-serif text-lg font-medium text-[#262320]">
                Recovery Instructions Dispatched
              </h2>
              <p className="text-xs text-[#5C554C] leading-relaxed">
                If an account exists for <strong>{email}</strong>, we have sent instructions. You can also reach our Nathdwara workshop directly on WhatsApp at <strong>+91 9079901405</strong>.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/account/login"
                className="btn-primary w-full text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Registered Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-xs py-3 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending Instructions...' : 'Send Reset Instructions'}</span>
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/account/login"
                className="text-xs text-[#8A8175] hover:text-[#262320] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
