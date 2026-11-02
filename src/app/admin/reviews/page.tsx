import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminReviewModerator } from '@/components/admin/AdminReviewModerator';

export default async function AdminReviewsPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: { select: { title: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Reviews Moderation ({reviews.length})
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          Moderate verified collector feedback. Reviews only show publicly once approved.
        </p>
      </div>

      <AdminReviewModerator initialReviews={reviews} />
    </div>
  );
}
