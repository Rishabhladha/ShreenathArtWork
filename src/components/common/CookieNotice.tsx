'use client';

import React, { useState, useSyncExternalStore } from 'react';

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
};

export function CookieNotice() {
  const hasConsent = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return Boolean(localStorage.getItem('shreenath_cookie_consent'));
      } catch {
        return true;
      }
    },
    () => true
  );

  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    try {
      localStorage.setItem('shreenath_cookie_consent', 'true');
    } catch {
      // Ignore
    }
    setDismissed(true);
  };

  if (hasConsent || dismissed) return null;

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

