'use client';

import React, { useState, useEffect } from 'react';

export function CookieNotice() {
  const [acknowledged, setAcknowledged] = useState(true);

  useEffect(() => {
    const hasSeen = localStorage.getItem('shreenath_cookie_consent');
    if (!hasSeen) {
      setAcknowledged(false);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('shreenath_cookie_consent', 'true');
    setAcknowledged(true);
  };

  if (acknowledged) return null;

  return (
    <aside aria-label="Privacy and cookies" className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-4 bg-[#FAF7F2] border border-[#D1C6B4] shadow-md rounded-sm text-xs text-[#5C554C]">
      <p className="leading-relaxed">
        We use essential cookies strictly to maintain your session and shopping cart. No third-party ad tracking cookies are used.
      </p>
      <div className="mt-3 flex items-center justify-end gap-3">
        <a
          href="/privacy"
          className="text-[#262320] underline hover:text-[#C47820] transition-colors"
        >
          Privacy Policy
        </a>
        <button
          type="button"
          onClick={handleDismiss}
          className="btn-primary text-xs py-1.5 px-3"
        >
          Understood
        </button>
      </div>
    </aside>
  );
}

