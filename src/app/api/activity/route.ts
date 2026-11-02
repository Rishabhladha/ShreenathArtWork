import { NextResponse } from 'next/server';
import { logActivityEvent, ActivityEventType } from '@/lib/events';
import { getServerAuthSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerAuthSession();
    const body = await req.json();
    const { eventType, sessionId, metadata } = body;

    const allowedEvents: ActivityEventType[] = [
      'SIGNUP',
      'LOGIN',
      'PRODUCT_VIEW',
      'ADD_TO_CART',
      'CHECKOUT_STARTED',
      'ORDER_PLACED',
      'PAYMENT_FAILED',
    ];

    if (!allowedEvents.includes(eventType)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    await logActivityEvent({
      eventType,
      userId: session?.user?.id,
      sessionId,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

