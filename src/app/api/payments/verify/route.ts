import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPaymentProvider } from '@/lib/payments';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { logActivityEvent } from '@/lib/events';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, providerOrderId, paymentId, signature } = body;

    if (!orderId || !providerOrderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing payment verification parameters' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        payments: true,
        couponRedemptions: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only online payment orders can be verified through gateway
    if (order.paymentMethod !== 'ONLINE') {
      return NextResponse.json(
        { error: 'Only online payment orders can be verified via payment gateway' },
        { status: 400 }
      );
    }

    // Idempotency: if already paid, return success immediately
    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        orderNumber: order.orderNumber,
      });
    }

    // Reject verification if order is already cancelled or payment previously failed
    if (
      order.status === 'CANCELLED' ||
      order.paymentStatus === 'CANCELLED' ||
      order.paymentStatus === 'FAILED'
    ) {
      return NextResponse.json(
        { error: 'Order has already been cancelled or payment failed. Cannot verify payment.' },
        { status: 400 }
      );
    }

    const provider = getPaymentProvider();
    const verification = await provider.verifyPayment({
      orderId: providerOrderId,
      paymentId,
      signature,
    });

    if (!verification.isValid) {
      // Signature failed: rollback stock and coupon ONLY if order is in CREATED status
      // This prevents repeated failed verification attempts from artificially inflating stock
      if (order.paymentStatus === 'CREATED') {
        await prisma.$transaction(async (tx) => {
          // Restore stock
          for (const item of order.items) {
            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            });
          }

          // Restore coupon
          for (const red of order.couponRedemptions) {
            await tx.coupon.update({
              where: { id: red.couponId },
              data: { usageCount: { decrement: 1 } },
            });
          }
          await tx.couponRedemption.deleteMany({
            where: { orderId: order.id },
          });

          await tx.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'FAILED',
              status: 'CANCELLED',
            },
          });

          await tx.payment.updateMany({
            where: { orderId: order.id },
            data: {
              status: 'FAILED',
              failureReason: 'HMAC signature verification failed',
              providerPaymentId: paymentId,
            },
          });

          await tx.orderStatusHistory.create({
            data: {
              orderId: order.id,
              status: 'CANCELLED',
              note: 'Payment signature verification failed',
              changedBy: 'GATEWAY',
            },
          });
        });

        await logActivityEvent({
          eventType: 'PAYMENT_FAILED',
          userId: order.userId || undefined,
          metadata: { orderNumber: order.orderNumber, reason: 'Signature mismatch' },
        });
      }

      return NextResponse.json(
        { error: 'Invalid payment signature. Payment could not be verified.' },
        { status: 400 }
      );
    }

    // Signature verified: update order and payment in transaction
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
        },
      });

      await tx.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: 'PAID',
          providerPaymentId: paymentId,
          method: verification.method || 'ONLINE',
          fee: verification.fee || 0,
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: 'CONFIRMED',
          note: `Payment verified successfully. Payment ID: ${paymentId}`,
          changedBy: 'GATEWAY',
        },
      });
    });

    // Send confirmation email
    let addressSnapshot: {
      addressLine1: string;
      city: string;
      state: string;
      postalCode: string;
    } = { addressLine1: '', city: '', state: '', postalCode: '' };

    try {
      addressSnapshot = JSON.parse(order.shippingAddress);
    } catch {
      // Use fallback empty
    }

    await sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((i) => ({
        title: i.titleSnapshot,
        size: i.sizeSnapshot,
        frame: i.frameSnapshot,
        quantity: i.quantity,
        price: i.priceSnapshot,
      })),
      total: order.total,
      paymentMethod: 'Online Payment (Razorpay)',
      shippingAddress: addressSnapshot,
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying your payment' },
      { status: 500 }
    );
  }
}

