'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { formatPrice } from '@/lib/money';
import { PATHS } from '@/lib/paths';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck, Sparkles } from 'lucide-react';

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    setDrawerOpen,
    updateQuantity,
    removeItem,
    getSubtotal,
  } = useCartStore();

  const { freeShippingThreshold, fetchSettings } = useSiteSettings();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const subtotal = getSubtotal();
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / (freeShippingThreshold || 500000)) * 100));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen, setDrawerOpen]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Shopping Cart">
      {/* Chiaroscuro Backdrop */}
      <div
        className="fixed inset-0 bg-[#12100E]/75 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#FAF6EF] border-l border-[#C5A059]/40 shadow-2xl flex flex-col">
          {/* Header in Royal Mewar Obsidian */}
          <div className="p-4 sm:p-5 border-b border-[#C5A059]/30 flex items-center justify-between bg-[#12100E] text-[#FAF6EF]">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#DFBE72]" />
              <h2 className="font-serif text-lg font-semibold text-[#FAF6EF] tracking-wide">
                Sacred Art Cart ({items.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#FAF6EF]/70 hover:text-[#DFBE72] focus-ring rounded-xs transition-colors"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Insured Crate Transit Meter */}
          <div className="bg-[#1A1714] text-[#FAF6EF] px-4 py-3 border-b border-[#C5A059]/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              {remainingForFreeShipping > 0 ? (
                <p className="text-[#FAF6EF]/85 font-light">
                  Add <span className="font-semibold text-[#DFBE72]">{formatPrice(remainingForFreeShipping)}</span> for free insured wooden crate transit
                </p>
              ) : (
                <p className="text-[#DFBE72] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#DFBE72]" />
                  <span>Free insured wooden crate transit unlocked!</span>
                </p>
              )}
              <span className="text-[11px] font-semibold text-[#DFBE72]">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-[#12100E] h-1.5 rounded-full overflow-hidden border border-[#C5A059]/30">
              <div
                className="bg-gradient-to-r from-[#C5A059] to-[#DFBE72] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FAF6EF]">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#12100E] border border-[#C5A059]/40 flex items-center justify-center mx-auto text-[#DFBE72]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-xl text-[#12100E] font-semibold">Your sanctum cart is empty</p>
                <p className="text-xs text-[#82776A] max-w-xs mx-auto leading-relaxed font-light">
                  Discover authentic temple Pichwai paintings, sanctum portraits, and 24kt gold varak art handcrafted in Nathdwara.
                </p>
                <div className="pt-2">
                  <Link
                    href={PATHS.catalog()}
                    onClick={() => setDrawerOpen(false)}
                    className="btn-accent text-xs py-3 px-6"
                  >
                    Explore Paintings Collection
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3.5 bg-white border border-[#E5D7BF] rounded-xs shadow-xs"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 shrink-0 bg-[#FAF6EF] border border-[#E5D7BF] overflow-hidden rounded-xs">
                    <Image
                      src={item.image || '/placeholder-artwork.svg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <Link
                          href={PATHS.product(item.slug)}
                          onClick={() => setDrawerOpen(false)}
                          className="font-serif text-sm font-semibold text-[#12100E] hover:text-[#8B1E1E] line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center text-[#82776A] hover:text-[#8B1E1E] focus-ring"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#82776A] mt-0.5">
                        {item.size} • {item.frame}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E5D7BF]/60">
                      {/* Touch-Friendly Quantity Selector */}
                      <div className="flex items-center border border-[#E5D7BF] bg-[#FAF6EF] rounded-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#524B43] hover:text-[#12100E] disabled:opacity-30 focus-ring"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-serif font-bold text-[#12100E]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#524B43] hover:text-[#12100E] disabled:opacity-30 focus-ring"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-serif font-bold text-[#12100E]">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E5D7BF] bg-white space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#524B43] font-medium">Subtotal</span>
                <span className="font-serif font-bold text-xl text-[#12100E]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#82776A] font-light">
                Taxes, authentication certificate and teak framing included.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <Link
                  href={PATHS.cart}
                  onClick={() => setDrawerOpen(false)}
                  className="btn-secondary text-xs min-h-[44px] text-center"
                >
                  View Full Cart
                </Link>
                <Link
                  href={PATHS.checkout}
                  onClick={() => setDrawerOpen(false)}
                  className="btn-accent text-xs min-h-[44px] text-center flex items-center justify-center gap-1.5 shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#DFBE72]" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
