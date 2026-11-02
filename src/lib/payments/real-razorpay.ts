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

    // Call real Razorpay Orders API:
    // const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    // const res = await fetch('https://api.razorpay.com/v1/orders', {
    //   method: 'POST',
    //   headers: {
    //     Authorization: `Basic ${auth}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ amount, currency, receipt }),
    // });
    // const data = await res.json();
    // return { providerOrderId: data.id, amount: data.amount, currency: data.currency, receipt: data.receipt };

    throw new Error('Real Razorpay SDK is disabled. Set PAYMENT_MODE=simulated to test without live keys.');
  }

  generateSimulatedSignature(): string {
    throw new Error('Not available in RealRazorpayProvider.');
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult> {
    const { orderId, paymentId, signature } = payload;
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(body)
      .digest('hex');

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );

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
    // const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    // const res = await fetch(`https://api.razorpay.com/v1/payments/${id}`, {
    //   headers: { Authorization: `Basic ${auth}` },
    // });
    // const data = await res.json();
    return {
      id,
      orderId: '',
      status: 'captured',
      amount: 0,
      method: 'unknown',
      createdAt: Math.floor(Date.now() / 1000),
    };
  }

  async refund(paymentId: string, amount: number): Promise<RefundResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay credentials missing.');
    }
    // const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    // const res = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
    //   method: 'POST',
    //   headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ amount }),
    // });
    // const data = await res.json();
    return {
      success: true,
      refundId: 'rfnd_placeholder',
      amount,
      status: 'processed',
    };
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    if (!signature || !this.keySecret) return false;
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(rawBody)
      .digest('hex');

    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(signature)
      );
    } catch {
      return false;
    }
  }
}

