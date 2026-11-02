import prisma from '@/lib/prisma';

export type ActivityEventType =
  | 'SIGNUP'
  | 'LOGIN'
  | 'PRODUCT_VIEW'
  | 'ADD_TO_CART'
  | 'CHECKOUT_STARTED'
  | 'ORDER_PLACED'
  | 'PAYMENT_FAILED';

export async function logActivityEvent(params: {
  eventType: ActivityEventType;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.activityEvent.create({
      data: {
        eventType: params.eventType,
        userId: params.userId,
        sessionId: params.sessionId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch (error) {
    // Non-blocking telemetry
    console.error('Failed to log activity event:', error);
  }
}

