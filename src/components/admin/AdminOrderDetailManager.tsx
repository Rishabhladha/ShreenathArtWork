'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/money';
import { ArrowLeft, Printer, Truck, DollarSign, Ban, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface OrderItemRecord {
  id: string;
  titleSnapshot: string;
  sizeSnapshot: string;
  frameSnapshot: string;
  priceSnapshot: number;
  subtotal: number;
  quantity: number;
}

interface StatusHistoryRecord {
  id: string;
  status: string;
  note?: string | null;
  changedBy: string;
  createdAt: string | Date;
}

interface PaymentRecord {
  id: string;
  provider: string;
  providerPaymentId?: string | null;
  status: string;
  method?: string | null;
  amount: number;
  createdAt: string | Date;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  orderNotes?: string | null;
  courierName?: string | null;
  trackingNumber?: string | null;
  internalNotes?: string | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  createdAt: string | Date;
  items: OrderItemRecord[];
  statusHistory: StatusHistoryRecord[];
  payments: PaymentRecord[];
}

interface AddressData {
  customerName?: string;
  customerPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export function AdminOrderDetailManager({ order }: { order: OrderDetail }) {
  const router = useRouter();

  const [status, setStatus] = useState(order.status);
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [internalNotes, setInternalNotes] = useState(order.internalNotes || '');
  const [refundAmount, setRefundAmount] = useState(order.total);
  const [refundReason, setRefundReason] = useState('Customer request');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  let addressData: AddressData = {};
  try {
    addressData = JSON.parse(order.shippingAddress);
  } catch {
    // Keep empty
  }

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          status,
          courierName,
          trackingNumber,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      setMessage('Fulfillment status updated.');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkCodPaid = async () => {
    if (!confirm('Confirm marking this Cash on Delivery order as PAID?')) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_cod_paid' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('Order marked as paid on delivery.');
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!confirm(`Confirm issuing refund of ${formatPrice(refundAmount)}?`)) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'issue_refund',
          refundAmount,
          reason: refundReason,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage('Simulated refund issued successfully.');
      router.refresh();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_notes', internalNotes }),
      });
      if (res.ok) {
        setMessage('Internal notes saved.');
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2DACD] pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-1.5 text-[#8A8175] hover:text-[#262320] border border-[#E2DACD] rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-[#262320]">
                {order.orderNumber}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-sm font-semibold bg-[#EAE2D5] text-[#262320] border border-[#D1C6B4]">
                {order.status}
              </span>
            </div>
            <p className="text-xs text-[#5C554C] mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Packing Slip</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm text-xs text-[#2A5C38] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left (2 Cols): Items, Customer Address, Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ordered Artworks */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              Ordered Paintings ({order.items.length})
            </h2>

            <div className="divide-y divide-[#ECE5DA]">
              {order.items.map((i: OrderItemRecord) => (
                <div key={i.id} className="py-3 flex justify-between items-start text-xs text-[#5C554C]">
                  <div>
                    <p className="font-semibold text-sm text-[#262320]">{i.titleSnapshot}</p>
                    <p className="mt-0.5">
                      Size: {i.sizeSnapshot} | Framing: {i.frameSnapshot}
                    </p>
                    <p className="text-[11px] text-[#8A8175]">Unit price: {formatPrice(i.priceSnapshot)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-[#262320]">
                      {formatPrice(i.subtotal)}
                    </p>
                    <p className="text-[11px] text-[#8A8175]">Qty: {i.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[#ECE5DA] pt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5C554C]">
                <span>Artwork Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[#2A5C38]">
                  <span>Discount</span>
                  <span>- {formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5C554C]">
                <span>Insured Wooden Crate Shipping</span>
                <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
              </div>
              <div className="border-t border-[#ECE5DA] pt-2 flex justify-between font-bold text-sm text-[#262320]">
                <span>Total Amount</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Customer Info */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs text-[#5C554C]">
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              Customer & Delivery Address
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <p className="font-semibold text-[#262320]">Customer Contact</p>
                <p className="mt-1">{order.customerName}</p>
                <p>Phone: {order.customerPhone}</p>
                <p>Email: {order.customerEmail}</p>
              </div>
              <div>
                <p className="font-semibold text-[#262320]">Shipment Destination</p>
                <p className="mt-1">{addressData.addressLine1}</p>
                {addressData.addressLine2 && <p>{addressData.addressLine2}</p>}
                {addressData.landmark && <p>Landmark: {addressData.landmark}</p>}
                <p>
                  {addressData.city}, {addressData.state} - {addressData.postalCode}
                </p>
              </div>
            </div>
            {order.orderNotes && (
              <div className="pt-2 border-t border-[#ECE5DA]">
                <p className="font-semibold text-[#262320]">Collector Delivery Notes:</p>
                <p className="mt-0.5">{order.orderNotes}</p>
              </div>
            )}
          </div>

          {/* Status Timeline History */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3">
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              Fulfillment Audit History
            </h2>
            <div className="space-y-2 text-xs">
              {order.statusHistory.map((h: StatusHistoryRecord) => (
                <div
                  key={h.id}
                  className="p-2.5 bg-[#FAF6EF] border border-[#ECE5DA] rounded-sm flex items-start justify-between"
                >
                  <div>
                    <span className="font-semibold text-[#262320]">{h.status}: </span>
                    <span className="text-[#5C554C]">{h.note}</span>
                    <span className="text-[10px] text-[#8A8175] block mt-0.5">By: {h.changedBy}</span>
                  </div>
                  <span className="text-[10px] text-[#8A8175] shrink-0">
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
        </div>

        {/* Right Sidebar: Status Actions, Refund, Notes */}
        <div className="space-y-6">
          {/* Update Status & Courier Form */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              Update Status & Courier
            </h2>

            <form onSubmit={handleUpdateStatus} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="block text-[#5C554C]">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
                >
                  <option value="PLACED">Placed</option>
                  <option value="CONFIRMED">Confirmed & In Workshop</option>
                  <option value="PACKED">Packed in Wooden Crate</option>
                  <option value="SHIPPED">Dispatched with Courier</option>
                  <option value="DELIVERED">Delivered to Customer</option>
                  <option value="CANCELLED">Cancelled (Restocks Paintings)</option>
                  <option value="RETURNED">Returned</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[#5C554C]">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Blue Dart, Delhivery, DTDC"
                  className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[#5C554C]">Courier Tracking Waybill #</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. BLUEDART-8921820"
                  className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320] font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Save Status Update</span>
              </button>
            </form>
          </div>

          {/* COD Mark as Paid Button */}
          {order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID' && (
            <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs">
              <h2 className="font-serif text-base font-semibold text-[#262320]">
                Cash on Delivery Action
              </h2>
              <p className="text-[#5C554C]">
                Customer chose Cash on Delivery. Once cash/UPI is received by the delivery courier, record payment:
              </p>
              <button
                type="button"
                onClick={handleMarkCodPaid}
                disabled={loading}
                className="w-full btn-primary text-xs py-2.5 bg-[#2A5C38] hover:bg-[#20472B] border-[#2A5C38]"
              >
                Mark COD as Paid ({formatPrice(order.total)})
              </button>
            </div>
          )}

          {/* Refund Control */}
          {order.paymentStatus === 'PAID' && (
            <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs">
              <h2 className="font-serif text-base font-semibold text-[#262320]">
                Issue Refund
              </h2>
              <p className="text-[#5C554C]">
                Issue simulated refund for damaged transit or cancellation:
              </p>
              <div className="space-y-2">
                <input
                  type="number"
                  value={Math.round(refundAmount / 100)}
                  onChange={(e) => setRefundAmount(parseInt(e.target.value || '0', 10) * 100)}
                  className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
                />
                <button
                  type="button"
                  onClick={handleRefund}
                  disabled={loading}
                  className="w-full btn-secondary text-xs py-2 text-[#8C2B2B] border-[#D9B5B5] hover:bg-[#FAF0F0]"
                >
                  Process Refund
                </button>
              </div>
            </div>
          )}

          {/* Internal Notes */}
          <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-3 text-xs">
            <h2 className="font-serif text-base font-semibold text-[#262320]">
              Workshop Notes (Private)
            </h2>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Internal notes regarding framing finish or dispatch..."
              className="w-full px-2.5 py-1.5 bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
            />
            <button
              type="button"
              onClick={handleSaveNotes}
              className="btn-secondary text-xs py-1.5 px-3"
            >
              Save Notes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

