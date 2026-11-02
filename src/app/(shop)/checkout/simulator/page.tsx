'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { formatPrice } from '@/lib/money';
import { ShieldAlert, CheckCircle2, XCircle, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

function PaymentSimulatorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);

  const orderId = searchParams.get('orderId') || '';
  const orderNumber = searchParams.get('orderNumber') || '';
  const providerOrderId = searchParams.get('providerOrderId') || '';
  const amountStr = searchParams.get('amount') || '0';
  const amount = parseInt(amountStr, 10);

  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('collector@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 1111 1111 1111');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulatedSuccess = async () => {
    setProcessing(true);
    setStatusMessage('Simulating payment authorization...');
    setError(null);

    try {
      // 1. Generate fake payment id: pay_SIM_xxxxx
      const randomSuffix = Math.random().toString(36).substring(2, 10);
      const paymentId = `pay_SIM_${randomSuffix}`;

      // 2. Request simulated HMAC signature from server
      const sigRes = await fetch('/api/payments/simulate-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: providerOrderId,
          paymentId,
        }),
      });

      const sigData = await sigRes.json();
      if (!sigRes.ok || !sigData.signature) {
        throw new Error('Failed to generate test signature');
      }

      setStatusMessage('Verifying HMAC signature with gallery order service...');

      // 3. Call server payment verification endpoint
      const verifyRes = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          providerOrderId,
          paymentId,
          signature: sigData.signature,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Signature verification failed');
      }

      // Success: clear cart and redirect to order confirmed
      clearCart();
      router.push(`/checkout/order-confirmed?orderNumber=${encodeURIComponent(orderNumber)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleSimulatedFailure = async () => {
    setProcessing(true);
    setStatusMessage('Simulating gateway payment decline...');
    setError(null);

    try {
      await fetch('/api/payments/fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason: 'Bank decline simulation (Insufficient test balance)',
        }),
      });

      setError('Payment declined by issuing bank. Reserved items have been released back to stock.');
    } catch {
      setError('Payment failed.');
    } finally {
      setProcessing(false);
      setStatusMessage(null);
    }
  };

  const handleUserCancelled = async () => {
    setProcessing(true);
    try {
      await fetch('/api/payments/fail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          reason: 'cancelled',
        }),
      });
      router.push('/cart');
    } catch {
      router.push('/cart');
    }
  };

  if (!orderId || !providerOrderId) {
    return (
      <div className="max-w-md mx-auto p-8 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-[#C47820] mx-auto" />
        <h1 className="font-serif text-xl font-semibold text-[#262320]">
          Invalid Payment Session
        </h1>
        <p className="text-xs text-[#5C554C]">
          No active payment attempt was found. Please return to your cart.
        </p>
        <button
          type="button"
          onClick={() => router.push('/cart')}
          className="btn-primary text-xs py-2 px-4"
        >
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 sm:px-6">
      {/* Required Visible Disclaimer Banner */}
      <div className="mb-6 p-4 bg-[#F4EFE6] border-2 border-[#C47820] rounded-sm text-xs text-[#262320] flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#C47820] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-sm">
            Payment Simulator: No real money is charged
          </p>
          <p className="text-[#5C554C] leading-relaxed">
            This simulator allows testing the complete payment flow, HMAC SHA256 signature verification, and stock reservation. Real Razorpay can be activated by providing API keys in production.
          </p>
        </div>
      </div>

      {/* Simulator Payment Sheet */}
      <div className="bg-white border border-[#E7E2D8] rounded-sm shadow-md overflow-hidden">
        {/* Sheet Header */}
        <div className="p-5 bg-[#1C1917] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#B8511B] font-sans font-semibold">
              Test Payment Sheet
            </span>
            <p className="font-serif text-lg font-semibold">SHREENATH ART WORK</p>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-[#A8A29E] block">Amount to Pay</span>
            <span className="font-serif text-xl font-bold">{formatPrice(amount)}</span>
          </div>
        </div>

        {/* Order Details bar */}
        <div className="px-5 py-2.5 bg-[#FBF9F5] border-b border-[#E7E2D8] flex items-center justify-between text-xs text-[#57534E]">
          <span>Order Reference: <strong className="text-[#1C1917]">{orderNumber}</strong></span>
          <span className="text-[11px] text-[#78716C] font-mono">{providerOrderId}</span>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-5 space-y-5">
          <div className="flex border-b border-[#E2DACD] text-xs">
            {[
              { id: 'upi', label: 'UPI / QR' },
              { id: 'card', label: 'Cards' },
              { id: 'netbanking', label: 'Netbanking' },
              { id: 'wallet', label: 'Wallets' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setMethod(t.id as typeof method)}
                className={`py-2 px-3 border-b-2 font-medium transition-colors ${
                  method === t.id
                    ? 'border-[#262320] text-[#262320]'
                    : 'border-transparent text-[#8A8175] hover:text-[#262320]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {method === 'upi' && (
            <div className="space-y-3">
              <label className="block text-xs text-[#5C554C]">Test UPI ID / VPA</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]"
                placeholder="username@bank"
              />
              <p className="text-[11px] text-[#8A8175]">
                Supports simulated instant UPI apps: Google Pay, PhonePe, Paytm, BHIM.
              </p>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="block text-xs text-[#5C554C]">Test Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm font-mono text-[#262320]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">Valid Thru</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm font-mono text-[#262320]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">CVV</label>
                  <input
                    type="text"
                    defaultValue="123"
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm font-mono text-[#262320]"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="space-y-2">
              <label className="block text-xs text-[#5C554C]">Select Test Bank</label>
              <select className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]">
                <option>State Bank of India (Test)</option>
                <option>HDFC Bank (Test)</option>
                <option>ICICI Bank (Test)</option>
                <option>Axis Bank (Test)</option>
                <option>Bank of Baroda (Test)</option>
              </select>
            </div>
          )}

          {method === 'wallet' && (
            <div className="space-y-2">
              <label className="block text-xs text-[#5C554C]">Select Test Wallet</label>
              <select className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm text-[#262320]">
                <option>Paytm Wallet (Test)</option>
                <option>Amazon Pay (Test)</option>
                <option>PhonePe Wallet (Test)</option>
              </select>
            </div>
          )}

          {/* Status and Error Messages */}
          {statusMessage && (
            <div className="p-3 bg-[#EAE2D5] border border-[#D1C6B4] rounded-sm text-xs text-[#262320] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#C47820] animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Test Action Controls */}
          <div className="pt-4 border-t border-[#ECE5DA] space-y-2.5">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#8A8175]">
              Simulate Payment Outcome:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleSimulatedSuccess}
                disabled={processing}
                className="btn-primary text-xs py-3 bg-[#15803D] hover:bg-[#166534] border-[#15803D] text-white flex items-center justify-center gap-2 shadow-sm font-semibold"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pay & Confirm Order</span>
              </button>

              <button
                type="button"
                onClick={handleSimulatedFailure}
                disabled={processing}
                className="btn-secondary text-xs py-3 text-[#B91C1C] border-[#FCA5A5] hover:bg-[#FEF2F2] flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                <span>Simulate Failure</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleUserCancelled}
              disabled={processing}
              className="w-full text-xs text-[#8A8175] hover:text-[#262320] py-2 flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Cancel and return to cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSimulatorPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto p-12 text-center text-xs text-[#8A8175]">
          Loading payment simulator...
        </div>
      }
    >
      <PaymentSimulatorContent />
    </Suspense>
  );
}

