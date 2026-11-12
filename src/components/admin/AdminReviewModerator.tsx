'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Check, X, Trash2 } from 'lucide-react';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string | Date;
  product: { title: string; slug: string };
  user: { name?: string | null; email?: string | null };
}

export function AdminReviewModerator({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [reviews, setReviews] = useState(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleToggleApproval = async (id: string, isApproved: boolean) => {
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: id, isApproved }),
      });

      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, isApproved } : r))
        );
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to update review status.');
      }
    } catch {
      setError('Technical error updating review approval.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setLoadingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to delete review.');
      }
    } catch {
      setError('Technical error deleting review.');
    } finally {
      setLoadingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="p-12 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm text-center text-xs text-[#5C554C]">
        No reviews submitted yet. Remember: reviews can only be submitted by logged-in collectors with delivered orders.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B]">
          {error}
        </div>
      )}
      {reviews.map((r) => (
        <div
          key={r.id}
          className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
        >
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-3">
              <Link
                href={`/product/${r.product.slug}`}
                target="_blank"
                className="font-serif font-semibold text-sm text-[#262320] hover:underline"
              >
                {r.product.title}
              </Link>
              <div className="flex text-[#C47820]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= r.rating ? 'fill-[#C47820]' : 'text-[#D1C6B4]'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-[#5C554C] leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>

            <p className="text-[11px] text-[#8A8175]">
              By {r.user.name || r.user.email} on{' '}
              {new Date(r.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {r.isApproved ? (
              <span className="px-2 py-1 text-[11px] rounded-sm font-semibold bg-[#EAE2D5] text-[#2A5C38] border border-[#D1C6B4]">
                Approved (Live)
              </span>
            ) : (
              <span className="px-2 py-1 text-[11px] rounded-sm font-semibold bg-[#FDF4E7] text-[#94601A] border border-[#EAD5B8]">
                Pending Moderation
              </span>
            )}

            <button
              type="button"
              onClick={() => handleToggleApproval(r.id, !r.isApproved)}
              disabled={loadingId === r.id}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              {r.isApproved ? 'Unapprove' : 'Approve'}
            </button>

            <button
              type="button"
              onClick={() => handleDelete(r.id)}
              disabled={loadingId === r.id}
              className="p-2 text-[#8A8175] hover:text-[#8C2B2B] border border-[#E2DACD] rounded-sm"
              title="Delete review"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

