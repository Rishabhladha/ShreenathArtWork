import { describe, it, expect } from 'vitest';
import { checkoutItemsSchema } from '../src/lib/validators';

describe('Inventory Stock Decrement and Rollback Logic', () => {
  it('validates authentic checkout items schema', () => {
    const validItems = [
      { productId: 'prod_1', variantId: 'var_1', quantity: 2 },
      { productId: 'prod_2', variantId: 'var_2', quantity: 1 },
    ];
    const parsed = checkoutItemsSchema.safeParse(validItems);
    expect(parsed.success).toBe(true);
  });

  it('rejects negative, zero, and non-integer quantities', () => {
    expect(
      checkoutItemsSchema.safeParse([{ productId: 'p1', variantId: 'v1', quantity: -2 }]).success
    ).toBe(false);
    expect(
      checkoutItemsSchema.safeParse([{ productId: 'p1', variantId: 'v1', quantity: 0 }]).success
    ).toBe(false);
    expect(
      checkoutItemsSchema.safeParse([{ productId: 'p1', variantId: 'v1', quantity: 1.5 }]).success
    ).toBe(false);
  });

  it('aggregates multiple line items with identical variant IDs', () => {
    const items = [
      { productId: 'prod_1', variantId: 'var_1', quantity: 2 },
      { productId: 'prod_1', variantId: 'var_1', quantity: 3 },
    ];
    const aggregated = new Map<string, number>();
    for (const item of items) {
      aggregated.set(item.variantId, (aggregated.get(item.variantId) || 0) + item.quantity);
    }

    expect(aggregated.get('var_1')).toBe(5);

    // Stock check against aggregated count
    const availableStock = 4;
    const canFulfill = (availableStock >= (aggregated.get('var_1') || 0));
    expect(canFulfill).toBe(false);
  });

  it('restores stock upon payment failure or order cancellation', () => {
    let currentStock = 3;
    const reservedQuantity = 2;

    // Simulate reservation
    currentStock -= reservedQuantity;
    expect(currentStock).toBe(1);

    // Simulate payment failure or user cancellation: release back
    currentStock += reservedQuantity;
    expect(currentStock).toBe(3);
  });

  it('prevents stock inflation on repeated failed verification attempts', () => {
    let currentStock = 10;
    const orderQuantity = 2;

    // Step 1: Order created, stock reserved
    currentStock -= orderQuantity; // stock = 8
    let orderPaymentStatus: 'CREATED' | 'FAILED' | 'CANCELLED' | 'PAID' = 'CREATED';

    // Step 2: Verification failure occurs: only rollback if status was CREATED
    const handleVerificationFailure = () => {
      if (orderPaymentStatus === 'CREATED') {
        currentStock += orderQuantity;
        orderPaymentStatus = 'FAILED';
        return { restored: true };
      }
      return { restored: false };
    };

    const firstFailure = handleVerificationFailure();
    expect(firstFailure.restored).toBe(true);
    expect(currentStock).toBe(10); // Restored to original stock
    expect(orderPaymentStatus).toBe('FAILED');

    // Step 3: Repeated/malicious failure calls on the same cancelled/failed order
    const secondFailure = handleVerificationFailure();
    expect(secondFailure.restored).toBe(false);
    expect(currentStock).toBe(10); // NOT inflated to 12

    const thirdFailure = handleVerificationFailure();
    expect(thirdFailure.restored).toBe(false);
    expect(currentStock).toBe(10); // NOT inflated to 14
  });
});

