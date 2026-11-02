import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import Link from 'next/link';

export default async function AdminPaymentsPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const payments = await prisma.payment.findMany({
    orderBy: { createdAt: 'desc' },
    include: { order: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#262320]">
            Payment Attempts & Log ({payments.length})
          </h1>
          <p className="text-xs text-[#5C554C] mt-0.5">
            Gateway verification records, simulated/live Razorpay transaction IDs, and settlement fees.
          </p>
        </div>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F4EFE6] text-[#262320] border-b border-[#E2DACD]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Payment ID</th>
              <th className="py-2.5 px-3 font-semibold">Order #</th>
              <th className="py-2.5 px-3 font-semibold">Date</th>
              <th className="py-2.5 px-3 font-semibold">Gateway Order ID</th>
              <th className="py-2.5 px-3 font-semibold">Method</th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#8A8175]">
                  No payment attempts logged yet.
                </td>
              </tr>
            ) : (
              payments.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF6EF]">
                  <td className="py-2.5 px-3 font-mono text-[#262320]">
                    {p.providerPaymentId || p.id.slice(0, 12)}
                  </td>
                  <td className="py-2.5 px-3">
                    <Link
                      href={`/admin/orders/${p.orderId}`}
                      className="text-[#C47820] hover:underline font-mono"
                    >
                      {p.order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-2.5 px-3 text-[#8A8175]">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#5C554C]">
                    {p.providerOrderId || 'N/A'}
                  </td>
                  <td className="py-2.5 px-3 text-[#5C554C]">{p.method || p.provider}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-sm font-semibold border ${
                        p.status === 'PAID'
                          ? 'bg-[#EAE2D5] text-[#2A5C38] border-[#D1C6B4]'
                          : p.status === 'FAILED'
                          ? 'bg-[#FAF0F0] text-[#8C2B2B] border-[#D9B5B5]'
                          : 'bg-[#FAF7F2] text-[#8A8175] border-[#E2DACD]'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-[#262320]">
                    {formatPrice(p.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
