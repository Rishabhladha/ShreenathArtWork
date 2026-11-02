'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Error Notice
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          Something went wrong
        </h1>
        <p className="text-xs sm:text-sm text-[#5C554C] leading-relaxed">
          An unexpected technical error occurred while loading this page. Our team has been notified.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary text-xs py-2.5 px-5"
          >
            Try Again
          </button>
          <Link href="/" className="btn-secondary text-xs py-2.5 px-5">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

