import { describe, it, expect } from 'vitest';
import { calculateOrderTotals, formatPrice } from '../src/lib/money';

describe('Price and Order Totals Calculation', () => {
  it('calculates shipping fee when subtotal is below free shipping threshold', () => {
    const result = calculateOrderTotals({
      subtotal: 300000, // Rs 3,000
      discount: 0,
      freeShippingThreshold: 500000, // Rs 5,000
      standardShippingCharge: 25000, // Rs 250
      gstEnabled: true,
      gstRatePercent: 12,
    });

    expect(result.subtotal).toBe(300000);
    expect(result.shippingFee).toBe(25000);
    expect(result.discountedSubtotal).toBe(300000);
    expect(result.tax).toBe(36000); // 12% of 300,000
    expect(result.total).toBe(325000); // 300,000 + 25,000
  });

  it('qualifies for free shipping when subtotal reaches or exceeds Rs 5,000', () => {
    const result = calculateOrderTotals({
      subtotal: 550000, // Rs 5,500
      discount: 0,
      freeShippingThreshold: 500000,
      standardShippingCharge: 25000,
      gstEnabled: true,
      gstRatePercent: 12,
    });

    expect(result.shippingFee).toBe(0);
    expect(result.total).toBe(550000);
  });

  it('correctly formats paise into Indian Rupee notation', () => {
    expect(formatPrice(1500000)).toMatch(/15,000/);
    expect(formatPrice(25000)).toMatch(/250/);
  });
});

