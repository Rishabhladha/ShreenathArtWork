import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getPaymentProvider } from '@/lib/payments';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';

    const provider = getPaymentProvider();
    const isValid = provider.verifyWebhook(rawBody, signature);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    if (eventType === 'payment.captured') {
      const paymentEntity = event.payload?.payment?.entity;
      const providerOrderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;

      if (providerOrderId && paymentId) {
        const paymentRecord = await prisma.payment.findFirst({
          where: { providerOrderId },
          include: { order: true },
        });

        if (paymentRecord && paymentRecord.order.paymentStatus !== 'PAID') {
          // If the order was already cancelled (e.g. timeout or user cancelled), do not falsely confirm without inventory
          if (
            paymentRecord.order.status === 'CANCELLED' ||
            paymentRecord.order.paymentStatus === 'CANCELLED'
          ) {
            await prisma.$transaction(async (tx) => {
              await tx.payment.update({
                where: { id: paymentRecord.id },
                data: {
                  status: 'PAID',
                  providerPaymentId: paymentId,
                },
              });

              await tx.orderStatusHistory.create({
                data: {
                  orderId: paymentRecord.orderId,
                  status: 'CANCELLED',
                  note: `Late payment received (${paymentId}) via Webhook for cancelled order. Requires review or refund.`,
                  changedBy: 'WEBHOOK',
                },
              });
            });
            return NextResponse.json({ status: 'ok', warning: 'Payment captured for cancelled order' });
          }

          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: paymentRecord.orderId },
              data: {
                paymentStatus: 'PAID',
                status: 'CONFIRMED',
              },
            });

            await tx.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: 'PAID',
                providerPaymentId: paymentId,
              },
            });

            await tx.orderStatusHistory.create({
              data: {
                orderId: paymentRecord.orderId,
                status: 'CONFIRMED',
                note: `Payment marked paid via Webhook (${paymentId})`,
                changedBy: 'WEBHOOK',
              },
            });
          });
        }
      }
    }

    return NextResponse.json({ status: 'ok', received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}

