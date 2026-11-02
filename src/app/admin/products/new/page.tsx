import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ProductForm } from '@/components/admin/ProductForm';

export default async function NewProductPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const categories = await prisma.category.findMany({
    orderBy: { displayOrder: 'asc' },
    select: { id: true, name: true },
  });

  return <ProductForm categories={categories} />;
}
