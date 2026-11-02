import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalOrders,
    pendingOrdersCount,
    paidOrders,
    unpaidOrdersCount,
    revenueTodayAggr,
    revenue7DaysAggr,
    revenue30DaysAggr,
    revenueAllTimeAggr,
    lowStockVariants,
    totalCustomers,
    recentOrders,
    inquiriesCount,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['PLACED', 'CONFIRMED'] } } }),
    prisma.order.count({ where: { paymentStatus: 'PAID' } }),
    prisma.order.count({ where: { paymentStatus: { in: ['CREATED', 'PENDING'] } } }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: todayStart } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: sevenDaysAgo } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID', createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lte: 2 } },
      include: { product: true },
      take: 6,
    }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { items: true },
    }),
    prisma.contactMessage.count({ where: { status: 'NEW' } }),
  ]);

  const revenueToday = revenueTodayAggr._sum.total || 0;
  const revenue7Days = revenue7DaysAggr._sum.total || 0;
  const revenue30Days = revenue30DaysAggr._sum.total || 0;
  const revenueAllTime = revenueAllTimeAggr._sum.total || 0;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#262320]">
            Gallery Management Overview
          </h1>
          <p className="text-xs text-[#5C554C] mt-0.5">
            Real-time sales, order fulfillment, and workshop inventory metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/products/new" className="btn-primary text-xs py-2 px-3">
            Add New Painting
          </Link>
        </div>
      </div>

      {/* Revenue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-1">
          <span className="text-[11px] text-[#8A8175] uppercase tracking-wider font-sans font-medium">
            Revenue Today
          </span>
          <p className="font-serif text-2xl font-bold text-[#262320]">
            {formatPrice(revenueToday)}
          </p>
          <p className="text-[10px] text-[#5C554C]">Paid transactions</p>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-1">
          <span className="text-[11px] text-[#8A8175] uppercase tracking-wider font-sans font-medium">
            Revenue (7 Days)
          </span>
          <p className="font-serif text-2xl font-bold text-[#262320]">
            {formatPrice(revenue7Days)}
          </p>
          <p className="text-[10px] text-[#5C554C]">Past 7 days</p>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-1">
          <span className="text-[11px] text-[#8A8175] uppercase tracking-wider font-sans font-medium">
            Revenue (30 Days)
          </span>
          <p className="font-serif text-2xl font-bold text-[#262320]">
            {formatPrice(revenue30Days)}
          </p>
          <p className="text-[10px] text-[#5C554C]">Past 30 days</p>
        </div>

        <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-1">
          <span className="text-[11px] text-[#8A8175] uppercase tracking-wider font-sans font-medium">
            All Time Revenue
          </span>
          <p className="font-serif text-2xl font-bold text-[#262320]">
            {formatPrice(revenueAllTime)}
          </p>
          <p className="text-[10px] text-[#5C554C]">Total collected</p>
        </div>
      </div>

      {/* Order Status Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5C554C]">Total Orders</span>
            <p className="font-serif text-xl font-bold text-[#262320]">{totalOrders}</p>
          </div>
          <ShoppingBag className="w-5 h-5 text-[#8A8175]" />
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5C554C]">Fulfillment Pending</span>
            <p className="font-serif text-xl font-bold text-[#C47820]">
              {pendingOrdersCount}
            </p>
          </div>
          <Clock className="w-5 h-5 text-[#C47820]" />
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5C554C]">Paid vs Unpaid</span>
            <p className="font-serif text-xl font-bold text-[#262320]">
              {paidOrders} / {unpaidOrdersCount}
            </p>
          </div>
          <CreditCard className="w-5 h-5 text-[#8A8175]" />
        </div>

        <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-[#5C554C]">Registered Customers</span>
            <p className="font-serif text-xl font-bold text-[#262320]">{totalCustomers}</p>
          </div>
          <Users className="w-5 h-5 text-[#8A8175]" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-lg font-semibold text-[#262320]">
              Recent Orders
            </h2>
            <Link href="/admin/orders" className="text-xs text-[#C47820] hover:underline">
              View All Orders
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-8 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm text-center text-xs text-[#5C554C]">
              No orders placed yet. Orders will appear here upon customer checkout.
            </div>
          ) : (
            <div className="bg-[#FAF7F2] border border-[#E2DACD] rounded-sm overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#F4EFE6] text-[#262320] border-b border-[#E2DACD]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Order</th>
                    <th className="py-2.5 px-3 font-semibold">Customer</th>
                    <th className="py-2.5 px-3 font-semibold">Date</th>
                    <th className="py-2.5 px-3 font-semibold">Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Total</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE5DA]">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF6EF]">
                      <td className="py-2.5 px-3 font-mono font-medium text-[#262320]">
                        {ord.orderNumber}
                      </td>
                      <td className="py-2.5 px-3 text-[#5C554C]">{ord.customerName}</td>
                      <td className="py-2.5 px-3 text-[#8A8175]">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 text-[10px] rounded-sm bg-[#EAE2D5] text-[#262320] font-medium border border-[#D1C6B4]">
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-[#262320]">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Link
                          href={`/admin/orders/${ord.id}`}
                          className="text-[#C47820] hover:underline"
                        >
                          Manage
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Alerts & Inquiries Sidebar */}
        <div className="space-y-6">
          {/* Low Stock Alert */}
          <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-sm font-semibold text-[#262320] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#C47820]" />
                <span>Low Inventory Notice</span>
              </h2>
              <Link href="/admin/inventory" className="text-xs text-[#C47820] hover:underline">
                Manage Stock
              </Link>
            </div>

            {lowStockVariants.length === 0 ? (
              <p className="text-xs text-[#5C554C]">
                All product variants have healthy stock levels.
              </p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {lowStockVariants.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 bg-[#FAF6EF] border border-[#ECE5DA] rounded-sm flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="font-medium text-[#262320] truncate">{v.product.title}</p>
                      <p className="text-[11px] text-[#8A8175]">
                        {v.size} ({v.frame})
                      </p>
                    </div>
                    <span
                      className={`text-[11px] px-1.5 py-0.5 rounded-sm font-semibold shrink-0 ${
                        v.stock === 0
                          ? 'bg-[#FAF0F0] text-[#8C2B2B] border border-[#D9B5B5]'
                          : 'bg-[#FDF4E7] text-[#94601A] border border-[#EAD5B8]'
                      }`}
                    >
                      {v.stock === 0 ? 'Out of Stock' : `${v.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Inquiries Card */}
          <div className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3">
            <h2 className="font-serif text-sm font-semibold text-[#262320]">
              Pending Inquiries
            </h2>
            <p className="text-xs text-[#5C554C]">
              You have <strong>{inquiriesCount}</strong> unread contact messages awaiting reply.
            </p>
            <div>
              <Link
                href="/admin/enquiries"
                className="btn-secondary text-xs py-1.5 px-3 inline-flex items-center gap-1"
              >
                <span>Open Enquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
