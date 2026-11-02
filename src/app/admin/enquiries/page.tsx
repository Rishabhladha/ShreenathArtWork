import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { AdminEnquiryManager } from '@/components/admin/AdminEnquiryManager';

export default async function AdminEnquiriesPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [messages, customOrders] = await Promise.all([
    prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.customOrderRequest.findMany({ orderBy: { createdAt: 'desc' } }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Inquiries & Commission Requests
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          General collector messages and bespoke made-to-order painting commissions.
        </p>
      </div>

      <AdminEnquiryManager messages={messages} customOrders={customOrders} />
    </div>
  );
}
