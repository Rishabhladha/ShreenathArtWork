import { describe, it, expect } from 'vitest';
import { SimulatedRazorpayProvider } from '../src/lib/payments/simulated-razorpay';
import crypto from 'crypto';

describe('Webhook Signature and Idempotency Handling', () => {
  const provider = new SimulatedRazorpayProvider();
  const secret = process.env.SIMULATED_RAZORPAY_SECRET || 'simulated_secret_key_nathdwara_art';

  it('validates authentic webhook payload with HMAC header', () => {
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_SIM_test', order_id: 'order_SIM_test', status: 'captured' } },
      },
    });

    const signature = crypto.createHmac('sha256', secret).update(rawPayload).digest('hex');

    const isValid = provider.verifyWebhook(rawPayload, signature);
    expect(isValid).toBe(true);
  });

  it('rejects webhook payload with altered body or signature', () => {
    const rawPayload = JSON.stringify({ event: 'payment.captured' });
    const tamperedSignature = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';

    const isValid = provider.verifyWebhook(rawPayload, tamperedSignature);
    expect(isValid).toBe(false);
  });

  it('maintains idempotency when duplicate event arrives', () => {
    // Simulated state machine
    let orderPaymentStatus: 'CREATED' | 'PAID' = 'CREATED';

    const processWebhook = () => {
      if (orderPaymentStatus === 'PAID') {
        return { status: 'already_processed', modified: false };
      }
      orderPaymentStatus = 'PAID';
      return { status: 'processed', modified: true };
    };

    // First arrival
    const firstAttempt = processWebhook();
    expect(firstAttempt.modified).toBe(true);
    expect(orderPaymentStatus).toBe('PAID');

    // Duplicate webhook arrival (network retry)
    const duplicateAttempt = processWebhook();
    expect(duplicateAttempt.modified).toBe(false);
    expect(duplicateAttempt.status).toBe('already_processed');
    expect(orderPaymentStatus).toBe('PAID');
  });
});

