import { PaymentProvider } from './provider.interface';
import { SimulatedRazorpayProvider } from './simulated-razorpay';
import { RealRazorpayProvider } from './real-razorpay';

let cachedProvider: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cachedProvider) return cachedProvider;

  const mode = process.env.PAYMENT_MODE || 'simulated';
  if (mode === 'razorpay') {
    cachedProvider = new RealRazorpayProvider();
  } else {
    cachedProvider = new SimulatedRazorpayProvider();
  }

  return cachedProvider;
}

export * from './provider.interface';
export { SimulatedRazorpayProvider, RealRazorpayProvider };

