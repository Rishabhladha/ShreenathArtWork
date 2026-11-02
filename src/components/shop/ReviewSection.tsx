'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Star, MessageSquare } from 'lucide-react';

interface ReviewItem {
  id: string;
  rating: number;
  comment: string;
  authorName: string;
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit review');
      }

      setMessage(data.message || 'Review submitted for moderation.');
      setComment('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 pt-8 border-t border-[#E2DACD]">
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

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-xs text-[#8A8175]">Loading feedback...</p>
        ) : reviews.length === 0 ? (
          <div className="p-6 bg-[#FAF7F2] border border-[#ECE5DA] rounded-sm text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-[#D1C6B4] mx-auto" />
            <p className="font-serif text-base text-[#262320]">No collector reviews yet</p>
            <p className="text-xs text-[#5C554C] max-w-sm mx-auto">
              Only collectors who have received a delivered order for this painting can submit a review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-xs text-[#262320]">{r.authorName}</span>
                  <div className="flex text-[#C47820]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= r.rating ? 'fill-[#C47820]' : 'text-[#D1C6B4]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#5C554C] leading-relaxed">{r.comment}</p>
                <p className="text-[10px] text-[#8A8175]">
                  {new Date(r.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h3 className="font-serif text-base font-semibold text-[#262320]">
          Leave Feedback for this Artwork
        </h3>

        {!session?.user ? (
          <p className="text-xs text-[#5C554C]">
            Please{' '}
            <Link href="/account/login" className="text-[#262320] underline font-medium">
              sign in to your customer account
            </Link>{' '}
            to review an artwork you have purchased and received.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setRating(val)}
                    className="p-1 focus-ring"
                    aria-label={`Rate ${val} out of 5 stars`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        val <= rating ? 'fill-[#C47820] text-[#C47820]' : 'text-[#D1C6B4]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Your Review</label>
              <textarea
                required
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience regarding the artwork brushwork, framing, and presentation..."
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
              />
            </div>

            {error && <p className="text-xs text-[#8C2B2B]">{error}</p>}
            {message && <p className="text-xs text-[#2A5C38]">{message}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs py-2 px-4 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

