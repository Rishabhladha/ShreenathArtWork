import React from 'react';
import { redirect } from 'next/navigation';
import { requireAdminSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Activity, Eye, ShoppingBag, CreditCard, CheckCircle2, UserPlus, AlertCircle } from 'lucide-react';

export default async function AdminActivityPage() {
  const session = await requireAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const [
    events,
    viewsCount,
    cartsCount,
    checkoutsCount,
    ordersCount,
  ] = await Promise.all([
    prisma.activityEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: true },
    }),
    prisma.activityEvent.count({ where: { eventType: 'PRODUCT_VIEW' } }),
    prisma.activityEvent.count({ where: { eventType: 'ADD_TO_CART' } }),
    prisma.activityEvent.count({ where: { eventType: 'CHECKOUT_STARTED' } }),
    prisma.order.count(),
  ]);

  const maxFunnel = Math.max(viewsCount, cartsCount, checkoutsCount, ordersCount, 1);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#E2DACD] pb-4">
        <h1 className="font-serif text-2xl font-bold text-[#262320]">
          Customer Activity & Conversion Funnel
        </h1>
        <p className="text-xs text-[#5C554C] mt-0.5">
          Real visitor telemetry: product views, shopping cart additions, checkout initiations, and completed orders.
        </p>
      </div>

      {/* Real Data Conversion Funnel */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-5">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Store Funnel (Real Telemetry)
        </h2>

        <div className="space-y-4 text-xs">
          {/* Step 1: Views */}
          <div className="space-y-1">
            <div className="flex justify-between text-[#5C554C]">
              <span className="flex items-center gap-1.5 font-medium text-[#262320]">
                <Eye className="w-3.5 h-3.5 text-[#C47820]" />
                <span>1. Product Page Views</span>
              </span>
              <span className="font-semibold text-[#262320]">{viewsCount}</span>
            </div>
            <div className="w-full bg-[#FAF6EF] border border-[#ECE5DA] h-3 rounded-sm overflow-hidden">
              <div
                className="bg-[#C47820] h-full"
                style={{ width: `${Math.round((viewsCount / maxFunnel) * 100)}%` }}
              />
            </div>
          </div>

          {/* Step 2: Carts */}
          <div className="space-y-1">
            <div className="flex justify-between text-[#5C554C]">
              <span className="flex items-center gap-1.5 font-medium text-[#262320]">
                <ShoppingBag className="w-3.5 h-3.5 text-[#2C464F]" />
                <span>2. Added to Cart</span>
              </span>
              <span className="font-semibold text-[#262320]">{cartsCount}</span>
            </div>
            <div className="w-full bg-[#FAF6EF] border border-[#ECE5DA] h-3 rounded-sm overflow-hidden">
              <div
                className="bg-[#2C464F] h-full"
                style={{ width: `${Math.round((cartsCount / maxFunnel) * 100)}%` }}
              />
            </div>
          </div>

          {/* Step 3: Checkouts */}
          <div className="space-y-1">
            <div className="flex justify-between text-[#5C554C]">
              <span className="flex items-center gap-1.5 font-medium text-[#262320]">
                <CreditCard className="w-3.5 h-3.5 text-[#94601A]" />
                <span>3. Checkouts Initiated</span>
              </span>
              <span className="font-semibold text-[#262320]">{checkoutsCount}</span>
            </div>
            <div className="w-full bg-[#FAF6EF] border border-[#ECE5DA] h-3 rounded-sm overflow-hidden">
              <div
                className="bg-[#94601A] h-full"
                style={{ width: `${Math.round((checkoutsCount / maxFunnel) * 100)}%` }}
              />
            </div>
          </div>

          {/* Step 4: Orders */}
          <div className="space-y-1">
            <div className="flex justify-between text-[#5C554C]">
              <span className="flex items-center gap-1.5 font-medium text-[#262320]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2A5C38]" />
                <span>4. Orders Placed</span>
              </span>
              <span className="font-semibold text-[#262320]">{ordersCount}</span>
            </div>
            <div className="w-full bg-[#FAF6EF] border border-[#ECE5DA] h-3 rounded-sm overflow-hidden">
              <div
                className="bg-[#2A5C38] h-full"
                style={{ width: `${Math.round((ordersCount / maxFunnel) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Real Activity Feed */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
        <h2 className="font-serif text-base font-semibold text-[#262320]">
          Recent Activity Feed (Last 50 Events)
        </h2>

        {events.length === 0 ? (
          <p className="text-xs text-[#8A8175] text-center py-6">
            No telemetry events recorded yet. Events populate as visitors interact with paintings.
          </p>
        ) : (
          <div className="space-y-2 text-xs">
            {events.map((e) => (
              <div
                key={e.id}
                className="p-3 bg-[#FAF6EF] border border-[#ECE5DA] rounded-sm flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-2.5">
                  <Activity className="w-4 h-4 text-[#8A8175] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#262320]">{e.eventType}</span>
                    {e.user && (
                      <span className="text-[#8A8175]"> ({e.user.email})</span>
                    )}
                    {e.metadata && (
                      <p className="text-[11px] text-[#5C554C] font-mono mt-0.5">
                        {e.metadata}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-[10px] text-[#8A8175] shrink-0">
                  {new Date(e.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
