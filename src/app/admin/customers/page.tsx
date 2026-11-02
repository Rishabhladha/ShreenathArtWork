import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { AdminCustomerToggle } from '@/components/admin/AdminCustomerToggle';

export default async function AdminCustomersPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        where: { paymentStatus: 'PAID' },
        select: { total: true },
      },
      _count: { select: { orders: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Registered Customers ({customers.length})
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          Collector accounts, lifetime spend, and account access status.
        </p>
      </div>

      <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F4EFE6] text-[#262320] border-b border-[#E2DACD]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Collector</th>
              <th className="py-2.5 px-3 font-semibold">Phone</th>
              <th className="py-2.5 px-3 font-semibold">Registered</th>
              <th className="py-2.5 px-3 font-semibold text-center">Orders</th>
              <th className="py-2.5 px-3 font-semibold text-right">Lifetime Spend</th>
              <th className="py-2.5 px-3 font-semibold text-right">Status / Access</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-[#8A8175]">
                  No registered customers yet.
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const lifetimeSpend = c.orders.reduce((acc, o) => acc + o.total, 0);

                return (
                  <tr key={c.id} className="hover:bg-[#FAF6EF]">
                    <td className="py-2.5 px-3">
                      <p className="font-medium text-[#262320]">{c.name || 'Anonymous Collector'}</p>
                      <p className="text-[11px] text-[#8A8175]">{c.email}</p>
                    </td>
                    <td className="py-2.5 px-3 text-[#5C554C]">{c.phone || 'N/A'}</td>
                    <td className="py-2.5 px-3 text-[#8A8175]">
                      {new Date(c.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-center text-[#5C554C]">
                      {c._count.orders}
                    </td>
                    <td className="py-2.5 px-3 text-right font-medium text-[#262320]">
                      {formatPrice(lifetimeSpend)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <AdminCustomerToggle customerId={c.id} initialActive={c.isActive} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
