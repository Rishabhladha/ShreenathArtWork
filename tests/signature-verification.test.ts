import { describe, it, expect } from 'vitest';
import { SimulatedRazorpayProvider } from '../src/lib/payments/simulated-razorpay';
import crypto from 'crypto';

describe('Payment HMAC SHA256 Signature Verification', () => {
  const provider = new SimulatedRazorpayProvider();

  it('generates and verifies valid HMAC signature for order and payment id', async () => {
    const orderId = 'order_SIM_test123';
    const paymentId = 'pay_SIM_test456';
    const signature = provider.generateSimulatedSignature(orderId, paymentId);

    expect(typeof signature).toBe('string');
    expect(signature.length).toBe(64); // SHA-256 hex string length

    const result = await provider.verifyPayment({
      orderId,
      paymentId,
      signature,
    });

    expect(result.isValid).toBe(true);
    expect(result.orderId).toBe(orderId);
    expect(result.paymentId).toBe(paymentId);
  });

  it('rejects tampered payment id or signature', async () => {
    const orderId = 'order_SIM_test123';
    const paymentId = 'pay_SIM_test456';
    const validSignature = provider.generateSimulatedSignature(orderId, paymentId);

    // Tampered payment ID
    const tamperedResult = await provider.verifyPayment({
      orderId,
      paymentId: 'pay_SIM_tampered',
      signature: validSignature,
    });

    expect(tamperedResult.isValid).toBe(false);
  });
});

