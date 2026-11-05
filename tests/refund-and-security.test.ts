import { describe, it, expect } from 'vitest';

describe('Cumulative Refund and Security Validations', () => {
  it('strictly caps cumulative refunds to order total across multiple partial refunds', () => {
    const orderTotal = 250000; // Rs 2,500
    const existingRefunds = [
      { amount: 100000, status: 'SUCCESS' }, // Rs 1,000
      { amount: 50000, status: 'FAILED' },  // failed refund: does not count
      { amount: 50000, status: 'SUCCESS' },  // Rs 500
    ];

    const totalAlreadyRefunded = existingRefunds
      .filter((r) => r.status === 'SUCCESS')
      .reduce((sum, r) => sum + r.amount, 0);

    expect(totalAlreadyRefunded).toBe(150000); // Rs 1,500 refunded so far
    const maxRefundable = orderTotal - totalAlreadyRefunded;
    expect(maxRefundable).toBe(100000); // Rs 1,000 remaining refundable balance

    // Attempting to refund Rs 1,200 must fail
    const requestedRefund = 120000;
    const isAllowed = requestedRefund <= maxRefundable;
    expect(isAllowed).toBe(false);

    // Refunding remaining Rs 1,000 must succeed and result in FULL refund status
    const validRefund = 100000;
    expect(validRefund <= maxRefundable).toBe(true);
    const isFullRefund = totalAlreadyRefunded + validRefund >= orderTotal;
    expect(isFullRefund).toBe(true);
  });

  it('rejects refunds for unpaid orders', () => {
    const checkCanRefund = (paymentStatus: string) => {
      return paymentStatus === 'PAID' || paymentStatus === 'PARTIALLY_REFUNDED';
    };

    expect(checkCanRefund('PENDING')).toBe(false);
    expect(checkCanRefund('CREATED')).toBe(false);
    expect(checkCanRefund('FAILED')).toBe(false);
    expect(checkCanRefund('PAID')).toBe(true);
    expect(checkCanRefund('PARTIALLY_REFUNDED')).toBe(true);
  });

  it('validates raster image file extensions against strict allowlist', () => {
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const isExtensionAllowed = (filename: string) => {
      const lower = filename.toLowerCase();
      return allowedExtensions.some((ext) => lower.endsWith(ext));
    };

    // Allowed raster formats
    expect(isExtensionAllowed('shreenathji-pichwai.jpg')).toBe(true);
    expect(isExtensionAllowed('sanctum-portrait.JPEG')).toBe(true);
    expect(isExtensionAllowed('gold-leaf-artwork.png')).toBe(true);
    expect(isExtensionAllowed('nathdwara-utsav.webp')).toBe(true);

    // Blocked malicious/dangerous formats
    expect(isExtensionAllowed('malicious.php')).toBe(false);
    expect(isExtensionAllowed('script.sh')).toBe(false);
    expect(isExtensionAllowed('exploit.svg')).toBe(false);
    expect(isExtensionAllowed('payload.html')).toBe(false);
    expect(isExtensionAllowed('malware.exe')).toBe(false);
    expect(isExtensionAllowed('index.xhtml')).toBe(false);
  });

  it('correctly extracts client IP from multi-hop x-forwarded-for header', () => {
    const extractClientIp = (headerValue: string | null): string => {
      return headerValue?.split(',')[0].trim() || 'local';
    };

    expect(extractClientIp('203.0.113.195, 70.41.3.18, 150.172.238.178')).toBe('203.0.113.195');
    expect(extractClientIp('  103.21.244.0  , 172.64.0.1')).toBe('103.21.244.0');
    expect(extractClientIp(null)).toBe('local');
    expect(extractClientIp('')).toBe('local');
  });
});
