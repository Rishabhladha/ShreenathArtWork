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

