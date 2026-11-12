'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useSession } from 'next-auth/react';
import { ShoppingBag, Heart, User, Menu, X, Search, MapPin, Sparkles } from 'lucide-react';
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
    { href: PATHS.catalog(), label: 'All Paintings' },
    { href: PATHS.category('pichwai'), label: 'Pichwai' },
    { href: PATHS.category('shreenathji-portraits'), label: 'Sanctum Portraits' },
    { href: PATHS.category('festival-and-utsav'), label: 'Festival Art' },
    { href: PATHS.category('miniature-art'), label: 'Miniature' },
    { href: PATHS.customOrder, label: 'Custom Orders' },
    { href: PATHS.info.about, label: 'About' },
    { href: PATHS.info.contact, label: 'Contact' },
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#231C10] focus:text-[#FAF7EE] focus:px-4 focus:py-2 focus:text-sm shadow-md"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DEC99C] shadow-[0_2px_12px_rgba(35,28,16,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger - 44px min touch target */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#231C10] hover:text-[#B8860B] focus-ring rounded-sm"
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Gallery Branding */}
            <div className="flex flex-col items-center lg:items-start">
              <Link href={PATHS.home} className="group text-center lg:text-left py-1">
                <span className="block font-serif text-lg sm:text-2xl tracking-[0.18em] text-[#231C10] font-semibold group-hover:text-[#B8860B] transition-colors">
                  SHREENATH ART WORK
                </span>
                <span className="block text-[9px] sm:text-[10px] tracking-[0.28em] text-[#B8860B] uppercase font-sans font-medium mt-0.5">
                  Nathdwara, Rajasthan
                </span>
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
                    className={`transition-colors py-1.5 border-b-2 text-[13px] tracking-wide ${
                      isActive
                        ? 'border-[#B8860B] text-[#B8860B] font-semibold'
                        : 'border-transparent text-[#4A3E2D] hover:text-[#B8860B]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions with Accessible 44px Touch Targets */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#231C10] hover:text-[#B8860B] transition-colors focus-ring rounded-sm"
                aria-label="Search paintings"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Order Tracking Quick Link - Desktop & Tablet */}
              <Link
                href={PATHS.trackOrder()}
                className="hidden md:flex items-center text-xs text-[#4A3E2D] hover:text-[#231C10] px-3 py-2 rounded-xs border border-[#DEC99C] hover:border-[#231C10] transition-colors min-h-[38px]"
                title="Track your order status"
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#B8860B]" />
                <span className="font-medium">Track Order</span>
              </Link>

              {/* Wishlist */}
              <Link
                href={PATHS.account.wishlist}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-[#231C10] hover:text-[#B8860B] transition-colors focus-ring rounded-sm"
                aria-label={mounted ? `Wishlist with ${wishlistCount} items` : 'Wishlist'}
              >
                <Heart className="w-5 h-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-4 h-4 px-1 text-[10px] bg-[#B8860B] text-white flex items-center justify-center rounded-full font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Admin Backoffice Quick Link for Authenticated Staff */}
              {session?.user && (session.user.role === 'OWNER' || session.user.role === 'STAFF') && (
                <Link
                  href={PATHS.admin.dashboard}
                  className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold bg-[#231C10] text-[#FAF7EE] hover:bg-[#A85A32] px-3 py-2 rounded-xs border border-[#231C10] transition-colors"
                  title="Open Gallery Backoffice"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
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
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#231C10] hover:text-[#B8860B] transition-colors focus-ring rounded-sm"
                aria-label={session?.user ? 'Customer account' : 'Sign in'}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative min-h-[44px] min-w-[44px] flex items-center justify-center text-[#231C10] hover:text-[#B8860B] transition-colors focus-ring rounded-sm"
                aria-label={mounted ? `Open shopping cart with ${cartItemCount} items` : 'Open shopping cart'}
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute top-2 right-2 min-w-4 h-4 px-1 text-[10px] bg-[#231C10] text-[#FAF7EE] flex items-center justify-center rounded-full font-bold">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Search Input */}
          {searchOpen && (
            <div className="py-3 px-2 border-t border-[#DEC99C] bg-[#FAF7EE]">
              <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-3xl mx-auto">
                <input
                  type="search"
                  placeholder="Search by painting title, theme, medium or size..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-[#DEC99C] rounded-xs focus-ring text-[#231C10]"
                  autoFocus
                />
                <button type="submit" className="btn-primary text-xs py-2 px-5 min-h-[44px]">
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn-secondary text-xs py-2 px-4 min-h-[44px]"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#DEC99C] bg-[#FAF7EE] px-5 pt-4 pb-8 space-y-4 shadow-xl">
            <nav className="flex flex-col divide-y divide-[#DEC99C]/60">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base font-serif text-[#231C10] hover:text-[#B8860B] py-3 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <span className="text-xs text-[#7A694F]">→</span>
                </Link>
              ))}
              <Link
                href={PATHS.trackOrder()}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-[#4A3E2D] hover:text-[#231C10] py-3 flex items-center justify-between"
              >
                <span>Track Your Order</span>
                <MapPin className="w-4 h-4 text-[#B8860B]" />
              </Link>
              {session?.user ? (
                <>
                  <Link
                    href={PATHS.account.profile}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-[#4A3E2D] hover:text-[#231C10] py-3"
                  >
                    My Account ({session.user.name || session.user.email})
                  </Link>
                  {(session.user.role === 'OWNER' || session.user.role === 'STAFF') && (
                    <Link
                      href={PATHS.admin.dashboard}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-sm font-semibold text-[#B8860B] py-3 flex items-center justify-between"
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
                  className="text-sm font-medium text-[#4A3E2D] hover:text-[#231C10] py-3"
                >
                  Sign In / Register
                </Link>
              )}
            </nav>
            <div className="pt-4 text-xs text-[#7A694F] border-t border-[#DEC99C] space-y-1">
              <p className="font-semibold text-[#231C10]">Shreenath Art Work Gallery</p>
              <p>Opposite Temple Gate, Nathdwara, Rajasthan 313301</p>
              <p>WhatsApp / Call: +91 9079901405</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
