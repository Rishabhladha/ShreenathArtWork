'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, ShoppingBag, Package } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { PATHS } from '@/lib/paths';

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

export function MobileBottomBar() {
  const mounted = useMounted();
  const pathname = usePathname();

  const cartItemCount = useCartStore((state) => state.getItemCount());
  const setCartDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  // Hidden on administrative dashboard views to keep backoffice clear
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const isHomeActive = pathname === PATHS.home;
  const isCatalogActive = pathname.startsWith('/catalog') || pathname.startsWith('/category');
  const isWishlistActive = pathname.startsWith('/account/wishlist');
  const isTrackActive = pathname.startsWith('/track-order') || pathname.startsWith('/account');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#12100E]/96 backdrop-blur-md border-t border-[#C5A059]/35 text-[#FAF6EF] shadow-[0_-6px_24px_rgba(0,0,0,0.5)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {/* 1. Home */}
        <Link
          href={PATHS.home}
          prefetch={true}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors relative ${
            isHomeActive ? 'text-[#DFBE72]' : 'text-[#FAF6EF]/65 hover:text-[#FAF6EF]'
          }`}
          aria-label="Home"
        >
          {isHomeActive && (
            <span className="absolute top-0 inset-x-4 h-0.5 bg-[#DFBE72] rounded-full shadow-[0_0_8px_#DFBE72]" />
          )}
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
          <span className={`text-[10px] tracking-wider mt-1 font-medium ${isHomeActive ? 'font-semibold text-[#DFBE72]' : ''}`}>
            Home
          </span>
        </Link>

        {/* 2. Masterpieces Catalog */}
        <Link
          href={PATHS.catalog()}
          prefetch={true}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors relative ${
            isCatalogActive ? 'text-[#DFBE72]' : 'text-[#FAF6EF]/65 hover:text-[#FAF6EF]'
          }`}
          aria-label="Paintings Catalog"
        >
          {isCatalogActive && (
            <span className="absolute top-0 inset-x-4 h-0.5 bg-[#DFBE72] rounded-full shadow-[0_0_8px_#DFBE72]" />
          )}
          <Compass className={`w-5 h-5 ${isCatalogActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
          <span className={`text-[10px] tracking-wider mt-1 font-medium ${isCatalogActive ? 'font-semibold text-[#DFBE72]' : ''}`}>
            Paintings
          </span>
        </Link>

        {/* 3. Wishlist */}
        <Link
          href={PATHS.account.wishlist}
          prefetch={true}
          className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            isWishlistActive ? 'text-[#DFBE72]' : 'text-[#FAF6EF]/65 hover:text-[#FAF6EF]'
          }`}
          aria-label={mounted ? `Wishlist with ${wishlistCount} paintings` : 'Wishlist'}
        >
          {isWishlistActive && (
            <span className="absolute top-0 inset-x-4 h-0.5 bg-[#DFBE72] rounded-full shadow-[0_0_8px_#DFBE72]" />
          )}
          <div className="relative">
            <Heart className={`w-5 h-5 ${isWishlistActive ? 'stroke-[2.2] fill-[#DFBE72]' : 'stroke-[1.7]'}`} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] bg-[#8B1E1E] border border-[#DFBE72]/60 text-white flex items-center justify-center rounded-full font-bold shadow-xs">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-wider mt-1 font-medium ${isWishlistActive ? 'font-semibold text-[#DFBE72]' : ''}`}>
            Saved
          </span>
        </Link>

        {/* 4. Cart Drawer Trigger */}
        <button
          type="button"
          onClick={() => setCartDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[#FAF6EF]/65 hover:text-[#FAF6EF] transition-colors focus-ring"
          aria-label={mounted ? `Cart with ${cartItemCount} items` : 'Shopping Cart'}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.7]" />
            {mounted && cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] bg-[#C5A059] text-[#12100E] border border-[#DFBE72] flex items-center justify-center rounded-full font-bold shadow-xs">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wider mt-1 font-medium">
            Cart
          </span>
        </button>

        {/* 5. Track Order / Account */}
        <Link
          href={PATHS.trackOrder()}
          prefetch={true}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors relative ${
            isTrackActive ? 'text-[#DFBE72]' : 'text-[#FAF6EF]/65 hover:text-[#FAF6EF]'
          }`}
          aria-label="Track Order"
        >
          {isTrackActive && (
            <span className="absolute top-0 inset-x-4 h-0.5 bg-[#DFBE72] rounded-full shadow-[0_0_8px_#DFBE72]" />
          )}
          <Package className={`w-5 h-5 ${isTrackActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
          <span className={`text-[10px] tracking-wider mt-1 font-medium ${isTrackActive ? 'font-semibold text-[#DFBE72]' : ''}`}>
            Track
          </span>
        </Link>
      </div>
    </nav>
  );
}
