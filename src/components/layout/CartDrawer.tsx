'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { formatPrice } from '@/lib/money';
import { PATHS } from '@/lib/paths';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShieldCheck } from 'lucide-react';

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

  // Close drawer on ESC key
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#231C10]/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-[#FAF7EE] border-l border-[#DEC99C] shadow-2xl flex flex-col">
          {/* Header with 44px min touch target */}
          <div className="p-4 sm:p-5 border-b border-[#DEC99C] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#231C10]" />
              <h2 className="font-serif text-lg font-semibold text-[#231C10]">
                Your Sacred Cart ({items.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#7A694F] hover:text-[#231C10] focus-ring rounded-xs"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress bar */}
          <div className="bg-[#F5EFE0] px-4 py-3 border-b border-[#DEC99C] space-y-2">
            <div className="flex items-center justify-between text-xs">
              {remainingForFreeShipping > 0 ? (
                <p className="text-[#4A3E2D]">
                  Add <span className="font-semibold text-[#231C10]">{formatPrice(remainingForFreeShipping)}</span> more for free insured shipping
                </p>
              ) : (
                <p className="text-[#15803D] font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Free insured wooden box shipping unlocked!</span>
                </p>
              )}
              <span className="text-[11px] font-semibold text-[#7A694F]">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-[#E8DAC0] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-[#B8860B] h-full transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F5EFE0] border border-[#DEC99C] flex items-center justify-center mx-auto text-[#B8860B]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif text-lg text-[#231C10] font-semibold">Your cart is empty</p>
                <p className="text-xs text-[#7A694F] max-w-xs mx-auto leading-relaxed">
                  Discover authentic temple Pichwai paintings, sanctum portraits, and gold foil art from Nathdwara.
                </p>
                <div className="pt-2">
                  <Link
                    href={PATHS.catalog()}
                    onClick={() => setDrawerOpen(false)}
                    className="btn-primary text-xs py-3 px-6"
                  >
                    Explore Paintings Collection
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3.5 bg-white border border-[#DEC99C] rounded-xs shadow-xs"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 shrink-0 bg-[#FAF7EE] border border-[#DEC99C]/60 overflow-hidden rounded-xs">
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
                          className="font-serif text-sm font-semibold text-[#231C10] hover:text-[#B8860B] line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        {/* Remove item button - 44px hit target */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center text-[#7A694F] hover:text-[#B91C1C] focus-ring"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#7A694F] mt-0.5">
                        {item.size} • {item.frame}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#DEC99C]/40">
                      {/* Touch-Friendly Quantity Selector with 44px min targets */}
                      <div className="flex items-center border border-[#DEC99C] bg-[#FAF7EE] rounded-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#4A3E2D] hover:text-[#231C10] disabled:opacity-30 focus-ring"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#231C10]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center text-[#4A3E2D] hover:text-[#231C10] disabled:opacity-30 focus-ring"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#231C10]">
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
            <div className="p-4 sm:p-5 border-t border-[#DEC99C] bg-white space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#4A3E2D]">Subtotal</span>
                <span className="font-serif font-bold text-lg text-[#231C10]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#7A694F]">
                Taxes and framing included. Insured transit across India.
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
                  className="btn-primary text-xs min-h-[44px] text-center flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
