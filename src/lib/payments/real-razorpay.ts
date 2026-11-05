import crypto from 'crypto';
import {
  PaymentProvider,
  CreateOrderResult,
  VerifyPaymentPayload,
  VerifyPaymentResult,
  FetchPaymentResult,
  RefundResult,
} from './provider.interface';

// Real Razorpay Provider stub.
// To switch to live Razorpay, set PAYMENT_MODE="razorpay" in .env
// and provide RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.
export class RealRazorpayProvider implements PaymentProvider {
  private keyId: string;
  private keySecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || '';
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  }

  async createOrder(
    amount: number,
    currency: string = 'INR',
    receipt: string
  ): Promise<CreateOrderResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay API keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount, currency, receipt }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay order creation failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    return {
      providerOrderId: data.id,
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
    };
  }

  generateSimulatedSignature(): string {
    throw new Error('Not available in RealRazorpayProvider.');
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult> {
    const { orderId, paymentId, signature } = payload;
    if (!signature || typeof signature !== 'string' || !this.keySecret) {
      return { isValid: false, paymentId, orderId };
    }

    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const actualBuf = Buffer.from(signature, 'utf-8');

    if (expectedBuf.length !== actualBuf.length) {
      return { isValid: false, paymentId, orderId };
    }

    const isValid = crypto.timingSafeEqual(expectedBuf, actualBuf);

    return {
      isValid,
      paymentId,
      orderId,
    };
  }

  async fetchPayment(id: string): Promise<FetchPaymentResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay credentials missing.');
    }
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/payments/${id}`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch payment from Razorpay: ${res.statusText}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      orderId: data.order_id || '',
      status: data.status,
      amount: data.amount,
      method: data.method,
      createdAt: data.created_at,
    };
  }

  async refund(paymentId: string, amount: number): Promise<RefundResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay credentials missing.');
    }
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Razorpay refund failed: ${errText}`);
    }

    const data = await res.json();
    return {
      success: true,
      refundId: data.id,
      amount: data.amount,
      status: data.status,
    };
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || this.keySecret;
    if (!signature || typeof signature !== 'string' || !secret) return false;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const expectedBuf = Buffer.from(expectedSignature, 'utf-8');
    const actualBuf = Buffer.from(signature, 'utf-8');
    if (expectedBuf.length !== actualBuf.length) return false;

    try {
      return crypto.timingSafeEqual(expectedBuf, actualBuf);
    } catch {
      return false;
    }
  }
}

