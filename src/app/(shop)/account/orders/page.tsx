import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { Package, ChevronRight, ArrowLeft } from 'lucide-react';

export default async function CustomerOrdersPage() {
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect('/account/login?callbackUrl=/account/orders');
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="flex items-center gap-2 text-xs text-[#8A8175]">
        <Link href="/account/profile" className="hover:text-[#262320] flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Profile</span>
        </Link>
      </div>

      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-3xl font-semibold text-[#262320]">
          My Orders ({orders.length})
        </h1>
        <p className="text-xs text-[#5C554C] mt-1">
          Complete history of your art acquisitions from our Nathdwara gallery.
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="p-12 bg-[#FAF7F2] border border-[#ECE5DA] rounded-sm text-center space-y-3">
          <Package className="w-12 h-12 text-[#D1C6B4] mx-auto" />
          <p className="font-serif text-lg text-[#262320]">No orders found</p>
          <p className="text-xs text-[#5C554C]">You have not placed any orders under this account yet.</p>
          <div className="pt-2">
            <Link href="/catalog" className="btn-primary text-xs py-2 px-4">
              Explore Paintings
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-5 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#ECE5DA] pb-3">
                <div>
                  <span className="font-serif text-base font-bold text-[#262320]">
                    {order.orderNumber}
                  </span>
                  <p className="text-xs text-[#8A8175] mt-0.5">
                    Placed on{' '}
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-sm bg-[#EAE2D5] text-[#262320] font-medium border border-[#D1C6B4]">
                    {order.status}
                  </span>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <span>View Order</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#5C554C]">
                {order.items.map((i) => (
                  <div key={i.id} className="flex justify-between">
                    <span>
                      {i.titleSnapshot} ({i.sizeSnapshot}, {i.frameSnapshot}) x {i.quantity}
                    </span>
                    <span className="font-medium text-[#262320]">
                      {formatPrice(i.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-[#ECE5DA] flex justify-between items-baseline text-xs">
                <span className="text-[#8A8175]">
                  Payment: {order.paymentMethod} ({order.paymentStatus})
                </span>
                <span className="font-semibold text-sm text-[#262320]">
                  Total: {formatPrice(order.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
