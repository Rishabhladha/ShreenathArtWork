'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart-store';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { calculateOrderTotals, formatPrice } from '@/lib/money';
import { trackActivity } from '@/lib/telemetry';
import { ShieldCheck, ArrowRight, AlertCircle, Lock, Truck, CreditCard, Banknote } from 'lucide-react';
import { PATHS } from '@/lib/paths';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry', 'Jammu and Kashmir', 'Ladakh'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, coupon, getSubtotal, clearCart } = useCartStore();

  const {
    freeShippingThreshold,
    standardShippingCharge,
    gstEnabled,
    gstRatePercent,
    codEnabled,
    fetchSettings,
  } = useSiteSettings();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    state: 'Rajasthan',
    postalCode: '',
    orderNotes: '',
    paymentMethod: 'ONLINE' as 'ONLINE' | 'COD',
    agreeToTerms: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Pre-fill user data if logged in - scheduled asynchronously to avoid cascading re-renders
  useEffect(() => {
    if (session?.user) {
      queueMicrotask(() => {
        setFormData((prev) => {
          const newName = prev.customerName || session.user.name || '';
          const newEmail = prev.customerEmail || session.user.email || '';
          if (prev.customerName === newName && prev.customerEmail === newEmail) {
            return prev;
          }
          return {
            ...prev,
            customerName: newName,
            customerEmail: newEmail,
          };
        });
      });
    }
  }, [session?.user?.name, session?.user?.email]);

  // Track checkout started
  useEffect(() => {
    if (items.length > 0) {
      trackActivity('CHECKOUT_STARTED', {
        itemCount: items.length,
        subtotal: getSubtotal(),
      });
    }
  }, []); // Run once on mount

  const handleFillSampleAddress = () => {
    setFormData({
      customerName: 'Manthan Kabra',
      customerEmail: 'shreenathartwork@gmail.com',
      customerPhone: '9079901405',
      addressLine1: 'Opposite Temple Gate, Near Moti Mahal',
      addressLine2: 'Main Haveli Marg',
      landmark: 'Near Temple Gate',
      city: 'Nathdwara',
      state: 'Rajasthan',
      postalCode: '313301',
      orderNotes: 'Devotional packaging requested. Please handle with care.',
      paymentMethod: formData.paymentMethod,
      agreeToTerms: true,
    });
    setErrors({});
    setServerError(null);
  };

  const subtotal = getSubtotal();
  const discountAmount = coupon ? coupon.discountAmount : 0;

  const totals = calculateOrderTotals({
    subtotal,
    discount: discountAmount,
    freeShippingThreshold,
    standardShippingCharge,
    gstEnabled,
    gstRatePercent,
  });

  const shippingFee = items.length === 0 ? 0 : totals.shippingFee;
  const total = items.length === 0 ? 0 : totals.total;

  const validate = () => {
    const errs: Record<string, string> = {};

    const cleanName = formData.customerName.trim();
    if (!cleanName || cleanName.length < 2) {
      errs.customerName = 'Please enter your full name (minimum 2 characters)';
    }

    const cleanEmail = formData.customerEmail.trim();
    if (!cleanEmail || !cleanEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errs.customerEmail = 'Please enter a valid email address';
    }

    const cleanPhone = formData.customerPhone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      errs.customerPhone = 'Please enter a valid 10-digit mobile number';
    }

    const cleanAddress = formData.addressLine1.trim();
    if (!cleanAddress || cleanAddress.length < 4) {
      errs.addressLine1 = 'Please enter complete house or street address';
    }

    const cleanCity = formData.city.trim();
    if (!cleanCity || cleanCity.length < 2) {
      errs.city = 'Please enter your city';
    }

    if (!formData.state.trim()) {
      errs.state = 'Please select your state';
    }

    const cleanPin = formData.postalCode.replace(/\D/g, '');
    if (!cleanPin || cleanPin.length !== 6) {
      errs.postalCode = 'Please enter a valid 6-digit Indian PIN code';
    }

    if (!formData.agreeToTerms) {
      errs.agreeToTerms = 'Please accept the Terms and Conditions to proceed';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!session?.user) {
      setServerError('Account authentication required. Please sign in or create an account to complete your purchase.');
      window.location.href = PATHS.account.login('/checkout');
      return;
    }

    if (!validate()) {
      setServerError('Please fill in all required delivery details (Name, 10-digit Phone, Email, Address, City, PIN code).');
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }
      return;
    }

    if (items.length === 0) {
      setServerError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          address: {
            ...formData,
            couponCode: coupon?.code,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process order. Please try again.');
      }

      // If COD, clear cart and redirect to order confirmed
      if (data.paymentMethod === 'COD') {
        clearCart();
        router.push(`/checkout/order-confirmed?orderNumber=${encodeURIComponent(data.orderNumber)}`);
        return;
      }

      // If Online Payment (Simulated Razorpay Simulator)
      if (data.isSimulated) {
        // Redirect to the dedicated simulated payment sheet
        router.push(
          `/checkout/simulator?orderId=${encodeURIComponent(data.orderId)}&orderNumber=${encodeURIComponent(
            data.orderNumber
          )}&providerOrderId=${encodeURIComponent(data.providerOrderId)}&amount=${data.amount}`
        );
      } else {
        // Real Razorpay SDK integration
        const loadScript = () => {
          return new Promise<boolean>((resolve) => {
            if ((window as unknown as { Razorpay: unknown }).Razorpay) {
              return resolve(true);
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
          });
        };

        const loaded = await loadScript();
        if (!loaded) {
          await fetch('/api/payments/fail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderId, reason: 'Failed to load Razorpay SDK' }),
          });
          throw new Error('Unable to load payment gateway. Please check your internet connection.');
        }

        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || 'INR',
          name: 'SHREENATH ART WORK',
          description: `Devotional Artwork Order ${data.orderNumber}`,
          order_id: data.providerOrderId,
          prefill: {
            name: formData.customerName,
            email: formData.customerEmail,
            contact: formData.customerPhone,
          },
          theme: {
            color: '#1C1917',
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              const verifyRes = await fetch('/api/payments/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderId,
                  providerOrderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                clearCart();
                router.push(`/checkout/order-confirmed?orderNumber=${encodeURIComponent(data.orderNumber)}`);
              } else {
                setServerError(verifyData.error || 'Payment verification failed');
                setSubmitting(false);
              }
            } catch {
              setServerError('Payment verification request failed. Please check your network.');
              setSubmitting(false);
            }
          },
          modal: {
            ondismiss: async () => {
              await fetch('/api/payments/fail', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: data.orderId,
                  reason: 'cancelled',
                }),
              });
              setServerError('Payment was cancelled. Your reserved items have been restored.');
              setSubmitting(false);
            },
          },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const RazorpayConstructor = (window as unknown as { Razorpay: any }).Razorpay;
        const rzp = new RazorpayConstructor(options);
        rzp.open();
      }
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'An error occurred during checkout');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <h1 className="font-serif text-2xl font-semibold text-[#262320]">Your Cart is Empty</h1>
        <p className="text-xs text-[#5C554C]">Please add paintings to your cart before proceeding to checkout.</p>
        <div>
          <Link href="/catalog" className="btn-primary text-xs py-2.5 px-4">
            Browse Paintings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
      {/* Checkout Title */}
      <div className="border-b border-[#E2DACD] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-[#262320]">Checkout</h1>
          <p className="text-xs text-[#5C554C] mt-0.5">
            Insured gallery packaging and direct transit from Nathdwara.
          </p>
        </div>
        {!session?.user && (
          <p className="text-xs text-[#5C554C]">
            Already have an account?{' '}
            <Link href={PATHS.account.login('/checkout')} className="text-[#262320] underline font-medium">
              Sign In
            </Link>{' '}
            (Required for purchase)
          </p>
        )}
      </div>

      {!session?.user && (
        <div className="p-4 bg-[#FAF1E8] border border-[#DEC99C] rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#A85A32] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-[#262320]">
                Collector Account Required for Sacred Art Orders
              </p>
              <p className="text-[#5C554C] mt-0.5">
                To guarantee insured transit, temple authenticity certification, and real-time shipment updates, orders cannot be placed as a guest.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
            <Link
              href={PATHS.account.login('/checkout')}
              className="btn-primary text-xs py-2 px-4 shadow-2xs font-semibold"
            >
              Sign In to Order
            </Link>
            <Link
              href={`${PATHS.account.register}?callbackUrl=/checkout`}
              className="btn-secondary text-xs py-2 px-4"
            >
              Create Account
            </Link>
          </div>
        </div>
      )}

      {serverError && (
        <div className="p-4 bg-[#FAF0F0] border border-[#D9B5B5] rounded-sm text-xs text-[#8C2B2B] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Shipping & Payment Fields */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Information */}
            <div className="p-6 bg-white border border-[#E2DACD] rounded-sm shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-base font-semibold text-[#1C1917]">
                  1. Contact Details
                </h2>
                <button
                  type="button"
                  onClick={handleFillSampleAddress}
                  className="text-[11px] font-sans font-medium text-[#B8511B] hover:text-[#9A4214] underline decoration-dotted"
                >
                  Fill Sample Delivery Address (Testing)
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="Collector / Recipient name"
                  />
                  {errors.customerName && (
                    <p className="text-[11px] text-[#8C2B2B]">{errors.customerName}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">Mobile Phone (10 digits) *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="e.g. 9829012345"
                  />
                  {errors.customerPhone && (
                    <p className="text-[11px] text-[#8C2B2B]">{errors.customerPhone}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs text-[#5C554C]">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="Order confirmation and tracking updates will be sent here"
                  />
                  {errors.customerEmail && (
                    <p className="text-[11px] text-[#8C2B2B]">{errors.customerEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
              <h2 className="font-serif text-base font-semibold text-[#262320] flex items-center gap-2">
                <span>2. Delivery Address in India</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs text-[#5C554C]">House / Flat / Building Address *</label>
                  <input
                    type="text"
                    required
                    value={formData.addressLine1}
                    onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="Flat / House number, Building name, Street"
                  />
                  {errors.addressLine1 && (
                    <p className="text-[11px] text-[#8C2B2B]">{errors.addressLine1}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">Area / Colony / Locality (Optional)</label>
                  <input
                    type="text"
                    value={formData.addressLine2}
                    onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="Locality or Sector"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={formData.landmark}
                    onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="e.g. Near City Temple"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  />
                  {errors.city && <p className="text-[11px] text-[#8C2B2B]">{errors.city}</p>}
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">State *</label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                  >
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs text-[#5C554C]">Postal PIN Code (6 digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="e.g. 313301"
                  />
                  {errors.postalCode && (
                    <p className="text-[11px] text-[#8C2B2B]">{errors.postalCode}</p>
                  )}
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs text-[#5C554C]">Delivery Notes / Special Instructions</label>
                  <textarea
                    rows={2}
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-[#FAF6EF] border border-[#E2DACD] rounded-sm focus-ring text-[#262320]"
                    placeholder="Any specific delivery instructions for the courier..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
              <h2 className="font-serif text-base font-semibold text-[#262320]">
                3. Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors border-[#262320] bg-[#FAF6EF]">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={formData.paymentMethod === 'ONLINE'}
                    onChange={() => setFormData({ ...formData, paymentMethod: 'ONLINE' })}
                    className="mt-1 text-[#262320]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-medium text-xs text-[#262320]">
                      <CreditCard className="w-4 h-4 text-[#C47820]" />
                      <span>Razorpay Secure Online Payment</span>
                    </div>
                    <p className="text-[11px] text-[#5C554C] mt-0.5">
                      Pay via UPI (GPay, PhonePe, Paytm), Credit / Debit Card, Netbanking, or Wallet.
                    </p>
                  </div>
                </label>

                {codEnabled && (
                  <label className="flex items-start gap-3 p-3.5 border rounded-sm cursor-pointer transition-colors border-[#E2DACD] hover:border-[#8A8175] bg-[#FAF7F2]">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === 'COD'}
                      onChange={() => setFormData({ ...formData, paymentMethod: 'COD' })}
                      className="mt-1 text-[#262320]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-medium text-xs text-[#262320]">
                        <Banknote className="w-4 h-4 text-[#8A8175]" />
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-[11px] text-[#5C554C] mt-0.5">
                        Pay cash or UPI upon delivery at your doorstep. Verified before courier dispatch.
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Place Order */}
          <div className="space-y-6">
            <div className="p-6 bg-[#FAF7F2] border border-[#E2DACD] rounded-sm space-y-4">
              <h2 className="font-serif text-lg font-semibold text-[#262320] border-b border-[#ECE5DA] pb-3">
                Items ({items.length})
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((i) => (
                  <div key={i.id} className="flex justify-between text-xs text-[#5C554C]">
                    <div className="pr-2 min-w-0">
                      <p className="font-medium text-[#262320] truncate">{i.title}</p>
                      <p className="text-[11px] text-[#8A8175]">
                        {i.size} | {i.frame} (Qty: {i.quantity})
                      </p>
                    </div>
                    <span className="font-medium text-[#262320] shrink-0">
                      {formatPrice(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#ECE5DA] pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-[#5C554C]">
                  <span>Subtotal</span>
                  <span className="text-[#262320] font-medium">{formatPrice(subtotal)}</span>
                </div>

                {coupon && (
                  <div className="flex justify-between text-[#2A5C38]">
                    <span>Discount ({coupon.code})</span>
                    <span>- {formatPrice(coupon.discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#5C554C]">
                  <span>Insured Shipping</span>
                  <span className="text-[#262320] font-medium">
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="border-t border-[#ECE5DA] pt-3 flex justify-between text-base font-semibold text-[#262320]">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              {/* Mandatory Agreement Checkbox */}
              <div className="pt-3 border-t border-[#ECE5DA] space-y-2">
                <label className="flex items-start gap-2.5 text-xs text-[#5C554C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="mt-0.5 text-[#262320] rounded-sm"
                  />
                  <span>
                    By placing this order you agree to the{' '}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-[#262320] underline hover:text-[#C47820]"
                    >
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="text-[#262320] underline hover:text-[#C47820]"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="text-[11px] text-[#8C2B2B]">{errors.agreeToTerms}</p>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary text-sm py-3.5 flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>
                  {submitting
                    ? 'Processing...'
                    : !session?.user
                    ? `Sign In to Complete Order (${formatPrice(total)})`
                    : formData.paymentMethod === 'ONLINE'
                    ? `Proceed to Payment: ${formatPrice(total)}`
                    : `Confirm COD Order: ${formatPrice(total)}`}
                </span>
              </button>

              <div className="pt-2 text-[11px] text-[#8A8175] space-y-1.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2A5C38]" />
                  <span>Nathdwara gallery authenticity guaranteed</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#8A8175]" />
                  <span>Insured transit with courier tracking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

