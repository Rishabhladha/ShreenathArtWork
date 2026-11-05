import React from 'react';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { Search, Package, CheckCircle2, Clock, Truck, Home, AlertCircle } from 'lucide-react';

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

export default async function TrackOrderPage({ searchParams }: TrackOrderProps) {
  const { orderNumber, contact } = await searchParams;

  let order = null;
  let errorMsg = null;

  if (orderNumber) {
    if (!contact || !contact.trim()) {
      errorMsg = 'Please enter both your Order Reference Number and matching Customer Email or Mobile.';
      order = null;
    } else {
      order = await prisma.order.findUnique({
        where: { orderNumber: orderNumber.trim() },
        include: {
          items: true,
          statusHistory: { orderBy: { createdAt: 'asc' } },
        },
      });

      if (!order) {
        errorMsg = `No order found with number "${orderNumber}". Please verify your order confirmation.`;
      } else {
        const cleanContact = contact.trim().toLowerCase();
        const emailMatches = order.customerEmail.toLowerCase() === cleanContact;
        const cleanPhone = cleanContact.replace(/\D/g, '');
        const orderPhoneClean = order.customerPhone.replace(/\D/g, '');
        const phoneMatches = cleanPhone.length >= 10 && orderPhoneClean.endsWith(cleanPhone.slice(-10));

        if (!emailMatches && !phoneMatches) {
          errorMsg = 'The email or phone provided does not match our records for this order.';
          order = null;
        }
      }
    }
  }

  // Determine active step index
  const getStepIndex = (status: string) => {
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
  };

  const currentStep = order ? getStepIndex(order.status) : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <div className="border-b border-[#E2DACD] pb-4">
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Shipment Tracking
        </span>
        <h1 className="font-serif text-3xl font-semibold text-[#262320] mt-1">
          Track Your Order
        </h1>
        <p className="text-xs text-[#5C554C] mt-1">
          Enter your order reference number and contact email or phone to view live packaging and courier status.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm">
        <form method="GET" action="/track-order" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Order Reference Number *</label>
              <input
                type="text"
                name="orderNumber"
                required
                defaultValue={orderNumber || ''}
                placeholder="e.g. ORD-2026-001001"
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs text-[#5C554C]">Customer Email or Mobile *</label>
              <input
                type="text"
                name="contact"
                required
                defaultValue={contact || ''}
                placeholder="Email or 10-digit mobile number"
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-2">
            <Search className="w-3.5 h-3.5" />
            <span>Search Status</span>
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="p-4 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Results */}
      {order && (
        <div className="space-y-6">
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE5DA] pb-4">
              <div>
                <span className="text-xs text-[#8A8175]">Order Number</span>
                <p className="font-serif text-xl font-bold text-[#262320]">
                  {order.orderNumber}
                </p>
                <p className="text-[11px] text-[#8A8175]">
                  Placed on{' '}
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="sm:text-right">
                <span className="text-xs text-[#8A8175] block">Current Status</span>
                <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-sm bg-[#EAE2D5] text-[#262320] border border-[#D1C6B4]">
                  {order.status}
                </span>
              </div>
            </div>

            {/* Courier Tracking Info if dispatched */}
            {order.trackingNumber && (
              <div className="p-4 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm text-xs space-y-1">
                <p className="font-semibold text-[#262320]">
                  Courier: {order.courierName || 'Insured Express Logistics'}
                </p>
                <p className="text-[#5C554C]">
                  Tracking Waybill Number:{' '}
                  <span className="font-mono font-semibold text-[#262320]">
                    {order.trackingNumber}
                  </span>
                </p>
              </div>
            )}

            {/* Visual Status Timeline */}
            <div className="space-y-4 pt-2">
              <h2 className="font-serif text-sm font-semibold text-[#262320]">
                Status Timeline
              </h2>

              {order.status === 'CANCELLED' ? (
                <div className="p-4 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B]">
                  This order was cancelled. Reserved paintings have been restocked.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {TIMELINE_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStep;
                    const isCurrent = idx === currentStep;
                    return (
                      <div
                        key={step.key}
                        className={`p-3 rounded-sm border text-center space-y-1 ${
                          isCurrent
                            ? 'bg-[#262320] text-[#FAF6EF] border-[#262320]'
                            : isDone
                            ? 'bg-[#EAE2D5] text-[#262320] border-[#D1C6B4]'
                            : 'bg-[#FAF6EF] text-[#8A8175] border-[#ECE5DA]'
                        }`}
                      >
                        <div className="w-5 h-5 mx-auto flex items-center justify-center">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <p className="text-[11px] font-medium leading-tight">{step.label}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Audit Timeline History */}
            {order.statusHistory.length > 0 && (
              <div className="pt-4 border-t border-[#ECE5DA] space-y-2">
                <h3 className="text-xs font-semibold text-[#262320]">Event History</h3>
                <div className="space-y-2 text-xs">
                  {order.statusHistory.map((h) => (
                    <div
                      key={h.id}
                      className="flex items-start justify-between text-[#5C554C] pb-1 border-b border-[#ECE5DA]"
                    >
                      <div>
                        <span className="font-medium text-[#262320]">{h.status}: </span>
                        <span>{h.note || 'Status update logged'}</span>
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

            {/* Ordered Artworks */}
            <div className="border-t border-[#ECE5DA] pt-4 space-y-2">
              <h3 className="font-serif text-sm font-semibold text-[#262320]">
                Items in this Shipment
              </h3>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

