import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminCategoryManager } from '@/components/admin/AdminCategoryManager';

export default async function AdminCategoriesPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    include: {
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Categories ({categories.length})
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          Organize gallery artworks by tradition (Pichwai, Sanctum Portraits, Festival & Utsav, Miniature Art, Large Format).
        </p>
      </div>

      <AdminCategoryManager initialCategories={categories} />
    </div>
  );
}
