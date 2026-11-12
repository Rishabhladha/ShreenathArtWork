import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { PATHS } from '@/lib/paths';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  AlertTriangle,
  Clock,
  ArrowRight,
  CreditCard,
  Plus,
  Warehouse,
  MailQuestion,
  CheckCircle2,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

export default async function AdminDashboardPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect(PATHS.admin.login());
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
    totalProducts,
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
    prisma.product.count(),
  ]);

  const revenueToday = revenueTodayAggr._sum.total || 0;
  const revenue7Days = revenue7DaysAggr._sum.total || 0;
  const revenue30Days = revenue30DaysAggr._sum.total || 0;
  const revenueAllTime = revenueAllTimeAggr._sum.total || 0;

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'SHIPPED':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'CONFIRMED':
      case 'PROCESSING':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'REFUNDED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FAILED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Title & Quick Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#262320]">
              Gallery Management
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#262320] text-[#DEC99C]">
              LIVE
            </span>
          </div>
          <p className="text-xs text-[#5C554C] mt-1">
            Real-time artwork commerce, workshop orders, inventory levels, and patron inquiries.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={PATHS.admin.productNew}
            className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#DEC99C]" />
            <span>Add New Painting</span>
          </Link>
          <Link
            href={PATHS.admin.orders}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#8A8175]" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {/* Revenue KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today */}
        <div className="p-5 bg-white border border-[#E2DACD] rounded-sm space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[#8A8175]">
            <span className="text-[11px] uppercase tracking-wider font-sans font-semibold">
              Today&apos;s Revenue
            </span>
            <div className="w-7 h-7 rounded-sm bg-[#FAF7F2] border border-[#E2DACD] flex items-center justify-center text-[#262320]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#262320]">
            {formatPrice(revenueToday)}
          </p>
          <p className="text-[10px] text-[#5C554C] flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Paid orders since midnight</span>
          </p>
        </div>

        {/* 7 Days */}
        <div className="p-5 bg-white border border-[#E2DACD] rounded-sm space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[#8A8175]">
            <span className="text-[11px] uppercase tracking-wider font-sans font-semibold">
              Past 7 Days
            </span>
            <div className="w-7 h-7 rounded-sm bg-[#FAF7F2] border border-[#E2DACD] flex items-center justify-center text-[#262320]">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#262320]">
            {formatPrice(revenue7Days)}
          </p>
          <p className="text-[10px] text-[#5C554C]">Trailing 7-day sales performance</p>
        </div>

        {/* 30 Days */}
        <div className="p-5 bg-white border border-[#E2DACD] rounded-sm space-y-2 shadow-2xs">
          <div className="flex items-center justify-between text-[#8A8175]">
            <span className="text-[11px] uppercase tracking-wider font-sans font-semibold">
              Past 30 Days
            </span>
            <div className="w-7 h-7 rounded-sm bg-[#FAF7F2] border border-[#E2DACD] flex items-center justify-center text-[#262320]">
              <TrendingUp className="w-3.5 h-3.5 text-[#A85A32]" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-[#262320]">
            {formatPrice(revenue30Days)}
          </p>
          <p className="text-[10px] text-[#5C554C]">Monthly gross volume</p>
        </div>

        {/* All-time */}
        <div className="p-5 bg-[#262320] text-[#FAF6EF] border border-[#3D3934] rounded-sm space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-[#DEC99C]">
            <span className="text-[11px] uppercase tracking-wider font-sans font-semibold">
              All-Time Revenue
            </span>
            <div className="w-7 h-7 rounded-sm bg-[#3D3934] flex items-center justify-center text-[#DEC99C]">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="font-serif text-2xl font-bold text-white">
            {formatPrice(revenueAllTime)}
          </p>
          <p className="text-[10px] text-[#C4B7A6]">Net collected through gateway & COD</p>
        </div>
      </div>

      {/* Operational Status Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href={PATHS.admin.orders}
          className="p-4 bg-white border border-[#E2DACD] rounded-sm hover:border-[#262320] transition-colors shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C554C]">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#8A8175] group-hover:text-[#262320]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#262320] mt-1">{totalOrders}</p>
        </Link>

        <Link
          href={`${PATHS.admin.orders}?status=PLACED`}
          className="p-4 bg-white border border-[#E2DACD] rounded-sm hover:border-[#A85A32] transition-colors shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C554C]">Fulfillment Queue</span>
            <Clock className="w-4 h-4 text-[#A85A32]" />
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <p className="font-serif text-2xl font-bold text-[#A85A32]">{pendingOrdersCount}</p>
            <span className="text-[10px] text-[#8A8175]">pending</span>
          </div>
        </Link>

        <Link
          href={PATHS.admin.payments}
          className="p-4 bg-white border border-[#E2DACD] rounded-sm hover:border-[#262320] transition-colors shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C554C]">Settled / Unpaid</span>
            <CreditCard className="w-4 h-4 text-[#8A8175] group-hover:text-[#262320]" />
          </div>
          <p className="font-serif text-xl font-bold text-[#262320] mt-1">
            {paidOrders} <span className="text-xs font-normal text-[#8A8175]">/ {unpaidOrdersCount}</span>
          </p>
        </Link>

        <Link
          href={PATHS.admin.customers}
          className="p-4 bg-white border border-[#E2DACD] rounded-sm hover:border-[#262320] transition-colors shadow-2xs group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C554C]">Patrons & Collectors</span>
            <Users className="w-4 h-4 text-[#8A8175] group-hover:text-[#262320]" />
          </div>
          <p className="font-serif text-2xl font-bold text-[#262320] mt-1">{totalCustomers}</p>
        </Link>
      </div>

      {/* Main Grid: Orders & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#262320]">
                Recent Orders
              </h2>
              <p className="text-xs text-[#5C554C]">
                Latest customer acquisitions and shipping milestones.
              </p>
            </div>
            <Link
              href={PATHS.admin.orders}
              className="text-xs font-medium text-[#A85A32] hover:text-[#8F4824] flex items-center gap-1"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 bg-white border border-[#E2DACD] rounded-sm text-center text-xs text-[#8A8175] space-y-2">
              <ShoppingBag className="w-6 h-6 mx-auto text-[#DEC99C]" />
              <p className="font-medium text-[#262320]">No orders recorded yet</p>
              <p>Customer checkout orders will appear here automatically with full tracking.</p>
            </div>
          ) : (
            <div className="bg-white border border-[#E2DACD] rounded-sm overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-[#FAF7F2] text-[#262320] border-b border-[#E2DACD]">
                    <tr>
                      <th className="py-3 px-3 font-semibold">Order</th>
                      <th className="py-3 px-3 font-semibold">Collector</th>
                      <th className="py-3 px-3 font-semibold">Fulfillment</th>
                      <th className="py-3 px-3 font-semibold">Payment</th>
                      <th className="py-3 px-3 font-semibold text-right">Total</th>
                      <th className="py-3 px-3 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#ECE5DA]">
                    {recentOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="py-3 px-3 font-mono font-medium text-[#262320]">
                          <Link
                            href={PATHS.admin.orderDetail(ord.id)}
                            className="hover:underline hover:text-[#A85A32]"
                          >
                            {ord.orderNumber}
                          </Link>
                          <span className="block text-[10px] text-[#8A8175] font-sans">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-[#262320] truncate max-w-[140px]">
                            {ord.customerName}
                          </p>
                          <p className="text-[10px] text-[#8A8175]">{ord.items.length} {ord.items.length === 1 ? 'painting' : 'paintings'}</p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] rounded-xs font-medium border ${getOrderStatusBadge(
                              ord.status
                            )}`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] rounded-xs font-medium border ${getPaymentStatusBadge(
                              ord.paymentStatus
                            )}`}
                          >
                            {ord.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-[#262320]">
                          {formatPrice(ord.total)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={PATHS.admin.orderDetail(ord.id)}
                            className="text-[#A85A32] hover:text-[#8F4824] font-medium"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Operational Sidebar (Stock & Messages) */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="p-5 bg-white border border-[#E2DACD] rounded-sm space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-sm font-bold text-[#262320] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#A85A32]" />
                <span>Low Inventory Notice</span>
              </h2>
              <Link
                href={PATHS.admin.inventory}
                className="text-xs text-[#A85A32] hover:underline font-medium"
              >
                Stock View
              </Link>
            </div>

            {lowStockVariants.length === 0 ? (
              <p className="text-xs text-[#5C554C]">
                All workshop artworks currently maintain healthy inventory reserves.
              </p>
            ) : (
              <div className="space-y-2.5 text-xs">
                {lowStockVariants.map((v) => (
                  <div
                    key={v.id}
                    className="p-2.5 bg-[#FAF7F2] border border-[#ECE5DA] rounded-sm flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#262320] truncate">{v.product.title}</p>
                      <p className="text-[10px] text-[#8A8175]">
                        {v.size} {v.frame ? `• ${v.frame}` : ''}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-xs font-semibold shrink-0 border ${
                        v.stock === 0
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {v.stock === 0 ? 'Out of Stock' : `${v.stock} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Inquiries */}
          <div className="p-5 bg-white border border-[#E2DACD] rounded-sm space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-sm font-bold text-[#262320] flex items-center gap-1.5">
                <MailQuestion className="w-4 h-4 text-[#262320]" />
                <span>Patron Inquiries</span>
              </h2>
              {inquiriesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#A85A32] text-white">
                  {inquiriesCount} new
                </span>
              )}
            </div>

            <p className="text-xs text-[#5C554C]">
              {inquiriesCount === 0
                ? 'All custom commission requests and inquiries are answered.'
                : `You have ${inquiriesCount} unread patron messages awaiting curator response.`}
            </p>

            <Link
              href={PATHS.admin.enquiries}
              className="btn-secondary text-xs py-2 px-3 w-full flex items-center justify-center gap-1.5"
            >
              <span>Open Inquiries Portal</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick Stats Summary */}
          <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm text-xs space-y-2">
            <p className="font-semibold text-[#262320] text-[11px] uppercase tracking-wider">
              Workshop Overview
            </p>
            <div className="flex justify-between text-[#5C554C]">
              <span>Active Artwork Catalog:</span>
              <span className="font-semibold text-[#262320]">{totalProducts} paintings</span>
            </div>
            <div className="flex justify-between text-[#5C554C]">
              <span>Registered Collectors:</span>
              <span className="font-semibold text-[#262320]">{totalCustomers} accounts</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
