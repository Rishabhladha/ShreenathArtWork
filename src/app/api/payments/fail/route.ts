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
      include: { items: true, couponRedemptions: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only online payment orders can be failed through payment gateway failure endpoint
    if (order.paymentMethod !== 'ONLINE') {
      return NextResponse.json(
        { error: 'Only online payment orders can be failed or cancelled via payment gateway' },
        { status: 400 }
      );
    }

    // Idempotency: Only cancel and restore stock if order is in CREATED status
    if (
      order.status !== 'CANCELLED' &&
      order.paymentStatus === 'CREATED'
    ) {
      await prisma.$transaction(async (tx) => {
        // 1. Release reserved stock back to inventory
        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }

        // 2. Restore coupon usage if coupon was redeemed
        for (const red of order.couponRedemptions) {
          await tx.coupon.update({
            where: { id: red.couponId },
            data: { usageCount: { decrement: 1 } },
          });
        }

        await tx.couponRedemption.deleteMany({
          where: { orderId: order.id },
        });

        // 3. Mark order and payments as cancelled/failed
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

