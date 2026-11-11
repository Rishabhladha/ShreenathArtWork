'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { formatPrice } from '@/lib/money';
import { PATHS } from '@/lib/paths';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#262320]/40 transition-opacity"
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF6EF] border-l border-[#E2DACD] shadow-xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#E2DACD] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#262320]" />
              <h2 className="font-serif text-lg font-semibold text-[#262320]">
                Your Cart ({items.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 text-[#5C554C] hover:text-[#262320] focus-ring rounded-sm"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress banner */}
          <div className="bg-[#F4EFE6] px-4 py-2.5 text-xs text-[#5C554C] border-b border-[#E2DACD]">
            {remainingForFreeShipping > 0 ? (
              <p>
                Add{' '}
                <span className="font-semibold text-[#262320]">
                  {formatPrice(remainingForFreeShipping)}
                </span>{' '}
                more to qualify for free insured shipping.
              </p>
            ) : (
              <p className="text-[#2A5C38] font-medium">
                Your order qualifies for free insured shipping across India.
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-12 h-12 mx-auto text-[#D1C6B4]" />
                <p className="font-serif text-lg text-[#262320]">Your cart is empty</p>
                <p className="text-xs text-[#5C554C] max-w-xs mx-auto">
                  Explore our original and print devotional paintings of Shreenathji from Nathdwara.
                </p>
                <div className="pt-2">
                  <Link
                    href={PATHS.catalog()}
                    onClick={() => setDrawerOpen(false)}
                    className="btn-primary text-xs py-2 px-4"
                  >
                    Browse Collection
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-24 shrink-0 bg-[#F4EFE6] border border-[#ECE5DA] overflow-hidden">
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
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={PATHS.product(item.slug)}
                          onClick={() => setDrawerOpen(false)}
                          className="font-serif text-sm font-semibold text-[#262320] hover:text-[#C47820] line-clamp-1"
                        >
                          {item.title}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[#8A8175] hover:text-[#8C2B2B] p-1 focus-ring"
                          aria-label={`Remove ${item.title} from cart`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-[#5C554C] mt-0.5">
                        {item.size} : {item.frame}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#E2DACD] bg-[#FAF6EF] rounded-sm">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="p-1 text-[#5C554C] hover:text-[#262320] disabled:opacity-30 focus-ring"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-medium text-[#262320]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1 text-[#5C554C] hover:text-[#262320] disabled:opacity-30 focus-ring"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <span className="text-sm font-medium text-[#262320]">
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
            <div className="p-4 sm:p-6 border-t border-[#E2DACD] bg-[#FAF7F2] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#5C554C]">Subtotal</span>
                <span className="font-semibold text-base text-[#262320]">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-[11px] text-[#8A8175]">
                Taxes, coupons and shipping calculated at checkout.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  href={PATHS.cart}
                  onClick={() => setDrawerOpen(false)}
                  className="btn-secondary text-xs py-2.5 text-center"
                >
                  View Full Cart
                </Link>
                <Link
                  href={PATHS.checkout}
                  onClick={() => setDrawerOpen(false)}
                  className="btn-primary text-xs py-2.5 text-center flex items-center justify-center gap-1.5"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
