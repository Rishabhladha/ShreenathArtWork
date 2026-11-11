import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { Prisma, OrderStatus, PaymentStatus } from '@prisma/client';
import { requireAdminSession } from '@/lib/auth';
import { formatPrice } from '@/lib/money';
import { PATHS } from '@/lib/paths';
import { Search, ShoppingBag, Eye, Clock, CheckCircle2, Truck, PackageCheck, AlertCircle } from 'lucide-react';

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    search?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const session = await requireAdminSession();
  if (!session) {
    redirect(PATHS.admin.login());
  }

  const { status, paymentStatus, paymentMethod, search } = await searchParams;

  const where: Prisma.OrderWhereInput = {};
  if (status) {
    where.status = status as OrderStatus;
  }
  if (paymentStatus) {
    where.paymentStatus = paymentStatus as PaymentStatus;
  }
  if (paymentMethod) {
    where.paymentMethod = paymentMethod as Prisma.EnumPaymentMethodFilter['equals'];
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search, mode: 'insensitive' } },
      { customerName: { contains: search, mode: 'insensitive' } },
      { customerPhone: { contains: search, mode: 'insensitive' } },
      { customerEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#262320]">
            Orders & Shipments ({orders.length})
          </h1>
          <p className="text-xs text-[#5C554C] mt-0.5">
            Process payments, manage courier waybills, and update temple art shipments.
          </p>
        </div>
      </div>

      {/* Filter Tabs / Quick Stats */}
      <div className="bg-[#FAF7F2] p-4 border border-[#E2DACD] rounded-sm flex flex-col sm:flex-row gap-3">
        <form className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#8A8175] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              name="search"
              defaultValue={search || ''}
              placeholder="Search by order number (e.g. SAW-), customer name or phone..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring"
            />
          </div>
          <button type="submit" className="btn-secondary text-xs py-1.5 px-3">
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs">
          {['ALL', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'].map((st) => (
            <a
              key={st}
              href={st === 'ALL' ? PATHS.admin.orders : `?status=${st}`}
              className={`px-2 py-1 rounded-sm border ${
                (st === 'ALL' && !status) || status === st
                  ? 'bg-[#262320] text-white border-[#262320]'
                  : 'bg-white text-[#5C554C] border-[#E2DACD] hover:bg-[#F4EFE6]'
              }`}
            >
              {st}
            </a>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E2DACD] rounded-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF7F2] border-b border-[#E2DACD] text-[#5C554C] font-semibold">
              <th className="py-2.5 px-3">Order Number</th>
              <th className="py-2.5 px-3">Date</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Artworks</th>
              <th className="py-2.5 px-3">Fulfillment Status</th>
              <th className="py-2.5 px-3">Payment</th>
              <th className="py-2.5 px-3 text-right">Total</th>
              <th className="py-2.5 px-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-[#8A8175]">
                  No orders found matching the filter criteria.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#262320]">
                    {ord.orderNumber}
                  </td>
                  <td className="py-2.5 px-3 text-[#5C554C]">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-[#262320]">{ord.customerName}</p>
                    <p className="text-[11px] text-[#8A8175]">{ord.customerPhone}</p>
                  </td>
                  <td className="py-2.5 px-3">
                    <p className="font-medium text-[#262320]">
                      {ord.items.length} item{ord.items.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-[11px] text-[#8A8175] truncate max-w-xs">
                      {ord.items.map((i) => i.titleSnapshot).join(', ')}
                    </p>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-semibold rounded-xs ${
                        ord.status === 'DELIVERED'
                          ? 'bg-[#EBF5EE] text-[#2A5C38]'
                          : ord.status === 'SHIPPED'
                          ? 'bg-[#EBF2F7] text-[#245C78]'
                          : ord.status === 'CONFIRMED' || ord.status === 'PACKED'
                          ? 'bg-[#FEF6EE] text-[#C47820]'
                          : ord.status === 'CANCELLED'
                          ? 'bg-[#FAF0F0] text-[#8C2B2B]'
                          : 'bg-[#F4EFE6] text-[#8A8175]'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-semibold rounded-xs border ${
                        ord.paymentStatus === 'PAID'
                          ? 'bg-[#EBF5EE] text-[#2A5C38] border-[#B8D9C0]'
                          : ord.paymentStatus === 'FAILED'
                          ? 'bg-[#FAF0F0] text-[#8C2B2B] border-[#D9B5B5]'
                          : 'bg-[#FAF7F2] text-[#8A8175] border-[#E2DACD]'
                      }`}
                    >
                      {ord.paymentStatus} ({ord.paymentMethod})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-[#262320]">
                    {formatPrice(ord.total)}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <Link
                      href={PATHS.admin.orderDetail(ord.id)}
                      className="btn-secondary text-xs py-1 px-2.5"
                    >
                      Manage
                    </Link>
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
