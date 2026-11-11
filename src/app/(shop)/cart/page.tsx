'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { calculateOrderTotals, formatPrice } from '@/lib/money';
import { PATHS } from '@/lib/paths';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, AlertCircle } from 'lucide-react';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    coupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
  } = useCartStore();

  const {
    freeShippingThreshold,
    standardShippingCharge,
    gstEnabled,
    gstRatePercent,
    fetchSettings,
  } = useSiteSettings();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discountAmount = coupon ? coupon.discountAmount : 0;

  const totals = calculateOrderTotals({
    subtotal,
    discount: discountAmount,
    freeShippingThreshold,
    standardShippingCharge,
    gstEnabled,
    gstRatePercent,
  });

  const shippingFee = items.length === 0 ? 0 : totals.shippingFee;
  const estimatedTax = items.length === 0 ? 0 : totals.tax;
  const total = items.length === 0 ? 0 : totals.total;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch(PATHS.api.coupon.validate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid discount coupon');
      }

      applyCoupon({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        discountValue: data.discountValue,
      });

      setCouponInput('');
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : 'Coupon validation failed');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-6">
        <ShoppingBag className="w-16 h-16 text-[#D1C6B4] mx-auto" />
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">Your Cart is Empty</h1>
        <p className="text-sm text-[#5C554C] max-w-md mx-auto leading-relaxed">
          You have not added any artworks to your cart yet. Explore our authentic Pichwai and sanctum devotional paintings from Nathdwara.
        </p>
        <div>
          <Link href={PATHS.catalog()} className="btn-primary text-sm py-3 px-6">
            Browse Artwork Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      <div className="border-b border-[#E2DACD] pb-4 flex items-baseline justify-between">
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          Shopping Cart ({items.length})
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-[#8A8175] hover:text-[#8C2B2B] underline"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-4 sm:p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex flex-col sm:flex-row gap-4 sm:gap-6 items-start sm:items-center"
            >
              <div className="relative w-24 h-28 shrink-0 bg-[#F4EFE6] border border-[#ECE5DA] overflow-hidden rounded-sm">
                <Image
                  src={item.image || '/placeholder-artwork.svg'}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <Link
                  href={PATHS.product(item.slug)}
                  className="font-serif text-base font-semibold text-[#262320] hover:text-[#C47820] line-clamp-1"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-[#5C554C]">
                  Size: {item.size} | Framing: {item.frame}
                </p>
                <p className="text-sm font-semibold text-[#262320] mt-1">
                  {formatPrice(item.price)} each
                </p>
              </div>

              {/* Quantity Controls & Remove */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4">
                <div className="flex items-center border border-[#E2DACD] bg-[#FAF6EF] rounded-sm">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1.5 text-[#5C554C] hover:text-[#262320] disabled:opacity-30 focus-ring"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-sm font-medium text-[#262320]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="p-1.5 text-[#5C554C] hover:text-[#262320] disabled:opacity-30 focus-ring"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-serif font-semibold text-base text-[#262320]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-[#8A8175] hover:text-[#8C2B2B] p-1 focus-ring"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm p-6 space-y-5">
            <h2 className="font-serif text-lg font-semibold text-[#262320] border-b border-[#E2DACD] pb-3">
              Order Summary
            </h2>

            <div className="space-y-3 text-xs text-[#5C554C]">
              <div className="flex justify-between">
                <span>Subtotal ({items.reduce((acc, i) => acc + i.quantity, 0)} items)</span>
                <span className="font-medium text-[#262320]">{formatPrice(subtotal)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-[#2A5C38]">
                  <span>Discount ({coupon.code})</span>
                  <span>-{formatPrice(coupon.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Insured Courier Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-[#2A5C38] font-medium">FREE</span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              {gstEnabled && (
                <div className="flex justify-between">
                  <span>Estimated GST ({gstRatePercent}%)</span>
                  <span>{formatPrice(estimatedTax)}</span>
                </div>
              )}

              <div className="border-t border-[#E2DACD] pt-3 flex justify-between text-base font-semibold text-[#262320]">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Discount Coupon Form */}
            <div className="border-t border-[#E2DACD] pt-4">
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#F4EFE6] border border-[#2A5C38]/40 rounded-sm text-xs">
                  <div className="flex items-center gap-1.5 text-[#2A5C38] font-medium">
                    <Check className="w-4 h-4" />
                    <span>Coupon {coupon.code} applied (-{formatPrice(coupon.discountAmount)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[#8A8175] hover:text-[#8C2B2B] text-[11px] underline ml-2"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-[#8A8175] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Coupon code (e.g. WELCOME10)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="btn-secondary text-xs px-3 py-2 disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <div className="flex items-center gap-1 text-[11px] text-[#8C2B2B]">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{couponError}</span>
                    </div>
                  )}
                </form>
              )}
            </div>

            <Link
              href={PATHS.checkout}
              className="w-full btn-primary text-sm py-3 text-center flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <p className="text-[11px] text-[#8A8175] text-center">
              Razorpay Secure online payment or Cash on Delivery available at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
