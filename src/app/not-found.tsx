import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md space-y-4">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          404 Not Found
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#262320]">
          Artwork or Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#5C554C] leading-relaxed">
          The painting or gallery page you are looking for may have been archived, renamed, or is temporarily unavailable.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Link href="/" className="btn-primary text-xs py-2.5 px-5">
            Return Home
          </Link>
          <Link href="/catalog" className="btn-secondary text-xs py-2.5 px-5">
            Browse Paintings
          </Link>
        </div>
      </div>
    </div>
  );
}

