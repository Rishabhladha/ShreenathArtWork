'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

export function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setStatus('success');
      setEmail('');
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Please check your email and try again');
    }
  };

  return (
    <footer className="bg-[#161412] text-[#E7E5E4] border-t border-[#292522] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Gallery Info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="block font-serif text-2xl tracking-wider text-[#FAF9F5] font-semibold">
              SHREENATH ART WORK
            </span>
            <p className="text-xs tracking-[0.2em] uppercase text-[#B8511B] font-sans font-medium">
              Devotional Art Gallery, Nathdwara
            </p>
            <p className="text-sm text-[#A8A29E] leading-relaxed max-w-sm">
              Authentic hand painted Pichwai, sacred sanctum portraits, and festival compositions of Shreenathji, made and framed with traditional methods in Nathdwara.
            </p>
            <div className="pt-2 space-y-2.5 text-xs text-[#A8A29E]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B8511B] shrink-0 mt-0.5" />
                <span>Opposite Temple Gate, Nathdwara, Rajasthan 313301</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B8511B] shrink-0" />
                <a
                  href="https://wa.me/919079901405"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FBBF24] transition-colors"
                >
                  9079901405 (WhatsApp & Calls)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B8511B] shrink-0" />
                <a
                  href="mailto:shreenathartwork@gmail.com"
                  className="hover:text-[#FBBF24] transition-colors"
                >
                  shreenathartwork@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B8511B] shrink-0" />
                <span>Monday to Sunday: 9:00 AM to 8:30 PM</span>
              </div>
            </div>
          </div>

          {/* Collection Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#FAF9F5] tracking-wide">
              Paintings
            </h3>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li>
                <Link href="/catalog?category=pichwai" className="hover:text-[#FBBF24] transition-colors">
                  Pichwai Art
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=shreenathji-portraits" className="hover:text-[#FBBF24] transition-colors">
                  Sanctum Portraits
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=festival-and-utsav" className="hover:text-[#FBBF24] transition-colors">
                  Festival and Utsav
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=miniature-art" className="hover:text-[#FBBF24] transition-colors">
                  Miniature Artworks
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=large-format" className="hover:text-[#FBBF24] transition-colors">
                  Large Format Works
                </Link>
              </li>
              <li>
                <Link href="/custom-order" className="hover:text-[#FBBF24] transition-colors">
                  Custom Painting Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Assistance */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#FAF9F5] tracking-wide">
              Information
            </h3>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li>
                <Link href="/about" className="hover:text-[#FBBF24] transition-colors">
                  Our Story and Heritage
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-[#FBBF24] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-[#FBBF24] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns" className="hover:text-[#FBBF24] transition-colors">
                  Shipping and Safe Packaging
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#FBBF24] transition-colors">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FBBF24] transition-colors">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#FAF9F5] tracking-wide">
              Gallery Dispatch
            </h3>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Receive updates on newly completed paintings, seasonal utsav collections, and exhibitions. We do not spam.
            </p>

            {status === 'success' ? (
              <div className="p-3 bg-[#24211D] border border-[#3E3832] text-xs text-[#86EFAC] flex items-center gap-2 rounded-sm">
                <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                <span>Thank you. Your email has been registered for gallery dispatches.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#24211D] border border-[#3E3832] rounded-l-sm focus-ring text-[#FAF9F5] placeholder-[#78716C]"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[#B8511B] text-white px-3.5 py-2 text-xs hover:bg-[#9A4214] transition-colors rounded-r-sm disabled:opacity-60 flex items-center justify-center"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-[11px] text-[#F87171]">{errorMessage}</p>
                )}
              </form>
            )}
            <p className="text-[11px] text-[#78716C]">
              Insured packing with moisture-sealed wooden boxes for transit across India.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-[#292522] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <p>
            Copyright {new Date().getFullYear()} SHREENATH ART WORK. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-[#FBBF24] transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#FBBF24] transition-colors">
              Terms
            </Link>
            <Link href="/shipping-returns" className="hover:text-[#FBBF24] transition-colors">
              Shipping
            </Link>
            <Link href="/contact" className="hover:text-[#FBBF24] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

