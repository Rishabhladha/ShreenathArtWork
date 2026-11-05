import { describe, it, expect } from 'vitest';
import { calculateCouponDiscount } from '../src/lib/money';

describe('Coupon Application Rules', () => {
  it('applies percentage discount accurately', () => {
    const discount = calculateCouponDiscount(
      {
        discountType: 'PERCENT',
        discountValue: 10,
        minOrderValue: 500000,
        maxDiscount: 200000,
      },
      600000 // Rs 6,000
    );

    expect(discount).toBe(60000); // 10% of 600,000 = Rs 600
  });

  it('caps discount at maxDiscount limit', () => {
    const discount = calculateCouponDiscount(
      {
        discountType: 'PERCENT',
        discountValue: 10,
        minOrderValue: 500000,
        maxDiscount: 200000, // Rs 2,000 max
      },
      3000000 // Rs 30,000
    );

    // 10% would be Rs 3,000, but capped at Rs 2,000
    expect(discount).toBe(200000);
  });

  it('returns 0 discount when cart value is below minOrderValue', () => {
    const discount = calculateCouponDiscount(
      {
        discountType: 'PERCENT',
        discountValue: 10,
        minOrderValue: 500000,
      },
      400000
    );
    expect(discount).toBe(0);
  });

  it('applies flat rupee deduction correctly', () => {
    const discount = calculateCouponDiscount(
      {
        discountType: 'FLAT',
        discountValue: 50000, // Rs 500
        minOrderValue: 400000,
      },
      450000
    );

    expect(discount).toBe(50000);
  });

  it('guarantees discount never exceeds subtotal even with >100% or huge flat discount', () => {
    // 150% discount attempt
    const percentDiscount = calculateCouponDiscount(
      {
        discountType: 'PERCENT',
        discountValue: 150,
      },
      100000 // Rs 1,000
    );
    expect(percentDiscount).toBe(100000); // Clamped to 100% (Rs 1,000)

    // Huge flat discount attempt exceeding subtotal
    const flatDiscount = calculateCouponDiscount(
      {
        discountType: 'FLAT',
        discountValue: 500000, // Rs 5,000
      },
      200000 // Rs 2,000
    );
    expect(flatDiscount).toBe(200000); // Clamped to subtotal (Rs 2,000)
  });
});

