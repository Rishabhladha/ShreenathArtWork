import React from 'react';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { PrintInvoiceButton } from '@/components/shop/PrintInvoiceButton';
import { ArrowLeft, MapPin, Phone, Mail, PackageCheck } from 'lucide-react';

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CustomerOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const session = await getServerAuthSession();

  if (!session || !session.user) {
    redirect('/account/login');
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payments: true,
      statusHistory: { orderBy: { createdAt: 'desc' } },
    },
  });

  if (!order || order.userId !== session.user.id) {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between no-print">
        <Link
          href="/account/orders"
          className="text-xs text-[#8A8175] hover:text-[#262320] flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}`}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Track Timeline</span>
          </Link>
          <PrintInvoiceButton />
        </div>
      </div>

      {/* Invoice Container */}
      <div className="p-8 sm:p-12 bg-white border border-[#E2DACD] rounded-sm space-y-8 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Gallery Invoice Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[#262320] pb-6">
          <div>
            <span className="font-serif text-2xl font-bold tracking-wider text-[#262320] block">
              SHREENATH ART WORK
            </span>
            <p className="text-xs text-[#5C554C] mt-1">
              Opposite Temple Gate, Nathdwara, Rajasthan 313301
            </p>
            <p className="text-xs text-[#5C554C]">
              Phone: 9079901405 | Email: shreenathartwork@gmail.com
            </p>
            <p className="text-xs text-[#8A8175] mt-1 font-mono">GSTIN: 08AAAFS1234F1Z5</p>
          </div>

          <div className="sm:text-right space-y-1">
            <span className="text-xs uppercase tracking-widest text-[#8A8175] block font-sans">
              Tax Invoice
            </span>
            <p className="font-serif text-xl font-bold text-[#262320]">{order.orderNumber}</p>
            <p className="text-xs text-[#5C554C]">
              Date:{' '}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
            <p className="text-xs text-[#5C554C]">Payment: {order.paymentMethod} ({order.paymentStatus})</p>
          </div>
        </div>

        {/* Bill To & Ship To */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-[#5C554C]">
          <div className="space-y-1">
            <p className="font-semibold text-xs text-[#262320] uppercase tracking-wider">
              Billed To:
            </p>
            <p className="font-medium text-[#262320]">{order.customerName}</p>
            <p>{order.customerEmail}</p>
            <p>Phone: {order.customerPhone}</p>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-xs text-[#262320] uppercase tracking-wider">
              Ship To:
            </p>
            <p className="font-medium text-[#262320]">{addressData.customerName}</p>
            <p>{addressData.addressLine1}</p>
            {addressData.addressLine2 && <p>{addressData.addressLine2}</p>}
            <p>
              {addressData.city}, {addressData.state} - {addressData.postalCode}
            </p>
            <p>Phone: {addressData.customerPhone}</p>
          </div>
        </div>

        {/* Invoice Items Table */}
        <div className="border border-[#E2DACD] overflow-hidden rounded-sm">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF7F2] text-[#262320] border-b border-[#E2DACD]">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Artwork Description</th>
                <th className="py-2.5 px-3 font-semibold text-center">Size</th>
                <th className="py-2.5 px-3 font-semibold text-center">Framing</th>
                <th className="py-2.5 px-3 font-semibold text-right">Price</th>
                <th className="py-2.5 px-3 font-semibold text-center">Qty</th>
                <th className="py-2.5 px-3 font-semibold text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE5DA]">
              {order.items.map((i) => (
                <tr key={i.id} className="text-[#5C554C]">
                  <td className="py-3 px-3 font-medium text-[#262320]">
                    {i.titleSnapshot}
                  </td>
                  <td className="py-3 px-3 text-center">{i.sizeSnapshot}</td>
                  <td className="py-3 px-3 text-center">{i.frameSnapshot}</td>
                  <td className="py-3 px-3 text-right">{formatPrice(i.priceSnapshot)}</td>
                  <td className="py-3 px-3 text-center">{i.quantity}</td>
                  <td className="py-3 px-3 text-right font-medium text-[#262320]">
                    {formatPrice(i.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="flex justify-end text-xs">
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between text-[#5C554C]">
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-[#2A5C38]">
                <span>Discount:</span>
                <span>- {formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-[#5C554C]">
              <span>Insured Shipping:</span>
              <span>{order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}</span>
            </div>
            <div className="flex justify-between text-[#8A8175] text-[11px]">
              <span>GST Included (12%):</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="border-t border-[#262320] pt-2 flex justify-between font-bold text-sm text-[#262320]">
              <span>Total Paid:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer Notes */}
        <div className="border-t border-[#E2DACD] pt-6 text-[11px] text-[#8A8175] space-y-1">
          <p className="font-semibold text-[#262320]">Gallery Certification and Authenticity</p>
          <p>
            Certified that the paintings supplied in this invoice are traditional handcrafted artworks executed in Nathdwara, Rajasthan.
          </p>
          <p>For inquiries, contact: 9079901405 | shreenathartwork@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
