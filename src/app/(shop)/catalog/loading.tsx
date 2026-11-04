import React from 'react';

export default function CatalogLoading() {
  return (
    <div
      role="status"
      aria-label="Loading catalog artworks"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8"
    >
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 text-xs text-[#8A8175] animate-pulse">
        <div className="h-3 w-10 bg-[#E8DAC0] rounded" />
        <span>/</span>
        <div className="h-3 w-20 bg-[#E2DACD] rounded" />
      </div>

      {/* Header Skeleton */}
      <div className="space-y-2 border-b border-[#E2DACD] pb-6 animate-pulse">
        <div className="h-8 w-72 sm:w-96 bg-[#E2DACD] rounded" />
        <div className="h-3.5 w-64 sm:w-80 bg-[#ECE5DA] rounded" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm animate-pulse">
        <div className="h-9 w-64 bg-[#E8DAC0] rounded-xs" />
        <div className="flex gap-2">
          <div className="h-9 w-28 bg-[#E8DAC0] rounded-xs" />
          <div className="h-9 w-32 bg-[#E8DAC0] rounded-xs" />
        </div>
      </div>

      {/* Grid of Product Card Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-[#DEC99C] rounded-sm overflow-hidden flex flex-col space-y-3"
          >
            {/* Artwork Image Container Placeholder */}
            <div className="aspect-[4/5] bg-[#F5EFE0] w-full border-b border-[#DEC99C]/40" />

            {/* Artwork Information */}
            <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="h-2.5 w-20 bg-[#E8DAC0] rounded" />
                <div className="h-4 w-44 bg-[#E2DACD] rounded" />
                <div className="h-3 w-32 bg-[#ECE5DA] rounded" />
              </div>

              {/* Price and Stock Skeleton */}
              <div className="pt-2 border-t border-[#E8DAC0] flex items-baseline justify-between">
                <div className="h-4 w-24 bg-[#E2DACD] rounded" />
                <div className="h-3 w-16 bg-[#ECE5DA] rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading catalog paintings, please wait...</span>
    </div>
  );
}
