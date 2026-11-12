'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useSession } from 'next-auth/react';
import { ShoppingBag, Heart, User, Menu, X, Search, MapPin, Sparkles, Phone } from 'lucide-react';
import { PATHS, isPathActive } from '@/lib/paths';

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function Header() {
  const mounted = useMounted();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  const cartItemCount = useCartStore((state) => state.getItemCount());
  const setCartDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  const navLinks = [
    { href: PATHS.catalog(), label: 'All Masterpieces' },
    { href: PATHS.category('pichwai'), label: 'Pichwai' },
    { href: PATHS.category('shreenathji-portraits'), label: 'Sanctum Portraits' },
    { href: PATHS.category('festival-and-utsav'), label: 'Utsav Art' },
    { href: PATHS.category('miniature-art'), label: 'Miniature' },
    { href: PATHS.customOrder, label: 'Custom Commission' },
    { href: PATHS.info.about, label: 'Heritage & Lineage' },
    { href: PATHS.info.contact, label: 'Gallery Darshan' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(PATHS.catalog({ search: searchQuery.trim() }));
      setSearchOpen(false);
    }
  };

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#C5A059] focus:text-[#12100E] focus:px-4 focus:py-2 focus:text-sm font-semibold shadow-lg"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-[#12100E]/98 backdrop-blur-md border-b border-[#C5A059]/30 text-[#FAF6EF] shadow-[0_4px_24px_rgba(0,0,0,0.35)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-22">
            {/* Mobile menu trigger - 44px min touch target */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#FAF6EF] hover:text-[#DFBE72] focus-ring rounded-xs transition-colors"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Gallery Royal Mewar Emblem Branding */}
            <div className="flex flex-col items-center lg:items-start">
              <Link href={PATHS.home} className="group text-center lg:text-left py-1">
                <span className="block font-serif text-lg sm:text-2xl md:text-[26px] tracking-[0.2em] text-[#FAF6EF] font-semibold group-hover:text-[#DFBE72] transition-colors">
                  SHREENATH ART WORK
                </span>
                <div className="flex items-center justify-center lg:justify-start gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DFBE72]" />
                  <span className="block text-[9px] sm:text-[10px] tracking-[0.3em] text-[#DFBE72] uppercase font-sans font-medium">
                    Nathdwara Pichwai Gallery • Est. 400-Yr Lineage
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
              {navLinks.map((link) => {
                const isActive = isPathActive(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`transition-all py-1.5 border-b-2 text-[13px] tracking-wider ${
                      isActive
                        ? 'border-[#DFBE72] text-[#DFBE72] font-semibold shadow-xs'
                        : 'border-transparent text-[#FAF6EF]/80 hover:text-[#DFBE72]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#FAF6EF] hover:text-[#DFBE72] transition-colors focus-ring rounded-xs"
                aria-label="Search paintings"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Order Tracking Quick Link - Desktop & Tablet */}
              <Link
                href={PATHS.trackOrder()}
                className="hidden md:flex items-center text-xs text-[#FAF6EF]/90 hover:text-[#DFBE72] px-3.5 py-2 rounded-xs border border-[#C5A059]/40 hover:border-[#DFBE72] transition-colors min-h-[38px] bg-[#1A1714]/80"
                title="Track your order status"
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#DFBE72]" />
                <span className="font-medium tracking-wide">Track Order</span>
              </Link>

              {/* Wishlist */}
              <Link
                href={PATHS.account.wishlist}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-[#FAF6EF] hover:text-[#DFBE72] transition-colors focus-ring rounded-xs"
                aria-label={mounted ? `Wishlist with ${wishlistCount} items` : 'Wishlist'}
              >
                <Heart className="w-5 h-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-4 h-4 px-1 text-[10px] bg-[#8B1E1E] border border-[#DFBE72]/60 text-white flex items-center justify-center rounded-full font-bold shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Admin Backoffice Quick Link for Authenticated Staff */}
              {session?.user && (session.user.role === 'OWNER' || session.user.role === 'STAFF') && (
                <Link
                  href={PATHS.admin.dashboard}
                  className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-[#8B1E1E] text-white hover:bg-[#731818] px-3 py-2 rounded-xs border border-[#DFBE72]/40 transition-colors"
                  title="Open Gallery Backoffice"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#DFBE72]" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Account */}
              <Link
                href={
                  session?.user
                    ? session.user.role === 'OWNER' || session.user.role === 'STAFF'
                      ? PATHS.admin.dashboard
                      : PATHS.account.profile
                    : PATHS.account.login()
                }
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#FAF6EF] hover:text-[#DFBE72] transition-colors focus-ring rounded-xs"
                aria-label={session?.user ? 'Customer account' : 'Sign in'}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-[#FAF6EF] hover:text-[#DFBE72] transition-colors focus-ring rounded-xs"
                aria-label={mounted ? `Open shopping cart with ${cartItemCount} items` : 'Open shopping cart'}
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-4 h-4 px-1 text-[10px] bg-[#C5A059] text-[#12100E] border border-[#DFBE72] flex items-center justify-center rounded-full font-bold shadow-xs">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Search Input */}
          {searchOpen && (
            <div className="py-3.5 px-3 border-t border-[#C5A059]/30 bg-[#1A1714]">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-3xl mx-auto">
                <input
                  type="search"
                  placeholder="Search sacred paintings by deity, theme, medium or size..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2.5 text-sm bg-[#12100E] border border-[#C5A059]/50 rounded-xs focus-ring text-[#FAF6EF] placeholder-[#82776A]"
                  autoFocus
                />
                <button type="submit" className="btn-primary text-xs py-2 px-5 min-h-[44px]">
                  Search Art
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn-secondary text-xs py-2 px-4 min-h-[44px] bg-[#221E1A] text-[#FAF6EF] border-[#C5A059]/40 hover:bg-[#12100E]"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#C5A059]/30 bg-[#12100E] px-5 pt-4 pb-8 space-y-4 shadow-2xl">
            <nav className="flex flex-col divide-y divide-[#C5A059]/20">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-serif text-[#FAF6EF] hover:text-[#DFBE72] py-3 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-[#DFBE72]">→</span>
                </Link>
              ))}
              <Link
                href={PATHS.trackOrder()}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#DFBE72] py-3 flex items-center justify-between"
              >
                <span>Track Your Sacred Order</span>
                <MapPin className="w-4 h-4 text-[#DFBE72]" />
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href={PATHS.account.profile}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-[#FAF6EF]/80 hover:text-[#DFBE72] py-3"
                  >
                    My Account ({session.user.name || session.user.email})
                  </Link>
                  {(session.user.role === 'OWNER' || session.user.role === 'STAFF') && (
                    <Link
                      href={PATHS.admin.dashboard}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-semibold text-[#DFBE72] py-3 flex items-center justify-between bg-[#1A1714] px-3 my-1 rounded-xs border border-[#C5A059]/40"
                    >
                      <span>Gallery Backoffice Admin Panel</span>
                      <span>→</span>
                    </Link>
                  )}
                </>
              ) : (
                <Link
                  href={PATHS.account.login()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium text-[#FAF6EF]/80 hover:text-[#DFBE72] py-3"
                >
                  Sign In / Collector Account
                </Link>
              )}
            </nav>
            <div className="pt-4 text-xs text-[#82776A] border-t border-[#C5A059]/25 space-y-1.5">
              <p className="font-semibold text-[#FAF6EF] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#DFBE72]" />
                <span>Shreenath Art Work Haveli Workshop</span>
              </p>
              <p>Opposite Shreenathji Temple Sanctum Gate, Nathdwara, Rajasthan 313301</p>
              <div className="flex items-center gap-2 pt-1 text-[#DFBE72]">
                <Phone className="w-3.5 h-3.5" />
                <a href="https://wa.me/919079901405" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  +91 9079901405 (WhatsApp & Darshan Consultation)
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
