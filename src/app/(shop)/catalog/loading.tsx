import React from 'react';

export default function CatalogLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 animate-in fade-in duration-200">
      {/* Header Skeleton */}
      <div className="space-y-3 border-b border-[#DEC99C] pb-6">
        <div className="h-4 w-28 bg-[#DEC99C]/60 rounded-xs animate-pulse" />
        <div className="h-9 w-64 bg-[#E8DAC0] rounded-xs animate-pulse" />
        <div className="h-4 w-full max-w-xl bg-[#E8DAC0]/50 rounded-xs animate-pulse" />
      </div>

      {/* Filter / Sort Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-white border border-[#DEC99C]/60 rounded-sm">
        <div className="h-8 w-44 bg-[#F5EFE4] rounded-sm animate-pulse" />
        <div className="h-8 w-36 bg-[#F5EFE4] rounded-sm animate-pulse" />
      </div>

      {/* Product Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white border border-[#DEC99C] rounded-sm overflow-hidden flex flex-col space-y-3 p-4 animate-pulse"
          >
            <div className="aspect-[4/5] bg-gradient-to-br from-[#F5EFE4] to-[#ECE3D2] rounded-sm w-full" />
            <div className="h-3.5 w-20 bg-[#DEC99C]/60 rounded-xs" />
            <div className="h-5 w-3/4 bg-[#E8DAC0] rounded-xs" />
            <div className="h-3 w-1/2 bg-[#E8DAC0]/50 rounded-xs" />
            <div className="pt-2 border-t border-[#DEC99C]/40 flex justify-between items-center">
              <div className="h-5 w-24 bg-[#DEC99C] rounded-xs" />
              <div className="h-3 w-16 bg-[#DEC99C]/40 rounded-xs" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
