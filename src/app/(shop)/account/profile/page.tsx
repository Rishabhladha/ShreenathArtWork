import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { Package, Heart, LogOut, MapPin, User, ChevronRight } from 'lucide-react';
import { SignOutButton } from '@/components/layout/SignOutButton';

export default async function CustomerProfilePage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect('/account/login?callbackUrl=/account/profile');
  }

  const [user, ordersCount, recentOrders] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: { addresses: true },
    }),
    prisma.order.count({
      where: { userId: session.user.id },
    }),
    prisma.order.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 3,
      include: { items: true },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Profile Header */}
      <div className="border-b border-[#E2DACD] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
            Customer Dashboard
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#262320]">
            Namaste, {user?.name || session.user.email}
          </h1>
          <p className="text-xs text-[#5C554C] mt-0.5">{session.user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <SignOutButton />
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/account/orders"
          className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm hover:border-[#262320] transition-colors space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <Package className="w-5 h-5 text-[#C47820]" />
            <ChevronRight className="w-4 h-4 text-[#8A8175] group-hover:text-[#262320]" />
          </div>
          <p className="font-serif text-base font-semibold text-[#262320]">My Orders</p>
          <p className="text-xs text-[#5C554C]">{ordersCount} total orders</p>
        </Link>

        <Link
          href="/account/wishlist"
          className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm hover:border-[#262320] transition-colors space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <Heart className="w-5 h-5 text-[#C47820]" />
            <ChevronRight className="w-4 h-4 text-[#8A8175] group-hover:text-[#262320]" />
          </div>
          <p className="font-serif text-base font-semibold text-[#262320]">Saved Paintings</p>
          <p className="text-xs text-[#5C554C]">View your wishlist</p>
        </Link>

        <Link
          href="/catalog"
          className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm hover:border-[#262320] transition-colors space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <User className="w-5 h-5 text-[#C47820]" />
            <ChevronRight className="w-4 h-4 text-[#8A8175] group-hover:text-[#262320]" />
          </div>
          <p className="font-serif text-base font-semibold text-[#262320]">Explore Gallery</p>
          <p className="text-xs text-[#5C554C]">Discover new artworks</p>
        </Link>
      </div>

      {/* Recent Orders Overview */}
      <div className="space-y-4 pt-4">
        <div className="flex items-baseline justify-between border-b border-[#E2DACD] pb-3">
          <h2 className="font-serif text-xl font-semibold text-[#262320]">Recent Orders</h2>
          <Link href="/account/orders" className="text-xs text-[#C47820] hover:underline">
            View All ({ordersCount})
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 bg-[#FAF7F2] border border-[#ECE5DA] rounded-sm text-center space-y-2">
            <p className="font-serif text-base text-[#262320]">No orders placed yet</p>
            <p className="text-xs text-[#5C554C]">
              Your artwork purchases will appear here once you place an order.
            </p>
            <div className="pt-2">
              <Link href="/catalog" className="btn-primary text-xs py-2 px-4">
                Browse Paintings
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-sm text-[#262320]">
                      {ord.orderNumber}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-sm bg-[#EAE2D5] text-[#262320] font-medium border border-[#D1C6B4]">
                      {ord.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#8A8175] mt-1">
                    {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    | {ord.items.length} artwork(s)
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-semibold text-sm text-[#262320]">
                    {formatPrice(ord.total)}
                  </span>
                  <Link
                    href={`/account/orders/${ord.id}`}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
