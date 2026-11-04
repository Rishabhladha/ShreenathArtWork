import React from 'react';
import { ReviewSectionSkeleton } from '@/components/shop/ReviewSectionSkeleton';
import { Sparkles, Truck, ShieldCheck, RotateCcw } from 'lucide-react';

export default function ProductDetailLoading() {
  return (
    <div
      role="status"
      aria-label="Loading artwork details"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12"
    >
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center text-xs gap-1.5 animate-pulse">
        <div className="h-3 w-10 bg-[#E8DAC0] rounded" />
        <span className="text-[#8A8175]">/</span>
        <div className="h-3 w-12 bg-[#E8DAC0] rounded" />
        <span className="text-[#8A8175]">/</span>
        <div className="h-3 w-20 bg-[#E8DAC0] rounded" />
        <span className="text-[#8A8175]">/</span>
        <div className="h-3 w-32 bg-[#E2DACD] rounded" />
      </div>

      {/* Product Hero Grid: Gallery + Purchasing Details Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Image Gallery Skeleton */}
        <div className="space-y-4">
          {/* Main Artwork Preview Placeholder */}
          <div className="relative aspect-4/3 sm:aspect-square w-full bg-[#F5EFE0] border border-[#DEC99C] rounded-sm overflow-hidden flex items-center justify-center animate-pulse">
            <div className="text-center space-y-2 p-6">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#E8DAC0] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#C47820] opacity-60" />
              </div>
              <div className="h-3 w-32 mx-auto bg-[#E8DAC0] rounded" />
            </div>
          </div>

          {/* Thumbnails Row Skeleton */}
          <div className="flex gap-3 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-[#FAF7F2] border border-[#E2DACD] rounded-xs"
              />
            ))}
          </div>
        </div>

        {/* Right: Artwork Details & Options Skeleton */}
        <div className="space-y-6 animate-pulse">
          {/* Title and Category */}
          <div className="space-y-2">
            <div className="h-3.5 w-24 bg-[#E8DAC0] rounded" />
            <div className="h-8 sm:h-10 w-3/4 bg-[#E2DACD] rounded" />
          </div>

          {/* Price Skeleton */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3">
            <div className="flex items-baseline gap-3">
              <div className="h-7 w-28 bg-[#DEC99C] rounded" />
              <div className="h-4 w-16 bg-[#E8DAC0] rounded" />
            </div>
            <div className="h-3 w-40 bg-[#ECE5DA] rounded" />
          </div>

          {/* Size / Frame Variant Buttons Skeleton */}
          <div className="space-y-3">
            <div className="h-3 w-28 bg-[#E8DAC0] rounded" />
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-[#FAF7F2] border border-[#E2DACD] rounded-xs" />
              <div className="h-9 w-24 bg-[#FAF7F2] border border-[#E2DACD] rounded-xs" />
              <div className="h-9 w-24 bg-[#FAF7F2] border border-[#E2DACD] rounded-xs" />
            </div>
          </div>

          {/* Add to Cart Button Skeleton */}
          <div className="h-11 w-full bg-[#231C10]/15 rounded-xs" />

          {/* Artwork Specifications Skeleton */}
          <div className="border-t border-[#E2DACD] pt-6 space-y-3">
            <div className="h-4 w-40 bg-[#E2DACD] rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2.5 w-20 bg-[#ECE5DA] rounded" />
                  <div className="h-3 w-32 bg-[#E8DAC0] rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="border-t border-[#E2DACD] pt-6 space-y-2">
            <div className="h-4 w-44 bg-[#E2DACD] rounded" />
            <div className="h-2.5 w-full bg-[#ECE5DA] rounded" />
            <div className="h-2.5 w-5/6 bg-[#ECE5DA] rounded" />
            <div className="h-2.5 w-4/6 bg-[#ECE5DA] rounded" />
          </div>

          {/* Trust Guarantees */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs text-[#8A8175]">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 opacity-50 shrink-0" />
              <div className="h-2.5 w-3/4 bg-[#ECE5DA] rounded" />
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 opacity-50 shrink-0" />
              <div className="h-2.5 w-2/3 bg-[#ECE5DA] rounded" />
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 opacity-50 shrink-0" />
              <div className="h-2.5 w-1/2 bg-[#ECE5DA] rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Collector Reviews Section Skeleton */}
      <ReviewSectionSkeleton />

      {/* Related Paintings Skeleton */}
      <section className="space-y-6 pt-12 border-t border-[#E2DACD] animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-6 w-52 bg-[#E2DACD] rounded" />
          <div className="h-3 w-20 bg-[#E8DAC0] rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#DEC99C] rounded-sm overflow-hidden flex flex-col space-y-3"
            >
              <div className="aspect-[4/5] bg-[#F5EFE0] w-full" />
              <div className="p-4 space-y-2">
                <div className="h-2.5 w-16 bg-[#E8DAC0] rounded" />
                <div className="h-4 w-36 bg-[#E2DACD] rounded" />
                <div className="h-3 w-24 bg-[#ECE5DA] rounded" />
                <div className="pt-2 border-t border-[#E8DAC0] flex justify-between">
                  <div className="h-4 w-20 bg-[#E2DACD] rounded" />
                  <div className="h-3 w-16 bg-[#ECE5DA] rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
