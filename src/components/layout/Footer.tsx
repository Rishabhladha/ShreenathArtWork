'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PATHS } from '@/lib/paths';

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
      const res = await fetch(PATHS.api.newsletter, {
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
    <footer className="bg-[#1C1917] text-[#FAF7EE] border-t border-[#382D1C] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Gallery Info */}
          <div className="lg:col-span-2 space-y-4">
            <span className="block font-serif text-2xl tracking-wider text-[#FAF7EE] font-semibold">
              SHREENATH ART WORK
            </span>
            <p className="text-xs tracking-[0.2em] uppercase text-[#B8860B] font-sans font-medium">
              Devotional Art Gallery, Nathdwara
            </p>
            <p className="text-sm text-[#A8A29E] leading-relaxed max-w-sm">
              Authentic hand painted Pichwai, sacred sanctum portraits, and festival compositions of Shreenathji, made and framed with traditional methods in Nathdwara.
            </p>
            <div className="pt-2 space-y-2.5 text-xs text-[#A8A29E]">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#B8860B] shrink-0 mt-0.5" />
                <span>Opposite Temple Gate, Nathdwara, Rajasthan 313301</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#B8860B] shrink-0" />
                <a
                  href="https://wa.me/919079901405"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#C59B27] transition-colors py-1"
                >
                  9079901405 (WhatsApp & Calls)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#B8860B] shrink-0" />
                <a
                  href="mailto:shreenathartwork@gmail.com"
                  className="hover:text-[#C59B27] transition-colors py-1"
                >
                  shreenathartwork@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#B8860B] shrink-0" />
                <span>Monday to Sunday: 9:00 AM to 8:30 PM (Darshan)</span>
              </div>
            </div>
          </div>

          {/* Collection Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#FAF7EE] tracking-wide">
              Paintings
            </h3>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li>
                <Link href={PATHS.category('pichwai')} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Pichwai Art
                </Link>
              </li>
              <li>
                <Link href={PATHS.category('shreenathji-portraits')} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Sanctum Portraits
                </Link>
              </li>
              <li>
                <Link href={PATHS.category('festival-and-utsav')} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Festival and Utsav
                </Link>
              </li>
              <li>
                <Link href={PATHS.category('miniature-art')} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Miniature Artworks
                </Link>
              </li>
              <li>
                <Link href={PATHS.customOrder} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Custom Painting Request
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Assistance */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#FAF7EE] tracking-wide">
              Information
            </h3>
            <ul className="space-y-2 text-xs text-[#A8A29E]">
              <li>
                <Link href={PATHS.info.about} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Our Story and Heritage
                </Link>
              </li>
              <li>
                <Link href={PATHS.trackOrder()} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href={PATHS.info.faq} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link href={PATHS.info.shippingReturns} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Shipping and Safe Packaging
                </Link>
              </li>
              <li>
                <Link href={PATHS.info.privacy} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href={PATHS.info.terms} className="hover:text-[#C59B27] transition-colors inline-block py-1">
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#FAF7EE] tracking-wide">
              Gallery Dispatch
            </h3>
            <p className="text-xs text-[#A8A29E] leading-relaxed">
              Receive updates on newly completed paintings, seasonal utsav collections, and temple exhibitions.
            </p>

            {status === 'success' ? (
              <div className="p-3 bg-[#231C10] border border-[#DEC99C] text-xs text-[#86EFAC] flex items-center gap-2 rounded-xs">
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
                    className="w-full px-3 py-2.5 text-xs bg-[#2B2621] border border-[#3D352C] rounded-l-xs focus-ring text-[#FAF7EE] placeholder-[#78716C] min-h-[44px]"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[#B8860B] text-white px-4 py-2.5 text-xs hover:bg-[#9E7205] transition-colors rounded-r-xs disabled:opacity-60 flex items-center justify-center min-h-[44px] min-w-[44px]"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-4 h-4" />
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
        <div className="pt-8 mt-8 border-t border-[#382D1C] flex flex-col sm:flex-row items-center justify-between text-xs text-[#78716C] gap-4">
          <p>
            Copyright {new Date().getFullYear()} SHREENATH ART WORK. Nathdwara, Rajasthan.
          </p>
          <div className="flex items-center gap-5">
            <Link href={PATHS.info.privacy} className="hover:text-[#C59B27] transition-colors py-1">
              Privacy
            </Link>
            <Link href={PATHS.info.terms} className="hover:text-[#C59B27] transition-colors py-1">
              Terms
            </Link>
            <Link href={PATHS.info.shippingReturns} className="hover:text-[#C59B27] transition-colors py-1">
              Shipping
            </Link>
            <Link href={PATHS.info.contact} className="hover:text-[#C59B27] transition-colors py-1">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
