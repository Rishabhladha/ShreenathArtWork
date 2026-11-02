import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminCouponManager } from '@/components/admin/AdminCouponManager';

export default async function AdminCouponsPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { redemptions: true } } },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Discount Coupons ({coupons.length})
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          Create promotional percentage discounts or flat INR deductions with order value conditions.
        </p>
      </div>

      <AdminCouponManager initialCoupons={coupons} />
    </div>
  );
}
