import React from 'react';

export default function ShopLayoutLoading() {
  return (
    <div
      role="status"
      aria-label="Loading shop content"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8 animate-pulse"
    >
      {/* Page Header Skeleton */}
      <div className="space-y-3 max-w-xl">
        <div className="h-3 w-28 bg-[#E8DAC0] rounded" />
        <div className="h-8 sm:h-10 w-3/4 bg-[#E2DACD] rounded" />
        <div className="h-3.5 w-full bg-[#ECE5DA] rounded" />
      </div>

      {/* Content Blocks Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[#E2DACD]">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4"
          >
            <div className="w-10 h-10 rounded-full bg-[#E8DAC0]" />
            <div className="h-5 w-40 bg-[#E2DACD] rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full bg-[#ECE5DA] rounded" />
              <div className="h-3 w-5/6 bg-[#ECE5DA] rounded" />
              <div className="h-3 w-2/3 bg-[#ECE5DA] rounded" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading, please wait...</span>
    </div>
  );
}
