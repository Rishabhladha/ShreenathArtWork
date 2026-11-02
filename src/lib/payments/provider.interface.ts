export interface CreateOrderResult {
  providerOrderId: string;
  amount: number; // in paise
  currency: string;
  receipt: string;
}

export interface VerifyPaymentPayload {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface VerifyPaymentResult {
  isValid: boolean;
  paymentId: string;
  orderId: string;
  method?: string;
  fee?: number;
}

export interface FetchPaymentResult {
  id: string;
  orderId: string;
  status: 'captured' | 'failed' | 'refunded' | 'pending';
  amount: number;
  method: string;
  createdAt: number;
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  amount: number;
  status: string;
}

export interface WebhookPayload {
  event: string;
  payload: {
    payment?: {
      entity?: {
        id: string;
        order_id: string;
        status: string;
        amount: number;
        method: string;
      };
    };
    order?: {
      entity?: {
        id: string;
        amount: number;
        status: string;
      };
    };
  };
}

export interface PaymentProvider {
  createOrder(amount: number, currency: string, receipt: string): Promise<CreateOrderResult>;
  verifyPayment(payload: VerifyPaymentPayload): Promise<VerifyPaymentResult>;
  fetchPayment(id: string): Promise<FetchPaymentResult>;
  refund(paymentId: string, amount: number): Promise<RefundResult>;
  verifyWebhook(rawBody: string, signature: string): boolean;
  generateSimulatedSignature(orderId: string, paymentId: string): string;
}

