'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useSession } from 'next-auth/react';
import { ShoppingBag, Heart, User, Menu, X, Search, MapPin } from 'lucide-react';
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
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#262320] focus:text-[#FAF6EF] focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#DEC99C] shadow-[0_2px_12px_rgba(35,28,16,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-[#1C1917] hover:text-[#B8511B] focus-ring"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Gallery Branding */}
            <div className="flex flex-col items-center lg:items-start">
              <Link href={PATHS.home} className="group text-center lg:text-left">
                <span className="block font-serif text-xl sm:text-2xl tracking-widest text-[#1C1917] font-semibold group-hover:text-[#B8511B] transition-colors">
                  SHREENATH ART WORK
                </span>
                <span className="block text-[10px] tracking-[0.25em] text-[#B8511B] uppercase font-sans font-medium">
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
                    className={`transition-colors py-1 border-b-2 text-[13px] tracking-wide ${
                      isActive
                        ? 'border-[#B8511B] text-[#B8511B] font-semibold'
                        : 'border-transparent text-[#44403C] hover:text-[#B8511B]'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Header Right Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Search Toggle */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-[#1C1917] hover:text-[#B8511B] transition-colors focus-ring"
                aria-label="Search paintings"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Order Tracking Quick Link */}
              <Link
                href={PATHS.trackOrder()}
                className="hidden md:flex items-center text-xs text-[#44403C] hover:text-[#1C1917] px-2.5 py-1.5 rounded-sm border border-[#E7E2D8] hover:border-[#1C1917] transition-colors"
                title="Track your order"
              >
                <MapPin className="w-3.5 h-3.5 mr-1 text-[#B8511B]" />
                <span>Track Order</span>
              </Link>

              {/* Wishlist */}
              <Link
                href={PATHS.account.wishlist}
                className="relative p-2 text-[#1C1917] hover:text-[#B8511B] transition-colors focus-ring"
                aria-label={mounted ? `Wishlist with ${wishlistCount} items` : 'Wishlist'}
              >
                <Heart className="w-5 h-5" />
                {mounted && wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] bg-[#B8511B] text-white flex items-center justify-center rounded-sm font-medium">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account */}
              <Link
                href={
                  session?.user
                    ? session.user.role === 'OWNER' || session.user.role === 'STAFF'
                      ? PATHS.admin.dashboard
                      : PATHS.account.profile
                    : PATHS.account.login()
                }
                className="p-2 text-[#1C1917] hover:text-[#B8511B] transition-colors focus-ring"
                aria-label={session?.user ? 'Customer account' : 'Sign in'}
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setCartDrawerOpen(true)}
                className="relative p-2 text-[#1C1917] hover:text-[#B8511B] transition-colors focus-ring"
                aria-label={mounted ? `Open shopping cart with ${cartItemCount} items` : 'Open shopping cart'}
              >
                <ShoppingBag className="w-5 h-5" />
                {mounted && cartItemCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 text-[10px] bg-[#B8511B] text-white flex items-center justify-center rounded-sm font-medium">
                    {cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Search Input */}
          {searchOpen && (
            <div className="py-3 px-2 border-t border-[#E2DACD] bg-[#FAF6EF]">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <input
                  type="search"
                  placeholder="Search by painting title, theme, medium or size..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  autoFocus
                />
                <button type="submit" className="btn-primary text-xs py-2 px-4">
                  Search
                </button>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="btn-secondary text-xs py-2 px-3"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#E2DACD] bg-[#FAF6EF] px-4 pt-4 pb-6 space-y-3">
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-base text-[#262320] hover:text-[#C47820] py-2 border-b border-[#ECE5DA]"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={PATHS.trackOrder()}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-[#5C554C] hover:text-[#262320] py-2"
              >
                Track Order
              </Link>
              <Link
                href={PATHS.account.wishlist}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm text-[#5C554C] hover:text-[#262320] py-2"
              >
                Wishlist ({wishlistCount})
              </Link>
              {session?.user ? (
                <Link
                  href={PATHS.account.profile}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-[#5C554C] hover:text-[#262320] py-2"
                >
                  My Account ({session.user.name || session.user.email})
                </Link>
              ) : (
                <Link
                  href={PATHS.account.login()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm text-[#5C554C] hover:text-[#262320] py-2"
                >
                  Sign In / Register
                </Link>
              )}
            </nav>
            <div className="pt-4 text-xs text-[#8A8175] border-t border-[#ECE5DA]">
              <p>Nathdwara, Rajasthan 313301</p>
              <p className="mt-1">Phone / WhatsApp: 9079901405</p>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
