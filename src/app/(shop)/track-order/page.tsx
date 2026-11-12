import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { getServerAuthSession } from '@/lib/auth';
import { formatPrice } from '@/lib/money';
import { PATHS } from '@/lib/paths';
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  Home,
  AlertCircle,
  LogIn,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface TrackOrderProps {
  searchParams: Promise<{
    orderNumber?: string;
    contact?: string;
  }>;
}

const TIMELINE_STEPS = [
  { key: 'PLACED', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed & Framed', icon: Package },
  { key: 'PACKED', label: 'Inspected & Packed', icon: Package },
  { key: 'SHIPPED', label: 'Dispatched via Courier', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: Home },
];

function getStepIndex(status: string) {
  switch (status) {
    case 'PLACED':
      return 0;
    case 'CONFIRMED':
      return 1;
    case 'PACKED':
      return 2;
    case 'SHIPPED':
      return 3;
    case 'DELIVERED':
      return 4;
    default:
      return 0;
  }
}

function parseAddress(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    const parts = [
      parsed.addressLine1,
      parsed.addressLine2,
      parsed.landmark,
      parsed.city,
      parsed.state,
      parsed.postalCode,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : raw;
  } catch {
    return raw;
  }
}

export default async function TrackOrderPage({ searchParams }: TrackOrderProps) {
  const { orderNumber, contact } = await searchParams;
  const session = await getServerAuthSession();

  let userOrders: Array<any> = [];
  let activeOrder: any = null;
  let errorMsg: string | null = null;
  const isUserLoggedIn = Boolean(session?.user);

  // 1. If user is logged in, automatically fetch all their orders (latest first)
  if (isUserLoggedIn && session?.user) {
    userOrders = await prisma.order.findMany({
      where: {
        OR: [
          ...(session.user.id ? [{ userId: session.user.id }] : []),
          ...(session.user.email ? [{ customerEmail: session.user.email.toLowerCase().trim() }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (userOrders.length > 0) {
      if (orderNumber) {
        const found = userOrders.find(
          (o) => o.orderNumber.toLowerCase() === orderNumber.trim().toLowerCase()
        );
        activeOrder = found || userOrders[0];
      } else {
        // Automatically default to the latest order on top
        activeOrder = userOrders[0];
      }
    }
  }

  // 2. If not found in user orders, or if a guest is performing a manual lookup
  if (!activeOrder && orderNumber) {
    if (!contact || !contact.trim()) {
      errorMsg = 'Please enter both your Order Reference Number and matching Customer Email or Mobile.';
    } else {
      const foundOrder = await prisma.order.findUnique({
        where: { orderNumber: orderNumber.trim() },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      if (!foundOrder) {
        errorMsg = `No order found with number "${orderNumber}". Please verify your order confirmation.`;
      } else {
        const cleanContact = contact.trim().toLowerCase();
        const emailMatches = foundOrder.customerEmail.toLowerCase() === cleanContact;
        const cleanPhone = cleanContact.replace(/\D/g, '');
        const orderPhoneClean = foundOrder.customerPhone.replace(/\D/g, '');
        const phoneMatches =
          cleanPhone.length >= 10 && orderPhoneClean.endsWith(cleanPhone.slice(-10));

        if (!emailMatches && !phoneMatches) {
          errorMsg = 'The email or phone provided does not match our records for this order.';
        } else {
          activeOrder = foundOrder;
        }
      }
    }
  }

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#E2DACD] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans font-medium">
            Shipment & Delivery Telemetry
          </span>
          <h1 className="font-serif text-3xl font-semibold text-[#262320] mt-1">
            Track Your Order
          </h1>
          <p className="text-xs text-[#5C554C] mt-1">
            {isUserLoggedIn
              ? `Namaste, ${session?.user?.name || session?.user?.email}. Your orders are listed below with live delivery status.`
              : 'Enter your order reference number to view live packaging, dispatch, and courier tracking details.'}
          </p>
        </div>

        {isUserLoggedIn && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-[#FAF1E8] border border-[#DEC99C] text-[11px] font-medium text-[#A85A32]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Signed In: {session?.user?.email}</span>
            </span>
          </div>
        )}
      </div>

      {/* Guest Login Banner if not signed in */}
      {!isUserLoggedIn && (
        <div className="p-4 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-[#262320] text-[#FAF6EF] flex items-center justify-center shrink-0">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#262320]">
                Already have a Shreenath Art Work account?
              </p>
              <p className="text-[11px] text-[#5C554C]">
                Sign in to automatically view your entire order history without typing your order reference number.
              </p>
            </div>
          </div>
          <Link
            href={PATHS.account.login('/track-order')}
            className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center"
          >
            <span>Sign In to Account</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Manual Search Form (Prominent for guests, expandable for logged-in users) */}
      {(!isUserLoggedIn || userOrders.length === 0) && (
        <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4 shadow-2xs">
          <h2 className="font-serif text-base font-semibold text-[#262320]">
            Lookup Order by Reference
          </h2>
          <form method="GET" action="/track-order" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Order Reference Number *</label>
                <input
                  type="text"
                  name="orderNumber"
                  required
                  defaultValue={orderNumber || ''}
                  placeholder="e.g. SAW-2026-001001"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Customer Email or 10-Digit Mobile *</label>
                <input
                  type="text"
                  name="contact"
                  required
                  defaultValue={contact || ''}
                  placeholder="Email or phone used during checkout"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              <span>Track Shipment</span>
            </button>
          </form>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Logged in with no orders yet */}
      {isUserLoggedIn && userOrders.length === 0 && !activeOrder && (
        <div className="p-10 bg-[#FAF7F2] border border-[#ECE5DA] rounded-sm text-center space-y-3">
          <Package className="w-10 h-10 text-[#8A8175] mx-auto opacity-70" />
          <h2 className="font-serif text-lg font-semibold text-[#262320]">
            No Orders Found for Your Account
          </h2>
          <p className="text-xs text-[#5C554C] max-w-md mx-auto">
            You haven&apos;t placed any orders with this email yet. If you placed an order as a guest, you can look it up using the reference number above.
          </p>
          <div className="pt-2">
            <Link href={PATHS.catalog()} className="btn-primary text-xs py-2 px-4">
              Explore Devotional Artworks
            </Link>
          </div>
        </div>
      )}

      {/* Active Order Details Card */}
      {activeOrder && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white border border-[#DEC99C] rounded-sm space-y-6 shadow-sm">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE5DA] pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#8A8175]">Active Tracking</span>
                  {userOrders.length > 0 && activeOrder.id === userOrders[0]?.id && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#EAE2D5] text-[#262320] font-semibold">
                      Latest Order
                    </span>
                  )}
                </div>
                <p className="font-serif text-2xl font-bold text-[#262320] mt-0.5">
                  {activeOrder.orderNumber}
                </p>
                <div className="flex items-center gap-3 text-xs text-[#8A8175] mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(activeOrder.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </span>
                  <span>•</span>
                  <span>Recipient: <strong className="text-[#262320]">{activeOrder.customerName}</strong></span>
                  <span>•</span>
                  <span>Total: <strong className="text-[#262320]">{formatPrice(activeOrder.total)}</strong></span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-[#8A8175] block mb-1">Fulfillment Status</span>
                <span
                  className={`inline-block px-3 py-1 text-xs font-semibold rounded-sm border ${
                    activeOrder.status === 'DELIVERED'
                      ? 'bg-[#EAF3EB] text-[#2A5C38] border-[#B7D8BD]'
                      : activeOrder.status === 'CANCELLED'
                      ? 'bg-[#FAF0F0] text-[#8C2B2B] border-[#D9B5B5]'
                      : activeOrder.status === 'SHIPPED'
                      ? 'bg-[#FAF1E8] text-[#A85A32] border-[#DEC99C]'
                      : 'bg-[#FAF7F2] text-[#262320] border-[#D1C6B4]'
                  }`}
                >
                  {activeOrder.status}
                </span>
              </div>
            </div>

            {/* Courier Dispatch Banner if tracking is available */}
            {activeOrder.trackingNumber ? (
              <div className="p-4 bg-[#FAF7F2] border border-[#DEC99C] rounded-sm text-xs space-y-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#262320] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#A85A32]" />
                    <span>Courier: {activeOrder.courierName || 'Insured Express Logistics'}</span>
                  </p>
                  <p className="text-[#5C554C] mt-0.5">
                    Waybill Tracking Number:{' '}
                    <span className="font-mono font-semibold text-[#262320]">
                      {activeOrder.trackingNumber}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#A85A32] bg-[#FAF1E8] px-2.5 py-1 rounded-sm border border-[#DEC99C]">
                    Insured Temple Art Transit
                  </span>
                </div>
              </div>
            ) : (
              activeOrder.status !== 'CANCELLED' && activeOrder.status !== 'DELIVERED' && (
                <div className="p-3.5 bg-[#FAF7F2] border border-[#ECE5DA] rounded-sm text-xs text-[#5C554C] flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#8A8175] shrink-0" />
                  <span>
                    Your artwork is being carefully framed and prepared in our Nathdwara workshop. A courier tracking waybill number will be assigned upon dispatch.
                  </span>
                </div>
              )
            )}

            {/* Visual Status Timeline */}
            <div className="space-y-4 pt-1">
              <h2 className="font-serif text-sm font-semibold text-[#262320]">
                Delivery Milestone Timeline
              </h2>

              {activeOrder.status === 'CANCELLED' ? (
                <div className="p-4 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B]">
                  This order was cancelled. Reserved paintings have been returned to gallery inventory.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-sm border text-center space-y-1.5 transition-all ${
                          isCurrent
                            ? 'bg-[#262320] text-[#FAF6EF] border-[#262320] shadow-xs'
                            : isDone
                            ? 'bg-[#FAF1E8] text-[#262320] border-[#DEC99C]'
                            : 'bg-[#FAF7F2] text-[#8A8175] border-[#ECE5DA]'
                        }`}
                      >
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          {isDone ? (
                            <CheckCircle2
                              className={`w-4 h-4 ${isCurrent ? 'text-[#DEC99C]' : 'text-[#A85A32]'}`}
                            />
                          ) : (
                            <Clock className="w-4 h-4 opacity-50" />
                          )}
                        </div>
                        <p className="text-[11px] font-medium leading-tight">{step.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Ordered Artworks */}
            <div className="border-t border-[#ECE5DA] pt-5 space-y-3">
              <h3 className="font-serif text-sm font-semibold text-[#262320]">
                Artworks in this Shipment ({activeOrder.items?.length || 0})
              </h3>
              <div className="space-y-2.5">
                {activeOrder.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#FAF7F2] border border-[#ECE5DA] rounded-sm flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <p className="font-semibold text-[#262320]">{item.titleSnapshot}</p>
                      <p className="text-[11px] text-[#7A7165] mt-0.5">
                        {item.sizeSnapshot} • {item.frameSnapshot} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-medium text-[#262320] whitespace-nowrap">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="border-t border-[#ECE5DA] pt-4 flex flex-col sm:flex-row justify-between text-xs text-[#5C554C] gap-2">
              <div>
                <span className="font-medium text-[#262320]">Delivery Destination: </span>
                <span>{parseAddress(activeOrder.shippingAddress)}</span>
              </div>
              <div className="text-right">
                <span className="font-medium text-[#262320]">Payment: </span>
                <span className="uppercase">{activeOrder.paymentMethod}</span> ({activeOrder.paymentStatus})
              </div>
            </div>

            {/* Audit History Log if available */}
            {activeOrder.statusHistory && activeOrder.statusHistory.length > 0 && (
              <div className="border-t border-[#ECE5DA] pt-4 space-y-2">
                <h4 className="text-xs font-semibold text-[#262320]">Shipment Updates & Log</h4>
                <div className="space-y-1.5 text-xs">
                  {activeOrder.statusHistory.map((h: any) => (
                    <div
                      key={h.id}
                      className="flex items-start justify-between text-[#5C554C] pb-1 border-b border-[#ECE5DA]/60 last:border-b-0"
                    >
                      <div>
                        <span className="font-medium text-[#262320]">{h.status}: </span>
                        <span>{h.note || 'Status update recorded'}</span>
                      </div>
                      <span className="text-[10px] text-[#8A8175] shrink-0 ml-2">
                        {new Date(h.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User's Previous Orders List (if logged in and has multiple orders) */}
          {userOrders.length > 1 && (
            <div className="space-y-4 pt-4">
              <div className="border-b border-[#E2DACD] pb-2 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-[#262320]">
                  Your Other Orders ({userOrders.length - 1})
                </h2>
                <span className="text-xs text-[#8A8175]">Click any order below to track it</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userOrders
                  .filter((o) => o.id !== activeOrder.id)
                  .map((ord) => (
                    <Link
                      key={ord.id}
                      href={PATHS.trackOrder(ord.orderNumber)}
                      className="p-4 bg-white border border-[#E2DACD] rounded-sm hover:border-[#262320] hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#262320] group-hover:text-[#A85A32]">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-sm border ${
                              ord.status === 'DELIVERED'
                                ? 'bg-[#EAF3EB] text-[#2A5C38] border-[#B7D8BD]'
                                : 'bg-[#FAF7F2] text-[#262320] border-[#D1C6B4]'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A7165]">
                          Placed on{' '}
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-[#262320] font-medium truncate">
                          {ord.items?.map((i: any) => i.titleSnapshot).join(', ')}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#ECE5DA] flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#262320]">{formatPrice(ord.total)}</span>
                        <span className="text-[#A85A32] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          <span>View Tracking</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}

          {/* Option to look up another order for logged in users */}
          {isUserLoggedIn && (
            <div className="pt-4 text-center">
              <details className="text-xs text-[#8A8175] inline-block cursor-pointer">
                <summary className="hover:text-[#262320] transition-colors py-1 px-3 border border-[#E2DACD] rounded-sm bg-[#FAF7F2]">
                  Looking for an order placed with a different email?
                </summary>
                <div className="p-4 bg-white border border-[#E2DACD] rounded-sm mt-3 text-left max-w-lg mx-auto shadow-sm">
                  <form method="GET" action="/track-order" className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-xs text-[#5C554C]">Order Reference Number</label>
                      <input
                        type="text"
                        name="orderNumber"
                        required
                        placeholder="e.g. SAW-2026-001001"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2DACD] rounded-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs text-[#5C554C]">Customer Email or Mobile</label>
                      <input
                        type="text"
                        name="contact"
                        required
                        placeholder="Email or phone"
                        className="w-full px-3 py-1.5 text-xs bg-[#FAF7F2] border border-[#E2DACD] rounded-sm"
                      />
                    </div>
                    <button type="submit" className="btn-secondary text-xs py-1.5 px-3">
                      Search Order
                    </button>
                  </form>
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
