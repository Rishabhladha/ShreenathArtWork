import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV === 'production' && process.env.PAYMENT_MODE !== 'simulated') {
      return NextResponse.json(
        { error: 'Simulated payment signature endpoint is disabled in production.' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { orderId, paymentId } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: 'Order ID and Payment ID required' }, { status: 400 });
    }

    // Verify orderId matches a pending payment record
    const payment = await prisma.payment.findFirst({
      where: {
        providerOrderId: orderId,
        status: { in: ['CREATED', 'PENDING'] },
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Valid pending payment intent not found for this order ID' },
        { status: 404 }
      );
    }

    const secret = process.env.SIMULATED_RAZORPAY_SECRET || 'simulated_secret_key_nathdwara_art';
    const data = `${orderId}|${paymentId}`;
    const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');

    return NextResponse.json({ signature });
  } catch {
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}

