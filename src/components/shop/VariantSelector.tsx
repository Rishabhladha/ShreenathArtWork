'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/money';
import { trackActivity } from '@/lib/telemetry';
import { ShoppingBag, Zap, Share2, Check, AlertCircle } from 'lucide-react';

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
      {/* Price & SKU */}
      <div className="space-y-1.5 p-4 bg-white border border-[#DEC99C] rounded-xs shadow-xs">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-[#231C10]">
            {currentVariant ? formatPrice(currentVariant.price) : 'Unavailable'}
          </span>
          {currentVariant?.mrp && currentVariant.mrp > currentVariant.price && (
            <span className="text-base text-[#7A694F] line-through">
              {formatPrice(currentVariant.mrp)}
            </span>
          )}
        </div>
        <p className="text-xs text-[#7A694F]">
          SKU: <span className="font-medium text-[#231C10]">{currentVariant?.sku || 'N/A'}</span> • Tax and wooden frame transit included
        </p>
      </div>

      {/* Size Option Selector with min 44px touch targets */}
      {sizes.length > 1 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#231C10]">
            Select Artwork Size
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
                      ? 'border-[#231C10] bg-[#231C10] text-white font-semibold shadow-xs'
                      : 'border-[#DEC99C] bg-white text-[#231C10] hover:border-[#B8860B] hover:bg-[#FAF7EE]'
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Frame Option Selector with min 44px touch targets */}
      {frames.length > 1 && (
        <div className="space-y-2.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#231C10]">
            Framing Selection
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
                      ? 'border-[#231C10] bg-[#231C10] text-white font-semibold shadow-xs'
                      : isAvailable
                      ? 'border-[#DEC99C] bg-white text-[#231C10] hover:border-[#B8860B] hover:bg-[#FAF7EE]'
                      : 'border-[#DEC99C]/50 bg-[#F5EFE0] text-[#7A694F] line-through'
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
          <div className="flex items-center gap-2 text-[#B91C1C] p-3 bg-red-50 border border-red-200 rounded-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>This size and framing combination is not currently available. Please select another variant.</span>
          </div>
        ) : isOutOfStock ? (
          <div className="flex items-center gap-2 text-[#A85A32] p-3 bg-[#FAF7EE] border border-[#DEC99C] rounded-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#B8860B]" />
            <span>Currently out of stock. Contact our Nathdwara workshop for a custom commissioned order.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[#15803D] font-medium p-3 bg-emerald-50/60 border border-emerald-200 rounded-xs">
            <Check className="w-4 h-4 shrink-0" />
            <span>
              In stock at Nathdwara gallery workshop ({currentVariant.stock} available for dispatch)
            </span>
          </div>
        )}
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Quantity Selector with 44px min touch buttons */}
          {!isOutOfStock && (
            <div className="flex items-center justify-between sm:justify-start border border-[#DEC99C] bg-white rounded-xs">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center text-[#4A3E2D] hover:text-[#231C10] disabled:opacity-30 focus-ring"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-4 text-sm font-semibold text-[#231C10]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(currentVariant.stock, q + 1))}
                disabled={quantity >= currentVariant.stock}
                className="min-h-[48px] min-w-[48px] flex items-center justify-center text-[#4A3E2D] hover:text-[#231C10] disabled:opacity-30 focus-ring"
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
            className="flex-1 btn-primary min-h-[48px] py-3 text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{addedAnimation ? 'Added to Cart!' : 'Add to Sanctum Cart'}</span>
          </button>

          {/* Buy Now */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 btn-accent min-h-[48px] py-3 text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Buy Now</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 text-xs text-[#4A3E2D] hover:text-[#231C10] border border-[#DEC99C] rounded-xs bg-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-[#15803D]" />
              <span className="text-[#15803D] font-medium">Artwork link copied to clipboard</span>
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
        className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-[#FAF7EE]/95 backdrop-blur-md border-t border-[#DEC99C] p-3 shadow-[0_-4px_16px_rgba(35,28,16,0.08)] flex items-center justify-between gap-3"
      >
        <div className="min-w-0">
          <p className="text-[10px] text-[#7A694F] truncate font-medium">{title}</p>
          <p className="font-serif font-bold text-base text-[#231C10]">
            {currentVariant ? formatPrice(currentVariant.price) : 'Unavailable'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="btn-primary min-h-[44px] px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{addedAnimation ? 'Added!' : 'Add to Cart'}</span>
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="btn-accent min-h-[44px] px-4 py-2 text-xs font-semibold flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Buy Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}
