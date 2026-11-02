import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminOrderDetailManager } from '@/components/admin/AdminOrderDetailManager';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      refunds: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order) {
    notFound();
  }

  return <AdminOrderDetailManager order={order} />;
}
