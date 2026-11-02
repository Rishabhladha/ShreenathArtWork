import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { Eye, Download, Search, Filter } from 'lucide-react';

interface OrdersPageProps {
  searchParams: Promise<{
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    search?: string;
  }>;
}

export default async function AdminOrdersPage({ searchParams }: OrdersPageProps) {
  const { status, paymentStatus, paymentMethod, search } = await searchParams;

  const where: any = {};
  if (status) {
    where.status = status;
  }
  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }
  if (paymentMethod) {
    where.paymentMethod = paymentMethod;
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
    orderBy: { createdAt: 'desc' },
    include: { items: true, payments: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-[#262320]">
            Orders & Shipments ({orders.length})
          </h1>
          <p className="text-xs text-[#5C554C] mt-0.5">
            Manage customer purchases, wooden crate courier dispatch, and payment status.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm">
        <form method="GET" action="/admin/orders" className="flex flex-wrap items-center gap-3 text-xs">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search by order number, name, phone..."
            className="px-3 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320] w-64"
          />

          <select
            name="status"
            defaultValue={status || ''}
            className="px-3 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
          >
            <option value="">All Fulfillment Statuses</option>
            <option value="PLACED">Placed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURNED">Returned</option>
          </select>

          <select
            name="paymentStatus"
            defaultValue={paymentStatus || ''}
            className="px-3 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
          >
            <option value="">All Payment Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="CREATED">Created</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          <select
            name="paymentMethod"
            defaultValue={paymentMethod || ''}
            className="px-3 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
          >
            <option value="">All Payment Methods</option>
            <option value="ONLINE">Online (Razorpay)</option>
            <option value="COD">Cash on Delivery</option>
          </select>

          <button type="submit" className="btn-secondary text-xs py-1.5 px-3">
            Filter
          </button>
        </form>
      </div>

      {/* Orders Table */}
      <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="bg-[#F4EFE6] text-[#262320] border-b border-[#E2DACD]">
            <tr>
              <th className="py-2.5 px-3 font-semibold">Order</th>
              <th className="py-2.5 px-3 font-semibold">Date</th>
              <th className="py-2.5 px-3 font-semibold">Customer</th>
              <th className="py-2.5 px-3 font-semibold">Fulfillment</th>
              <th className="py-2.5 px-3 font-semibold">Payment</th>
              <th className="py-2.5 px-3 font-semibold text-right">Amount</th>
              <th className="py-2.5 px-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECE5DA]">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-[#8A8175]">
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF6EF]">
                  <td className="py-2.5 px-3 font-mono font-medium text-[#262320]">
                    {ord.orderNumber}
                  </td>
                  <td className="py-2.5 px-3 text-[#8A8175]">
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
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-sm font-semibold border ${
                        ord.status === 'DELIVERED'
                          ? 'bg-[#EAE2D5] text-[#2A5C38] border-[#D1C6B4]'
                          : ord.status === 'CANCELLED'
                          ? 'bg-[#FAF0F0] text-[#8C2B2B] border-[#D9B5B5]'
                          : ord.status === 'SHIPPED'
                          ? 'bg-[#FDF4E7] text-[#94601A] border-[#EAD5B8]'
                          : 'bg-[#FAF7F2] text-[#262320] border-[#E2DACD]'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] rounded-sm font-semibold border ${
                        ord.paymentStatus === 'PAID'
                          ? 'bg-[#EAE2D5] text-[#2A5C38] border-[#D1C6B4]'
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
                      href={`/admin/orders/${ord.id}`}
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
