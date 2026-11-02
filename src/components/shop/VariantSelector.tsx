'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/money';
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

  // Find matching variant
  const currentVariant =
    variants.find((v) => v.size === selectedSize && v.frame === selectedFrame) ||
    variants.find((v) => v.size === selectedSize) ||
    variants[0];

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
    router.push('/checkout');
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* Price & SKU */}
      <div className="space-y-1">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl font-bold text-[#262320]">
            {formatPrice(currentVariant.price)}
          </span>
          {currentVariant.mrp && currentVariant.mrp > currentVariant.price && (
            <span className="text-base text-[#8A8175] line-through">
              {formatPrice(currentVariant.mrp)}
            </span>
          )}
        </div>
        <p className="text-xs text-[#8A8175]">
          SKU: {currentVariant.sku} | Tax included. Insured framing and transit.
        </p>
      </div>

      {/* Size Option Selector */}
      {sizes.length > 1 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#262320]">
            Select Artwork Size
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isSelected = size === selectedSize;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-2 text-xs rounded-sm border transition-colors focus-ring ${
                    isSelected
                      ? 'border-[#1C1917] bg-[#1C1917] text-white font-medium shadow-xs'
                      : 'border-[#E7E2D8] bg-white text-[#1C1917] hover:border-[#B8511B]'
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
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#262320]">
            Framing Option
          </label>
          <div className="flex flex-wrap gap-2">
            {frames.map((frame) => {
              const isSelected = frame === selectedFrame;
              return (
                <button
                  key={frame}
                  type="button"
                  onClick={() => setSelectedFrame(frame)}
                  className={`px-3 py-2 text-xs rounded-sm border transition-colors focus-ring ${
                    isSelected
                      ? 'border-[#1C1917] bg-[#1C1917] text-white font-medium shadow-xs'
                      : 'border-[#E7E2D8] bg-white text-[#1C1917] hover:border-[#B8511B]'
                  }`}
                >
                  {frame}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock Availability indicator (Real DB stock only, strictly factual) */}
      <div className="text-xs">
        {isOutOfStock ? (
          <div className="flex items-center gap-1.5 text-[#8C2B2B]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Currently out of stock. Contact our gallery for a made-to-order commission.</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[#2A5C38]">
            <Check className="w-4 h-4 shrink-0" />
            <span>
              In stock in Nathdwara workshop ({currentVariant.stock} available)
            </span>
          </div>
        )}
      </div>

      {/* Quantity & CTA Buttons */}
      <div className="space-y-3 pt-2">
        <div className="flex gap-3">
          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center border border-[#E2DACD] bg-[#FAF7F2] rounded-sm">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="px-3 py-2 text-[#5C554C] hover:text-[#262320] disabled:opacity-30 focus-ring"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="px-3 text-sm font-medium text-[#262320]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(currentVariant.stock, q + 1))}
                disabled={quantity >= currentVariant.stock}
                className="px-3 py-2 text-[#5C554C] hover:text-[#262320] disabled:opacity-30 focus-ring"
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
            className="flex-1 btn-primary py-3 text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add to Cart</span>
          </button>

          {/* Buy Now */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            className="flex-1 btn-accent py-3 text-sm font-medium flex items-center justify-center gap-2 shadow-sm"
          >
            <Zap className="w-4 h-4" />
            <span>Buy Now</span>
          </button>
        </div>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs text-[#5C554C] hover:text-[#262320] border border-[#ECE5DA] rounded-sm transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#2A5C38]" />
              <span className="text-[#2A5C38]">Link copied to clipboard</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share this artwork</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

