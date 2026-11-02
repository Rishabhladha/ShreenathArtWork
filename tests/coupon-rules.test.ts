import { describe, it, expect } from 'vitest';

function applyCouponLogic(params: {
  coupon: {
    discountType: 'PERCENT' | 'FLAT';
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number | null;
  };
  subtotal: number;
}) {
  const { coupon, subtotal } = params;
  if (subtotal < coupon.minOrderValue) {
    throw new Error('Minimum order value not met');
  }

  let discount = 0;
  if (coupon.discountType === 'PERCENT') {
    discount = Math.round((subtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Math.min(coupon.discountValue, subtotal);
  }

  return discount;
}

describe('Coupon Application Rules', () => {
  it('applies percentage discount accurately', () => {
    const discount = applyCouponLogic({
      coupon: {
        discountType: 'PERCENT',
        discountValue: 10,
        minOrderValue: 500000,
        maxDiscount: 200000,
      },
      subtotal: 600000, // Rs 6,000
    });

    expect(discount).toBe(60000); // 10% of 600,000 = Rs 600
  });

  it('caps discount at maxDiscount limit', () => {
    const discount = applyCouponLogic({
      coupon: {
        discountType: 'PERCENT',
        discountValue: 10,
        minOrderValue: 500000,
        maxDiscount: 200000, // Rs 2,000 max
      },
      subtotal: 3000000, // Rs 30,000
    });

    // 10% would be Rs 3,000, but capped at Rs 2,000
    expect(discount).toBe(200000);
  });

  it('rejects coupon when cart value is below minOrderValue', () => {
    expect(() =>
      applyCouponLogic({
        coupon: {
          discountType: 'PERCENT',
          discountValue: 10,
          minOrderValue: 500000,
        },
        subtotal: 400000,
      })
    ).toThrow('Minimum order value not met');
  });

  it('applies flat rupee deduction correctly', () => {
    const discount = applyCouponLogic({
      coupon: {
        discountType: 'FLAT',
        discountValue: 50000, // Rs 500
        minOrderValue: 400000,
      },
      subtotal: 450000,
    });

    expect(discount).toBe(50000);
  });
});

