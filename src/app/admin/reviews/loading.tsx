import React from 'react';

export default function AdminReviewsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading reviews for moderation"
      className="space-y-6 max-w-5xl animate-pulse"
    >
      <div className="border-b border-[#E2DACD] pb-4 space-y-2">
        <div className="h-7 w-64 bg-[#E2DACD] rounded" />
        <div className="h-3 w-80 bg-[#ECE5DA] rounded" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-3">
                <div className="h-4 w-40 bg-[#E8DAC0] rounded" />
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="w-3 h-3 bg-[#E8DAC0] rounded-xs" />
                  ))}
                </div>
              </div>
              <div className="h-3 w-4/5 bg-[#ECE5DA] rounded" />
              <div className="h-2.5 w-36 bg-[#ECE5DA] rounded" />
            </div>

            <div className="flex items-center gap-2">
              <div className="h-7 w-24 bg-[#E8DAC0] rounded-sm" />
              <div className="h-7 w-16 bg-[#E8DAC0] rounded-sm" />
              <div className="h-7 w-7 bg-[#E8DAC0] rounded-sm" />
            </div>
          </div>
        ))}
      </div>

      <span className="sr-only">Loading collector reviews moderation panel...</span>
    </div>
  );
}
