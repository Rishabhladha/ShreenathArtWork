'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/money';
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

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const freeShippingThreshold = 500000; // Rs 5,000
  const standardShipping = 25000; // Rs 250
  const discountAmount = coupon ? coupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const shippingFee = discountedSubtotal >= freeShippingThreshold || items.length === 0 ? 0 : standardShipping;
  const estimatedTax = Math.round((discountedSubtotal * 12) / 100);
  const total = discountedSubtotal + shippingFee;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          subtotal,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid coupon');
      }

      applyCoupon(data.coupon);
      setCouponInput('');
    } catch (err: unknown) {
      setCouponError(err instanceof Error ? err.message : 'Coupon could not be applied');
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
          <Link href="/catalog" className="btn-primary text-sm py-3 px-6">
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
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="flex-1 space-y-1 min-w-0">
                <Link
                  href={`/product/${item.slug}`}
                  className="font-serif text-base font-semibold text-[#262320] hover:text-[#C47820] line-clamp-1"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-[#5C554C]">
                  Size: {item.size} | Framing: {item.frame}
                </p>
                <p className="text-xs text-[#8A8175]">
                  Unit price: {formatPrice(item.price)}
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center border border-[#E2DACD] bg-[#FAF6EF] rounded-sm">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="p-1.5 text-[#5C554C] hover:text-[#262320] disabled:opacity-30 focus-ring"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-xs font-medium text-[#262320]">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="p-1.5 text-[#5C554C] hover:text-[#262320] disabled:opacity-30 focus-ring"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right min-w-[5rem]">
                  <span className="text-sm font-semibold text-[#262320]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-[#8A8175] hover:text-[#8C2B2B] focus-ring"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Safe Delivery Note */}
          <div className="p-4 bg-[#F4EFE6] border border-[#E2DACD] rounded-sm text-xs text-[#5C554C] space-y-1">
            <p className="font-semibold text-[#262320]">Safe Transit Assurance</p>
            <p>
              Framed paintings are wrapped in foam, sealed in water-resistant film, and shipped in multi-layer corrugated wooden boxes.
            </p>
          </div>
        </div>

        {/* Order Summary Card */}
        <div className="space-y-6">
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-5">
            <h2 className="font-serif text-lg font-semibold text-[#262320] border-b border-[#ECE5DA] pb-3">
              Order Summary
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#5C554C]">
                <span>Artwork Subtotal</span>
                <span className="text-[#262320] font-medium">{formatPrice(subtotal)}</span>
              </div>

              {coupon && (
                <div className="flex justify-between text-[#2A5C38]">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon ({coupon.code})</span>
                  </span>
                  <span>- {formatPrice(coupon.discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#5C554C]">
                <span>Insured Shipping</span>
                <span className="text-[#262320] font-medium">
                  {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-[#8A8175] text-[11px]">
                <span>Estimated GST (included)</span>
                <span>{formatPrice(estimatedTax)}</span>
              </div>

              <div className="border-t border-[#ECE5DA] pt-3 flex justify-between text-base font-semibold text-[#262320]">
                <span>Total Amount</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-[#ECE5DA] space-y-2">
              {coupon ? (
                <div className="flex items-center justify-between p-2.5 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm text-xs">
                  <div className="flex items-center gap-1.5 text-[#2A5C38]">
                    <Check className="w-4 h-4" />
                    <span>Code <strong>{coupon.code}</strong> applied</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-[#8C2B2B] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. SHREENATH10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-l-sm focus-ring text-[#262320] uppercase"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !couponInput.trim()}
                      className="bg-[#262320] text-[#FAF6EF] px-3.5 py-2 text-xs hover:bg-[#3D3934] transition-colors rounded-r-sm disabled:opacity-50"
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
              href="/checkout"
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

