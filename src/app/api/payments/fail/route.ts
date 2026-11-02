import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { logActivityEvent } from '@/lib/events';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, reason, providerPaymentId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only cancel if order is not already paid
    if (order.paymentStatus !== 'PAID') {
      await prisma.$transaction(async (tx) => {
        // Release reserved stock back to inventory
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: reason === 'cancelled' ? 'CANCELLED' : 'FAILED',
            status: 'CANCELLED',
          },
        });

        await tx.payment.updateMany({
          where: { orderId: order.id },
          data: {
            status: reason === 'cancelled' ? 'CANCELLED' : 'FAILED',
            failureReason: reason || 'Payment cancelled by user',
            providerPaymentId: providerPaymentId || null,
          },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'CANCELLED',
            note: `Payment ${reason === 'cancelled' ? 'cancelled by user' : 'failed'}: ${reason}`,
            changedBy: 'CUSTOMER',
          },
        });
      });

      await logActivityEvent({
        eventType: 'PAYMENT_FAILED',
        userId: order.userId || undefined,
        metadata: { orderNumber: order.orderNumber, reason: reason || 'User cancelled' },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order and payment status updated to cancelled. Stock released.',
    });
  } catch (error) {
    console.error('Payment failure update error:', error);
    return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
  }
}

