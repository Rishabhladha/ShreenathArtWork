import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { CheckCircle2, PackageCheck, Printer, MapPin, Phone, ArrowRight } from 'lucide-react';

interface OrderConfirmedProps {
  searchParams: Promise<{ orderNumber?: string }>;
}

export default async function OrderConfirmedPage({ searchParams }: OrderConfirmedProps) {
  const { orderNumber } = await searchParams;

  if (!orderNumber) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payments: true,
    },
  });

  if (!order) {
    notFound();
  }

  let addressData: {
    customerName: string;
    customerPhone: string;
    addressLine1: string;
    addressLine2?: string;
    landmark?: string;
    city: string;
    state: string;
    postalCode: string;
  } = {
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
  };

  try {
    addressData = JSON.parse(order.shippingAddress);
  } catch {
    // Keep defaults
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
      {/* Success Hero Header */}
      <div className="text-center space-y-3">
        <div className="w-12 h-12 bg-[#EAE2D5] text-[#2A5C38] rounded-sm flex items-center justify-center mx-auto border border-[#D1C6B4]">
          <CheckCircle2 className="w-7 h-7" />
        </div>
        <span className="text-xs uppercase tracking-widest text-[#8A8175] font-sans">
          Order Confirmed
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#262320]">
          Thank you for your order
        </h1>
        <p className="text-xs text-[#5C554C] max-w-md mx-auto leading-relaxed">
          Your order has been received by our Nathdwara gallery. We will prepare your artwork with archival materials and safe wooden framing.
        </p>
      </div>

      {/* Order Reference Box */}
      <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE5DA] pb-4">
          <div>
            <span className="text-xs text-[#8A8175] block">Order Number</span>
            <span className="font-serif text-xl font-bold text-[#262320]">
              {order.orderNumber}
            </span>
          </div>
          <div className="sm:text-right">
            <span className="text-xs text-[#8A8175] block">Payment Status</span>
            <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-sm bg-[#EAE2D5] text-[#262320] border border-[#D1C6B4]">
              {order.paymentStatus === 'PAID'
                ? 'Paid Online (Razorpay)'
                : order.paymentMethod === 'COD'
                ? 'Cash on Delivery (Pending)'
                : order.paymentStatus}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="space-y-3">
          <h2 className="font-serif text-sm font-semibold text-[#262320]">
            Ordered Paintings
          </h2>
          <div className="space-y-3 divide-y divide-[#ECE5DA]">
            {order.items.map((item) => (
              <div key={item.id} className="pt-3 flex justify-between text-xs text-[#5C554C]">
                <div>
                  <p className="font-medium text-[#262320]">{item.titleSnapshot}</p>
                  <p className="text-[11px] text-[#8A8175]">
                    Size: {item.sizeSnapshot} | Frame: {item.frameSnapshot} (Qty: {item.quantity})
                  </p>
                </div>
                <span className="font-medium text-[#262320] shrink-0">
                  {formatPrice(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-[#ECE5DA] pt-4 space-y-2 text-xs">
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
            <span>Insured Shipping</span>
            <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
          </div>
          <div className="border-t border-[#ECE5DA] pt-2 flex justify-between text-base font-semibold text-[#262320]">
            <span>Total Amount</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="border-t border-[#ECE5DA] pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <h3 className="font-serif font-semibold text-[#262320] mb-1">
              Delivery Destination
            </h3>
            <p className="text-[#5C554C] leading-relaxed">
              {addressData.customerName}
              <br />
              {addressData.addressLine1}
              {addressData.addressLine2 && `, ${addressData.addressLine2}`}
              <br />
              {addressData.city}, {addressData.state} - {addressData.postalCode}
              <br />
              Phone: {addressData.customerPhone}
            </p>
          </div>

          <div>
            <h3 className="font-serif font-semibold text-[#262320] mb-1">
              Dispatch & Packaging
            </h3>
            <p className="text-[#5C554C] leading-relaxed">
              Dispatched from Nathdwara, Rajasthan via insured courier. Each painting is packed in multi-layer foam and wooden boxes.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center pt-2">
        <Link
          href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
          className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
        >
          <PackageCheck className="w-4 h-4" />
          <span>Track Order Timeline</span>
        </Link>
        <Link href="/catalog" className="btn-secondary text-xs py-2.5 px-4">
          Continue Browsing
        </Link>
      </div>

      {/* Gallery Assistance Note */}
      <div className="text-center text-xs text-[#8A8175] space-y-1">
        <p>Questions regarding your order? Reach our gallery directly:</p>
        <p className="text-[#262320] font-medium">
          Phone / WhatsApp: 9079901405 | Email: shreenathartwork@gmail.com
        </p>
      </div>
    </div>
  );
}

