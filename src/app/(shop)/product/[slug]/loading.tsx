import React from 'react';
import { Sparkles, ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-in fade-in duration-200">
      {/* Breadcrumb Skeleton */}
      <nav aria-label="Breadcrumb skeleton" className="flex items-center gap-2">
        <div className="h-3.5 w-10 bg-[#E8DAC0]/70 rounded-xs animate-pulse" />
        <span className="text-xs text-[#8A8175]">/</span>
        <div className="h-3.5 w-14 bg-[#E8DAC0]/70 rounded-xs animate-pulse" />
        <span className="text-xs text-[#8A8175]">/</span>
        <div className="h-3.5 w-20 bg-[#E8DAC0]/70 rounded-xs animate-pulse" />
        <span className="text-xs text-[#8A8175]">/</span>
        <div className="h-3.5 w-32 bg-[#E8DAC0]/50 rounded-xs animate-pulse" />
      </nav>

      {/* Product Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Left: Gallery Skeleton */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] bg-gradient-to-br from-[#F5EFE4] via-[#ECE3D2] to-[#F5EFE4] border border-[#DEC99C] rounded-sm overflow-hidden flex flex-col items-center justify-center animate-pulse">
            <div className="w-12 h-12 rounded-full bg-[#DEC99C]/40 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-[#B8860B]/60 animate-spin" />
            </div>
            <p className="font-serif text-sm text-[#7A694F] tracking-wide">
              Loading Sacred Artwork...
            </p>
            <p className="text-[11px] text-[#A8987E] mt-1 font-sans">
              Retrieving handcrafted details and high-resolution darshan
            </p>

            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
          </div>

          {/* Thumbnails row skeleton */}
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-20 h-24 bg-[#EFE9DC] border border-[#DEC99C]/60 rounded-sm animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Right: Artwork Details & Options Skeleton */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-28 bg-[#DEC99C]/60 rounded-xs animate-pulse" />
            <div className="h-8 sm:h-10 w-4/5 bg-[#E8DAC0] rounded-xs animate-pulse" />
            <div className="h-6 w-1/2 bg-[#E8DAC0]/70 rounded-xs animate-pulse" />
          </div>

          {/* Price skeleton */}
          <div className="p-4 bg-[#FAF7EE] border border-[#DEC99C]/60 rounded-sm space-y-2">
            <div className="h-7 w-36 bg-[#DEC99C]/70 rounded-xs animate-pulse" />
            <div className="h-3 w-48 bg-[#DEC99C]/40 rounded-xs animate-pulse" />
          </div>

          {/* Variant Selection Skeletons */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-[#E8DAC0]/70 rounded-xs animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-24 bg-[#F5EFE4] border border-[#DEC99C]/60 rounded-sm animate-pulse"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-24 bg-[#E8DAC0]/70 rounded-xs animate-pulse" />
              <div className="flex flex-wrap gap-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-32 bg-[#F5EFE4] border border-[#DEC99C]/60 rounded-sm animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Add to Cart button skeleton */}
            <div className="pt-2 flex gap-3">
              <div className="h-12 w-28 bg-[#F5EFE4] border border-[#DEC99C] rounded-sm animate-pulse" />
              <div className="h-12 flex-1 bg-[#231C10]/15 rounded-sm animate-pulse flex items-center justify-center">
                <span className="text-xs text-[#7A694F] font-medium tracking-wide">
                  Loading Options...
                </span>
              </div>
            </div>
          </div>

          {/* Specifications Grid Skeleton */}
          <div className="border-t border-[#DEC99C]/60 pt-6 space-y-3">
            <div className="h-4 w-36 bg-[#E8DAC0]/70 rounded-xs animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-3 w-20 bg-[#E8DAC0]/50 rounded-xs animate-pulse" />
                  <div className="h-3.5 w-32 bg-[#E8DAC0]/80 rounded-xs animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Description Skeleton */}
          <div className="border-t border-[#DEC99C]/60 pt-6 space-y-2">
            <div className="h-4 w-40 bg-[#E8DAC0]/70 rounded-xs animate-pulse" />
            <div className="h-3 w-full bg-[#E8DAC0]/40 rounded-xs animate-pulse" />
            <div className="h-3 w-11/12 bg-[#E8DAC0]/40 rounded-xs animate-pulse" />
            <div className="h-3 w-4/5 bg-[#E8DAC0]/40 rounded-xs animate-pulse" />
          </div>

          {/* Shipping Highlights Skeleton */}
          <div className="p-4 bg-[#FAF7EE] border border-[#DEC99C]/60 rounded-sm space-y-3">
            <div className="flex items-center gap-2.5">
              <Truck className="w-4 h-4 text-[#DEC99C]" />
              <div className="h-3 w-64 bg-[#DEC99C]/60 rounded-xs animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#DEC99C]" />
              <div className="h-3 w-56 bg-[#DEC99C]/60 rounded-xs animate-pulse" />
            </div>
            <div className="flex items-center gap-2.5">
              <RotateCcw className="w-4 h-4 text-[#DEC99C]" />
              <div className="h-3 w-60 bg-[#DEC99C]/60 rounded-xs animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Related Artworks Skeleton */}
      <div className="pt-12 border-t border-[#DEC99C]/60 space-y-6">
        <div className="h-6 w-48 bg-[#E8DAC0]/80 rounded-xs animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white border border-[#DEC99C] rounded-sm overflow-hidden flex flex-col space-y-3 p-4 animate-pulse"
            >
              <div className="aspect-[4/5] bg-[#F5EFE4] rounded-sm w-full" />
              <div className="h-4 w-20 bg-[#E8DAC0]/60 rounded-xs" />
              <div className="h-5 w-3/4 bg-[#E8DAC0] rounded-xs" />
              <div className="h-4 w-24 bg-[#DEC99C] rounded-xs" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
