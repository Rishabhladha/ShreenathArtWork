import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { ProductForm } from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        variants: { orderBy: { price: 'asc' } },
        images: { orderBy: { displayOrder: 'asc' } },
      },
    }),
    prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true },
    }),
  ]);

  if (!product) {
    notFound();
  }

  return <ProductForm initialProduct={product} categories={categories} />;
}
