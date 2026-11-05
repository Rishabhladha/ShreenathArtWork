export function formatPrice(paise: number): string {
  const rupees = Math.round(paise / 100);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatPriceExact(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

export function calculateOrderTotals(params: {
  subtotal: number; // in paise
  discount: number; // in paise
  freeShippingThreshold: number; // in paise
  standardShippingCharge: number; // in paise
  gstEnabled: boolean;
  gstRatePercent: number; // e.g. 12
}) {
  const discountedSubtotal = Math.max(0, params.subtotal - params.discount);
  
  // Free shipping if discounted subtotal is >= threshold
  const shippingFee =
    discountedSubtotal >= params.freeShippingThreshold ? 0 : params.standardShippingCharge;

  // In Indian retail, prices for handicrafts are customarily inclusive or exclusive of GST.
  // When gstEnabled is true and configured as component of total:
  // Tax = Math.round(discountedSubtotal * gstRatePercent / 100)
  const tax = params.gstEnabled
    ? Math.round((discountedSubtotal * params.gstRatePercent) / 100)
    : 0;

  const total = discountedSubtotal + shippingFee;

  return {
    subtotal: params.subtotal,
    discount: params.discount,
    discountedSubtotal,
    shippingFee,
    tax,
    total,
  };
}

export function calculateCouponDiscount(
  coupon: {
    discountType: 'PERCENT' | 'FLAT' | string;
    discountValue: number;
    minOrderValue?: number | null;
    maxDiscount?: number | null;
  },
  subtotal: number
): number {
  if (subtotal <= 0) return 0;
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    return 0;
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENT') {
    const safePercent = Math.min(100, Math.max(0, coupon.discountValue));
    discount = Math.round((subtotal * safePercent) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return Math.max(0, Math.min(discount, subtotal));
}

