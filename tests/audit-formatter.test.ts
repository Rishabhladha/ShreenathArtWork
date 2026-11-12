import { describe, it, expect } from 'vitest';
import { formatAuditEntry } from '../src/components/admin/AuditFormatters';

describe('formatAuditEntry (Human-Readable Audit Trail)', () => {
  it('formats CREATE_PRODUCT into artwork title and slug chip instead of raw JSON', () => {
    const rawDetails = JSON.stringify({ title: 'bahubali', slug: 'bahubali' });
    const formatted = formatAuditEntry('Product', '6aec77e2', 'CREATE_PRODUCT', rawDetails);

    expect(formatted.headline).toBe('Artwork: "bahubali"');
    expect(formatted.entityLabel).toBe('Artwork Painting');
    expect(formatted.entityLink).toContain('/admin/products/6aec77e2');
    expect(formatted.actionBadge.label).toBe('PRODUCT CREATED');
    expect(formatted.chips).toEqual([
      { label: 'Slug', value: 'bahubali' },
    ]);
  });

  it('formats UPDATE_ORDER_STATUS with clear fulfillment status advance', () => {
    const rawDetails = JSON.stringify({
      oldStatus: 'PLACED',
      newStatus: 'CONFIRMED',
      trackingNumber: 'SAW-TRACK-99',
    });
    const formatted = formatAuditEntry('Order', 'ord-123', 'UPDATE_ORDER_STATUS', rawDetails);

    expect(formatted.headline).toBe('Fulfillment status advanced: PLACED → CONFIRMED');
    expect(formatted.entityLabel).toBe('Customer Order');
    expect(formatted.entityLink).toBe('/admin/orders/ord-123');
    expect(formatted.chips).toEqual([
      { label: 'Waybill', value: 'SAW-TRACK-99' },
    ]);
  });

  it('formats ADJUST_STOCK with SKU and unit count transitions', () => {
    const rawDetails = JSON.stringify({
      sku: 'SKU-PICHWAI-1',
      oldStock: 5,
      newStock: 2,
    });
    const formatted = formatAuditEntry('Inventory', null, 'ADJUST_STOCK', rawDetails);

    expect(formatted.headline).toBe('Stock updated for SKU SKU-PICHWAI-1: 5 → 2 units');
    expect(formatted.entityLabel).toBe('Stock Inventory');
    expect(formatted.entityLink).toBe('/admin/inventory');
    expect(formatted.actionBadge.label).toBe('STOCK UPDATED');
  });

  it('formats ISSUE_REFUND with formatted rupee amount and reason', () => {
    const rawDetails = JSON.stringify({
      amount: 18000,
      reason: 'Collector requested cancellation prior to framing',
    });
    const formatted = formatAuditEntry('Order', 'ord-456', 'ISSUE_REFUND', rawDetails);

    expect(formatted.entityLabel).toBe('Customer Order');
    expect(formatted.actionBadge.label).toBe('REFUND ISSUED');
    expect(formatted.chips).toEqual([
      { label: 'Amount', value: '₹180' },
      { label: 'Reason', value: 'Collector requested cancellation prior to framing' },
    ]);
  });

  it('handles null, empty, or corrupted JSON gracefully without crashing', () => {
    const formatted1 = formatAuditEntry('Product', null, 'UPDATE_PRODUCT', null);
    expect(formatted1.headline).toBe('Artwork Painting modification logged');
    expect(formatted1.chips).toEqual([]);

    const formatted2 = formatAuditEntry('Category', null, 'DELETE_CATEGORY', 'invalid-json-string');
    expect(formatted2.headline).toBe('Collection Category modification logged');
    expect(formatted2.chips).toEqual([]);
  });
});
