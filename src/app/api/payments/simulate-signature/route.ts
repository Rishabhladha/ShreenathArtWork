import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, paymentId } = body;

    if (!orderId || !paymentId) {
      return NextResponse.json({ error: 'Order ID and Payment ID required' }, { status: 400 });
    }

    const secret = process.env.SIMULATED_RAZORPAY_SECRET || 'simulated_secret_key_nathdwara_art';
    const data = `${orderId}|${paymentId}`;
    const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');

    return NextResponse.json({ signature });
  } catch {
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}

