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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#DEC99C] pb-5 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#B8860B] font-sans font-semibold">
            Shipment & Delivery Telemetry
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#231C10] mt-1">
            Track Your Order
          </h1>
          <p className="text-xs sm:text-sm text-[#7A694F] mt-1">
            {isUserLoggedIn
              ? `Namaste, ${session?.user?.name || session?.user?.email}. Your orders are listed below with live fulfillment and courier updates.`
              : 'Enter your order reference number to view live packaging, dispatch, and courier tracking details.'}
          </p>
        </div>

        {isUserLoggedIn && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xs bg-[#FAF7EE] border border-[#DEC99C] text-xs font-medium text-[#231C10]">
              <ShieldCheck className="w-4 h-4 text-[#B8860B]" />
              <span>Signed In: {session?.user?.email}</span>
            </span>
          </div>
        )}
      </div>

      {/* Guest Login Banner if not signed in */}
      {!isUserLoggedIn && (
        <div className="p-4 sm:p-5 bg-white border border-[#DEC99C] rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xs bg-[#231C10] text-[#FAF7EE] flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#231C10]">
                Already have a Shreenath Art Work account?
              </p>
              <p className="text-xs text-[#7A694F] mt-0.5">
                Sign in to automatically view your entire order history without typing your order reference number.
              </p>
            </div>
          </div>
          <Link
            href={PATHS.account.login('/track-order')}
            className="btn-primary text-xs py-2.5 px-4 min-h-[44px] flex items-center gap-1.5 whitespace-nowrap self-start sm:self-center"
          >
            <span>Sign In to Account</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Manual Search Form (Prominent for guests, expandable for logged-in users) */}
      {(!isUserLoggedIn || userOrders.length === 0) && (
        <div className="p-6 bg-white border border-[#DEC99C] rounded-xs space-y-4 shadow-xs">
          <h2 className="font-serif text-base font-semibold text-[#231C10]">
            Lookup Order by Reference
          </h2>
          <form method="GET" action="/track-order" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#4A3E2D]">Order Reference Number *</label>
                <input
                  type="text"
                  name="orderNumber"
                  required
                  defaultValue={orderNumber || ''}
                  placeholder="e.g. SAW-2026-001001"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7EE] border border-[#DEC99C] rounded-xs focus-ring text-[#231C10] min-h-[44px]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#4A3E2D]">Customer Email or 10-Digit Mobile *</label>
                <input
                  type="text"
                  name="contact"
                  required
                  defaultValue={contact || ''}
                  placeholder="Email or phone used during checkout"
                  className="w-full px-3.5 py-2.5 text-xs bg-[#FAF7EE] border border-[#DEC99C] rounded-xs focus-ring text-[#231C10] min-h-[44px]"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary text-xs py-3 px-5 min-h-[44px] flex items-center gap-2">
              <Search className="w-4 h-4" />
              <span>Track Sacred Shipment</span>
            </button>
          </form>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xs text-xs text-[#B91C1C] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Logged in with no orders yet */}
      {isUserLoggedIn && userOrders.length === 0 && !activeOrder && (
        <div className="p-10 bg-white border border-[#DEC99C] rounded-xs text-center space-y-3 shadow-xs">
          <Package className="w-10 h-10 text-[#7A694F] mx-auto opacity-70" />
          <h2 className="font-serif text-lg font-semibold text-[#231C10]">
            No Orders Found for Your Account
          </h2>
          <p className="text-xs text-[#7A694F] max-w-md mx-auto">
            You haven&apos;t placed any orders with this email yet. If you placed an order as a guest, you can look it up using the reference number above.
          </p>
          <div className="pt-2">
            <Link href={PATHS.catalog()} className="btn-primary text-xs py-2.5 px-5 min-h-[44px]">
              Explore Devotional Artworks
            </Link>
          </div>
        </div>
      )}

      {/* Active Order Details Card */}
      {activeOrder && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 bg-white border border-[#DEC99C] rounded-xs space-y-6 shadow-xs">
            {/* Order Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DEC99C]/60 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#B8860B] uppercase tracking-wider">Active Tracking</span>
                  {userOrders.length > 0 && activeOrder.id === userOrders[0]?.id && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#FAF7EE] border border-[#DEC99C] text-[#231C10] font-semibold">
                      Latest Order
                    </span>
                  )}
                </div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#231C10] mt-1">
                  {activeOrder.orderNumber}
                </p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A694F] mt-1.5">
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
                  <span>Recipient: <strong className="text-[#231C10]">{activeOrder.customerName}</strong></span>
                  <span>•</span>
                  <span>Total: <strong className="text-[#231C10]">{formatPrice(activeOrder.total)}</strong></span>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-[#7A694F] block mb-1">Fulfillment Status</span>
                <span
                  className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-xs border ${
                    activeOrder.status === 'DELIVERED'
                      ? 'bg-emerald-50 text-[#15803D] border-emerald-300'
                      : activeOrder.status === 'CANCELLED'
                      ? 'bg-red-50 text-[#B91C1C] border-red-200'
                      : activeOrder.status === 'SHIPPED'
                      ? 'bg-[#FAF7EE] text-[#B8860B] border-[#DEC99C]'
                      : 'bg-[#FAF7EE] text-[#231C10] border-[#DEC99C]'
                  }`}
                >
                  {activeOrder.status}
                </span>
              </div>
            </div>

            {/* Courier Dispatch Banner if tracking is available */}
            {activeOrder.trackingNumber ? (
              <div className="p-4 bg-[#FAF7EE] border border-[#DEC99C] rounded-xs text-xs space-y-1.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#231C10] flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#B8860B]" />
                    <span>Courier: {activeOrder.courierName || 'Insured Express Logistics'}</span>
                  </p>
                  <p className="text-[#4A3E2D] mt-0.5">
                    Waybill Tracking Number:{' '}
                    <span className="font-mono font-semibold text-[#231C10]">
                      {activeOrder.trackingNumber}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#231C10] bg-white px-3 py-1 rounded-xs border border-[#DEC99C] font-medium">
                    Insured Temple Art Transit
                  </span>
                </div>
              </div>
            ) : (
              activeOrder.status !== 'CANCELLED' && activeOrder.status !== 'DELIVERED' && (
                <div className="p-3.5 bg-[#FAF7EE] border border-[#DEC99C]/60 rounded-xs text-xs text-[#4A3E2D] flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[#B8860B] shrink-0" />
                  <span>
                    Your artwork is being carefully framed and prepared in our Nathdwara workshop. A courier tracking waybill number will be assigned upon dispatch.
                  </span>
                </div>
              )
            )}

            {/* Visual Status Timeline */}
            <div className="space-y-4 pt-1">
              <h2 className="font-serif text-sm font-semibold text-[#231C10]">
                Delivery Milestone Timeline
              </h2>

              {activeOrder.status === 'CANCELLED' ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xs text-xs text-[#B91C1C]">
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
                        className={`p-3 rounded-xs border text-center space-y-1.5 transition-all ${
                          isCurrent
                            ? 'bg-[#231C10] text-[#FAF7EE] border-[#231C10] shadow-xs'
                            : isDone
                            ? 'bg-[#FAF7EE] text-[#231C10] border-[#DEC99C]'
                            : 'bg-white text-[#7A694F] border-[#DEC99C]/50'
                        }`}
                      >
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          {isDone ? (
                            <CheckCircle2
                              className={`w-4 h-4 ${isCurrent ? 'text-[#C59B27]' : 'text-[#B8860B]'}`}
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
            <div className="border-t border-[#DEC99C]/60 pt-5 space-y-3">
              <h3 className="font-serif text-sm font-semibold text-[#231C10]">
                Artworks in this Shipment ({activeOrder.items?.length || 0})
              </h3>
              <div className="space-y-2.5">
                {activeOrder.items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#FAF7EE] border border-[#DEC99C] rounded-xs flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <p className="font-semibold text-[#231C10]">{item.titleSnapshot}</p>
                      <p className="text-[11px] text-[#7A694F] mt-0.5">
                        {item.sizeSnapshot} • {item.frameSnapshot} • Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-[#231C10] whitespace-nowrap">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Destination */}
            <div className="border-t border-[#DEC99C]/60 pt-4 flex flex-col sm:flex-row justify-between text-xs text-[#4A3E2D] gap-2">
              <div>
                <span className="font-semibold text-[#231C10]">Delivery Destination: </span>
                <span>{parseAddress(activeOrder.shippingAddress)}</span>
              </div>
              <div className="sm:text-right">
                <span className="font-semibold text-[#231C10]">Payment: </span>
                <span className="uppercase">{activeOrder.paymentMethod}</span> ({activeOrder.paymentStatus})
              </div>
            </div>

            {/* Audit History Log if available */}
            {activeOrder.statusHistory && activeOrder.statusHistory.length > 0 && (
              <div className="border-t border-[#DEC99C]/60 pt-4 space-y-2">
                <h4 className="text-xs font-semibold text-[#231C10]">Shipment Updates & Log</h4>
                <div className="space-y-1.5 text-xs">
                  {activeOrder.statusHistory.map((h: any) => (
                    <div
                      key={h.id}
                      className="flex items-start justify-between text-[#4A3E2D] pb-1 border-b border-[#DEC99C]/40 last:border-b-0"
                    >
                      <div>
                        <span className="font-semibold text-[#231C10]">{h.status}: </span>
                        <span>{h.note || 'Status update recorded'}</span>
                      </div>
                      <span className="text-[10px] text-[#7A694F] shrink-0 ml-2">
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
              <div className="border-b border-[#DEC99C] pb-2 flex items-center justify-between">
                <h2 className="font-serif text-lg font-semibold text-[#231C10]">
                  Your Other Orders ({userOrders.length - 1})
                </h2>
                <span className="text-xs text-[#7A694F]">Click any order below to track it</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userOrders
                  .filter((o) => o.id !== activeOrder.id)
                  .map((ord) => (
                    <Link
                      key={ord.id}
                      href={PATHS.trackOrder(ord.orderNumber)}
                      className="p-4 bg-white border border-[#DEC99C] rounded-xs hover:border-[#B8860B] hover:shadow-xs transition-all flex flex-col justify-between group"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#231C10] group-hover:text-[#B8860B]">
                            {ord.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded-xs border ${
                              ord.status === 'DELIVERED'
                                ? 'bg-emerald-50 text-[#15803D] border-emerald-300'
                                : 'bg-[#FAF7EE] text-[#231C10] border-[#DEC99C]'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#7A694F]">
                          Placed on{' '}
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-[#231C10] font-medium truncate">
                          {ord.items?.map((i: any) => i.titleSnapshot).join(', ')}
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-[#DEC99C]/60 flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#231C10]">{formatPrice(ord.total)}</span>
                        <span className="text-[#B8860B] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>View Tracking</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
