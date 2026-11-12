import { describe, it, expect } from 'vitest';
import { formatAuditEntry } from '../src/components/admin/AuditFormatters';

describe('formatAuditEntry (Human-Readable Audit Trail)', () => {
  it('formats CREATE_PRODUCT into artwork title and slug chip instead of raw JSON', () => {
    const rawDetails = JSON.stringify({ title: 'bahubali', slug: 'bahubali' });
    const formatted = formatAuditEntry('Product', '6aec77e2', 'CREATE_PRODUCT', rawDetails);

    expect(formatted.headline).toBe('Added new painting: "bahubali"');
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

    expect(formatted.headline).toBe('Order status changed: PLACED → CONFIRMED');
    expect(formatted.entityLabel).toBe('Customer Order');
    expect(formatted.entityLink).toBe('/admin/orders/ord-123');
    expect(formatted.chips).toEqual([
      { label: 'Transition', value: 'PLACED → CONFIRMED' },
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

    expect(formatted.headline).toBe('Inventory count adjusted for SKU SKU-PICHWAI-1: 5 → 2 units');
    expect(formatted.entityLabel).toBe('Stock Inventory');
    expect(formatted.entityLink).toBe('/admin/inventory');
    expect(formatted.actionBadge.label).toBe('STOCK UPDATED');
  });

  it('formats ISSUE_REFUND with formatted rupee amount and note', () => {
    const rawDetails = JSON.stringify({
      amount: 18000,
      reason: 'Collector requested cancellation prior to framing',
    });
    const formatted = formatAuditEntry('Order', 'ord-456', 'ISSUE_REFUND', rawDetails);

    expect(formatted.entityLabel).toBe('Customer Order');
    expect(formatted.actionBadge.label).toBe('REFUND ISSUED');
    expect(formatted.chips).toEqual([
      { label: 'Amount', value: '₹180' },
      { label: 'Note', value: 'Collector requested cancellation prior to framing' },
    ]);
  });

  it('formats EMAIL_VERIFIED security audit log event', () => {
    const rawDetails = JSON.stringify({ email: 'collector@example.com' });
    const formatted = formatAuditEntry('User', 'usr-1', 'EMAIL_VERIFIED', rawDetails);

    expect(formatted.headline).toBe('Patron email verified via 6-digit OTP');
    expect(formatted.entityLabel).toBe('Collector Account');
    expect(formatted.actionBadge.label).toBe('EMAIL VERIFIED');
    expect(formatted.chips).toEqual([
      { label: 'Email', value: 'collector@example.com' },
    ]);
  });

  it('formats PASSWORD_RESET security audit log event', () => {
    const rawDetails = JSON.stringify({ email: 'patron@example.com' });
    const formatted = formatAuditEntry('User', 'usr-2', 'PASSWORD_RESET', rawDetails);

    expect(formatted.headline).toBe('Patron password successfully reset');
    expect(formatted.entityLabel).toBe('Collector Account');
    expect(formatted.actionBadge.label).toBe('PASSWORD RESET');
    expect(formatted.chips).toEqual([
      { label: 'Email', value: 'patron@example.com' },
    ]);
  });

  it('handles null, empty, or corrupted JSON gracefully without crashing', () => {
    const formatted1 = formatAuditEntry('Product', null, 'UPDATE_PRODUCT', null);
    expect(formatted1.headline).toBe('Artwork Painting modification logged');
    expect(formatted1.chips).toEqual([]);

    const formatted2 = formatAuditEntry('Category', null, 'DELETE_CATEGORY', 'invalid-json-string');
    expect(formatted2.headline).toBe('Artwork Category modification logged');
    expect(formatted2.chips).toEqual([]);
  });
});
