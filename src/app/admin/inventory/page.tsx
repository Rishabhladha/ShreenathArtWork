import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminInventoryManager } from '@/components/admin/AdminInventoryManager';

export default async function AdminInventoryPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const variants = await prisma.productVariant.findMany({
    orderBy: { stock: 'asc' },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Inventory & Stock Management
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          Real database stock levels. Adjust counts with recorded audit reasons.
        </p>
      </div>

      <AdminInventoryManager initialVariants={variants} />
    </div>
  );
}
