'use client';

import React, { useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, ShoppingBag, Package } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { PATHS, isPathActive } from '@/lib/paths';

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
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#FAF7EE]/95 backdrop-blur-md border-t border-[#DEC99C] shadow-[0_-4px_20px_rgba(35,28,16,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1">
        {/* 1. Home */}
        <Link
          href={PATHS.home}
          prefetch={true}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            isHomeActive ? 'text-[#B8860B]' : 'text-[#7A694F] hover:text-[#231C10]'
          }`}
          aria-label="Home"
        >
          <Home className={`w-5 h-5 ${isHomeActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
          <span className={`text-[10px] tracking-wide mt-1 font-medium ${isHomeActive ? 'font-semibold text-[#231C10]' : ''}`}>
            Home
          </span>
        </Link>

        {/* 2. Catalog */}
        <Link
          href={PATHS.catalog()}
          prefetch={true}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            isCatalogActive ? 'text-[#B8860B]' : 'text-[#7A694F] hover:text-[#231C10]'
          }`}
          aria-label="Catalog"
        >
          <Compass className={`w-5 h-5 ${isCatalogActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
          <span className={`text-[10px] tracking-wide mt-1 font-medium ${isCatalogActive ? 'font-semibold text-[#231C10]' : ''}`}>
            Paintings
          </span>
        </Link>

        {/* 3. Wishlist */}
        <Link
          href={PATHS.account.wishlist}
          prefetch={true}
          className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            isWishlistActive ? 'text-[#B8860B]' : 'text-[#7A694F] hover:text-[#231C10]'
          }`}
          aria-label={mounted ? `Wishlist with ${wishlistCount} paintings` : 'Wishlist'}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${isWishlistActive ? 'stroke-[2.2] fill-[#B8860B]' : 'stroke-[1.7]'}`} />
            {mounted && wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] bg-[#B8860B] text-white flex items-center justify-center rounded-full font-bold">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] tracking-wide mt-1 font-medium ${isWishlistActive ? 'font-semibold text-[#231C10]' : ''}`}>
            Saved
          </span>
        </Link>

        {/* 4. Cart Drawer Trigger */}
        <button
          type="button"
          onClick={() => setCartDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] text-[#7A694F] hover:text-[#231C10] transition-colors focus-ring"
          aria-label={mounted ? `Cart with ${cartItemCount} items` : 'Shopping Cart'}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[1.7]" />
            {mounted && cartItemCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 text-[9px] bg-[#231C10] text-[#FAF7EE] flex items-center justify-center rounded-full font-bold">
                {cartItemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-wide mt-1 font-medium">
            Cart
          </span>
        </button>

        {/* 5. Track Order / Account */}
        <Link
          href={PATHS.trackOrder()}
          prefetch={true}
          className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] transition-colors ${
            isTrackActive ? 'text-[#B8860B]' : 'text-[#7A694F] hover:text-[#231C10]'
          }`}
          aria-label="Track Order"
        >
          <Package className={`w-5 h-5 ${isTrackActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
          <span className={`text-[10px] tracking-wide mt-1 font-medium ${isTrackActive ? 'font-semibold text-[#231C10]' : ''}`}>
            Track
          </span>
        </Link>
      </div>
    </nav>
  );
}
