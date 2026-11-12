'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Phone, Mail, MapPin, Clock, ArrowRight, CheckCircle2, Sparkles, Award } from 'lucide-react';
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
    <footer className="bg-[#12100E] text-[#FAF6EF] border-t border-[#C5A059]/30 mt-auto shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Gallery Info & Royal Provenance */}
          <div className="lg:col-span-2 space-y-4">
            <span className="block font-serif text-2xl sm:text-3xl tracking-[0.16em] text-[#FAF6EF] font-semibold">
              SHREENATH ART WORK
            </span>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-[#DFBE72]" />
              <p className="text-xs tracking-[0.24em] uppercase text-[#DFBE72] font-sans font-medium">
                Nathdwara Pichwai & Haveli Art Lineage
              </p>
            </div>
            <p className="text-sm text-[#FAF6EF]/75 leading-relaxed max-w-sm font-light">
              Authentic hand painted Pichwai, sacred sanctum portraits, and festival compositions of Shreenathji, crafted with 24kt gold leaf and natural stone pigments in Nathdwara, Rajasthan.
            </p>
            <div className="pt-2 space-y-2.5 text-xs text-[#FAF6EF]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#DFBE72] shrink-0 mt-0.5" />
                <span>Opposite Shreenathji Temple Sanctum Gate, Nathdwara 313301</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#DFBE72] shrink-0" />
                <a
                  href="https://wa.me/919079901405"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#DFBE72] transition-colors py-1 font-medium"
                >
                  +91 9079901405 (WhatsApp & Darshan Inquiries)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#DFBE72] shrink-0" />
                <a
                  href="mailto:shreenathartwork@gmail.com"
                  className="hover:text-[#DFBE72] transition-colors py-1"
                >
                  shreenathartwork@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#DFBE72] shrink-0" />
                <span>Monday to Sunday: 9:00 AM to 8:30 PM (Darshan Timings)</span>
              </div>
            </div>
          </div>

          {/* Collection Links */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#DFBE72] tracking-wider uppercase text-xs">
              Sacred Collections
            </h3>
            <ul className="space-y-2 text-xs text-[#FAF6EF]/75">
              <li>
                <Link href={PATHS.category('pichwai')} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Pichwai Paintings
                </Link>
              </li>
              <li>
                <Link href={PATHS.category('shreenathji-portraits')} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Sanctum Portraits
                </Link>
              </li>
              <li>
                <Link href={PATHS.category('festival-and-utsav')} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Festival & Utsav Art
                </Link>
              </li>
              <li>
                <Link href={PATHS.category('miniature-art')} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Miniature Artworks
                </Link>
              </li>
              <li>
                <Link href={PATHS.customOrder} className="hover:text-[#DFBE72] transition-colors inline-block py-1 font-medium text-[#DFBE72]">
                  Commission Custom Painting →
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Assistance */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#DFBE72] tracking-wider uppercase text-xs">
              Collector Knowledge
            </h3>
            <ul className="space-y-2 text-xs text-[#FAF6EF]/75">
              <li>
                <Link href={PATHS.info.about} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  400-Year Mewar Lineage
                </Link>
              </li>
              <li>
                <Link href={PATHS.trackOrder()} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Track Your Shipment
                </Link>
              </li>
              <li>
                <Link href={PATHS.info.faq} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Authentication & FAQ
                </Link>
              </li>
              <li>
                <Link href={PATHS.info.shippingReturns} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Insured Wooden Crating
                </Link>
              </li>
              <li>
                <Link href={PATHS.info.privacy} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href={PATHS.info.terms} className="hover:text-[#DFBE72] transition-colors inline-block py-1">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-semibold text-[#DFBE72] tracking-wider uppercase text-xs">
              Haveli Dispatch
            </h3>
            <p className="text-xs text-[#FAF6EF]/75 leading-relaxed font-light">
              Receive updates on newly completed masterworks, seasonal utsav collections, and exhibitions.
            </p>

            {status === 'success' ? (
              <div className="p-3 bg-[#1A1714] border border-[#C5A059] text-xs text-[#86EFAC] flex items-center gap-2 rounded-xs">
                <CheckCircle2 className="w-4 h-4 text-[#86EFAC] shrink-0" />
                <span>Thank you. Your email has been registered for gallery dispatches.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex">
                  <input
                    type="email"
                    required
                    placeholder="Enter collector email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#1A1714] border border-[#C5A059]/40 rounded-l-xs focus-ring text-[#FAF6EF] placeholder-[#82776A] min-h-[44px]"
                  />
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="bg-[#8B1E1E] text-white px-4 py-2.5 text-xs hover:bg-[#731818] transition-colors rounded-r-xs disabled:opacity-60 flex items-center justify-center min-h-[44px] min-w-[44px] border border-[#C5A059]/40 border-l-0"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-4 h-4 text-[#DFBE72]" />
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-[11px] text-[#F87171]">{errorMessage}</p>
                )}
              </form>
            )}
            <p className="text-[11px] text-[#FAF6EF]/60 font-light flex items-center gap-1.5 pt-1">
              <Sparkles className="w-3 h-3 text-[#DFBE72]" />
              <span>Insured reinforced wooden crates for all shipments.</span>
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-[#C5A059]/25 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FAF6EF]/60 gap-4">
          <p>
            Copyright {new Date().getFullYear()} SHREENATH ART WORK. Nathdwara, Rajasthan. All sacred artworks protected.
          </p>
          <div className="flex items-center gap-5">
            <Link href={PATHS.info.privacy} className="hover:text-[#DFBE72] transition-colors py-1">
              Privacy
            </Link>
            <Link href={PATHS.info.terms} className="hover:text-[#DFBE72] transition-colors py-1">
              Terms
            </Link>
            <Link href={PATHS.info.shippingReturns} className="hover:text-[#DFBE72] transition-colors py-1">
              Shipping
            </Link>
            <Link href={PATHS.info.contact} className="hover:text-[#DFBE72] transition-colors py-1">
              Darshan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
