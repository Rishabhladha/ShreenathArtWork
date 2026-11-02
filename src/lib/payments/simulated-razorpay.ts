import crypto from 'crypto';
import {
  PaymentProvider,
  CreateOrderResult,
  VerifyPaymentPayload,
  VerifyPaymentResult,
  FetchPaymentResult,
  RefundResult,
} from './provider.interface';

export class SimulatedRazorpayProvider implements PaymentProvider {
  private secret: string;

  constructor() {
    this.secret = process.env.SIMULATED_RAZORPAY_SECRET || 'simulated_secret_key_nathdwara_art';
  }

  async createOrder(
    amount: number,
    currency: string = 'INR',
    receipt: string
  ): Promise<CreateOrderResult> {
    const randomHex = crypto.randomBytes(6).toString('hex');
    const providerOrderId = `order_SIM_${randomHex}`;
    return {
      providerOrderId,
      amount,
      currency,
      receipt,
    };
  }

  generateSimulatedSignature(orderId: string, paymentId: string): string {
    const data = `${orderId}|${paymentId}`;
    return crypto.createHmac('sha256', this.secret).update(data).digest('hex');
  }

  async verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult> {
    const { orderId, paymentId, signature } = payload;
    const expectedSignature = this.generateSimulatedSignature(orderId, paymentId);

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signature)
    );

    return {
      isValid,
      paymentId,
      orderId,
      method: 'SIMULATED_UPI',
      fee: Math.round(500), // simulated 500 paise (Rs 5) gateway fee
    };
  }

  async fetchPayment(id: string): Promise<FetchPaymentResult> {
    return {
      id,
      orderId: 'order_SIM_simulated',
      status: 'captured',
      amount: 100000,
      method: 'upi',
      createdAt: Math.floor(Date.now() / 1000),
    };
  }

  async refund(paymentId: string, amount: number): Promise<RefundResult> {
    const refundId = `rfnd_SIM_${crypto.randomBytes(6).toString('hex')}`;
    return {
      success: true,
      refundId,
      amount,
      status: 'processed',
    };
  }

  verifyWebhook(rawBody: string, signature: string): boolean {
    if (!signature) return false;
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
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

