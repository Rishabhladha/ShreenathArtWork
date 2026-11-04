import React from 'react';

export interface ReviewListSkeletonProps {
  count?: number;
}

/**
 * Loading skeleton specifically for the review items list.
 * Displayed while reviews are being retrieved from the database.
 */
export function ReviewListSkeleton({ count = 3 }: ReviewListSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading collector reviews"
      className="space-y-3"
    >
      {/* Subtle database fetch indicator */}
      <div className="flex items-center gap-2.5 py-1 text-xs text-[#8A8175]">
        <div
          className="w-3.5 h-3.5 border-2 border-[#C47820] border-t-transparent rounded-full animate-spin shrink-0"
          aria-hidden="true"
        />
        <span className="font-medium">Fetching verified collector reviews from database...</span>
      </div>

      {/* Shimmering Review Skeleton Cards */}
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 animate-pulse"
        >
          {/* Header: Author skeleton + Star rating skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-[#E8DAC0]" />
              <div
                className="h-3 bg-[#E8DAC0] rounded"
                style={{ width: `${80 + (i % 3) * 25}px` }}
              />
            </div>
            <div className="flex gap-1" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-3.5 h-3.5 rounded-xs bg-[#E8DAC0]" />
              ))}
            </div>
          </div>

          {/* Comment text lines skeleton with staggered widths */}
          <div className="space-y-1.5">
            <div
              className="h-2.5 bg-[#ECE5DA] rounded"
              style={{ width: i % 2 === 0 ? '92%' : '98%' }}
            />
            <div
              className="h-2.5 bg-[#ECE5DA] rounded"
              style={{ width: i % 2 === 0 ? '78%' : '85%' }}
            />
            {i % 2 === 0 && (
              <div className="h-2.5 bg-[#ECE5DA] rounded w-2/5" />
            )}
          </div>

          {/* Timestamp skeleton */}
          <div className="h-2 w-20 bg-[#ECE5DA] rounded" />
        </div>
      ))}
      <span className="sr-only">Loading verified collector reviews...</span>
    </div>
  );
}

/**
 * Full skeleton of the collector reviews section.
 * Used as a React Suspense fallback and on page route transitions.
 */
export function ReviewSectionSkeleton() {
  return (
    <section
      aria-label="Collector Inquiries and Reviews loading"
      className="space-y-6 pt-8 border-t border-[#E2DACD]"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#262320]">
            Collector Inquiries and Reviews
          </h2>
          <p className="text-xs text-[#8A8175] mt-0.5">
            Verified feedback from collectors who acquired this painting.
          </p>
        </div>
      </div>

      {/* Review List Skeleton */}
      <ReviewListSkeleton count={3} />

      {/* Review Submission Form Skeleton */}
      <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4 animate-pulse">
        <div className="h-4 w-48 bg-[#E8DAC0] rounded" />
        <div className="h-3 w-72 bg-[#ECE5DA] rounded" />
      </div>
    </section>
  );
}
