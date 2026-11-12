'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/money';
import { trackActivity } from '@/lib/telemetry';
import { ShoppingBag, Zap, Share2, Check, AlertCircle, Sparkles, Award } from 'lucide-react';

export interface VariantData {
  id: string;
  size: string;
  frame: string;
  price: number;
  mrp?: number | null;
  sku: string;
  stock: number;
  isDefault: boolean;
}

interface VariantSelectorProps {
  productId: string;
  title: string;
  slug: string;
  image: string;
  variants: VariantData[];
}

export function VariantSelector({
  productId,
  title,
  slug,
  image,
  variants,
}: VariantSelectorProps) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Unique sizes and frames
  const sizes = Array.from(new Set(variants.map((v) => v.size)));
  const frames = Array.from(new Set(variants.map((v) => v.frame)));

  // Default selected variant
  const defaultVar = variants.find((v) => v.isDefault) || variants[0];
  const [selectedSize, setSelectedSize] = useState<string>(defaultVar?.size || sizes[0]);
  const [selectedFrame, setSelectedFrame] = useState<string>(defaultVar?.frame || frames[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    const hasCurrentFrame = variants.some((v) => v.size === size && v.frame === selectedFrame);
    if (!hasCurrentFrame) {
      const compatible = variants.find((v) => v.size === size);
      if (compatible) {
        setSelectedFrame(compatible.frame);
      }
    }
  };

  const handleSelectFrame = (frame: string) => {
    setSelectedFrame(frame);
    const hasCurrentSize = variants.some((v) => v.size === selectedSize && v.frame === frame);
    if (!hasCurrentSize) {
      const compatible = variants.find((v) => v.frame === frame);
      if (compatible) {
        setSelectedSize(compatible.size);
      }
    }
  };

  // Find exact matching variant
  const currentVariant = variants.find(
    (v) => v.size === selectedSize && v.frame === selectedFrame
  );

  const isOutOfStock = !currentVariant || currentVariant.stock <= 0;

  const handleAddToCart = () => {
    if (!currentVariant || isOutOfStock) return;
    addItem({
      productId,
      variantId: currentVariant.id,
      title,
      slug,
      image,
      size: currentVariant.size,
      frame: currentVariant.frame,
      price: currentVariant.price,
      mrp: currentVariant.mrp,
      quantity,
      maxStock: currentVariant.stock,
    });
    trackActivity('ADD_TO_CART', {
      productId,
      variantId: currentVariant.id,
      title,
      price: currentVariant.price,
      quantity,
    });
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuyNow = () => {
    if (!currentVariant || isOutOfStock) return;
    addItem({
      productId,
      variantId: currentVariant.id,
      title,
      slug,
      image,
      size: currentVariant.size,
      frame: currentVariant.frame,
      price: currentVariant.price,
      mrp: currentVariant.mrp,
      quantity,
      maxStock: currentVariant.stock,
    });
    trackActivity('ADD_TO_CART', {
      productId,
      variantId: currentVariant.id,
      title,
      price: currentVariant.price,
      quantity,
    });
    router.push('/checkout');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Price & SKU Plinth */}
      <div className="space-y-1.5 p-5 bg-white border border-[#E5D7BF] rounded-xs shadow-[0_2px_8px_rgba(18,16,14,0.04)]">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#12100E]">
            {currentVariant ? formatPrice(currentVariant.price) : 'Unavailable'}
          </span>
          {currentVariant?.mrp && currentVariant.mrp > currentVariant.price && (
            <span className="text-base text-[#82776A] line-through font-serif">
              {formatPrice(currentVariant.mrp)}
            </span>
          )}
        </div>
        <p className="text-xs text-[#82776A] font-light">
          SKU: <span className="font-mono font-medium text-[#12100E]">{currentVariant?.sku || 'N/A'}</span> • Tax & insured wooden crate transit included
        </p>
      </div>

      {/* Size Option Selector */}
      {sizes.length > 1 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#12100E]">
            Artwork Dimensions
          </label>
          <div className="flex flex-wrap gap-2.5">
            {sizes.map((size) => {
              const isSelected = size === selectedSize;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSelectSize(size)}
                  className={`min-h-[44px] min-w-[56px] px-4 py-2.5 text-xs rounded-xs border transition-all focus-ring ${
                    isSelected
                      ? 'border-[#C5A059] bg-[#12100E] text-[#DFBE72] font-semibold shadow-sm'
                      : 'border-[#E5D7BF] bg-white text-[#12100E] hover:border-[#C5A059] hover:bg-[#FAF6EF]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Frame Option Selector */}
      {frames.length > 1 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#12100E]">
            Framing & Mounting
          </label>
          <div className="flex flex-wrap gap-2.5">
            {frames.map((frame) => {
              const isSelected = frame === selectedFrame;
              const isAvailable = variants.some((v) => v.size === selectedSize && v.frame === frame);
              return (
                <button
                  key={frame}
                  type="button"
                  onClick={() => handleSelectFrame(frame)}
                  className={`min-h-[44px] min-w-[64px] px-4 py-2.5 text-xs rounded-xs border transition-all focus-ring ${
                    isSelected
                      ? 'border-[#C5A059] bg-[#12100E] text-[#DFBE72] font-semibold shadow-sm'
                      : isAvailable
                      ? 'border-[#E5D7BF] bg-white text-[#12100E] hover:border-[#C5A059] hover:bg-[#FAF6EF]'
                      : 'border-[#E5D7BF]/50 bg-[#F4EDE0] text-[#82776A] line-through'
                  }`}
                >
                  {frame}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Availability indicator */}
      <div className="text-xs">
        {!currentVariant ? (
          <div className="flex items-center gap-2 text-[#9E2A2B] p-3 bg-red-50/70 border border-red-200 rounded-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This dimension and framing combination is not currently available. Please select another variant.</span>
          </div>
        ) : isOutOfStock ? (
          <div className="flex items-center gap-2 text-[#12100E] p-3 bg-[#F4EDE0] border border-[#C5A059]/40 rounded-xs">
            <Sparkles className="w-4 h-4 shrink-0 text-[#C5A059]" />
            <span>Currently out of stock. Contact our Nathdwara haveli for a custom commissioned artwork.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#1F5E3B] font-medium p-3 bg-emerald-50/60 border border-emerald-200 rounded-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>
              In stock at Nathdwara workshop ({currentVariant.stock} available for immediate packing)
            </span>
          </div>
        )}
      </div>

      {/* Provenance Seal Callout */}
      <div className="p-3.5 bg-[#12100E] text-[#FAF6EF] border border-[#C5A059]/40 rounded-xs flex items-center gap-3 shadow-xs">
        <Award className="w-5 h-5 text-[#DFBE72] shrink-0" />
        <div className="text-xs">
          <p className="font-serif font-semibold text-[#DFBE72]">Authentic Nathdwara Provenance</p>
          <p className="text-[#FAF6EF]/75 font-light text-[11px]">Includes signed Certificate of Lineage and 24kt Gold Varak seal.</p>
        </div>
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Quantity Selector with 48px min touch buttons */}
          {!isOutOfStock && (
            <div className="flex items-center justify-between sm:justify-start border border-[#E5D7BF] bg-white rounded-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center text-[#524B43] hover:text-[#12100E] disabled:opacity-30 focus-ring"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 text-sm font-serif font-bold text-[#12100E]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(currentVariant.stock, q + 1))}
                disabled={quantity >= currentVariant.stock}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center text-[#524B43] hover:text-[#12100E] disabled:opacity-30 focus-ring"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          )}

          {/* Add to Cart */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex-1 btn-primary min-h-[48px] py-3 text-sm font-medium flex items-center justify-center gap-2 shadow-md"
          >
            <ShoppingBag className="w-4 h-4 text-[#DFBE72]" />
            <span>{addedAnimation ? 'Added to Cart!' : 'Add to Sanctum Cart'}</span>
          </button>

          {/* Buy Now */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 btn-accent min-h-[48px] py-3 text-sm font-medium flex items-center justify-center gap-2 shadow-md"
          >
            <Zap className="w-4 h-4 text-[#DFBE72]" />
            <span>Buy Now</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 text-xs text-[#524B43] hover:text-[#12100E] border border-[#E5D7BF] rounded-xs bg-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#1F5E3B]" />
              <span className="text-[#1F5E3B] font-medium">Artwork link copied to clipboard</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>Share this Nathdwara artwork</span>
            </>
          )}
        </button>
      </div>

      {/* Sticky Mobile Floating Action Bar on Mobile Viewports (< lg) */}
      <div
        className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-[#12100E]/98 backdrop-blur-md border-t border-[#C5A059]/40 p-3 shadow-[0_-6px_24px_rgba(0,0,0,0.5)] flex items-center justify-between gap-3 text-[#FAF6EF]"
      >
        <div className="min-w-0">
          <p className="text-[10px] text-[#DFBE72] truncate font-medium uppercase tracking-wider">{title}</p>
          <p className="font-serif font-bold text-base text-[#FAF6EF]">
            {currentVariant ? formatPrice(currentVariant.price) : 'Unavailable'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn-primary min-h-[44px] px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 bg-[#1A1714] border-[#C5A059]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#DFBE72]" />
            <span>{addedAnimation ? 'Added!' : 'Add to Cart'}</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="btn-accent min-h-[44px] px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-[#DFBE72]" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
